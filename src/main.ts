/**
 * Anarchy — lifts Subway Builder's build limits.
 *
 * The limits live in two places, so the mod relaxes both:
 *  1. Per-train-type config (curve radius, grade, track clearance & spacing,
 *     curve-speed, station length, plus the at-grade road-crossing flag) via
 *     `trains.modifyTrainType`.
 *  2. Global game constants (elevation range, station/tunnel vertical clearance,
 *     building-foundation gap, track-segment length) via `api.modifyConstants`.
 *     These are the rules that AREN'T per-train stats.
 *
 * Both are re-applied on load and whenever a city/save loads. No UI yet — it's
 * on while the mod is enabled.
 *
 * Note: "stations must start and end at the same level" is a hardcoded
 * construction validation with no constant behind it, so it can't be relaxed.
 */

const MOD_VERSION = '1.0.0';
const TAG = '[Track Anarchy]';

/** Relaxed per-train-type build stats (geometry that isn't a global constant). */
const ANARCHY_STATS: Record<string, number> = {
  minTurnRadius: 5,
  minStationTurnRadius: 5,
  maxSlopePercentage: 1_000_000, // effectively unlimited grade (near-vertical and beyond)
  trackClearance: 0,
  parallelTrackSpacing: 0, // parallel tracks can sit directly on top of each other
  maxLateralAcceleration: 1000, // no curve-speed penalty — tight curves stay full-speed
  minStationLength: 1,
  maxStationLength: 1_000_000,
};

/**
 * Relaxed global game constants — only the build rules that are real runtime
 * constants (verified via getConstants()). Elevation range is effectively
 * unlimited; the vertical-clearance constants go to 0 so structures can touch.
 */
const ANARCHY_CONSTANTS: Record<string, number> = {
  MIN_ELEVATION: -1_000_000,
  MAX_ELEVATION: 1_000_000,
  STATION_HEIGHT: 0, // station vertical-clearance requirement → 0 (stations can collide)
  TUNNEL_HEIGHT: 0, // tunnel vertical-clearance requirement → 0
  BUILDING_FOUNDATION_GAP: 0, // build flush against building foundations
  MIN_TRACK_LENGTH: 1,
  MAX_TRACK_LENGTH: 1_000_000,
};

const api = window.SubwayBuilderAPI;

if (!api) {
  console.error(`${TAG} SubwayBuilderAPI not found!`);
} else {
  console.log(`${TAG} v${MOD_VERSION} | API v${api.version}`);

  // Build-rule fields are under-documented in the published types — reach loosely.
  const trains = api.trains as unknown as {
    getTrainTypes?: () => Record<string, { stats?: Record<string, number> }>;
    modifyTrainType?: (id: string, updates: unknown) => void;
  };
  const root = api as unknown as {
    modifyConstants?: (constants: Record<string, number>) => void;
  };

  /** Relax the global build constants. */
  const applyConstants = (): void => {
    try {
      root.modifyConstants?.(ANARCHY_CONSTANTS);
      console.log(`${TAG} constants relaxed (elevation range, station/tunnel clearance, track length).`);
    } catch (err) {
      console.error(`${TAG} modifyConstants failed:`, err);
    }
  };

  /** Relax the per-train build stats. Returns false if no train types loaded yet. */
  const applyStats = (): boolean => {
    const types = trains.getTrainTypes?.() ?? {};
    const ids = Object.keys(types);
    if (ids.length === 0) return false;
    for (const id of ids) {
      const cur = types[id]?.stats ?? {};
      try {
        trains.modifyTrainType?.(id, {
          stats: { ...cur, ...ANARCHY_STATS },
          allowAtGradeRoadCrossing: true, // at-grade track can cross roads
        });
      } catch (err) {
        console.error(`${TAG} failed to modify ${id}:`, err);
      }
    }
    console.log(`${TAG} stats applied to ${ids.length} train type(s): ${ids.join(', ')}`);
    return true;
  };

  /** Apply constants immediately, then poll for train types and apply stats. */
  const applyAll = (): void => {
    applyConstants();
    let tries = 0;
    const tick = (): void => {
      if (applyStats()) return;
      if (++tries < 40) setTimeout(tick, 500);
      else console.warn(`${TAG} no train types found after ${tries} tries`);
    };
    tick();
  };

  let started = false;
  api.hooks.onMapReady(async () => {
    if (started) return;
    started = true;
    applyAll();
    try {
      api.hooks.onCityLoad(applyAll);
    } catch {
      /* hook may not exist */
    }
    try {
      api.hooks.onGameLoaded(applyAll);
    } catch {
      /* hook may not exist */
    }
    console.log(`${TAG} Initialized.`);
  });
}
