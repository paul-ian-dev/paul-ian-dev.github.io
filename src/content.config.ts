import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { credentialSchema, experienceSchema, noteSchema, profileSchema, projectSchema } from './content/schemas';

export const collections = {
  profile: defineCollection({ loader: glob({ pattern: 'profile.yaml', base: './src/content/profile' }), schema: profileSchema }),
  experience: defineCollection({ loader: glob({ pattern: '*.yaml', base: './src/content/experience' }), schema: experienceSchema }),
  projects: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/projects' }), schema: projectSchema }),
  credentials: defineCollection({ loader: glob({ pattern: '*.yaml', base: './src/content/credentials' }), schema: credentialSchema }),
  notes: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/notes' }), schema: noteSchema }),
};
