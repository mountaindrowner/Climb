// Per-frame pose of the warrior: heavy alternating steps, squash on landing, duck, block, swing arc, cape sway, torch.
import { yawFor } from '../../core/math.js';
import { ST } from '../../core/state.js';
import { torch } from '../../render/renderer.js';
import { PL, playerWorld } from './player.js';
import { posOf } from '../../world/path.js';

export function animatePlayer(){
  const { mode, time, G, FALL } = ST;
  if (mode === 'fall' && FALL){
    PL.P.position.set(FALL.r * Math.cos(FALL.a), FALL.y, FALL.r * Math.sin(FALL.a));
    PL.P.rotation.set(0, yawFor(FALL.a), 0); PL.body.rotation.z = FALL.spin; PL.body.position.y = 0.6; PL.P.visible = true;
  } else if (mode === 'pool'){ PL.P.visible = false; }
  else if (G){
    const p = posOf(G.s);
    PL.P.position.copy(playerWorld()); PL.P.rotation.set(0, yawFor(p.a), 0);
    PL.body.position.y = 0;
    PL.P.visible = !(G.inv > 0 && Math.floor(time * 20) % 2 === 0) && mode !== 'title';
    const duck = G.duck > 0 ? 0.6 : 1, sq = G.squash;
    PL.body.scale.set(1 + sq * 0.12, (1 - sq * 0.18) * duck, 1 + sq * 0.12);
    // Legs alternate per step: the lead foot lifts and plants on the next step while the trailing leg pushes off.
    const stepPh = p.land ? 0 : p.fr, swing = mode === 'climb' ? Math.sin(stepPh * Math.PI) : 0;
    const lead = p.i % 2 === 0 ? PL.legA : PL.legB, trail = lead === PL.legA ? PL.legB : PL.legA;
    lead.rotation.z = swing * 0.8; lead.position.y = 0.36 + swing * 0.16;
    trail.rotation.z = -swing * 0.3; trail.position.y = 0.36;
    PL.body.rotation.z = mode === 'climb' ? -0.08 - swing * 0.05 : 0;
    PL.cape.rotation.z = -0.15 - swing * 0.15 + Math.sin(time * 3.1) * 0.06;
    PL.trailMat.opacity = G.atk > 0 ? (G.atk / 0.2) * 0.75 : 0;
    if (G.block > 0){ PL.shield.position.set(0.3, 0.68, 0.05); PL.shield.rotation.set(0, Math.PI / 2, 0); }
    else { PL.shield.position.set(-0.1, 0.64, -0.31); PL.shield.rotation.set(0, 0, 0); }
    let ang = -0.55; if (G.atk > 0){ const q = 1 - G.atk / 0.2; ang = 1.1 - q * 3.2; }
    PL.pivot.rotation.z = ang;
  }
  const pw = G ? playerWorld() : PL.P.position;
  torch.position.set(pw.x * 0.62, pw.y + 2.6, pw.z * 0.62);
  torch.intensity = 1.75 + 0.22 * Math.sin(time * 13) * Math.sin(time * 7.3) + Math.random() * 0.08;
  return pw;
}
