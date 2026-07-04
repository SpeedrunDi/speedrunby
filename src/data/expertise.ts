import type { L } from '../i18n/types';

export interface ExpertiseCard {
  id: string;
  lead?: true;
  title: L;
  body: L;
  hints: string[];
}

export const expertise: ExpertiseCard[] = [
  {
    id: 'ai-agentic',
    lead: true,
    title: { ru: 'AI и агентные системы', en: 'AI & Agentic Systems' },
    body: {
      ru: 'Production-grade приложения на Claude: многоагентная оркестрация, дизайн инструментов и MCP, Claude Agent SDK, настройка Claude Code, управление контекстом и структурированный вывод.',
      en: 'Production-grade Claude applications: multi-agent orchestration, tool & MCP design, the Claude Agent SDK, Claude Code configuration, context management and structured output.',
    },
    hints: ['Claude', 'MCP', 'Agent SDK'],
  },
  {
    id: 'backend',
    title: { ru: 'Бэкенд-разработка', en: 'Backend Engineering' },
    body: {
      ru: 'Надёжные сервисы для финтеха на Java и Spring Boot — чистые API, продуманные потоки данных и интеграции, рассчитанные на прод.',
      en: 'Reliable services for fintech on Java and Spring Boot — clean APIs, solid data flows and integrations built to run in production.',
    },
    hints: ['Java', 'Spring Boot', 'Microservices'],
  },
  {
    id: 'frontend',
    title: { ru: 'Фронтенд-разработка', en: 'Frontend Engineering' },
    body: {
      ru: 'Быстрые и аккуратные интерфейсы на React, Next.js и TypeScript — точная вёрстка, грамотный стейт-менеджмент и внимание к деталям.',
      en: 'Fast, polished interfaces on React, Next.js and TypeScript — precise layout, solid state management and real attention to detail.',
    },
    hints: ['React', 'Next.js', 'TypeScript'],
  },
];
