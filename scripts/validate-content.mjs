// Prebuild content validation (CI job: quality).
// Zod-parses every data module: both locales non-empty on every L<>,
// exactly 15 projects, Anthropic credentials carry a verify URL.
// Confidentiality grep lives in check-confidential.mjs (post-build).
import { z } from 'zod';

const L = z.object({
  ru: z.string().min(1),
  en: z.string().min(1),
});

const Project = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: L,
  years: z.string().min(4),
  flagship: z.literal(true).optional(),
  status: z.enum(['production', 'in-dev']),
  description: L,
  tags: z.array(z.string().min(1)).min(1).max(6),
  links: z
    .object({ github: z.string().url().optional(), live: z.string().url().optional() })
    .optional(),
  confidential: z.literal(true).optional(),
});

const Credential = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    issuer: z.string().min(1),
    year: z.number().int().gte(2020),
    verifyUrl: z.string().url().optional(),
    accreditationId: z.string().optional(),
    kind: L.optional(),
    description: L.optional(),
    issued: L.optional(),
    validTo: L.optional(),
    skills: z.array(z.string()).optional(),
    featured: z.literal(true).optional(),
  })
  .refine((c) => c.issuer !== 'Anthropic' || !!c.verifyUrl, {
    message: 'Anthropic credentials must carry a public verify URL (Credly or LinkedIn fallback)',
  });

const StackGroup = z.object({ id: z.string(), title: L, items: z.array(z.string().min(1)).min(3) });
const ProcessStep = z.object({
  n: z.number().int().min(1).max(5),
  title: L,
  body: L,
  artifacts: z.array(z.string()).min(1),
});
const Testimonial = z.object({
  quote: L,
  author: z.string().min(1),
  initials: z.string().min(1).max(3),
  role: L,
  source: z.string(),
});
const Expertise = z.object({
  id: z.string(),
  lead: z.literal(true).optional(),
  title: L,
  body: L,
  hints: z.array(z.string()).min(1),
});
const Stat = z.object({ value: z.number(), suffix: z.string(), label: L });

const fail = (msg) => {
  console.error(`✗ validate-content: ${msg}`);
  process.exitCode = 1;
};

const { projects } = await import('../src/data/projects.ts');
const { credentials } = await import('../src/data/credentials.ts');
const { stack } = await import('../src/data/stack.ts');
const { process: processSteps } = await import('../src/data/process.ts');
const { testimonials } = await import('../src/data/testimonials.ts');
const { expertise } = await import('../src/data/expertise.ts');
const { profile } = await import('../src/data/profile.ts');

const check = (name, schema, value) => {
  const r = schema.safeParse(value);
  if (!r.success)
    fail(`${name}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  else console.log(`✓ ${name}`);
};

check('projects', z.array(Project).length(15), projects);
check('credentials', z.array(Credential).min(6), credentials);
check('stack', z.array(StackGroup).length(4), stack);
check('process', z.array(ProcessStep).length(5), processSteps);
check('testimonials', z.array(Testimonial).min(2), testimonials);
check('expertise', z.array(Expertise).length(3), expertise);
check('profile.stats', z.array(Stat).length(4), profile.stats);
check('profile.about', z.array(L).min(2), profile.about);

if (process.exitCode) {
  console.error('Content validation FAILED');
  process.exit(1);
}
console.log('Content validation passed.');
