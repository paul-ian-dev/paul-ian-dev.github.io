const PLACEHOLDER = /\[[^\]\n]+\](?!\()/g;

/**
 * @param {unknown} value
 * @param {string} [path]
 * @returns {Array<{ path: string, text: string }>}
 */
export function findPlaceholders(value, path = '') {
  if (typeof value === 'string') {
    return [...value.matchAll(PLACEHOLDER)].map((m) => ({ path, text: m[0] }));
  }
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => findPlaceholders(v, path ? `${path}.${i}` : String(i)));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => findPlaceholders(v, path ? `${path}.${k}` : k));
  }
  return [];
}
