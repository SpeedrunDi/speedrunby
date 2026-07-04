import type { L } from '../i18n/types';

export const profile = {
  name: 'Amankeldi Kydyraliev',
  nameShort: 'AK',
  role: {
    ru: 'Claude Certified Architect и fullstack-инженер',
    en: 'Claude Certified Architect & Fullstack Engineer',
  } satisfies L,
  lede: {
    ru: 'Проектирую и создаю production-grade приложения на Claude — многоагентная оркестрация, дизайн инструментов и MCP, Claude Agent SDK — опираясь на 4+ года разработки fullstack-систем в финтехе на Java, Spring Boot, React и Next.js.',
    en: 'I design and build production-grade applications with Claude — multi-agent orchestration, tool & MCP design, and the Claude Agent SDK — backed by 4+ years shipping fullstack fintech systems on Java, Spring Boot, React and Next.js.',
  } satisfies L,
  location: { ru: 'Бишкек, Кыргызстан', en: 'Bishkek, Kyrgyzstan' } satisfies L,
  company: { ru: 'Финтех · EvoGroup.ai', en: 'Fintech · EvoGroup.ai' } satisfies L,
  email: 'amanmaksat0@gmail.com',
  socials: {
    github: 'https://github.com/SpeedrunDi',
    linkedin: 'https://www.linkedin.com/in/speedrunbyit/',
    telegram: 'https://t.me/speedrunby',
    credly: 'https://www.credly.com/badges/1ff8986c-6a43-4bd9-b304-b96895b0150c/public_url',
  },
  repo: 'https://github.com/SpeedrunDi/speedrunby',
  stats: [
    {
      value: 4,
      suffix: '+',
      label: { ru: 'года в продакшене', en: 'years shipping to production' },
    },
    { value: 5, suffix: '', label: { ru: 'сертификатов Anthropic', en: 'Anthropic credentials' } },
    {
      value: 11,
      suffix: '',
      label: { ru: 'навыков архитектора подтверждено', en: 'architect skills verified' },
    },
    {
      value: 10,
      suffix: '+',
      label: { ru: 'продакшн-микросервисов', en: 'production microservices' },
    },
  ] as { value: number; suffix: string; label: L }[],
  about: [
    {
      ru: 'Я fullstack-инженер с 4+ годами разработки и вывода в прод продакшн-систем, сейчас в финтехе в EvoGroup.ai — бэкенд на Java и Spring Boot, фронтенд на React, Next.js и TypeScript.',
      en: "I'm a fullstack engineer with 4+ years building and shipping production systems, currently in fintech at EvoGroup.ai — backend on Java and Spring Boot, frontend on React, Next.js and TypeScript.",
    },
    {
      ru: 'В 2026 году получил сертификат Claude Certified Architect – Foundations от Anthropic — это закрепило то, на чём я фокусируюсь сейчас: проектирование надёжных production-grade AI-систем вокруг Claude.',
      en: 'In 2026 I earned the Claude Certified Architect – Foundations credential from Anthropic, formalizing where my focus now lives: designing reliable, production-grade AI systems around Claude.',
    },
  ] as L[],
};
