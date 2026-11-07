// The ledges of decks.js, drawn and kept: stone slabs on the stair's own lane, a switchback's slabs held out from the
// wall on stone corbels, crumbling ones cracked and paler; the broken ends of the stair where a platforming flight's
// steps are gone, or a switchback comes up through it. A crumbling ledge shakes once he stands on it, drops away, and
// grinds back up after a while when he is off it.
import { R, RW, OMEGA } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { bgeo, vArc } from '../render/primitives.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { burst } from '../render/particles.js';
import { stoneTex } from '../render/textures.js';
import { yawFor, rng } from '../core/math.js';
import { zoneOf, topAt } from './path.js';
import { DECKS, HOLES, LEDGE } from './decks.js';
const THREE = window.THREE;
const CRUMBLE = { shake: 0.3, drop: 0.65, regrow: 3.0 };

function slab(d, dyn){
  const z = ZONES[zoneOf(d.k)], len = d.s1 - d.s0, a = (d.s0 + d.s1) / 2 * OMEGA, r = rng(d.id * 97 + 3);
  const base = new THREE.Color(z.stone).multiplyScalar(d.kind === 'crumble' ? 1.15 : 0.9);
  const g = new THREE.Group();
  const top = new THREE.Mesh(bgeo(len * 1.02, LEDGE.thick, 1.9), new THREE.MeshLambertMaterial({ color: base, map: stoneTex }));
  top.position.y = -LEDGE.thick / 2; g.add(top);
  const under = rockMaterial(base.clone().multiplyScalar(0.7).getHex());
  for (let i = 0; i < 3; i++) g.add(rock(under, { w: len * 0.35, h: 0.35, d: 1.2, jag: 0.35 }, (i - 1) * len * 0.3, -LEDGE.thick - 0.12, (r() - 0.5) * 0.5, r));
  if (d.kind === 'crumble'){ const crack = new THREE.MeshBasicMaterial({ color: 0x1a1418 }); for (let i = 0; i < 2; i++){ const c = new THREE.Mesh(bgeo(0.04, 0.02, 1.7), crack); c.position.set((i - 0.5) * len * 0.4, 0.005, 0); c.rotation.y = (r() - 0.5) * 0.6; g.add(c); } }
  if (d.owner === 'fork'){   // held out from the wall on a corbel
    const cb = new THREE.Mesh(bgeo(Math.min(0.6, len * 0.5), 0.9, RW - R - 0.6), new THREE.MeshLambertMaterial({ color: base.clone().multiplyScalar(0.8), map: stoneTex }));
    cb.position.set(0, -LEDGE.thick - 0.35, -(RW - R) / 2 - 0.2); cb.rotation.x = 0.35; g.add(cb);
  }
  g.position.copy(vArc(a, R, d.top)); g.rotation.set(0, yawFor(a), 0); dyn.add(g);
  d.m = g; d.home = g.position.y;
}
export function buildLedges(dyn){
  for (const d of DECKS) slab(d, dyn);
  // the stair's broken ends at its holes
  for (const h of HOLES){
    const mat = rockMaterial(new THREE.Color(ZONES[zoneOf(h.k)].stone).multiplyScalar(0.75).getHex()), r = rng(Math.floor(h.s0 * 13));
    for (const s of [h.s0, h.s1]){ for (let i = 0; i < 2; i++){ const a = s * OMEGA, p = vArc(a + (r() - 0.5) * 0.01, R + (r() - 0.5) * 1.6, topAt(s + (s === h.s0 ? -0.05 : 0.05)) - 0.25); dyn.add(rock(mat, { w: 0.4, h: 0.4, d: 0.5, jag: 0.4 }, p.x, p.y, p.z, r)); } }
  }
}
// a fork's ledges, built once the ram opens it mid-climb
export function buildMore(list, dyn){ for (const d of list) slab(d, dyn); }
export function updateLedges(dt){
  const G = ST.G;
  for (const d of DECKS){
    if (!d.m || d.kind !== 'crumble') continue;
    const on = G && G.on === d;
    if (!d.gone){
      if (on){ if (!d.t) sfx.crack(); d.t += dt; } else if (d.t && d.t < CRUMBLE.shake) d.t = Math.max(0, d.t - dt);
      d.m.position.y = d.home + (d.t > 0 ? (Math.random() - 0.5) * 0.05 : 0);
      if (d.t >= CRUMBLE.drop){ d.gone = 0.0001; d.vy = 0; sfx.crack(); burst(d.m.position.clone(), 14, '#8c8298', 2.4, 7, 0.08); }
    } else {
      d.gone += dt; d.vy -= 22 * dt; d.m.position.y += d.vy * dt; d.m.visible = d.gone < 1.4;
      if (d.gone > CRUMBLE.regrow && !on){ d.gone = 0; d.t = 0; d.m.visible = true; d.m.position.y = d.home; sfx.creak(); }
    }
  }
}
