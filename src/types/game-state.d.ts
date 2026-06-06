/** Subway Builder Modding API v1.0.0 - Game State Types */

import type { Coordinate, BuildType, DisplayType, TrackType, RouteShape } from './core';

// =============================================================================
// STATION DATA STRUCTURES
// =============================================================================

export interface NearbyStation {
  stationId: string;
  walkingTime: number;
}

export interface Station {
  id: string;
  name: string;
  coords: Coordinate;
  trackIds: string[];
  trackGroupId: string;
  buildType: BuildType;
  stNodeIds: string[];
  routeIds: string[];
  createdAt: number;
  nearbyStations: NearbyStation[];
}

// =============================================================================
// TRACK DATA STRUCTURES
// =============================================================================

export interface Track {
  id: string;
  coords: Coordinate[];
  buildType: BuildType;
  displayType: DisplayType;
  type: TrackType;
  reversable: boolean;
  interactable: boolean;
  length: number;
  startElevation: number;
  endElevation: number;
  trackType: string;
  waterIntersectionPercentage: number;
  createdAt: number;
}

// =============================================================================
// TRAIN DATA STRUCTURES
// =============================================================================

export interface TrainMotion {
  speed: number;
  acceleration: number;
}

export interface TrackProgress {
  trackId: string;
  headProgress: number;
  tailProgress: number;
  triggeredSignalIds: string[];
}

export interface TrainWindow {
  tracks: TrackProgress[];
  headStComboProgress: number;
  tailStComboProgress: number;
  coords: Coordinate[];
  signalIds?: string[];
}

export interface CurrentStComboInfo {
  index: number;
  gapFromHeadToEndOfRoute: number;
  timeAtStop: number | null;
  timeAtStopEnd: number | null;
  endStNodeId: string;
}

export interface Train {
  id: string;
  routeId: string;
  length?: number;
  cars?: number;
  trainType?: string;
  currentStComboInfo?: CurrentStComboInfo;
  motion?: TrainMotion;
  windows?: {
    train: TrainWindow;
    warning: TrainWindow;
  };
}

// =============================================================================
// ROUTE DATA STRUCTURES
// =============================================================================

export interface StNode {
  id: string;
  center: Coordinate;
  trackIds: string[];
  buildType: BuildType;
}

export interface SignalReference {
  signalId: string;
  areaCovered: 'all' | string;
}

export interface PathSegment {
  trackId: string;
  reversed: boolean;
  length: number;
  signals: SignalReference[];
}

export interface StCombo {
  startStNodeId: string;
  endStNodeId: string;
  path: PathSegment[];
  distance: number;
}

export interface StComboTiming {
  stNodeId: string;
  stNodeIndex: number;
  arrivalTime: number;
  departureTime: number;
}

export interface TrainSchedule {
  highDemand: number;
  mediumDemand: number;
  lowDemand: number;
}

export interface Route {
  id: string;
  name?: string;
  bullet?: string;
  color?: string;
  textColor?: string;
  shape?: RouteShape;
  carsPerTrain?: number;
  idealTrainCount?: number;
  trainType?: string;
  trainSchedule?: TrainSchedule;
  tempParentId?: string | null;
  stations?: Station[];
  stNodes?: StNode[];
  stCombos?: StCombo[];
  stComboTimings?: StComboTiming[];
}

// =============================================================================
// DEMAND & POPULATION TYPES
// =============================================================================

export interface DemandPoint {
  id: string;
  location: Coordinate;
  jobs: number;
  residents: number;
  popIds: string[];
  residentModeShare: ModeChoiceStats;
  workerModeShare: ModeChoiceStats;
}

export interface Pop {
  id: string;
  size: number;
  residenceId: string;
  jobId: string;
  drivingSeconds: number;
  drivingDistance: number;
  drivingPath?: Coordinate[];
  homeDepartureTime: number;
  workDepartureTime: number;
  lastCommute: CompletedPopCommute;
}

export interface DemandData {
  points: Map<string, DemandPoint>;
  popsMap: Map<string, Pop>;
}

// =============================================================================
// METRICS & STATS TYPES
// =============================================================================

export interface RidershipStats {
  totalRidersPerHour: number;
  totalRiders: number;
  timeWindowHours: number;
}

export interface LineMetric {
  name: string;
  ridersPerHour: number;
  routeId?: string;
  routeBullet?: string;
  routeColor?: string;
  trainCount?: number;
  trainsPerHour?: number;
  revenuePerHour?: number;
}

export interface ModeChoiceStats {
  walking: number;
  driving: number;
  transit: number;
  unknown: number;
}

export interface CompletedCommute {
  popId: string;
  size: number;
  journeyEnd: number;
  journeyStart: number;
  origin: 'work' | 'home';
  stationRoutes: StationRoute[];
}

export interface CompletedPopCommute {
  modeChoice: ModeChoiceStats;
  transitPaths: TransitPath[];
  walking: WalkingCommute;
}

export interface WalkingCommute {
  time: number;
  distance: number;
}

export interface StationRoute {
  stationIds: string[];
  routeId: string;
}

export interface StationRidership {
  total: number;
  transfers?: number;
  byRoute?: Array<{ routeId: string; popCount: number }>;
}

export interface RouteRidership {
  byStation: Array<{ stationId: string; popCount: number }>;
}

export interface TransitPath {
  arrivalTime: number;
  departureTime: number;
  fromStopCoords: Coordinate;
  fromStopId: string;
  isDriving: boolean;
  isWalking: boolean;
  routeId: string;
  toStopCoords: Coordinate;
  toStopId: string;
}
