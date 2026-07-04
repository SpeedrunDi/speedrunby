import type { Locale } from './types';

/**
 * Chrome strings (labels, aria, small UI). Content lives in src/data.
 * Flat dot-keys; `useTranslations` falls back to RU so a missing EN key
 * can never render an empty string.
 */
export const ui = {
  ru: {
    'site.title': 'Amankeldi Kydyraliev — Claude Certified Architect',
    'site.description':
      'Amankeldi Kydyraliev — Claude Certified Architect и fullstack-инженер. Production-grade AI-системы на Claude, микросервисы для финтеха, React/Next.js.',
    'a11y.skip': 'Перейти к содержимому',
    'a11y.themeToggle': 'Переключить тему',
    'a11y.langSwitch': 'Switch to English',
    'notfound.title': 'Страница не найдена',
    'notfound.body': 'Такой страницы нет. Возможно, ссылка устарела.',
    'notfound.home': 'На главную',
    'placeholder.lede':
      'Claude Certified Architect и fullstack-инженер. Полная версия сайта — скоро.',
  },
  en: {
    'site.title': 'Amankeldi Kydyraliev — Claude Certified Architect',
    'site.description':
      'Amankeldi Kydyraliev — Claude Certified Architect and fullstack engineer. Production-grade AI systems with Claude, fintech microservices, React/Next.js.',
    'a11y.skip': 'Skip to content',
    'a11y.themeToggle': 'Toggle theme',
    'a11y.langSwitch': 'Переключить на русский',
    'notfound.title': 'Page not found',
    'notfound.body': 'This page does not exist. The link may be outdated.',
    'notfound.home': 'Back home',
    'placeholder.lede': 'Claude Certified Architect & fullstack engineer. Full site coming soon.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof ui)['ru'];
