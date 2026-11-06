// The crumbling handoff at the foot of each high road. Its first steps have fallen away; one slab is left, on a beam,
// level with the fork landing. Stand on it and it shudders, then rises on its groaning beam to just under the first
// intact step, holds there a moment, and falls. Jump across while it holds. Miss, and you drop and land back on the
// fork landing (one health); a new slab comes up for another try.
//   rest -> shudder -> rise -> hold -> fall -> gone -> return -> rest
// path.js asks it, through DYN.top, what is under a spot on the crumbling foot: the slab's top, or a hole (null).
import { BRANCHES, DYN, branchOf, posOf } from './path.js';
import { ST } from '../core/state.js';
import { S, save } from '../save/store.js';
import { scene } from '../render/renderer.js';
import { stoneTex } from '../render/textures.js';
import { bgeo, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { sfx } from '../audio/sfx.js';
import { rumble } from '../core/input.js';
import { hash, yawFor } from '../core/math.js';
import { ZONES } from '../config/zones.js';
import { zoneOf } from './path.js';
const THREE = window.THREE;

export const HANDOFF = { shudder: 0.6, rise: 1.3, hold: 1.1, gone: 2.2, ret: 1.0 };   // seconds in each state
const SLAB_H = 0.9, DEPTH = 1.8, BEAM = 0.55, DROP = 7;   // the slab's thickness; how far below the landing the beam is footed

// per high road: its state and its meshes
for (const b of BRANCHES){
  const z = ZONES[zoneOf(b.kA)], L = b.platTo - b.platFrom, um = (b.platFrom + b.platTo) / 2, a = b.aA - um / b.r;
  const g = new THREE.Group();
  const slab = new THREE.Mesh(bgeo(L, SLAB_H, DEPTH), new THREE.MeshLambertMaterial({ color: new THREE.Color(z.stone).multiplyScalar(0.8), map: stoneTex }));
  slab.position.y = -SLAB_H / 2;
  const beam = new THREE.Mesh(bgeo(BEAM, 1, BEAM), new THREE.MeshLambertMaterial({ color: 0x3a2e22 }));
  const cap = new THREE.Mesh(bgeo(BEAM * 1.6, 0.18, DEPTH * 0.7), new THREE.MeshLambertMaterial({ color: 0x2c2620 }));   // an iron cap under the slab
  cap.position.y = -SLAB_H - 0.09;
  g.add(slab, cap);
  scene.add(g); scene.add(beam);
  // broken stubs of the fallen steps, still stuck in the rock behind
  for (let i = 0; i < b.iC; i++){
    if (hash(b.j + 7, i) < 0.35) continue;
    const u = (i + 0.5) * b.stepL, au = b.aA - u / b.r, top = b.yA + (i + 1) * b.rise - 0.2 - hash(b.j, i + 3) * 0.4;
    const w = 0.35 + hash(b.j, i + 9) * 0.35;
    const stub = new THREE.Mesh(bgeo(b.stepL * (0.5 + hash(i, b.j) * 0.4), 0.7, w), slab.material);
    vArc(au, b.r + DEPTH / 2 - w / 2 + 0.05, top - 0.35, stub.position); stub.rotation.set(hash(i, 2) * 0.3 - 0.15, yawFor(au), hash(i, 5) * 0.4 - 0.2);
    scene.add(stub);
  }
  b.hs = { st: 'rest', t: 0, y: b.yA, vy: 0, spin: 0, a, um, g, slab, beam, tilt: 0 };
}

// what is under u on the crumbling foot: the slab's top, or null for a hole
DYN.top = (b, u) => {
  const h = b.hs; if (!h) return null;
  const solid = h.st === 'rest' || h.st === 'shudder' || h.st === 'rise' || h.st === 'hold';
  return solid && u >= b.platFrom && u <= b.platTo ? h.y : null;
};
// can he step off the slab here? Only back onto the fork landing, and only while the slab rests level with it.
export const slabLets = (b, u) => u <= b.platTo && (u >= b.platFrom || b.hs.st === 'rest');

let lastG = null;
const ease = x => x < 0.5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x);
function enter(b, st){ b.hs.st = st; b.hs.t = 0; }

