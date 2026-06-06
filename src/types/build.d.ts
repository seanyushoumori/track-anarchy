/** Subway Builder Modding API v1.0.0 */

import type { Coordinate, RouteShape } from './core';
import type { Route } from './game-state';

// =============================================================================
// BLUEPRINT INPUT TYPES
// =============================================================================

/** Input for placing a single blueprint track segment. */
export interface BlueprintTrackInput {
  /** Array of [longitude, latitude] coordinate pairs defining the track path. */
  coords: Coordinate[];
  /** Track type ID (e.g. 'heavy-metro', 'light-metro'). */
  trackType?: string;
  /** Starting elevation. 0 = surface, negative = underground. */
  startElevation?: number;
  /** Ending elevation. 0 = surface, negative = underground. */
  endElevation?: number;
}

/** Input for grouping tracks into a track group (parallel/quad). */
export interface TrackGroupInput {
  /** IDs of tracks in this group. */
  trackIds: string[];
  /** Center line coordinates for the group. */
  centerLine: Coordinate[];
  /** Lane configuration of the track group. */
  trackLanesType: 'single' | 'parallel' | 'quad';
}

// =============================================================================
// BUILD RESULT TYPES
// =============================================================================

/** Result of placing blueprint tracks. */
export interface PlaceBlueprintResult {
  success: boolean;
  /** IDs of the placed blueprint tracks. */
  trackIds: string[];
  /** IDs of the created track groups. */
  trackGroupIds: string[];
  error?: string;
}

/** Result of building (constructing) all placed blueprints. */
export interface BuildBlueprintsResult {
  success: boolean;
  /** Number of tracks that were built. */
  builtTrackCount: number;
  /** Total cost of construction. */
  totalCost: number;
  error?: string;
}

// =============================================================================
// ROUTE CREATION TYPES
// =============================================================================

/** Options for creating a new route. */
export interface CreateRouteOptions {
  /** Route bullet label (e.g. "A", "1"). */
  bullet?: string;
  /** Route color as hex string. */
  color?: string;
  /** Text color for the route bullet as hex string. */
  textColor?: string;
  /** Shape of the route bullet icon. */
  shape?: RouteShape;
  /** Train type ID to use for this route. */
  trainType?: string;
}

/** Result of creating a route. */
export interface CreateRouteResult {
  success: boolean;
  /** The created route object, present when successful. */
  route?: Route;
  error?: string;
}

// =============================================================================
// TRAIN PURCHASE TYPES
// =============================================================================

/** Result of purchasing trains. */
export interface BuyTrainsResult {
  success: boolean;
  /** Number of trains successfully purchased. */
  totalPurchased?: number;
  error?: string;
}

/** Result of adding a train to a route. */
export interface AddTrainResult {
  success: boolean;
  /** ID of the added train. */
  trainId?: string;
  error?: string;
}

// =============================================================================
// BLUEPRINT COST TYPES
// =============================================================================

/** Cost breakdown for blueprint tracks. */
export interface BlueprintCost {
  totalCost: number;
  breakdown: {
    trackCost: number;
    stationCost: number;
    scissorsCrossoverCost: number;
    buildingDemolitionCost: number;
  };
}
