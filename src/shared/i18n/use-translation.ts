'use client';

import React from 'react';
import { useTranslationContext } from './translation-provider';
import { UseTranslationReturn, TranslationKeys } from './types';

/**
 * Load translations for a specific module and locale
 */
async function loadModuleTranslations(
  moduleName: string,
  locale: string
): Promise<TranslationKeys | null> {
  try {
    const translations = await import(
      `@/modules/${moduleName}/translations/${locale}.json`
    );
    return translations.default;
  } catch (error) {
    console.error(`Failed to load module translations for ${moduleName}/${locale}:`, error);
    return null;
  }
}

/**
 * Load global translations for a specific locale
 */
async function loadGlobalTranslations(
  locale: string
): Promise<TranslationKeys | null> {
  try {
    const translations = await import(`./translations/${locale}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load global translations for ${locale}:`, error);
    return null;
  }
}


/**
 * Replace parameters in translation string
 * Example: interpolate('Hello {name}!', { name: 'John' }) => 'Hello John!'
 */
function interpolate(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Translation cache to avoid re-loading translations
 */
const translationCache: Record<string, TranslationKeys> = {};

/**
 * Main translation hook with default English text approach
 *
 * @param moduleName - Optional module name for module-specific translations
 * @returns Translation function with locale management
 *
 * @example
 * // Default English text, translated in other languages
 * const { t } = useTranslation('UsersGuard');
 * t('Login'); // EN: "Login", FR: "Connexion", AR: "تسجيل الدخول"
 *
 * @example
 * // With parameters
 * const { t } = useTranslation();
 * t('Welcome, {name}!', { name: 'John' }); // EN: "Welcome, John!", FR: "Bienvenue, John!"
 *
 * @example
 * // Global translations
 * const { t } = useTranslation();
 * t('Save'); // EN: "Save", FR: "Enregistrer", AR: "حفظ"
 */
export function useTranslation(moduleName?: string): UseTranslationReturn {
  const { locale, setLocale } = useTranslationContext();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  /**
   * Translate text with fallback logic:
   * 1. If locale is 'en', return the default English text
   * 2. Check module translations (if moduleName provided)
   * 3. Check global translations
   * 4. Return the default English text if not found
   */
  const t = React.useCallback((defaultText: string, params?: Record<string, string | number>): string => {
    // If English, return default text directly
    if (locale === 'en') {
      return interpolate(defaultText, params);
    }

    // For other languages, look up translations
    const cacheKey = `${moduleName || 'global'}_${locale}`;

    // Try to get from cache first
    const translations = translationCache[cacheKey];

    if (!translations) {
      // Translations not loaded yet, return default English text
      return interpolate(defaultText, params);
    }

    // Try module translations first
    if (moduleName) {
      const moduleKey = `${moduleName}_${locale}`;
      const moduleTranslations = translationCache[moduleKey];

      if (moduleTranslations) {
        // Use defaultText as the key
        const value = moduleTranslations[defaultText];
        if (value && typeof value === 'string') {
          return interpolate(value, params);
        }
      }
    }

    // Fallback to global translations
    const globalKey = `global_${locale}`;
    const globalTranslations = translationCache[globalKey];

    if (globalTranslations) {
      // Use defaultText as the key
      const value = globalTranslations[defaultText];
      if (value && typeof value === 'string') {
        return interpolate(value, params);
      }
    }

    // Return default English text if no translation found
    return interpolate(defaultText, params);
  }, [locale]);

  // Preload translations (runs once per locale/module combination)
  // Skip loading for English since we use default text
  React.useEffect(() => {
    if (locale === 'en') {
      forceUpdate(); // Force re-render for English
      return; // No need to load translations for English
    }

    const loadTranslations = async () => {
      console.log(`🔄 Loading translations for module: ${moduleName || 'global'}, locale: ${locale}`);

      let translationsChanged = false;

      // Load module translations
      if (moduleName) {
        const moduleKey = `${moduleName}_${locale}`;
        if (!translationCache[moduleKey]) {
          const moduleTranslations = await loadModuleTranslations(moduleName, locale);
          if (moduleTranslations) {
            translationCache[moduleKey] = moduleTranslations;
            translationsChanged = true;
            console.log(`✅ Loaded ${Object.keys(moduleTranslations).length} module translations for ${moduleName}/${locale}`);
          }
        }
      }

      // Load global translations
      const globalKey = `global_${locale}`;
      if (!translationCache[globalKey]) {
        const globalTranslations = await loadGlobalTranslations(locale);
        if (globalTranslations) {
          translationCache[globalKey] = globalTranslations;
          translationsChanged = true;
          console.log(`✅ Loaded ${Object.keys(globalTranslations).length} global translations for ${locale}`);
        }
      }

      // Force re-render after translations are loaded
      if (translationsChanged) {
        console.log(`🔄 Forcing re-render for locale: ${locale}`);
        forceUpdate();
      }
    };

    loadTranslations();
  }, [locale, moduleName]);

  return { t, locale, setLocale };
}
