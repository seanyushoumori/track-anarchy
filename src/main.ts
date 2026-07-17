/**
 * Track Anarchy — lifts Subway Builder's build limits, with a settings UI.
 *
 * Each build rule is a feature toggle in the game's Settings menu (reachable
 * from the home screen AND in-game). ON applies the relaxed value; OFF restores
 * the vanilla default.
 *
 * Restoring defaults is subtle: anarchy writes to global constants PERSIST
 * across reloads, so reading the "current" constant back gives a contaminated
 * value. We therefore restore constants from a hardcoded vanilla table, and for
 * per-train stats we capture the original — but sentinel-guarded so we never
 * record a value that already equals our anarchy value.
 */

const MOD_VERSION = '1.3.0';
const TAG = '[Track Anarchy]';
const STORAGE_KEY = 'track-anarchy:enabled';
// The game keeps modified train-type stats across a reload, but this mod's module
// re-executes and loses its in-memory captured defaults — so after a reload it can't
// tell a relaxed value from a real default and stats that lack a hardcoded fallback
// (station lengths) never revert. Persist the captured defaults so they survive.
const ORIG_STATS_KEY = 'track-anarchy:origStats';
const ORIG_ROAD_KEY = 'track-anarchy:origRoad';
const ORIG_GCTPH_KEY = 'track-anarchy:origGcTph';
// 'settings-menu' = in-game + startup settings; 'main-menu' = directly on the home screen
// (the settings sub-panel doesn't re-read registrations after a session, so we also mount on main-menu).
const PLACEMENTS = ['settings-menu', 'main-menu'];

interface Lever {
  id: string;
  label: string;
  stats?: Record<string, number>;
  constants?: Record<string, number>;
  roadCrossing?: boolean;
  /** Lifts the ocean-floor build rule via the ocean depth detector. */
  ocean?: boolean;
  /** Start disabled (most levers default on; this one doesn't). */
  defaultOff?: boolean;
}

const LEVERS: Lever[] = [
  { id: 'curves', label: 'Sharp curves', stats: { minTurnRadius: 5, minStationTurnRadius: 5, maxLateralAcceleration: 1000 } },
  { id: 'grades', label: 'Steep grades', stats: { maxSlopePercentage: 1_000_000 } },
  { id: 'clearance', label: 'Zero track clearance', stats: { trackClearance: 0 } },
  { id: 'spacing', label: 'Overlapping parallel tracks', stats: { parallelTrackSpacing: 0 }, defaultOff: true },
  { id: 'stationSize', label: 'Any station size', stats: { minStationLength: 1, maxStationLength: 1_000_000 } },
  { id: 'roadCrossing', label: 'At-grade road, highway & runway crossings', roadCrossing: true },
  { id: 'oceanFloor', label: 'Build below the ocean floor', ocean: true },
  { id: 'elevation', label: 'Unlimited build height', constants: { MIN_ELEVATION: -1_000_000, MAX_ELEVATION: 1_000_000 } },
  { id: 'collision', label: 'Station & tunnel collision', constants: { STATION_HEIGHT: 0, TUNNEL_HEIGHT: 0 } },
  { id: 'foundations', label: 'Build under buildings', constants: { BUILDING_FOUNDATION_GAP: 0 } },
  // 1.4.x split the minimum-length limit into three constants (single / normal /
  // advanced track modes); 1.3.x had only MIN_TRACK_LENGTH. Setting all of them is
  // harmless on older versions — non-existent constants are filtered out in applyAll.
  { id: 'trackLength', label: 'Any track segment length', constants: { MIN_TRACK_LENGTH: 1, MIN_SINGLE_TRACK_LENGTH: 1, MIN_ADVANCED_TRACK_LENGTH: 1, MAX_TRACK_LENGTH: 1_000_000 } },
];

/** Hardcoded vanilla constant values — we can't read these back reliably (anarchy writes persist). */
const DEFAULT_CONSTANTS: Record<string, number> = {
  MIN_ELEVATION: -100,
  MAX_ELEVATION: 20,
  STATION_HEIGHT: 4,
  TUNNEL_HEIGHT: 5,
  BUILDING_FOUNDATION_GAP: 3,
  MIN_TRACK_LENGTH: 10,
  MIN_SINGLE_TRACK_LENGTH: 10, // 1.4.x
  MIN_ADVANCED_TRACK_LENGTH: 10, // 1.4.x
  MAX_TRACK_LENGTH: 10000,
};

