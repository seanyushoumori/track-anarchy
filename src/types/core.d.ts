/** Subway Builder Modding API v1.0.0 */

/** A geographic coordinate as [longitude, latitude]. */
export type Coordinate = [longitude: number, latitude: number];

/** A geographic bounding box as [minLon, minLat, maxLon, maxLat]. */
export type BoundingBox = [minLon: number, minLat: number, maxLon: number, maxLat: number];

/** Game simulation speed. */
export type GameSpeed = 'slow' | 'normal' | 'fast' | 'ultrafast';

/** Whether an entity is a placed blueprint or fully constructed. */
export type BuildType = 'constructed' | 'blueprint';

/** Visual display state of a track segment. */
export type DisplayType = 'blueprint' | 'constructed';

/**
 * Elevation classification for track segments.
 *
 * Thresholds:
 * - `DEEP_BORE` — below -30m
 * - `STANDARD_TUNNEL` — -30m to -8m
 * - `CUT_AND_COVER` — -8m to -3m
 * - `AT_GRADE` — -3m to 4.5m
 * - `ELEVATED` — above 4.5m
 */
export type ElevationType = 'DEEP_BORE' | 'STANDARD_TUNNEL' | 'CUT_AND_COVER' | 'AT_GRADE' | 'ELEVATED';

/** The functional type of a track segment. */
export type TrackType = 'station' | 'track' | 'scissors-crossover' | 'express-station';

/** The bullet shape displayed on a route label. */
export type RouteShape = 'circle' | 'pill' | 'diamond' | 'square' | string;
