/** Subway Builder Modding API v1.0.0 */

import type { ElevationType } from './core';

export interface HighSlopeSpeedMultiplier {
  minSlopePercentage: number;
  maxSlopePercentage: number;
  multiplier: number;
}

export interface ConstructionCosts {
  TUNNEL: {
    SINGLE_MULTIPLIER: number;
    QUAD_MULTIPLIER: number;
  };
  STATION: {
    SINGLE_MULTIPLIER: number;
    QUAD_MULTIPLIER: number;
  };
  ELEVATION_MULTIPLIERS: Record<ElevationType, number>;
  WATER_MULTIPLIERS: Record<ElevationType, number>;
  ELEVATION_THRESHOLDS: Record<ElevationType, number>;
}

export interface GameConstants {
  // -- Financial --

  /** Default starting budget (3,000,000,000) */
  STARTING_MONEY: number;
  /** Default ticket price (3) */
  DEFAULT_TICKET_COST: number;
  /** Revenue multiplier applied to fares (365) */
  FARE_MULTIPLIER: number;
  /** Seconds between operational cost charges (900 seconds / 15 minutes) */
  OPERATIONAL_COST_CHARGE_INTERVAL: number;

  // -- Construction --

  CONSTRUCTION_COSTS: ConstructionCosts;

  // -- Elevation --

  /** Minimum elevation in meters (-100) */
  MIN_ELEVATION: number;
  /** Maximum elevation in meters (20) */
  MAX_ELEVATION: number;
  /** Gap between building foundations and tunnels in meters (3) */
  BUILDING_FOUNDATION_GAP: number;

  // -- Track constraints --

  /** Minimum track segment length in meters (10) */
  MIN_TRACK_LENGTH: number;
  /** Maximum track segment length in meters (10,000) */
  MAX_TRACK_LENGTH: number;
  /** Spacing between parallel tracks in meters (3.81) */
  PARALLEL_TRACKS_SPACING: number;
  /** Minimum clearance between tracks in meters (1) */
  TRACK_CLEARANCE: number;
  /** Standard track gauge width in meters (1.435) */
  TRACK_WIDTH: number;
  /** Length of scissors crossover in meters (40) */
  SCISSORS_CROSSOVER_LENGTH: number;

  // -- Structure dimensions --

  /** Station structure height in meters (4) */
  STATION_HEIGHT: number;
  /** Tunnel bore height in meters (5) */
  TUNNEL_HEIGHT: number;

  // -- Signal windows --

  /** V-merge signal window length in meters (200) */
  V_MERGE_SIGNAL_WINDOW_LENGTH: number;
  /** Diamond crossing signal window length in meters (10) */
  DIAMOND_SIGNAL_WINDOW_LENGTH: number;
  /** Additional warning window length in meters (2) */
  ADDITIONAL_WARNING_WINDOW_LENGTH: number;
  /** Additional extra warning window length in meters (100) */
  ADDITIONAL_EXTRA_WARNING_WINDOW_LENGTH: number;

  // -- Operations --

  /** Time trains stop at stations in seconds (20) */
  STATION_STOP_TIME: number;
  /** Maximum slope grade percentage (4) */
  MAX_SLOPE_PERCENTAGE: number;
  /** Maximum trains per hour limit (120) */
  TPH_LIMIT: number;
  /** Number of train cars available at game start (30) */
  STARTING_TRAIN_CARS: number;

  // -- Physics --

  HIGH_SLOPE_SPEED_MULTIPLIER: HighSlopeSpeedMultiplier[];
  /** Maximum jerk in m/s^3 (0.3) */
  MAX_JERK: number;
  /** Maximum lateral acceleration in m/s^2 (0.8) */
  MAX_LATERAL_ACCELERATION: number;
  /** Acceptable speed margin in m/s (0.01) */
  ACCEPTABLE_SPEED_MARGIN: number;
  /** Minimum turn radius in meters (29) */
  MIN_TURN_RADIUS: number;

  // -- Timing --

  /** 900 seconds / 15 minutes */
  COMMUTE_INTERVAL_LENGTH: number;
  /** 86400 seconds / 24 hours */
  TIME_TO_KEEP_COMMUTE_DATA: number;
  /** 900 seconds / 15 minutes */
  STUCK_TRAIN_TIMEOUT: number;
  /** Seconds between commute data filter passes (3600 seconds / 1 hour) */
  COMMUTE_DATA_FILTER_INTERVAL: number;
  /** Seconds for train schedule transition window (1800 seconds / 30 minutes) */
  TRAIN_SCHEDULE_TRANSITION_WINDOW: number;

  // -- Walking --

  /** Base walking speed in m/s (1) */
  WALKING_SPEED: number;
  /** Accurate-path walking speed in m/s (1.5) */
  WALKING_SPEED_ACCURATE_PATH: number;
  /** Speed multiplier for airport walking (1.5) */
  AIRPORT_WALKING_SPEED_MULTIPLIER: number;

  /** Additional constants (extensible) */
  [key: string]: unknown;
}
