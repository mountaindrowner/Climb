// Spitter: clings to the wall above the stair, draws an aim line while it charges, then spits an orb.
// Answer: B to block; a parry (B within the parry window) reflects the orb and kills it.
// States: idle -> charge -> fired -> spent | reflect -> dead
import { RW, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { GOLD } from '../../config/economy.js';
import { ST } from '../../core/state.js';
import { sfx } from '../../audio/sfx.js';
import { lam, bas, mbox, placeArc } from '../../render/primitives.js';
import { burst } from '../../render/particles.js';
import { float, hitstop, flash } from '../../fx/feedback.js';
import { topAt } from '../../world/path.js';
import { hurt, head } from '../player/player.js';
const THREE = window.THREE;
const T = TUNE.spitter, _v = new THREE.Vector3();

export function build(o, { glow, dyn }){
  const a = o.s * OMEGA, top = topAt(o.s);
  const g = new THREE.Group();
  g.add(mbox(0.9, 0.8, 0.5, lam(0x1a1622), 0, 0, -0.05));
  g.add(mbox(0.72, 0.62, 0.5, lam(0x2e2738), 0, 0, 0.1));
  const mouthMat = new THREE.MeshBasicMaterial({ color: glow }); mouthMat.color.multiplyScalar(0.35);
  const mouth = mbox(0.36, 0.14, 0.06, mouthMat, 0, -0.1, 0.37); g.add(mouth);
  g.add(mbox(0.06, 0.06, 0.06, bas(glow), -0.16, 0.14, 0.37), mbox(0.06, 0.06, 0.06, bas(glow), 0.16, 0.14, 0.37));
  g.scale.setScalar(1.3); placeArc(g, a, RW - 0.4, top + 3.1); dyn.add(g);
  const orb = mbox(0.55, 0.55, 0.55, new THREE.MeshBasicMaterial({ color: glow })); orb.visible = false; dyn.add(orb);
  const aim = mbox(0.05, 0.05, 1, new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0, depthWrite: false })); aim.visible = false; dyn.add(aim);
  o.m = g; o.mouth = mouth; o.mouthMat = mouthMat; o.orbM = orb; o.glow = glow; o.aim = aim;
}

export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  if (!o.alive){ o.dead += dt; return; }
  if (o.st === 'idle' && d < T.range){ o.st = 'charge'; o.tm = 0; }
  if (o.st === 'charge'){ o.tm += dt; if (o.tm >= T.charge){ o.st = 'fired'; o.tm = 0; o.orb = { t: 0, dur: T.flight }; sfx.spit(); } }
  if (o.st === 'fired'){ o.orb.t += dt; if (o.orb.t >= o.orb.dur) resolveOrb(o); }
  if (o.st === 'reflect'){
    o.orb.t += dt;
    if (o.orb.t >= o.orb.dur){
      o.alive = false; o.dead = 0; o.done = true; o.orb = null;
      const sp = o.m.position.clone(); burst(sp, 16, o.glow, 4); G.gold += GOLD.spitterParry; float('+' + GOLD.spitterParry, sp, '#e8b04a'); sfx.hit();
    }
  }
}
function resolveOrb(o){
  const G = ST.G, since = ST.time - G.lastBlock;
  if (G.block > 0 && since <= TUNE.player.parryWindow){
    o.st = 'reflect'; o.orb = { t: 0, dur: T.reflect, back: true, from: head(1.2) };
    sfx.parry(); flash(-0.25); hitstop(TUNE.feel.hitstopParry); float('Parry!', head(), '#9fd0ff'); burst(head(1.2), 14, '#9fd0ff', 3);
  } else if (G.block > 0){
    o.st = 'spent'; o.orb = null; o.done = true; sfx.block(); float('Blocked', head(), '#c9d2e0'); burst(head(1.2), 6, '#c9d2e0', 2);
  } else { o.st = 'spent'; o.orb = null; o.done = true; hurt(1, 'Hit'); }
}

export function draw(o){
  const G = ST.G, time = ST.time;
  if (!o.alive || !G || Math.abs(o.s - G.s) > 8){ if (!o.alive) o.m.visible = o.dead < 0.05; o.orbM.visible = false; o.aim.visible = false; return; }
  const ch = o.st === 'charge' ? o.tm / T.charge : 0;
  o.mouthMat.color.setHex(o.glow).multiplyScalar(0.35 + ch * 0.65);
  o.mouth.scale.set(1 + ch * 0.6, 1 + ch * 1.4, 1);
  if (o.st === 'charge'){
    const from = o.m.localToWorld(_v.set(0, -0.1, 0.4)).clone(), to = head(1.2);
    o.aim.visible = true; o.aim.position.lerpVectors(from, to, 0.5); o.aim.lookAt(to); o.aim.scale.z = from.distanceTo(to);
    o.aim.material.opacity = 0.15 + ch * 0.6;
  } else o.aim.visible = false;
  if (o.orb){
    o.orbM.visible = true;
    const q = o.orb.t / o.orb.dur;
    let from, to;
    if (o.orb.back){ from = o.orb.from; to = o.m.position; } else { from = o.m.position; to = head(1.2); }
    o.orbM.position.lerpVectors(from, to, q); o.orbM.position.y += Math.sin(q * Math.PI) * 0.7;
    o.orbM.material.color.setHex(o.orb.back ? 0x9fd0ff : o.glow);
    o.orbM.rotation.y += 0.3; o.orbM.scale.setScalar(0.9 + 0.2 * Math.sin(time * 30));
    if (Math.random() < 0.6) burst(o.orbM.position, 1, o.orb.back ? '#9fd0ff' : o.glow, 0.4, 0, 0.1);
  } else o.orbM.visible = false;
}

export function hud(o, d, { drawIcon, drawTiming }){
  if (o.orb && !o.orb.back) drawTiming('B', o.orb.t, o.orb.dur);
  if (o.alive && o.st === 'charge') drawIcon(o.m.position.clone().setY(o.m.position.y + 1.0), '!', '#ff6b5a');
}
