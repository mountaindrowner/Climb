// The run's choices, pure (no page): which marks Fetch offers, which oaths a stone carries. Seeded, so a stone or a rest
// stop offers the same things however often you come back to it in one climb.
import { MARKS, OATHS } from '../config/run.js';
import { S } from '../save/store.js';
import { ST } from '../core/state.js';
export const knownMarks = () => Object.keys(MARKS).filter(id => MARKS[id].start || S.unlocked.includes(id));
// the marks Fetch offers at rest stop k this climb: three of the known ones you do not have, the same each visit
export function offeredMarks(seed, k, G = ST.G){
  const pool = knownMarks().filter(id => !G.marks.includes(id));
  let h = (Math.imul(seed | 0, 2654435761 | 0) ^ Math.imul(k + 1, 40503)) >>> 0; const out = [];
  while (pool.length && out.length < 3){ h = (Math.imul(h, 1103515245) + 12345) >>> 0; out.push(pool.splice(h % pool.length, 1)[0]); }
  return out;
}
// the two oaths an oath stone offers
export function offeredOaths(seed, k){ const ids = Object.keys(OATHS), h = (Math.imul((seed | 0) + 7, 2246822519 | 0) ^ Math.imul(k + 3, 3266489917 | 0)) >>> 0, skip = h % 3; return ids.filter((_, i) => i !== skip); }