/**
 * Fallback vanilla stat defaults, used only if a clean per-train capture isn't
 * available (e.g. a soft reload happened before the async persist completed).
 * Per-train first (values differ a lot — commuter-rail's minTurnRadius is 88, not
 * 29 — so a single global table would revert the wrong way), then a global net.
 * Measured from a fresh 1.4.5 launch; the captured/persisted value is authoritative
 * and self-heals, so these only matter as a last resort.
 */
const STAT_FALLBACK_BY_TYPE: Record<string, Record<string, number>> = {
  'heavy-metro': { minTurnRadius: 29, minStationTurnRadius: 400, maxSlopePercentage: 4, trackClearance: 1, parallelTrackSpacing: 3.81, maxLateralAcceleration: 1, minStationLength: 79, maxStationLength: 229 },
  'light-metro': { minTurnRadius: 29, minStationTurnRadius: 400, maxSlopePercentage: 4, trackClearance: 1, parallelTrackSpacing: 3.81, maxLateralAcceleration: 1, minStationLength: 42.1, maxStationLength: 80.2 },
  'commuter-rail': { minTurnRadius: 88, minStationTurnRadius: 1400, maxSlopePercentage: 3.5, trackClearance: 1.2, parallelTrackSpacing: 4.27, maxLateralAcceleration: 1, minStationLength: 108, maxStationLength: 368 },
};
const STAT_FALLBACK: Record<string, number> = {
  minTurnRadius: 29,
  minStationTurnRadius: 400,
  maxSlopePercentage: 4,
  trackClearance: 1,
  parallelTrackSpacing: 3.81,
  maxLateralAcceleration: 1,
  // minStationLength / maxStationLength: vary per train — rely on per-type table + captured value
};

const api = window.SubwayBuilderAPI;

