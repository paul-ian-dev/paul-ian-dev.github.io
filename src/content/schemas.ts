import { z } from 'astro/zod';

const yearMonth = z.string().regex(/^(\d{4}-\d{2}|\[[^\]]+\])$/, 'Use YYYY-MM, or a [placeholder]');

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
  cv: z.string().optional(),
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
  end: yearMonth.nullable().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  order: z.number(),
});

export const projectSchema = z.object({
  title: z.string(),
  summary: z.string(),
  year: z.number().int(),
  context: z.string().optional(),
  stack: z.array(z.string()).default([]),
  flow: z.array(z.string()).default([]),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  liveUrl: z.url().optional(),
  repoUrl: z.url().optional(),
  featured: z.boolean().default(false),
  earlier: z.boolean().default(false),
  order: z.number(),
});

export const credentialSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.number().int(),
  detail: z.string().optional(),
  kind: z.enum(['degree', 'certification', 'award']),
  order: z.number(),
});

export const noteSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  linkedinUrl: z.url().optional(),
  draft: z.boolean().default(false),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type Note = z.infer<typeof noteSchema>;
