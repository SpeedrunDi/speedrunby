import type { L } from '../i18n/types';

export interface StackGroup {
  id: string;
  title: L;
  items: string[];
}

export const stack: StackGroup[] = [
  {
    id: 'backend',
    title: { ru: 'Бэкенд', en: 'Backend' },
    items: [
      'Java',
      'Spring Boot',
      'Spring Cloud',
      'PostgreSQL',
      'Node.js',
      'Express',
      'MongoDB',
      'Elasticsearch',
      'ActiveMQ / Artemis',
      'Flyway',
    ],
  },
  {
    id: 'frontend',
    title: { ru: 'Фронтенд', en: 'Frontend' },
    items: [
      'React',
      'Next.js',
      'TypeScript',
      'Vue',
      'Astro',
      'Tailwind CSS',
      'MobX / Zustand',
      'TanStack Query',
      'GSAP',
      'Three.js',
    ],
  },
  {
    id: 'ai',
    title: { ru: 'AI и агентные', en: 'AI & Agentic' },
    items: [
      'Claude API',
      'Anthropic SDK',
      'Claude Code',
      'Agentic Tool-Use',
      'Prompt Engineering',
      'Structured Output',
    ],
  },
  {
    id: 'infra',
    title: { ru: 'Инфра и DevOps', en: 'Infra & DevOps' },
    items: [
      'Docker',
      'Docker Compose',
      'GitHub Actions',
      'GitLab CI',
      'Prometheus & Grafana',
      'Nginx',
      'Keycloak',
      'Testcontainers',
      'Cloudflare',
    ],
  },
];
