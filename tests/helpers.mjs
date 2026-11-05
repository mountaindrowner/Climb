// The entity registry imports THREE-dependent modules, so tests list the types by reading the registry source.
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/entities/registry.js', import.meta.url), 'utf8');
export const ENTITY_TYPES = [...src.matchAll(/^import \* as (\w+) from/gm)].map(m => m[1]);