if (!api) {
  console.error(`${TAG} SubwayBuilderAPI not found!`);
} else {
  console.log(`${TAG} v${MOD_VERSION} | API v${api.version}`);

  const trains = api.trains as unknown as {
    getTrainTypes?: () => Record<
      string,
      { stats?: Record<string, number>; allowGradeCrossing?: boolean; allowAtGradeRoadCrossing?: boolean; gradeCrossingTphLimit?: Record<string, number | null> }
    >;
    modifyTrainType?: (id: string, updates: unknown) => void;
  };
  const root = api as unknown as { modifyConstants?: (c: Record<string, number>) => void };

  // The highway/runway at-grade block is NOT a train flag or constant — it lives in
  // the road collision INDEX (an rbush whose leaf items carry `type: 'road' | 'highway'
  // | 'runway'`). The validator blocks item.type 'highway'/'runway'; nothing in the
  // official API touches it, so we reach it via the internal store bridge (the same one
  // Copy Paste / Track Visualizer use) and retype those obstacles to plain 'road'.
  type RoadNode = {
    type?: string;
    feature?: { properties?: { roadClass?: string; __taClass?: string } };
    children?: RoadNode[];
    __taType?: string;
  };
  const bridge = (): { roadsIndex?: { data?: RoadNode }; setRoadsIndex?: (i: unknown) => void } | null => {
    try {
      return (
        (window as unknown as { __subwayBuilder_storeCallbacks__?: { getState?: () => Record<string, unknown> } })
          .__subwayBuilder_storeCallbacks__?.getState?.() as never
      ) ?? null;
    } catch {
      return null;
    }
  };
  // Per-road-class grade-crossing trains/hour cap (vanilla: highway is null = disallowed).
  const GC_TPH_ANARCHY: Record<string, number> = { highway: 999, major: 999, medium: 999, minor: 999 };

  /**
   * Retype highway/runway obstacles in the road collision index to plain roads (ON),
   * or restore them (OFF). Idempotent and self-describing (stores the original type on
   * the node), so it survives re-applies and needs no separate persistence — the index
   * is rebuilt per city, and we re-run on every city load.
   */
  const reclassifyObstacles = (enable: boolean): void => {
    try {
      const st = bridge();
      const root2 = st?.roadsIndex?.data;
      if (!root2 || typeof st?.setRoadsIndex !== 'function') return;
      let changed = 0;
      const visit = (n: RoadNode | undefined): void => {
        if (!n || typeof n !== 'object') return;
        if (n.feature) {
          const props = n.feature.properties;
          if (enable) {
            if (n.type === 'highway' || n.type === 'runway') {
              n.__taType = n.type;
              n.type = 'road';
              changed++;
            }
            // The highway gate is (item.type === 'highway') OR (roadClass === 'highway'),
            // so retype BOTH — but only inside the collision index, so rendering (which
            // reads roadsGeojson) is left untouched.
            if (props && props.roadClass === 'highway') {
              props.__taClass = props.roadClass;
              props.roadClass = 'major';
              changed++;
            }
          } else {
            if (n.__taType) {
              n.type = n.__taType;
              delete n.__taType;
              changed++;
            }
            if (props && props.__taClass) {
              props.roadClass = props.__taClass;
              delete props.__taClass;
              changed++;
            }
          }
        }
        if (Array.isArray(n.children)) for (const c of n.children) visit(c);
      };
      visit(root2);
      if (changed) st.setRoadsIndex(st.roadsIndex);
    } catch (err) {
      console.error(`${TAG} reclassifyObstacles failed:`, err);
    }
  };

  /**
   * Lift the ocean-floor rule: the validator blocks track sitting above the seabed
   * (per-cell `depth_min` in the ocean depth detector) unless it's elevated. Push each
   * cell's floor "up" so any track counts as deeper than it (ON), or restore the
   * captured original (OFF). Self-describing + rebuilt per city, like reclassifyObstacles.
   */
  const reclassifyOcean = (enable: boolean): void => {
    try {
      const st = bridge() as { oceanDepthDetector?: { depthsMap?: Map<unknown, { depth_min?: number; __taDepth?: number }> } } | null;
      const dm = st?.oceanDepthDetector?.depthsMap;
      if (!dm || typeof dm.values !== 'function') return;
      for (const cell of dm.values()) {
        if (!cell || typeof cell.depth_min !== 'number') continue;
        if (enable) {
          if (cell.__taDepth === undefined) {
            cell.__taDepth = cell.depth_min;
            cell.depth_min = 1e9; // floor above everything → any track is deeper → passes
          }
        } else if (cell.__taDepth !== undefined) {
          cell.depth_min = cell.__taDepth;
          delete cell.__taDepth;
        }
      }
      // No setOceanDepthDetector exists; the validator reads the map live, so mutating
      // it in place is enough.
    } catch (err) {
      console.error(`${TAG} reclassifyOcean failed:`, err);
    }
  };
  // Read the live constant set so we only write keys this game version actually has
  // (the length-constant names differ between 1.3.x and 1.4.x). Absent → don't filter.
  const getConstants = (api.utils as unknown as { getConstants?: () => Record<string, number> }).getConstants;
  const store = api.storage as unknown as { get?: (k: string) => unknown; set?: (k: string, v: unknown) => void };
  const ui = api.ui as unknown as {
    registerComponent?: (p: string, o: { id: string; component: unknown }) => void;
    unregisterComponent?: (p: string, id: string) => void;
    forceUpdate?: () => void;
  };
  const React = (api.utils as unknown as {
    React: {
      createElement: (...args: unknown[]) => unknown;
      useState: <T>(init: T) => [T, (v: T | ((prev: T) => T)) => void];
    };
  }).React;
  const h = React.createElement;

  // ---- enabled selection (persisted; default = all on except defaultOff) ----
  const enabled = new Set<string>(LEVERS.filter((l) => !l.defaultOff).map((l) => l.id));
  const persist = (): void => {
    try {
      void store.set?.(STORAGE_KEY, [...enabled]); // storage is async; fire-and-forget
    } catch {
      /* ignore */
    }
  };

  // ---- captured per-train stat defaults (sentinel-guarded + persisted) ----
  const origStats: Record<string, Record<string, number>> = {}; // [trainId][statKey] = clean default
  const origRoad: Record<string, boolean> = {};
  const origGcTph: Record<string, Record<string, number | null> | null> = {}; // captured gradeCrossingTphLimit

  const persistOrigs = (): void => {
    try {
      void store.set?.(ORIG_STATS_KEY, origStats);
      void store.set?.(ORIG_ROAD_KEY, origRoad);
      void store.set?.(ORIG_GCTPH_KEY, origGcTph);
    } catch {
      /* ignore */
    }
  };

  const captureStats = (types: Record<string, { stats?: Record<string, number>; allowGradeCrossing?: boolean; allowAtGradeRoadCrossing?: boolean; gradeCrossingTphLimit?: Record<string, number | null> }>): void => {
    let changed = false;
    for (const id of Object.keys(types)) {
      const stats = types[id]?.stats ?? {};
      origStats[id] = origStats[id] ?? {};
      for (const lever of LEVERS) {
        if (!lever.stats) continue;
        for (const k of Object.keys(lever.stats)) {
          const v = stats[k];
          // Sentinel guard: only trust a value that ISN'T our anarchy value — else
          // it's one we wrote and reading it back would poison the saved default.
          // A clean reading REFRESHES the default (self-heals if the game's changes),
          // but a contaminated one leaves the previously-captured/persisted default intact.
          if (typeof v === 'number' && v !== lever.stats[k] && origStats[id][k] !== v) {
            origStats[id][k] = v;
            changed = true;
          }
        }
      }
      // 1.4.x renamed allowAtGradeRoadCrossing → allowGradeCrossing (the build
      // validation still reads the old name too). Capture from whichever exists —
      // once only (the flag has no reliable sentinel; the persisted value is authoritative).
      if (origRoad[id] == null) {
        origRoad[id] = types[id]?.allowGradeCrossing ?? types[id]?.allowAtGradeRoadCrossing ?? false;
        changed = true;
      }
      // gradeCrossingTphLimit: capture once (null = train originally had none, e.g. subways).
      if (!(id in origGcTph)) {
        origGcTph[id] = types[id]?.gradeCrossingTphLimit ?? null;
        changed = true;
      }
    }
    if (changed) persistOrigs();
  };

  const statDefault = (id: string, k: string): number | undefined =>
    origStats[id]?.[k] ?? STAT_FALLBACK_BY_TYPE[id]?.[k] ?? STAT_FALLBACK[k];

  /** Apply the current selection: ON → relaxed value; OFF → vanilla default. */
  const applyAll = (): boolean => {
    const types = trains.getTrainTypes?.() ?? {};
    const ids = Object.keys(types);
    if (ids.length === 0) return false;
    captureStats(types);

    // Global constants — restore from the hardcoded table (reads are contaminated).
    // Skip constants that don't exist in this game version so a mixed 1.3.x/1.4.x
    // lever (e.g. the three track-length keys) stays backwards compatible.
    let liveConstants: Record<string, number> | null = null;
    try {
      liveConstants = getConstants?.() ?? null;
    } catch {
      liveConstants = null;
    }
    const constants: Record<string, number> = {};
    for (const lever of LEVERS) {
      if (!lever.constants) continue;
      const on = enabled.has(lever.id);
      for (const k of Object.keys(lever.constants)) {
        if (liveConstants && !(k in liveConstants)) continue; // this version lacks the constant
        constants[k] = on ? lever.constants[k] : DEFAULT_CONSTANTS[k] ?? lever.constants[k];
      }
    }
    if (Object.keys(constants).length) {
      try {
        root.modifyConstants?.(constants);
      } catch (err) {
        console.error(`${TAG} modifyConstants failed:`, err);
      }
    }

    // Per-train stats + road-crossing flag.
    const roadLever = LEVERS.find((l) => l.roadCrossing);
    for (const id of ids) {
      const cur = types[id]?.stats ?? {};
      const statUpdates: Record<string, number> = {};
      for (const lever of LEVERS) {
        if (!lever.stats) continue;
        const on = enabled.has(lever.id);
        for (const k of Object.keys(lever.stats)) {
          if (on) {
            statUpdates[k] = lever.stats[k];
          } else {
            const d = statDefault(id, k);
            if (d != null) statUpdates[k] = d; // else leave current (no clean default known)
          }
        }
      }
      const update: {
        stats: Record<string, number>;
        allowGradeCrossing?: boolean;
        allowAtGradeRoadCrossing?: boolean;
        gradeCrossingTphLimit?: Record<string, number | null> | null;
      } = {
        stats: { ...cur, ...statUpdates },
      };
      if (roadLever) {
        const on = enabled.has(roadLever.id);
        // Set BOTH names: allowGradeCrossing (1.4.x, shown in the Train Types panel)
        // and allowAtGradeRoadCrossing (1.3.x + the 1.4.x road-intersection validator).
        update.allowGradeCrossing = on ? true : origRoad[id] ?? false;
        update.allowAtGradeRoadCrossing = update.allowGradeCrossing;
        // Lift the per-road-class grade-crossing trains/hour cap (highway is null by
        // default) so crossings aren't throttled; restore the captured original when off.
        update.gradeCrossingTphLimit = on ? GC_TPH_ANARCHY : origGcTph[id] ?? null;
      }
      try {
        trains.modifyTrainType?.(id, update);
      } catch (err) {
        console.error(`${TAG} failed to modify ${id}:`, err);
      }
    }

    // Highway/runway at-grade crossings + the ocean-floor rule are gated in collision
    // indexes (rbush item.type / ocean depth cells), not by any train flag or constant —
    // relax them directly via the store bridge.
    if (roadLever) reclassifyObstacles(enabled.has(roadLever.id));
    const oceanLever = LEVERS.find((l) => l.ocean);
    if (oceanLever) reclassifyOcean(enabled.has(oceanLever.id));

    console.log(`${TAG} applied (${enabled.size}/${LEVERS.length} features on).`);
    return true;
  };

  const applyWhenReady = (): void => {
    let tries = 0;
    const tick = (): void => {
      if (applyAll()) return;
      if (++tries < 40) setTimeout(tick, 500);
      else console.warn(`${TAG} no train types found after ${tries} tries`);
    };
    tick();
  };

  // ---- Settings UI: one CONTROLLED component, so state survives navigation ----
  const SettingsPanel = (): unknown => {
    const [, setTick] = React.useState(0);
    const rerender = (): void => setTick((n) => n + 1);
    const row = (lever: Lever): unknown =>
      h(
        'label',
        {
          key: lever.id,
          style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', cursor: 'pointer', fontSize: '13px' },
        },
        h('input', {
          type: 'checkbox',
          checked: enabled.has(lever.id), // read live state every render
          onChange: (e: { target: { checked: boolean } }) => {
            if (e.target.checked) enabled.add(lever.id);
            else enabled.delete(lever.id);
            persist();
            applyAll();
            rerender();
          },
        }),
        h('span', null, lever.label),
      );
    return h(
      'div',
      { style: { padding: '8px 0' } },
      h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, 'Track Anarchy — build limits'),
      h(
        'div',
        {
          style: {
            fontSize: '11px',
            fontWeight: 700,
            color: '#fbbf24',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
          },
        },
        'IMPORTANT: game must be restarted for settings to apply.',
      ),
      ...LEVERS.map(row),
    );
  };

  const registerUI = (): void => {
    for (const p of PLACEMENTS) {
      const id = `track-anarchy-${p}`; // distinct id per placement (registry may key by id alone)
      try {
        ui.unregisterComponent?.(p, id);
        ui.registerComponent?.(p, { id, component: SettingsPanel });
      } catch (err) {
        console.error(`${TAG} failed to register UI at ${p}:`, err);
      }
    }
  };

  // api.storage is async — read via Promise.resolve (handles a sync value OR a
  // Promise), then refresh the panel + re-apply with the loaded selection.
  const loadEnabled = (): void => {
    try {
      Promise.resolve(store.get?.(STORAGE_KEY))
        .then((saved) => {
          if (!Array.isArray(saved)) return;
          enabled.clear();
          for (const id of saved) if (typeof id === 'string') enabled.add(id);
          try {
            ui.forceUpdate?.();
          } catch {
            /* ignore */
          }
          applyAll();
        })
        .catch(() => {
          /* ignore */
        });
    } catch {
      /* ignore */
    }
  };

  // Load the persisted clean defaults BEFORE the user can toggle a lever off, so a
  // revert after a reload uses the real defaults instead of the contaminated values.
  // A fresh clean capture (full launch) wins over the persisted copy (self-heal).
  const loadOrigs = (): void => {
    try {
      Promise.resolve(store.get?.(ORIG_STATS_KEY))
        .then((saved) => {
          if (!saved || typeof saved !== 'object') return;
          for (const id of Object.keys(saved as Record<string, Record<string, number>>)) {
            const savedForId = (saved as Record<string, Record<string, number>>)[id] ?? {};
            origStats[id] = { ...savedForId, ...(origStats[id] ?? {}) }; // in-memory clean capture wins
          }
        })
        .catch(() => {
          /* ignore */
        });
      Promise.resolve(store.get?.(ORIG_ROAD_KEY))
        .then((saved) => {
          if (!saved || typeof saved !== 'object') return;
          for (const id of Object.keys(saved as Record<string, boolean>)) {
            if (origRoad[id] == null) origRoad[id] = (saved as Record<string, boolean>)[id];
          }
        })
        .catch(() => {
          /* ignore */
        });
      Promise.resolve(store.get?.(ORIG_GCTPH_KEY))
        .then((saved) => {
          if (!saved || typeof saved !== 'object') return;
          for (const id of Object.keys(saved as Record<string, unknown>)) {
            if (!(id in origGcTph)) origGcTph[id] = (saved as Record<string, Record<string, number | null> | null>)[id];
          }
        })
        .catch(() => {
          /* ignore */
        });
    } catch {
      /* ignore */
    }
  };

  // roadsIndex loads with the city and can lag the first applyAll — retry the obstacle
  // reclassification until it's populated (so highway/runway crossings unlock on load).
  const reclassifyWhenReady = (): void => {
    let tries = 0;
    let roadDone = false;
    let oceanDone = false;
    const tick = (): void => {
      const st = bridge() as { roadsIndex?: { data?: unknown }; oceanDepthDetector?: { depthsMap?: unknown } } | null;
      if (!roadDone && st?.roadsIndex?.data) {
        reclassifyObstacles(enabled.has('roadCrossing'));
        roadDone = true;
      }
      if (!oceanDone && st?.oceanDepthDetector?.depthsMap) {
        reclassifyOcean(enabled.has('oceanFloor'));
        oceanDone = true;
      }
      if ((roadDone && oceanDone) || ++tries >= 40) return;
      setTimeout(tick, 500);
    };
    tick();
  };

  // The settings panel doesn't survive the in-game ↔ main-menu transition on its
  // own, so re-register (idempotent) on every lifecycle event — notably onGameEnd
  // (exit to menu). Apply stats whenever a city is present.
  const refreshUI = (): void => {
    registerUI();
    try {
      ui.forceUpdate?.();
    } catch {
      /* ignore */
    }
  };
  const hook = (name: string, fn: () => void): void => {
    try {
      (api.hooks as unknown as Record<string, ((cb: () => void) => void) | undefined>)[name]?.(fn);
    } catch {
      /* hook may not exist */
    }
  };

  refreshUI();
  loadOrigs();
  loadEnabled();
  api.hooks.onMapReady(async () => {
    refreshUI();
    applyWhenReady();
    reclassifyWhenReady();
  });
  hook('onCityLoad', () => {
    applyWhenReady();
    reclassifyWhenReady();
  });
  hook('onGameLoaded', () => {
    applyWhenReady();
    reclassifyWhenReady();
  });
  hook('onGameInit', refreshUI);
  hook('onGameEnd', () => {
    // re-register immediately + after the menu has had time to mount
    refreshUI();
    setTimeout(refreshUI, 400);
    setTimeout(refreshUI, 1200);
  });
  console.log(`${TAG} Initialized.`);
}
