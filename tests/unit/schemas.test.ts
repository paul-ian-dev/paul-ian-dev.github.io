import { describe, expect, it } from 'vitest';
import { credentialSchema, experienceSchema, noteSchema, profileSchema, projectSchema } from '../../src/content/schemas';

// Sveltia CMS saves a cleared optional field as "" (output.omit_empty_optional_fields defaults to false).
describe('optional fields cleared in the CMS', () => {
  it('experience: an empty end date means current', () => {
    const r = experienceSchema.safeParse({ company: 'A', title: 'B', category: 'engineering', start: '2025-01', end: '', summary: '', order: 1 });
    expect(r.success, r.error?.message).toBe(true);
    expect(r.data?.end).toBeUndefined();
    expect(r.data?.summary).toBeUndefined();
  });

  it('projects: empty URLs, screenshot and context are treated as missing', () => {
    const r = projectSchema.safeParse({
      title: 'A', summary: 'B', year: 2025, order: 1, context: '', cover: '', coverAlt: '', liveUrl: '', repoUrl: '',
    });
    expect(r.success, r.error?.message).toBe(true);
    expect(r.data).not.toHaveProperty('liveUrl', '');
    expect(r.data?.liveUrl).toBeUndefined();
    expect(r.data?.repoUrl).toBeUndefined();
    expect(r.data?.cover).toBeUndefined();
  });

  it('credentials: an empty detail is treated as missing', () => {
    const r = credentialSchema.safeParse({ name: 'A', issuer: 'B', year: 2025, kind: 'award', detail: '', order: 1 });
    expect(r.success, r.error?.message).toBe(true);
    expect(r.data?.detail).toBeUndefined();
  });

  it('notes: an empty LinkedIn URL is treated as missing', () => {
    const r = noteSchema.safeParse({ title: 'A', date: '2026-01-01', summary: 'B', linkedinUrl: '' });
    expect(r.success, r.error?.message).toBe(true);
    expect(r.data?.linkedinUrl).toBeUndefined();
  });

  it('profile: an empty CV is treated as missing', () => {
    const r = profileSchema.safeParse({
      name: 'A', headline: 'B', pitch: 'C', location: 'D', greeting: [{ text: 'Hi', lang: 'en' }], about: ['E'],
      email: 'a@b.co', linkedin: 'https://a.b', github: 'https://c.d', cv: '',
      whatIBuild: [{ label: 'X', caption: 'x' }, { label: 'Y', caption: 'y' }], stack: { work: [], projects: [], learning: [] },
    });
    expect(r.success, r.error?.message).toBe(true);
    expect(r.data?.cv).toBeUndefined();
  });

  it('still rejects a malformed URL or date', () => {
    expect(projectSchema.safeParse({ title: 'A', summary: 'B', year: 2025, order: 1, liveUrl: 'not a url' }).success).toBe(false);
    expect(experienceSchema.safeParse({ company: 'A', title: 'B', category: 'other', start: '2025-01', end: '2025-6', order: 1 }).success).toBe(false);
  });
});
