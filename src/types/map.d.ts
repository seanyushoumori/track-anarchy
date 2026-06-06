/** Subway Builder Modding API v1.0.0 */

import type { Coordinate } from './core';

// =============================================================================
// MAP SOURCE & LAYER TYPES
// =============================================================================

/** Configuration for a map tile or data source. */
export interface MapSource {
  type: 'raster' | 'vector' | 'geojson';
  /** URL templates with {z}/{x}/{y} placeholders. */
  tiles?: string[];
  /** Tile size in pixels. Default 256. */
  tileSize?: number;
  /** URL to a TileJSON resource or GeoJSON file. */
  url?: string;
  /** Inline GeoJSON data. */
  data?: unknown;
  /** Attribution string displayed on the map. */
  attribution?: string;
}

/** Configuration for a MapLibre layer. */
export interface MapLayer {
  id: string;
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'raster' | 'fill-extrusion';
  /** ID of the source to use for this layer. */
  source: string;
  /** Source layer name (required for vector tile sources). */
  'source-layer'?: string;
  /** MapLibre paint properties. */
  paint?: Record<string, unknown>;
  /** MapLibre layout properties. */
  layout?: Record<string, unknown>;
  /** MapLibre filter expression. */
  filter?: unknown[];
}

// =============================================================================
// TILE & LAYER OVERRIDES
// =============================================================================

/** Override tile URLs for a specific city. */
export interface TileURLOverride {
  cityCode: string;
  /** URL template with {z}/{x}/{y} placeholders. */
  tilesUrl: string;
  /** Foundation tile URL template. */
  foundationTilesUrl: string;
  /** Maximum zoom level for the tiles. */
  maxZoom: number;
}

/** Override paint, filter, or source-layer for an existing map layer. */
export interface LayerOverride {
  layerId: string;
  sourceLayer?: string;
  /** MapLibre filter expression. */
  filter?: unknown[];
  /** MapLibre paint properties to override. */
  paint?: Record<string, unknown>;
}

// =============================================================================
// ROUTING TYPES
// =============================================================================

/** Override the routing service used for driving path calculations in a city. */
export interface RoutingServiceOverride {
  cityCode: string;
  /** URL template with {origin_lon}, {origin_lat}, {dest_lon}, {dest_lat} placeholders. */
  routingUrl: string;
  format: 'osrm' | 'valhalla' | 'graphhopper' | 'custom';
  /** Custom parser for the routing response. Required when format is 'custom'. */
  customParser?: (response: unknown) => RouteResult;
}

/** Result of a driving route query. */
export interface RouteResult {
  /** Driving time in seconds. */
  drivingSeconds: number;
  /** Driving distance in meters. */
  drivingDistance: number;
  /** Coordinates along the driving path. */
  drivingPath?: Coordinate[];
}

// =============================================================================
// LAYER VISIBILITY
// =============================================================================

/** Default visibility settings for built-in map layers in a city. */
export interface DefaultLayerVisibility {
  buildingFoundations?: boolean;
  oceanFoundations?: boolean;
  trackElevations?: boolean;
  trains?: boolean;
  stations?: boolean;
  routes?: boolean;
  arrows?: boolean;
  signals?: boolean;
}
