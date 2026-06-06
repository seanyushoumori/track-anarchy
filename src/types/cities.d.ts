/** Subway Builder Modding API v1.0.0 */

import type { Coordinate } from './core';

// =============================================================================
// VIEW STATE
// =============================================================================

/** Camera position for viewing a city on the map. */
export interface ViewState {
  /** Map zoom level */
  zoom: number;
  /** Camera latitude */
  latitude: number;
  /** Camera longitude */
  longitude: number;
  /** Map rotation in degrees. Default: 0 */
  bearing?: number;
}

// =============================================================================
// CITY CONFIGURATION (input to registerCity)
// =============================================================================

/** Configuration object passed to `api.registerCity()`. */
export interface CityConfig {
  /** Display name of the city */
  name: string;
  /** Unique uppercase city code (e.g. "NYC", "LON") */
  code: string;
  /** Optional description of the city */
  description?: string;
  /** Optional population number */
  population?: number;
  /** Initial camera position when loading this city */
  initialViewState: ViewState;
  /** Minimum zoom level allowed for this city */
  minZoom?: number;
  /** URL for the city's map thumbnail image */
  mapImageUrl?: string;
  /** Alternative name for mapImageUrl */
  thumbnail?: string;
}

// =============================================================================
// CITY (returned from getCities)
// =============================================================================

/** City data as returned by `api.utils.getCities()`. Extends CityConfig with fields that are always present in returned data. */
export interface City extends CityConfig {
  /** Country the city is in (always present in returned for in-game cities // not necessarily present for modded cities) */
  country?: string;
  /** Description of the city (always present in returned data) */
  description: string;
}

// =============================================================================
// CITY TAB
// =============================================================================

/** Configuration for a city selection tab in the UI. */
export interface CityTab {
  /** Unique tab identifier */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Optional emoji shown before the label */
  emoji?: string;
  /** City codes included in this tab */
  cityCodes: string[];
}

// =============================================================================
// CITY DATA FILES
// =============================================================================

/** URLs for city data files, used with `api.cities.setCityDataFiles()`. */
export interface CityDataFiles {
  /** URL to the buildings index JSON file (required) */
  buildingsIndex: string;
  /** URL to the demand data JSON file (required) */
  demandData: string;
  /** URL to the roads GeoJSON file (required) */
  roads: string;
  /** URL to the runways/taxiways GeoJSON file */
  runwaysTaxiways?: string;
  /** URL to the ocean depth index JSON file */
  oceanDepthIndex?: string;
}
