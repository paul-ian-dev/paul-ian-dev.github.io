import type { CollectionEntry } from 'astro:content';

export function hasCaseStudy(entry: CollectionEntry<'projects'>): boolean {
  return Boolean(entry.body && entry.body.trim().length > 0);
}
