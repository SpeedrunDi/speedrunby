export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

/** A value localized into every supported language. */
export type L<T = string> = Record<Locale, T>;
