/** Subway Builder Modding API v1.0.0 - Career Missions */

import type { BoundingBox } from './core';

// =============================================================================
// MISSION METRIC & OPERATOR TYPES
// =============================================================================

/** Metrics available for mission star conditions. */
export type MissionMetric =
  | 'stations_count'
  | 'trains_count'
  | 'routes_count'
  | 'tracks_count'
  | 'total_passengers'
  | 'ridership_percentage'
  | 'daily_profit'
  | 'total_revenue'
  | 'total_debt'
  | 'money'
  | 'play_time_minutes'
  | 'elapsed_days'
  | 'passengers_between_regions'
  | 'passengers_from_region'
  | 'passengers_to_region'
  | 'stations_in_region';

/** Comparison operators for mission star conditions. */
export type MissionOperator = '>=' | '>' | '<=' | '<' | '==' | '!=';

/**
 * Mission difficulty tier.
 * - `starter` — unlocked immediately (0 stars required)
 * - `growth` — unlocked at 4+ stars
 * - `mega` — unlocked at 10+ stars
 */
export type MissionTier = 'starter' | 'growth' | 'mega';

/** Identifier for a star within a mission (1-indexed). */
export type StarId = 'star1' | 'star2' | 'star3';

/** UI panel to open when the player clicks a star's action button. */
export type ActionPanel = 'construction' | 'routes-list' | 'demand-stats';

// =============================================================================
// STAR & MISSION CONFIG
// =============================================================================

/** Configuration for a single star objective within a mission. */
export interface StarConfig {
  id: StarId;
  label: string;
  shortLabel: string;
  /** Emoji icon displayed next to the star. */
  icon?: string;
  metric: MissionMetric;
  target: number;
  /** Comparison operator. Defaults to `'>='`. */
  operator?: MissionOperator;
  /** Step-by-step hints shown to the player. */
  howTo?: string[];
  /** Which panel to open when the player clicks the action button. */
  actionPanel?: ActionPanel;
  /** Label for the action button. */
  actionLabel?: string;
  /** Geographic parameters for region-based metrics. */
  params?: {
    bbox?: BoundingBox;
    originBbox?: BoundingBox;
    destBbox?: BoundingBox;
  };
}

/**
 * Configuration for a career mission.
 *
 * @remarks
 * `id` should use reverse-domain style (e.g. `'my-mod.speed-run'`).
 * The `stars` array should contain 1-3 entries.
 */
export interface MissionConfig {
  /**
   * Unique mission identifier.
   * Use reverse-domain style, e.g. `'my-mod.speed-run'`.
   */
  id: string;
  cityCode: string;
  name: string;
  description: string;
  /**
   * Difficulty tier that controls when the mission is unlocked.
   * - `starter` — 0 stars required
   * - `growth` — 4+ stars required
   * - `mega` — 10+ stars required
   */
  tier: MissionTier;
  /** Star objectives (1-3 entries). */
  stars: StarConfig[];
}

// =============================================================================
// REGION DEFINITIONS
// =============================================================================

/** A mapping of region names to their geographic bounding boxes. */
export interface RegionDefinition {
  [regionName: string]: BoundingBox;
}

// =============================================================================
// CAREER CONSTANTS
// =============================================================================

/**
 * Constant object mapping UPPER_CASE keys to {@link MissionMetric} string values.
 *
 * Available keys: `STATIONS_COUNT`, `TRAINS_COUNT`, `ROUTES_COUNT`, `TRACKS_COUNT`,
 * `TOTAL_PASSENGERS`, `RIDERSHIP_PERCENTAGE`, `DAILY_PROFIT`, `TOTAL_REVENUE`,
 * `TOTAL_DEBT`, `MONEY`, `PLAY_TIME_MINUTES`, `ELAPSED_DAYS`,
 * `PASSENGERS_BETWEEN_REGIONS`, `PASSENGERS_FROM_REGION`, `PASSENGERS_TO_REGION`,
 * `STATIONS_IN_REGION`.
 */
export interface CareerMetrics {
  readonly STATIONS_COUNT: 'stations_count';
  readonly TRAINS_COUNT: 'trains_count';
  readonly ROUTES_COUNT: 'routes_count';
  readonly TRACKS_COUNT: 'tracks_count';
  readonly TOTAL_PASSENGERS: 'total_passengers';
  readonly RIDERSHIP_PERCENTAGE: 'ridership_percentage';
  readonly DAILY_PROFIT: 'daily_profit';
  readonly TOTAL_REVENUE: 'total_revenue';
  readonly TOTAL_DEBT: 'total_debt';
  readonly MONEY: 'money';
  readonly PLAY_TIME_MINUTES: 'play_time_minutes';
  readonly ELAPSED_DAYS: 'elapsed_days';
  readonly PASSENGERS_BETWEEN_REGIONS: 'passengers_between_regions';
  readonly PASSENGERS_FROM_REGION: 'passengers_from_region';
  readonly PASSENGERS_TO_REGION: 'passengers_to_region';
  readonly STATIONS_IN_REGION: 'stations_in_region';
}

/**
 * Constant object mapping UPPER_CASE keys to {@link MissionOperator} string values.
 *
 * Available keys: `GREATER_OR_EQUAL`, `GREATER`, `LESS_OR_EQUAL`, `LESS`, `EQUAL`, `NOT_EQUAL`.
 */
export interface CareerOperators {
  readonly GREATER_OR_EQUAL: '>=';
  readonly GREATER: '>';
  readonly LESS_OR_EQUAL: '<=';
  readonly LESS: '<';
  readonly EQUAL: '==';
  readonly NOT_EQUAL: '!=';
}

/**
 * Pre-defined geographic regions with bounding boxes.
 *
 * **NYC regions:**
 * - Brooklyn: `BUSHWICK`, `WILLIAMSBURG`, `BEDSTUY`, `GREENPOINT`, `DUMBO`, `DOWNTOWN_BROOKLYN`
 * - Manhattan: `LOWER_MANHATTAN`, `FINANCIAL_DISTRICT`, `TRIBECA`, `SOHO`, `EAST_VILLAGE`,
 *   `MIDTOWN`, `TIMES_SQUARE`, `UPPER_EAST_SIDE`, `UPPER_WEST_SIDE`, `HARLEM`
 * - Queens: `LONG_ISLAND_CITY`, `ASTORIA`
 */
export interface CareerRegions {
  readonly NYC: RegionDefinition;
}
