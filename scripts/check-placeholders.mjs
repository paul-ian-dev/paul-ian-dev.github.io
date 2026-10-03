import { readEntries } from './content-files.mjs';
import { findPlaceholders } from './placeholders.mjs';

const dirs = ['profile', 'experience', 'projects', 'credentials', 'notes'].map((d) => `src/content/${d}`);
const found = [];
for (const dir of dirs) {
  for (const entry of await readEntries(dir)) {
    for (const p of findPlaceholders({ ...entry.data, body: entry.body })) found.push(`${entry.file} → ${p.path}: ${p.text}`);
  }
}
if (found.length) {
  console.warn(`\n⚠ ${found.length} placeholder(s) still on the site:\n  ${found.join('\n  ')}\n`);
} else {
  console.log('✓ No placeholders left in content.');
}
