/** Subway Builder Modding API v1.0.0 */

/** The structure of a mod's manifest.json file. */
export interface ModManifest {
  /** Unique mod identifier in reverse-domain notation (e.g. 'com.example.my-mod'). */
  id: string;
  /** Display name of the mod. */
  name: string;
  /** Optional description of what the mod does. */
  description?: string;
  /** Semantic version string (e.g. '1.0.0'). */
  version: string;
  /** Mod author information. */
  author: {
    name: string;
    url?: string;
  };
  /** Entry point JavaScript file (e.g. 'mod.js'). */
  main: string;
  /** Optional URL to the mod's homepage or repository. */
  homepage?: string;
  /** Optional object containing mod dependencies. */
  dependencies?: unknown;
  /** Optional icon string */
  icon?: string;
  /** Maximum and minimum supported game versions */
  maxGameVersion?: string;
  minGameVersion?: string;
}
