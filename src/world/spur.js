// The spur at each fork: a short stair from the fork landing, climbing right into the wall, crumbling. Once he is on it
// its steps fall away behind him, a collapse that chases him up at nearly his running speed, so he cannot stop; it ends
// in a broken edge, and the high road's foot is beside it, behind and higher, out of reach without the run-up. Each
// step shakes before it goes. When he is off it again, the stones grind back up into place for another try.
//   path.js asks DYN.gone(spur, i) whether step i has fallen (a hole, reported by ground.js).
import { SPURS, DYN, spurOf, SPUR } from './path.js';
import { ST } from '../core/state.js';
import { S, save } from '../save/store.js';
import { scene } from '../render/renderer.js';
import { stoneTex } from '../render/textures.js';
import { bgeo, vArc } from '../render/primitives.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { rng } from '../core/math.js';
import { burst } from '../render/particles.js';
import { sfx } from '../audio/sfx.js';
import { rumble } from '../core/input.js';
import { hash, yawFor } from '../core/math.js';
import { ZONES } from '../config/zones.js';
import { zoneOf, posOf, landingS, BR_BASE } from './path.js';
import { impact } from '../fx/impact.js';
import { setToast } from '../fx/feedback.js';
const THREE = window.THREE;

const COLLAPSE = SPUR.collapse;
const STEP_H = 0.9, DEPTH = 0.9;

for (const sp of SPURS){
  const z = ZONES[zoneOf(sp.kA)], mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(z.stone).multiplyScalar(0.82), map: stoneTex });
  sp.steps3 = [];
  for (let i = 0; i < sp.steps; i++){
    const u = (i + 0.5) * sp.stepL, a = sp.a0 + u / sp.r, top = sp.yA + (i + 1) * sp.rise;
    const m = new THREE.Mesh(bgeo(sp.stepL * 1.02, STEP_H, DEPTH), mat);
    vArc(a, sp.r, top - STEP_H / 2, m.position); m.rotation.set(0, yawFor(a), 0); scene.add(m);
    sp.steps3.push({ m, home: m.position.clone(), a, top, vy: 0, spin: (hash(sp.j, i) - 0.5) * 3 });
  }
  // the broken end: two jagged stones jutting from it
  for (let k = 0; k < 2; k++){
    const a = sp.tipA + 0.02, st = new THREE.Mesh(bgeo(0.35 + 0.2 * k, 0.5, 0.4), mat);
    vArc(a, sp.r + (k - 0.5) * 0.4, sp.topY - 0.3 - 0.2 * k, st.position); st.rotation.set(0.2 * k, yawFor(a), 0.5 - k); scene.add(st);
  }
  // a closed fork (not open this run): the spur long fallen, a heap of rubble at the back of the landing instead
  const heap = new THREE.Group(), rm = rockMaterial(new THREE.Color(z.stone).multiplyScalar(0.7).getHex()), r = rng(sp.j * 131 + 7);
  for (let k = 0; k < 9; k++){
    const u = r() * 2.2, a = sp.a0 + u / sp.r, h = 0.25 + r() * 0.9 * (1 - u / 3);
    heap.add(rock(rm, { w: 0.5 + r() * 0.5, h: 0.4 + r() * 0.5, d: 0.5 + r() * 0.4, jag: 0.35 }, (sp.r + (r() - 0.5) * 0.6) * Math.cos(a), sp.yA + h * 0.5, (sp.r + (r() - 0.5) * 0.6) * Math.sin(a), r));
  }
  heap.visible = false; scene.add(heap); sp.heap = heap;
  sp.cs = { t: null, gone: new Array(sp.steps).fill(false), regrow: 0, off: 0 };
}
DYN.gone = (sp, i) => !!(sp.cs && sp.cs.gone[i]);

