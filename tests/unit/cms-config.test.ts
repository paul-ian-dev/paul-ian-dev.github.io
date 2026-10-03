import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { credentialSchema, experienceSchema, noteSchema, profileSchema, projectSchema } from '../../src/content/schemas';

type Field = { name: string; widget: string; required?: boolean };
type Collection = { name: string; folder?: string; files?: Array<{ name: string; file: string; fields: Field[] }>; fields?: Field[] };

const config = parse(await readFile('public/admin/config.yml', 'utf8')) as {
  backend: { name: string; repo: string; branch: string };
  collections: Collection[];
};
const fieldsOf = (name: string) => {
  const c = config.collections.find((x) => x.name === name);
  if (!c) throw new Error(`collection ${name} missing`);
  return (c.fields ?? c.files?.[0]?.fields ?? []).map((f) => f.name);
};

describe('CMS config', () => {
  it('targets this repo on master', () => {
    expect(config.backend).toMatchObject({ name: 'github', repo: 'paul-ian-dev/paul-ian-dev.github.io', branch: 'master' });
  });

  const pairs = [
    ['profile', profileSchema],
    ['experience', experienceSchema],
    ['projects', projectSchema],
    ['credentials', credentialSchema],
    ['notes', noteSchema],
  ] as const;

  for (const [name, schema] of pairs) {
    it(`${name}: every schema field is editable in the CMS`, () => {
      const cms = fieldsOf(name);
      for (const key of Object.keys(schema.shape)) expect(cms, `${name}.${key}`).toContain(key);
    });
  }

  it('experience category offers exactly engineering and other', () => {
    const c = config.collections.find((x) => x.name === 'experience')!;
    const field = c.fields!.find((f) => f.name === 'category') as Field & { options: Array<{ value: string }> };
    expect(field.options.map((o) => o.value)).toEqual(['engineering', 'other']);
  });

  it('experience end date is checked in the editor and may be left empty', () => {
    const c = config.collections.find((x) => x.name === 'experience')!;
    const field = c.fields!.find((f) => f.name === 'end') as Field & { pattern?: [string, string] };
    expect(field.pattern, 'end has no pattern').toBeDefined();
    const re = new RegExp(field.pattern![0]);
    expect(re.test('2025-06')).toBe(true);
    expect(re.test('')).toBe(true);
    expect(re.test('2025-6')).toBe(false);
  });
});
