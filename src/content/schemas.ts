import { z } from 'astro/zod';

const yearMonth = z.string().regex(/^(\d{4}-\d{2}|\[[^\]]+\])$/, 'Use YYYY-MM, or a [placeholder]');

/** Sveltia CMS saves a cleared optional field as "", so treat blank as missing. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional());

export const profileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  pitch: z.string(),
  location: z.string(),
  greeting: z.array(z.object({ text: z.string(), lang: z.string() })).min(1),
  about: z.array(z.string()).min(1),
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
  cv: optional(z.string()),
  whatIBuild: z.array(z.object({ label: z.string(), caption: z.string(), hub: z.boolean().default(false) })).min(2),
  stack: z.object({
    work: z.array(z.string()),
    projects: z.array(z.string()),
    learning: z.array(z.string()),
  }),
});

export const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  category: z.enum(['engineering', 'other']),
  start: yearMonth,
  end: optional(yearMonth.nullable()),
  summary: optional(z.string()),
  tags: z.array(z.string()).default([]),
  order: z.number(),
});

export const projectSchema = z.object({
  title: z.string(),
  summary: z.string(),
  year: z.number().int(),
  context: optional(z.string()),
  stack: z.array(z.string()).default([]),
  cover: optional(z.string()),
  coverAlt: optional(z.string()),
  liveUrl: optional(z.url()),
  repoUrl: optional(z.url()),
  featured: z.boolean().default(false),
  earlier: z.boolean().default(false),
  order: z.number(),
});

export const credentialSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.number().int(),
  detail: optional(z.string()),
  kind: z.enum(['degree', 'certification', 'award']),
  order: z.number(),
});

export const noteSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  linkedinUrl: optional(z.url()),
  draft: z.boolean().default(false),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type Note = z.infer<typeof noteSchema>;
