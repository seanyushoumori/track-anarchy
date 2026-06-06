/** Subway Builder Modding API v1.0.0 */

import type { Coordinate, BoundingBox } from './core';

// =============================================================================
// BUILDING DATA TYPES
// =============================================================================

export interface BuildingBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  foundationDepth: number;
}

export interface BuildingData {
  id: string;
  bounds: BuildingBounds;
  polygon: Coordinate[];
  foundationDepth: number;
}

export interface BuildingsIndex {
  cellSize: number;
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  cols: number;
  rows: number;
  cells: number[][];
  buildings: BuildingData[];
  buildingCount: number;
  nonEmptyCells: number;
  maxFoundationDepth: number;
}

// =============================================================================
// OPTIMIZED BUILDING DATA TYPES
// =============================================================================

export interface OptimizedBuildingData {
  b: BoundingBox;
  f: number;
  p: Coordinate[];
}

export interface OptimizedBuildingsIndex {
  cs: number;
  bbox: BoundingBox;
  grid: [number, number];
  cells: number[][];
  buildings: OptimizedBuildingData[];
  stats: {
    count: number;
    maxDepth: number;
  };
}

// =============================================================================
// DEMAND DATA FILE FORMAT
// =============================================================================

export interface DemandDataFile {
  points: Array<{
    id: string;
    location: Coordinate;
    jobs: number;
    residents: number;
    popIds: string[];
  }>;
  pops: Array<{
    id: string;
    size: number;
    residenceId: string;
    jobId: string;
    drivingSeconds: number;
    drivingDistance: number;
    drivingPath?: Coordinate[];
  }>;
}

// =============================================================================
// ROAD DATA TYPES
// =============================================================================

export interface RoadProperties {
  roadClass: string;
  structure: string;
  name: string;
}

// =============================================================================
// ZOD SCHEMA REFERENCES
// =============================================================================

export interface GameSchemas {
  DemandDataSchema: unknown;
  DemandPointSchema: unknown;
  PopSchema: unknown;
  BuildingIndexSchema: unknown;
  BuildingBoundsSchema: unknown;
  BuildingDataSchema: unknown;
  OptimizedBuildingIndexSchema: unknown;
  OptimizedBuildingDataSchema: unknown;
  RoadsGeojsonSchema: unknown;
  RoadPropertiesSchema: unknown;
  RunwaysTaxiwaysGeojsonSchema: unknown;
}
