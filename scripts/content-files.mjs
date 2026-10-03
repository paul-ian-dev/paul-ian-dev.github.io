import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';

/**
 * Reads every .yaml/.md file in a folder. Markdown files are split into frontmatter data and body.
 * @param {string} dir
 * @returns {Promise<Array<{ file: string, data: Record<string, unknown>, body: string }>>}
 */
export async function readEntries(dir) {
  const names = (await readdir(dir)).filter((n) => /\.(ya?ml|md)$/.test(n));
  return Promise.all(names.map(async (name) => {
    const file = join(dir, name);
    const raw = (await readFile(file, 'utf8')).replace(/^﻿/, '');
    if (name.endsWith('.md')) {
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!m) throw new Error(`${file}: missing frontmatter`);
      return { file, data: parse(m[1]) ?? {}, body: m[2] };
    }
    return { file, data: parse(raw) ?? {}, body: '' };
  }));
}
