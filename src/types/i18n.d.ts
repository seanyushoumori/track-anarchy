/** Subway Builder Modding API v1.0.0 */

// =============================================================================
// SUPPORTED LANGUAGES
// =============================================================================

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh';

// =============================================================================
// I18N TYPES
// =============================================================================

/**
 * Translation dictionary keyed by language code, then by translation key to value.
 * Outer key is a language code (e.g. 'en', 'es').
 * Inner key is the translation key, value is the translated string.
 */
export type I18nTranslations = Record<string, Record<string, string>>;

/** A function that translates a key to a localized string */
export type TranslateFunction = (key: string) => string;

/**
 * Internationalization API.
 * Supports dot-notation keys (e.g. 'menu.file.open').
 * Falls back to English, then to the key itself.
 */
export interface I18nAPI {
  /** Translate a key with optional parameter interpolation */
  translate(key: string, params?: Record<string, string | number>): string;

  /** Get the current language code */
  getCurrentLanguage(): string;

  /** Get all supported language codes */
  getSupportedLanguages(): string[];

  /**
   * Create a translate function from a translations dictionary.
   * Supports dot-notation keys. Falls back to English, then to the key itself.
   */
  create(translations: I18nTranslations): TranslateFunction;
}
