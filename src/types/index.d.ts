/** Subway Builder Modding API v1.0.0 */

// =============================================================================
// RE-EXPORTS
// =============================================================================

export * from './core';
export * from './game-state';
export * from './game-constants';
export * from './game-actions';
export * from './cities';
export * from './trains';
export * from './stations';
export * from './map';
export * from './build';
export * from './career';
export * from './content-templates';
export * from './pop-timing';
export * from './ui';
export * from './i18n';
export * from './utils';
export * from './electron';
export * from './schemas';
export * from './manifest';
export * from './api';

// =============================================================================
// THIRD-PARTY LIBRARY TYPES (window globals)
// =============================================================================

/** Chance.js random generator instance. */
export interface ChanceInstance {
  bool(opts?: { likelihood: number }): boolean;
  character(opts?: { pool?: string; alpha?: boolean; numeric?: boolean; symbols?: boolean }): string;
  floating(opts?: { min?: number; max?: number; fixed?: number }): number;
  integer(opts?: { min?: number; max?: number }): number;
  natural(opts?: { min?: number; max?: number }): number;
  string(opts?: { length?: number; pool?: string }): string;
  pick<T>(arr: T[], count?: number): T | T[];
  shuffle<T>(arr: T[]): T[];
  weighted<T>(arr: T[], weights: number[]): T;
  sentence(opts?: { words?: number }): string;
  word(opts?: { length?: number; syllables?: number }): string;
  paragraph(opts?: { sentences?: number }): string;
  name(opts?: { middle?: boolean; middle_initial?: boolean; prefix?: boolean; suffix?: boolean }): string;
  first(opts?: { gender?: string; nationality?: string }): string;
  last(opts?: { nationality?: string }): string;
  color(opts?: { format?: string; grayscale?: boolean }): string;
  hash(opts?: { length?: number; casing?: string }): string;
  guid(opts?: { version?: number }): string;
  [method: string]: (...args: any[]) => any;
}

/** deck.gl namespace available as `window.deck` (in-game only). */
export interface DeckGLNamespace {
  VERSION: string;
  version: string;
  log: unknown;
  [key: string]: unknown;
}

// =============================================================================
// GLOBAL DECLARATIONS
// =============================================================================

import type { ModdingAPI } from './api';
import type { ElectronAPI, ElectronAPIExtended } from './electron';

declare global {
  interface Window {
    /** The Subway Builder Modding API. */
    SubwayBuilderAPI: ModdingAPI;
    /** Electron IPC bridge (Electron builds only). */
    electron?: ElectronAPI;
    /** Extended Electron API for data loading and blueprint operations. */
    electronAPI?: ElectronAPIExtended;
    /** Internal store callbacks. */
    __subwayBuilder_storeCallbacks__?: unknown;
    /** Chance.js constructor (in-game only). */
    Chance?: new (seed?: number | string) => ChanceInstance;
    /** Chance.js global instance (in-game only). */
    chance?: ChanceInstance;
    /** HammerJS gesture library (in-game only). */
    Hammer?: unknown;
    /** deck.gl namespace (in-game only). */
    deck?: DeckGLNamespace;
    /** luma.gl namespace (in-game only). */
    luma?: unknown;
    /** math.gl namespace (in-game only). */
    mathgl?: unknown;
    /** loaders.gl namespace (in-game only). */
    loaders?: unknown;
  }
}
