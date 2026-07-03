import { DEFAULT_LOCALE, type L, type Locale } from './types';
import { ui, type UiKey } from './ui';

/** Pick the localized variant of a content value (RU fallback). */
export function t<T>(value: L<T>, locale: Locale): T {
  return value[locale] ?? value[DEFAULT_LOCALE];
}

/** Translator for chrome strings with RU fallback. */
export function useTranslations(locale: Locale) {
  return function translate(key: UiKey): string {
    return ui[locale][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

/** Root path of a locale ('/' for ru, '/en/' for en). */
export function localePath(locale: Locale, hash = ''): string {
  const base = locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
  return `${base}${hash}`;
}

export function altLocale(locale: Locale): Locale {
  return locale === 'ru' ? 'en' : 'ru';
}
