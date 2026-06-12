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

const MOD_VERSION = '1.1.0';
const TAG = '[Track Anarchy]';
const STORAGE_KEY = 'track-anarchy:enabled';
// 'settings-menu' = in-game + startup settings; 'main-menu' = directly on the home screen
// (the settings sub-panel doesn't re-read registrations after a session, so we also mount on main-menu).
const PLACEMENTS = ['settings-menu', 'main-menu'];

interface Lever {
  id: string;
  label: string;
  stats?: Record<string, number>;
  constants?: Record<string, number>;
  roadCrossing?: boolean;
  /** Start disabled (most levers default on; this one doesn't). */
  defaultOff?: boolean;
}

const LEVERS: Lever[] = [
  { id: 'curves', label: 'Sharp curves', stats: { minTurnRadius: 5, minStationTurnRadius: 5, maxLateralAcceleration: 1000 } },
  { id: 'grades', label: 'Steep grades', stats: { maxSlopePercentage: 1_000_000 } },
  { id: 'clearance', label: 'Zero track clearance', stats: { trackClearance: 0 } },
  { id: 'spacing', label: 'Overlapping parallel tracks', stats: { parallelTrackSpacing: 0 }, defaultOff: true },
  { id: 'stationSize', label: 'Any station size', stats: { minStationLength: 1, maxStationLength: 1_000_000 } },
  { id: 'roadCrossing', label: 'At-grade road crossings', roadCrossing: true },
  { id: 'elevation', label: 'Unlimited build height', constants: { MIN_ELEVATION: -1_000_000, MAX_ELEVATION: 1_000_000 } },
  { id: 'collision', label: 'Station & tunnel collision', constants: { STATION_HEIGHT: 0, TUNNEL_HEIGHT: 0 } },
  { id: 'foundations', label: 'Build under buildings', constants: { BUILDING_FOUNDATION_GAP: 0 } },
  { id: 'trackLength', label: 'Any track segment length', constants: { MIN_TRACK_LENGTH: 1, MAX_TRACK_LENGTH: 1_000_000 } },
];

/** Hardcoded vanilla constant values — we can't read these back reliably (anarchy writes persist). */
const DEFAULT_CONSTANTS: Record<string, number> = {
  MIN_ELEVATION: -100,
  MAX_ELEVATION: 20,
  STATION_HEIGHT: 4,
  TUNNEL_HEIGHT: 5,
  BUILDING_FOUNDATION_GAP: 3,
  MIN_TRACK_LENGTH: 10,
  MAX_TRACK_LENGTH: 10000,
};

/** Fallback vanilla stat defaults (global), used only if a clean per-train capture isn't available. */
const STAT_FALLBACK: Record<string, number> = {
  minTurnRadius: 29,
  minStationTurnRadius: 400,
  maxSlopePercentage: 4,
  trackClearance: 1,
  parallelTrackSpacing: 3.81,
  maxLateralAcceleration: 0.8,
  // minStationLength / maxStationLength: not known globally — rely on captured value
};

const api = window.SubwayBuilderAPI;

if (!api) {
  console.error(`${TAG} SubwayBuilderAPI not found!`);
} else {
  console.log(`${TAG} v${MOD_VERSION} | API v${api.version}`);

  const trains = api.trains as unknown as {
    getTrainTypes?: () => Record<string, { stats?: Record<string, number>; allowAtGradeRoadCrossing?: boolean }>;
    modifyTrainType?: (id: string, updates: unknown) => void;
  };
  const root = api as unknown as { modifyConstants?: (c: Record<string, number>) => void };
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

  // ---- captured per-train stat defaults (sentinel-guarded) ----
  const origStats: Record<string, Record<string, number>> = {}; // [trainId][statKey] = clean default
  const origRoad: Record<string, boolean> = {};

  const captureStats = (types: Record<string, { stats?: Record<string, number>; allowAtGradeRoadCrossing?: boolean }>): void => {
    for (const id of Object.keys(types)) {
      const stats = types[id]?.stats ?? {};
      origStats[id] = origStats[id] ?? {};
      for (const lever of LEVERS) {
        if (!lever.stats) continue;
        for (const k of Object.keys(lever.stats)) {
          if (origStats[id][k] != null) continue; // already have a clean default
          const v = stats[k];
          // sentinel guard: never record a value that already equals our anarchy value
          if (typeof v === 'number' && v !== lever.stats[k]) origStats[id][k] = v;
        }
      }
      if (origRoad[id] == null) origRoad[id] = types[id]?.allowAtGradeRoadCrossing ?? false;
    }
  };

  const statDefault = (id: string, k: string): number | undefined => origStats[id]?.[k] ?? STAT_FALLBACK[k];

  /** Apply the current selection: ON → relaxed value; OFF → vanilla default. */
  const applyAll = (): boolean => {
    const types = trains.getTrainTypes?.() ?? {};
    const ids = Object.keys(types);
    if (ids.length === 0) return false;
    captureStats(types);

    // Global constants — restore from the hardcoded table (reads are contaminated).
    const constants: Record<string, number> = {};
    for (const lever of LEVERS) {
      if (!lever.constants) continue;
      const on = enabled.has(lever.id);
      for (const k of Object.keys(lever.constants)) {
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
      const update: { stats: Record<string, number>; allowAtGradeRoadCrossing?: boolean } = {
        stats: { ...cur, ...statUpdates },
      };
      if (roadLever) update.allowAtGradeRoadCrossing = enabled.has(roadLever.id) ? true : origRoad[id] ?? false;
      try {
        trains.modifyTrainType?.(id, update);
      } catch (err) {
        console.error(`${TAG} failed to modify ${id}:`, err);
      }
    }
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
      ...LEVERS.map(row),
      h('div', { style: { fontSize: '11px', opacity: 0.6, marginTop: '6px' } }, 'Some changes take effect on the next city load.'),
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
  loadEnabled();
  api.hooks.onMapReady(async () => {
    refreshUI();
    applyWhenReady();
  });
  hook('onCityLoad', applyWhenReady);
  hook('onGameLoaded', applyWhenReady);
  hook('onGameInit', refreshUI);
  hook('onGameEnd', () => {
    // re-register immediately + after the menu has had time to mount
    refreshUI();
    setTimeout(refreshUI, 400);
    setTimeout(refreshUI, 1200);
  });
  console.log(`${TAG} Initialized.`);
}
