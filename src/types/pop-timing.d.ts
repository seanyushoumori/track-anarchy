/** Subway Builder Modding API v1.0.0 */

/**
 * A time range during which commuters travel, in 24-hour format (0-23).
 *
 * Defaults: `[{ start: 7, end: 9 }, { start: 17, end: 19 }]`
 */
export interface CommuteTimeRange {
  /** Start hour in 24-hour format (0-23). */
  start: number;
  /** End hour in 24-hour format (0-23). */
  end: number;
}
