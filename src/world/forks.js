// The fork landings, drawn and played. An open fork: its switchback's first ledge hangs over the near end of the landing
// (decks.js, ledges.js). A closed one (not open this climb): that ledge has fallen and lies in a heap of rubble on the
// landing; with the ram (a rune), three blows clear it and the switchback stands again for this climb.
import { R, OMEGA, F, FL } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { ST } from '../core/state.js';
import { S, save } from '../save/store.js';
import { scene } from '../render/renderer.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { rng } from '../core/math.js';
import { burst } from '../render/particles.js';
import { sfx } from '../audio/sfx.js';
import { rumble } from '../core/input.js';
import { impact } from '../fx/impact.js';
import { setToast } from '../fx/feedback.js';
import { BRANCHES, zoneOf, posOf, landingS, landingY, forkFrom } from './path.js';
import { switchbackOf, openFork } from './decks.js';
import { buildMore } from './ledges.js';
import { dyn } from './generate.js';
import { setFlight } from './stair.js';
const THREE = window.THREE;

for (const b of BRANCHES){
  const z = ZONES[zoneOf(b.kA)], heap = new THREE.Group(), rm = rockMaterial(new THREE.Color(z.stone).multiplyScalar(0.7).getHex()), r = rng(b.j * 131 + 7);
  const s0 = b.kA * FL + F, y = landingY(b.kA);
  for (let k = 0; k < 9; k++){
    const u = r() * 1.4, a = (s0 + u) * OMEGA, h = 0.25 + r() * 0.8 * (1 - u / 2);
    heap.add(rock(rm, { w: 0.5 + r() * 0.5, h: 0.4 + r() * 0.5, d: 0.5 + r() * 0.4, jag: 0.35 }, (R + 0.55 + (r() - 0.5) * 0.6) * Math.cos(a), y + h * 0.5, (R + 0.55 + (r() - 0.5) * 0.6) * Math.sin(a), r));
  }
  heap.visible = false; scene.add(heap); b.heap = heap;
}
let lastG = null;
export function updateForks(){
  const G = ST.G;
  if (G !== lastG){ lastG = G; for (const b of BRANCHES) b.rubHits = 0; }
  for (const b of BRANCHES) b.heap.visible = !b.open && !ST.practice && !!switchbackOf(b.kA);
}
const closedHere = G => { if (G.s >= 100000 || !G.grounded || G.on) return null; const p = posOf(G.s); if (!p.land) return null; const b = BRANCHES.find(x => x.kA === p.k && !x.open && switchbackOf(x.kA)); return b && Math.abs(G.s - landingS(b.kA)) < 1.5 ? b : null; };
export const atRubble = G => !ST.practice && S.runes.includes('ram') && !!closedHere(G);   // a heap he can strike: his cuts stay put on it
export function hitRubble(G, swing){
  if (ST.practice || !S.runes.includes('ram')) return false;
  const b = closedHere(G); if (!b) return false;
  b.rubHits = (b.rubHits || 0) + 1;
  const at = b.heap.children[0].getWorldPosition(new THREE.Vector3()); at.y += 0.4;
  impact(at, ({ slash: -1.25, back: -1.1, chop: 1.0 }[swing.pose] || 0) * G.face, { heavy: b.rubHits >= 3 });
  burst(at, 12, '#8c8298', 3, 8, 0.08); sfx.crack();
  if (b.rubHits >= 3){ b.open = true; buildMore(openFork(b), dyn); { const sw = switchbackOf(b.kA); setFlight(Math.floor(sw.hole.s0 / FL)); } sfx.rumble(); rumble(0.5, 0.4, 260); burst(at, 30, '#8c8298', 4, 7, 0.1); setToast('The ram breaks through', 'A ledge stands over the landing again', 2.4); }
  return true;
}
// what to say on a fork landing, the first time
let nearRubble = null;
export function forkHint(G){
  if (ST.practice || G.s >= 100000) return null;
  const p = posOf(G.s);
  if (G.grounded && !G.on && p.land && forkFrom(p.k) && switchbackOf(p.k) && !S.seen.includes('fork')) return 'A ledge hangs over this landing: a switchback, a shortcut. Jump and you catch its edge and pull up; then climb it back the other way.';
  if (G.on && G.on.owner === 'fork' && !S.seen.includes('fork')){ S.seen.push('fork'); save(); }
  const here = closedHere(G), key = S.runes.includes('ram') ? 'rubble' : 'rubble0';
  if (!here){ if (nearRubble && !S.seen.includes(nearRubble)){ S.seen.push(nearRubble); save(); } nearRubble = null; return null; }
  if (S.seen.includes(key)) return null;
  nearRubble = key;
  return key === 'rubble' ? 'A fallen ledge in a heap of rubble. Strike it three times with {attack} and the ram clears it.' : 'A fallen ledge lies here in a heap of rubble. Something heavier than a sword could clear it.';
}
