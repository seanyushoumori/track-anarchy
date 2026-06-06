/** Subway Builder Modding API v1.0.0 */

// =============================================================================
// STATION TYPE CONFIGURATION
// =============================================================================

/**
 * Configuration for a custom station type, used with `api.stations.registerStationType()`.
 *
 * Multipliers scale from a base value of 1.0. Override fields set absolute values
 * instead of multiplying the base.
 */
export interface StationTypeConfig {
  /** Unique identifier for this station type */
  id: string;
  /** Display name */
  name: string;
  /** Description of this station type */
  description?: string;
  /**
   * Multiplier for the station's passenger catchment area.
   * @default 1.0 (base: 1800 seconds / 30 minute walking radius)
   */
  catchmentMultiplier?: number;
  /**
   * Multiplier for the transfer radius between stations.
   * @default 1.0 (base: 600 seconds / 10 minute walking radius)
   */
  transferRadiusMultiplier?: number;
  /**
   * Multiplier for passenger walking speed near this station.
   * @default 1.0 (base: 1 m/s)
   */
  walkSpeedMultiplier?: number;
  /**
   * Time a train dwells at this station, in seconds.
   * @default 20
   */
  dwellTime?: number;
  /** Absolute catchment radius override in seconds (bypasses multiplier) */
  catchmentOverride?: number;
  /** Absolute transfer radius override in seconds (bypasses multiplier) */
  transferRadiusOverride?: number;
  /** Absolute walk speed override in m/s (bypasses multiplier) */
  walkSpeedOverride?: number;
  /** Lucide icon name for this station type */
  icon?: string;
  /** Hex color for this station type (e.g. "#FF0000") */
  color?: string;
}

/** Alias for StationTypeConfig. */
export type StationType = StationTypeConfig;