let lastG = null;
export function updateSpurs(dt){
  const G = ST.G;
  if (G !== lastG){ lastG = G; for (const sp of SPURS) reset(sp); }
  for (const sp of SPURS){
    const c = sp.cs, on = G && spurOf(G.s) === sp, open = sp.road.open;
    sp.heap.visible = !open;
    if (!open){ for (const s3 of sp.steps3) s3.m.visible = false; continue; }
    if (on && G.grounded && c.t == null && !c.regrow){ c.t = 0; sfx.crack(); sfx.rumble(); if (Math.abs(G.y - sp.yA) < 6) rumble(0.35, 0.25, 220); }
    if (c.t != null){
      c.t += dt;
      for (let i = 0; i < sp.steps; i++){
        const at = COLLAPSE.delay + (i + 0.5) * sp.stepL / COLLAPSE.speed;
        if (!c.gone[i] && c.t >= at){ c.gone[i] = true; const s3 = sp.steps3[i]; s3.vy = 0; sfx.crack(); burst(s3.home.clone().setY(s3.top), 10, '#8c8298', 2.2, 6, 0.08); }
      }
      // all fallen and he is off it: after a rest, the stones grind back up
      if (c.gone.every(Boolean) && !on){ c.off += dt; if (c.off > COLLAPSE.rest){ c.t = null; c.regrow = COLLAPSE.regrow; sfx.creak(); } }
    }
    if (c.regrow){ c.regrow = Math.max(0, c.regrow - dt); if (!c.regrow) reset(sp); }
    draw(sp, dt);
  }
}
function reset(sp){ sp.rubHits = 0; const c = sp.cs; c.t = null; c.off = 0; c.regrow = 0; c.gone.fill(false); for (const s3 of sp.steps3){ s3.m.position.copy(s3.home); s3.m.rotation.set(0, yawFor(s3.a), 0); s3.m.visible = true; } }
function draw(sp, dt){
  const c = sp.cs;
  for (let i = 0; i < sp.steps; i++){
    const s3 = sp.steps3[i], m = s3.m;
    if (c.regrow){ const u = 1 - c.regrow / COLLAPSE.regrow; m.visible = true; m.position.copy(s3.home); m.position.y -= 4 * (1 - u) * (1 - u); m.rotation.set(0, yawFor(s3.a), 0); continue; }
    if (c.gone[i]){
      s3.vy -= 24 * dt; m.position.y += s3.vy * dt; m.rotation.z += s3.spin * dt; m.rotation.x += s3.spin * 0.4 * dt;
      m.visible = m.position.y > s3.home.y - 18;
      continue;
    }
    // shaking before it goes
    const at = c.t == null ? Infinity : COLLAPSE.delay + (i + 0.5) * sp.stepL / COLLAPSE.speed;
    const k = c.t != null && c.t > at - COLLAPSE.shake ? 0.05 : 0;
    m.position.set(s3.home.x + (Math.random() - 0.5) * k, s3.home.y + (Math.random() - 0.5) * k, s3.home.z + (Math.random() - 0.5) * k);
  }
}

// The ram (a rune): strike the rubble over a closed fork three times and it gives, opening the fork for this climb.
const closedHere = G => { if (G.s >= BR_BASE || !G.grounded) return null; const p = posOf(G.s); if (!p.land) return null; const sp = SPURS.find(s => s.kA === p.k && !s.road.open); return sp && Math.abs(G.s - landingS(sp.kA)) < 1.5 ? sp : null; };
export function hitRubble(G, swing){
  if (ST.practice || !S.runes.includes('ram')) return false;
  const sp = closedHere(G); if (!sp) return false;
  sp.rubHits = (sp.rubHits || 0) + 1;
  const at = sp.heap.children[0] ? sp.heap.children[0].getWorldPosition(new THREE.Vector3()) : G.s;
  at.y += 0.4; impact(at, ({ slash: -0.6, back: 0.6, chop: -1.3 }[swing.pose] || 0) * G.face, { heavy: sp.rubHits >= 3 });
  burst(at, 12, '#8c8298', 3, 8, 0.08); sfx.crack();
  if (sp.rubHits >= 3){ sp.road.open = true; sfx.rumble(); rumble(0.5, 0.4, 260); burst(at, 30, '#8c8298', 4, 7, 0.1); setToast('The ram breaks through', 'The old stair is open: hold {right} and press {jump}', 2.6); }
  return true;
}
let nearRubble = null;   // which hint was showing: it counts as seen once he has walked on from it
export function rubbleHint(G){
  const here = ST.practice ? null : closedHere(G), key = S.runes.includes('ram') ? 'rubble' : 'rubble0';
  if (!here){ if (nearRubble && !S.seen.includes(nearRubble)){ S.seen.push(nearRubble); save(); } nearRubble = null; return null; }
  if (S.seen.includes(key)) return null;
  nearRubble = key;
  return key === 'rubble' ? 'Rubble over the old stair. It is loose: strike it three times with {attack} and the ram breaks through.' : 'Rubble chokes an old stair here. Something heavier than a sword could break it.';
}
// the first time on a spur: say what to do
export function spurHint(G){
  const sp = spurOf(G.s); if (!sp || ST.practice) return null;
  if (S.seen.includes('handoff')) return null;
  if (G.s - sp.s0 > sp.len - 0.5){ S.seen.push('handoff'); save(); return null; }
  return 'It is falling away under you: keep running, and press {jump} at its end to leap onto the high road.';
}
