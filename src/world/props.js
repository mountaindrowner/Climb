// Meshes for a flight's contents: gold, the broken lift, the rest stop, and each obstacle's own model via the entity registry.
import { FH, R, OMEGA } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { S } from '../save/store.js';
import { ST } from '../core/state.js';
import { fireLight } from '../render/renderer.js';
import { lam, bas, mbox, placeArc, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { zoneOf, landingS, topAt } from './path.js';
import { dyn, content } from './generate.js';
import { ENTITIES } from '../entities/registry.js';
const THREE = window.THREE;

export function buildFlightMeshes(c){
  const z = ZONES[zoneOf(c.k)], glow = new THREE.Color(z.glow).getHex();
  const ctx = { c, z, glow, dyn };
  for (const o of c.obs){ const e = ENTITIES[o.type]; if (e && e.build) e.build(o, ctx); }
  for (const gd of c.gold){
    const m = mbox(0.24, 0.24, 0.24, new THREE.MeshLambertMaterial({ color: 0xe8b04a, emissive: 0x5a3a00 }));
    m.position.copy(vArc(gd.s * OMEGA, R + 0.3, topAt(gd.s) + 0.4)); dyn.add(m); gd.m = m;
  }
  const k = c.k, a = landingS(k) * OMEGA, top = k * FH + FH;
  if (c.sp === 'lift'){
    const g = new THREE.Group(), steel = 0x8d96a8;
    g.add(mbox(0.14, 2.2, 0.14, lam(steel), -0.55, 1.1, 0)); g.add(mbox(0.14, 2.2, 0.14, lam(steel), 0.55, 1.1, 0));
    const bar = mbox(1.3, 0.16, 0.3, lam(steel), 0, 2.2, 0); g.add(bar);
    g.add(mbox(1.0, 0.12, 1.0, lam(0x5b6170), 0, 0.15, 0));
    const lampMat = new THREE.MeshBasicMaterial({ color: 0x3a3a40 }); g.add(mbox(0.22, 0.22, 0.22, lampMat, 0, 2.45, 0));
    g.add(mbox(0.05, top + 2.2, 0.05, lam(0x8a7a5a), 0, -(top + 2.2) / 2 + 2.2, 0)); // rope down to the Pool
    placeArc(g, a, R - 1.0, top); dyn.add(g);
    c.extras.push({ type: 'lift', g, bar, lampMat, k });
  } else if (c.sp === 'camp'){
    const g = new THREE.Group();
    const l1 = mbox(0.8, 0.16, 0.18, lam(0x6b4a33), 0, 0.08, 0); l1.rotation.y = 0.5; g.add(l1);
    const l2 = l1.clone(); l2.rotation.y = -0.5; g.add(l2);
    const f1 = mbox(0.28, 0.4, 0.28, bas(0xff8a3c), 0, 0.3, 0), f2 = mbox(0.14, 0.24, 0.14, bas(0xffe08a), 0, 0.3, 0);
    g.add(f1, f2);
    g.add(mbox(0.6, 0.5, 0.6, lam(0x5a4030), 0.9, 0.25, 0.3)); // the trader's pack
    placeArc(g, a, R + 0.4, top); dyn.add(g);
    c.extras.push({ type: 'camp', g, f1, f2, k });
  }
}

// Animate gold, lifts and campfires; point the shared fire light at the nearest source (or the Warden).
export function updateProps(dt, pw){
  const { time } = ST;
  let fireTarget = null, fireDist = 1e9;
  for (const c of content.values()){
    for (const o of c.obs){ const e = ENTITIES[o.type]; if (e && e.draw) e.draw(o); }
    for (const g of c.gold){ if (g.m){ g.m.visible = !g.taken; g.m.rotation.y += dt * 2; g.m.position.y = topAt(g.s) + 0.42 + Math.sin(time * 4 + g.s) * 0.08; } }
    for (const ex of c.extras){
      if (ex.type === 'lift'){
        const ok = S.lifts.includes(ex.k);
        ex.lampMat.color.setHex(ok ? 0xffd88a : 0x3a3a40);
        ex.bar.rotation.z = ok ? 0 : 0.22;
        if (ok){ const d = ex.g.position.distanceTo(pw); if (d < fireDist){ fireDist = d; fireTarget = { p: ex.g.position, y: 2.4, i: 1.3, c: 0xffc070 }; } }
        else if (Math.random() < 0.05) burst(vArc(landingS(ex.k) * OMEGA, R - 1.0, ex.k * FH + FH + 2.1), 2, '#ffcf6b', 2, 6, 0.05); // sparks from the broken lamp
      } else if (ex.type === 'camp'){
        const fl = 0.7 + 0.3 * Math.sin(time * 9) * Math.sin(time * 5.3);
        ex.f1.scale.set(1, fl, 1); ex.f2.scale.set(1, 0.6 + fl * 0.6, 1);
        const d = ex.g.position.distanceTo(pw); if (d < fireDist){ fireDist = d; fireTarget = { p: ex.g.position, y: 0.6, i: 2.4 * fl, c: 0xff8a3c }; }
      }
    }
  }
  if (fireTarget && fireDist < 16){ fireLight.distance = 11; fireLight.position.copy(fireTarget.p); fireLight.position.y += fireTarget.y; fireLight.intensity = fireTarget.i; fireLight.color.setHex(fireTarget.c); }
  else fireLight.intensity = 0;
}
