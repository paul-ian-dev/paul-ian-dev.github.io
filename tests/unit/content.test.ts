import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readEntries } from '../../scripts/content-files.mjs';
import { credentialSchema, experienceSchema, noteSchema, profileSchema, projectSchema } from '../../src/content/schemas';

const collections = [
  ['profile', profileSchema],
  ['experience', experienceSchema],
  ['projects', projectSchema],
  ['credentials', credentialSchema],
  ['notes', noteSchema],
] as const;

// Phone numbers are never published.
const CONTACT = /\+60|\b04\d{2}\s?\d{3}\s?\d{3}\b/;

// Names that must stay off the site live in a git-ignored file, so the list itself is never published.
const PRIVATE_FILE = 'private/forbidden-terms.txt';
const privateTerms = existsSync(PRIVATE_FILE)
  ? readFileSync(PRIVATE_FILE, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  : [];
const PRIVATE = privateTerms.length ? new RegExp(privateTerms.join('|'), 'i') : null;

describe('seed content', () => {
  for (const [name, schema] of collections) {
    it(`every ${name} entry matches its schema`, async () => {
      for (const entry of await readEntries(`src/content/${name}`)) {
        const result = schema.safeParse(entry.data);
        expect(result.success, `${entry.file}: ${result.error?.message}`).toBe(true);
      }
    });

    it(`${name} contains no phone numbers`, async () => {
      for (const entry of await readEntries(`src/content/${name}`)) {
        expect(JSON.stringify(entry.data) + entry.body, entry.file).not.toMatch(CONTACT);
      }
    });

    it.skipIf(!PRIVATE)(`${name} contains nothing from the private list`, async () => {
      for (const entry of await readEntries(`src/content/${name}`)) {
        expect(JSON.stringify(entry.data) + entry.body, entry.file).not.toMatch(PRIVATE!);
      }
    });
  }

  it('has exactly three engineering roles and two other-work roles', async () => {
    const roles = (await readEntries('src/content/experience')).map((e) => e.data.category);
    expect(roles.filter((c) => c === 'engineering')).toHaveLength(3);
    expect(roles.filter((c) => c === 'other')).toHaveLength(2);
  });
});
