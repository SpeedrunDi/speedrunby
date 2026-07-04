import type { L } from '../i18n/types';

export interface Credential {
  id: string;
  name: string;
  issuer: string;
  year: number;
  /** Public verification URL. Credly for the featured badge; the Skilljar
   * course certificates are not on Credly (TODO: swap to Credly if issued
   * later) — they verify via accreditation ID + the LinkedIn certifications
   * section. */
  verifyUrl?: string;
  accreditationId?: string;
  kind?: L;
  description?: L;
  issued?: L;
  validTo?: L;
  skills?: string[];
  featured?: true;
}

export const LINKEDIN_CERTS_URL =
  'https://www.linkedin.com/in/speedrunbyit/details/certifications/';

export const credentials: Credential[] = [
  {
    id: 'claude-architect',
    name: 'Claude Certified Architect – Foundations',
    issuer: 'Anthropic',
    year: 2026,
    featured: true,
    verifyUrl: 'https://www.credly.com/badges/1ff8986c-6a43-4bd9-b304-b96895b0150c/public_url',
    accreditationId: 'moqeww28pg96',
    kind: { ru: 'Сертификация · Foundational', en: 'Certification · Foundational' },
    description: {
      ru: 'Сертификат Claude Certified Architect – Foundations предназначен для solution-архитекторов. Обладатель умеет проектировать и создавать production-grade приложения на Claude с помощью Claude Code, Claude Agent SDK, Claude API и MCP.',
      en: 'The Claude Certified Architect – Foundations credential is designed for solution architects. Earners can design and build production-grade applications with Claude using Claude Code, the Claude Agent SDK, the Claude API, and MCP.',
    },
    issued: { ru: 'май 2026', en: 'May 2026' },
    validTo: { ru: 'май 2027', en: 'May 2027' },
    skills: [
      'AI System Design',
      'Generative AI Architecture',
      'Multi-Agent Orchestration',
      'Tool & MCP Design',
      'Claude Agent SDK',
      'Claude Code Configuration',
      'Context Management',
      'Prompt Engineering',
      'Structured Output',
      'LLMs',
      'Production Reliability',
    ],
  },
  {
    id: 'claude-api',
    name: 'Building with the Claude API',
    issuer: 'Anthropic',
    year: 2026,
    accreditationId: '753ngvfd6th9',
    verifyUrl: LINKEDIN_CERTS_URL,
  },
  {
    id: 'mcp-intro',
    name: 'Introduction to Model Context Protocol',
    issuer: 'Anthropic',
    year: 2026,
    accreditationId: '4mtuhtjke2id',
    verifyUrl: LINKEDIN_CERTS_URL,
  },
  {
    id: 'claude-code',
    name: 'Claude Code in Action',
    issuer: 'Anthropic',
    year: 2026,
    accreditationId: 'qb62youwnaqw',
    verifyUrl: LINKEDIN_CERTS_URL,
  },
  {
    id: 'agent-skills',
    name: 'Introduction to Agent Skills',
    issuer: 'Anthropic',
    year: 2026,
    accreditationId: 't2mdihgqpixt',
    verifyUrl: LINKEDIN_CERTS_URL,
  },
  {
    id: 'attractor-js',
    name: 'JavaScript',
    issuer: 'Attractor School',
    year: 2023,
    kind: {
      ru: 'Сертификат курса · Инженерная база',
      en: 'Course certificate · Engineering foundation',
    },
  },
];