export function updateHandoffs(dt){
  const G = ST.G;
  if (G !== lastG){ lastG = G; for (const b of BRANCHES) Object.assign(b.hs, { st: 'rest', t: 0, y: b.yA, vy: 0, spin: 0, tilt: 0 }); }
  for (const b of BRANCHES){
    const h = b.hs; h.t += dt;
    const on = G && G.grounded && branchOf(G.s) === b && posOf(G.s).slab;
    const near = G && Math.abs(posOf(G.s).y - b.yA) < 12;
    if (h.st === 'rest'){ h.y = b.yA; if (on){ enter(b, 'shudder'); sfx.creak(); sfx.crack(); dust(b, 10); if (near) rumble(0.3, 0.2, 200); } }
    else if (h.st === 'shudder'){ if (h.t >= HANDOFF.shudder){ enter(b, 'rise'); sfx.rumble(); } }
    else if (h.st === 'rise'){
      const x = Math.min(1, h.t / HANDOFF.rise); h.y = b.yA + (b.slabTop - b.yA) * ease(x);
      if (Math.random() < dt * 3) sfx.creak();
      if (x >= 1){ enter(b, 'hold'); sfx.step(); ST.dip = Math.max(ST.dip, 0.04); }
    }
    else if (h.st === 'hold'){
      if (h.t > HANDOFF.hold - 0.45 && Math.random() < dt * 8) sfx.crack();
      if (h.t >= HANDOFF.hold){ enter(b, 'fall'); h.vy = 0; h.spin = (hash(b.j, Math.floor(ST.time)) - 0.5) * 2.5; sfx.rumble(); dust(b, 16); if (on) rumble(0.6, 0.4, 300); }
    }
    else if (h.st === 'fall'){
      h.vy -= 30 * dt; h.y += h.vy * dt; h.tilt += h.spin * dt;
      if (h.t > 1.2) enter(b, 'gone');
    }
    else if (h.st === 'gone'){ if (h.t >= HANDOFF.gone){ enter(b, 'return'); h.tilt = 0; } }
    else if (h.st === 'return'){
      const x = Math.min(1, h.t / HANDOFF.ret); h.y = b.yA - 5 + 5 * ease(x);
      if (x >= 1){ enter(b, 'rest'); h.y = b.yA; sfx.step(); }
    }
    draw(b, h);
  }
}
function draw(b, h){
  // the shudder before it moves and the shaking before it goes
  const shaking = h.st === 'shudder' ? 0.06 : h.st === 'rise' ? 0.015 : h.st === 'hold' && h.t > HANDOFF.hold - 0.45 ? 0.05 : 0;
  const jx = (Math.random() - 0.5) * shaking, jy = (Math.random() - 0.5) * shaking;
  const p = vArc(h.a, b.r, h.y + jy);
  h.g.visible = h.st !== 'gone'; h.beam.visible = h.st !== 'gone';
  h.g.position.set(p.x + jx * Math.sin(h.a), p.y, p.z - jx * Math.cos(h.a));
  h.g.rotation.set(0, yawFor(h.a), h.tilt);
  // the beam stands under the slab down to its footing; it drops away with the slab
  const foot = h.st === 'fall' ? h.y - SLAB_H - 0.2 - DROP : b.yA - DROP;
  const topB = h.y - SLAB_H - 0.18, len = Math.max(0.2, topB - foot);
  vArc(h.a, b.r, foot + len / 2, h.beam.position); h.beam.scale.set(1, len, 1); h.beam.rotation.set(0, yawFor(h.a), h.tilt * 0.6);
}
function dust(b, n){ const h = b.hs; burst(vArc(h.a, b.r, h.y - SLAB_H), n, 0x8a7d6b, 2.2, 0.5); }

// the first time on the slab: say what to do
export function handoffHint(G){
  const b = branchOf(G.s); if (!b || ST.practice) return null;
  const u = G.s - b.s0;
  if (u >= b.crumbleTo){ if (!S.seen.includes('handoff')){ S.seen.push('handoff'); save(); } return null; }
  if (S.seen.includes('handoff')) return null;
  return 'The slab rises on its beam, then falls. When it stops, hold {left} and press {jump} to leap onto the steps.';
}
