// Save migrations, oldest first. Each takes the raw stored object and returns the next shape.
// The current shape is produced by `fresh()` in store.js; bump SAVE_VERSION when it changes and add a step here.
export const SAVE_VERSION = 2;

export const MIGRATIONS = [
  // 1 -> 2: the v3 prototype stored the same fields without a version; flights and metres are unchanged.
  raw => ({ ...raw, version: 2 }),
];

export function migrate(raw){
  let data = raw || {}, v = data.version || 1;
  for (; v < SAVE_VERSION; v++) data = MIGRATIONS[v - 1](data);
  return data;
}
