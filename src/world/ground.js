// What the stair offers the warrior's feet and head at a point: holes where broken steps have fallen away, and low
// ceilings where beams cross. Threat modules register these by their state; the motor asks.
import { TUNE } from '../config/tuning.js';
import { content } from './generate.js';
import { posOf, branchOf, spurOf, spurHole } from './path.js';
const E = () => TUNE.move.holeEdge;

function near(s, fn){
  const k = posOf(s).k;
  for (let kk = k - 1; kk <= k + 1; kk++){ const c = content.get(kk); if (!c) continue; for (const o of c.obs){ const r = fn(o); if (r) return r; } }
  return null;
}
// A broken step that has fallen away under s: { top } of the missing step, or null.
export const holeAt = s => {
  const sp = spurOf(s); if (sp) return spurHole(sp, s - sp.s0);   // a spur: its fallen steps, and the void past its end
  if (branchOf(s)) return null;
  return mainHole(s);
};
const mainHole = s => near(s, o => o.type === 'gap' && o.holeOpen && s > o.step0 + E() && s < o.step0 + (o.wide ? 2 : 1) - E() ? { top: o.top } : null);
// A beam overhead at s: true or null.
export const ceilingAt = s => near(s, o => o.type === 'beam' && Math.abs(s - o.s) < o.halfWidth ? true : null);
