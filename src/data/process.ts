import type { L } from '../i18n/types';

/** "How I work with Claude" — the architect-process showcase section. */
export interface ProcessStep {
  n: 1 | 2 | 3 | 4 | 5;
  title: L;
  body: L;
  artifacts: string[];
}

export const process: ProcessStep[] = [
  {
    n: 1,
    title: { ru: 'Discovery и context engineering', en: 'Discovery & context engineering' },
    body: {
      ru: 'Начинаю с контекста, а не с промпта: CLAUDE.md как контракт проекта, документация как источник контекста, память для долгоживущих фактов. Агент хорош настолько, насколько хорош его контекст.',
      en: 'I start with context, not prompts: CLAUDE.md as the project contract, docs-as-context, persistent memory for long-lived facts. An agent is only as good as its context.',
    },
    artifacts: ['CLAUDE.md', 'docs-as-context', 'memory'],
  },
  {
    n: 2,
    title: { ru: 'Архитектура', en: 'Architecture' },
    body: {
      ru: 'Проектирую топологию: один агент или оркестрация, какие инструменты нужны, где границы MCP-серверов. Контракты интерфейсов инструментов — до кода.',
      en: 'I design the topology: single agent vs orchestration, which tools exist, where MCP server boundaries sit. Tool interface contracts come before code.',
    },
    artifacts: ['agent topology', 'MCP servers', 'tool contracts'],
  },
  {
    n: 3,
    title: { ru: 'Guardrails', en: 'Guardrails' },
    body: {
      ru: 'Надёжность закладывается заранее: схемы structured output, permission-режимы, поверхность prompt-injection, эвалы на ключевые сценарии.',
      en: 'Reliability is designed in: structured-output schemas, permission modes, the prompt-injection surface, evals for the critical paths.',
    },
    artifacts: ['output schemas', 'permission modes', 'evals'],
  },
  {
    n: 4,
    title: { ru: 'Сборка', en: 'Build' },
    body: {
      ru: 'Строю через Claude Code: воркфлоу с сабагентами, хуки как гейты качества, ревью-агенты в CI. Этот сайт собран ровно так — репозиторий открыт.',
      en: 'I build with Claude Code: subagent workflows, hooks as quality gates, review agents in CI. This site was built exactly this way — the repo is open.',
    },
    artifacts: ['Claude Code', 'subagents', 'hooks', 'CI review'],
  },
  {
    n: 5,
    title: { ru: 'Эксплуатация', en: 'Operate' },
    body: {
      ru: 'После запуска: трейсинг агентных прогонов, бюджеты стоимости и латентности, регрессионные эвалы при изменениях моделей и промптов.',
      en: 'After launch: tracing agent runs, cost and latency budgets, regression evals when models or prompts change.',
    },
    artifacts: ['tracing', 'cost budgets', 'regression evals'],
  },
];
