// The motor: input to motion. Instant acceleration and turning, full air control, variable jump height with heavier
// fall gravity, coyote time and a jump buffer, a step-up assist, crouch-walking, an invulnerable roll that cancels
// attacks, a held shield with a parry window, and weapon combos with anticipation, active frames and recovery.
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { WEAPONS } from '../../config/weapons.js';
import { S } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { clamp } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { vArc } from '../../render/primitives.js';
import { burst } from '../../render/particles.js';
import { posOf, walkY, special, landingS, branchOf, forkFrom, routeSign, safeSpot } from '../../world/path.js';
import { IN, consume } from '../../core/input.js';
import { holeAt, ceilingAt } from '../../world/ground.js';
import { slabLets } from '../../world/handoff.js';
import { strike, drink, repairLift, hurt } from './player.js';
const MV = TUNE.move;
const dust = (G, n, spd, c) => { const p = posOf(G.s); burst(vArc(p.a, p.r, G.y + 0.05), n, c || '#b4aac8', spd || 1.4, 5, 0.08); };

export function stepMotor(G, dt){
  const H = IN.held;
  // ---- timers
  G.inv = Math.max(0, G.inv - dt); G.hurtT = Math.max(0, G.hurtT - dt); G.rollCd = Math.max(0, G.rollCd - dt);
  G.coyote = Math.max(0, G.coyote - dt); G.jumpBuf = Math.max(0, G.jumpBuf - dt); G.landT = Math.max(0, G.landT - dt); G.jumpT += dt;
  if (G.roll > 0){ G.roll = Math.max(0, G.roll - dt); if (G.roll === 0) G.rollCd = MV.roll.cooldown; }
  const stunned = G.hurtT > 0;

  // ---- presses
  if (consume('flask')) drink();
  if (consume('jump')){
    const p = posOf(G.s);
    if (!ST.practice && G.grounded && p.land && special(p.k) === 'lift' && !S.lifts.includes(p.k) && Math.abs(G.v) < 1) repairLift(p.k);
    else G.jumpBuf = MV.buffer;
  }
  if (consume('roll') && G.roll <= 0 && G.rollCd <= 0 && !stunned && (!G.atk || G.atk.phase !== 'active')){
    const dir = H.right ? 1 : H.left ? -1 : G.face;
    G.roll = MV.roll.time; G.rollDir = dir; G.face = dir; G.atk = null; G.crouch = false; sfx.whoosh(); dust(G, 6, 2);
  }
  if (consume('block')) G.blockAt = ST.time;
  G.blocking = H.block && G.roll <= 0 && !stunned && !G.atk;
  if (consume('attack') && G.roll <= 0 && !stunned){
    if (!G.atk) startSwing(G, 0);
    else G.atk.queued = true;                     // buffered into the next swing of the combo
  }

  // ---- the swing
  if (G.atk){
    const A = G.atk, w = WEAPONS[G.weapon], sw = w.combo[A.i];
    A.t += dt;
    if (A.phase === 'wind' && A.t >= sw.wind){ A.phase = 'active'; A.t = 0; G.v += G.face * sw.lunge / sw.active; sfx.slash(); }
    if (A.phase === 'active'){
      if (!A.hit){ A.hit = true; if (strike(sw)){ A.landed = true; } }
      if (A.t >= sw.active){ A.phase = 'rec'; A.t = 0; }
    }
    if (A.phase === 'rec'){
      if (A.queued && A.i + 1 < w.combo.length && A.t >= sw.rec * 0.25) startSwing(G, A.i + 1);
      else if (A.t >= sw.rec) G.atk = null;
      else if (A.t >= sw.rec * 0.4 && (H.left || H.right || G.jumpBuf > 0)) G.atk = null;   // recovery cancels into movement
    }
  }

  // ---- crouch: held down on the ground; forced while a beam is overhead
  const under = ceilingAt(G.s);
  G.crouch = !!(G.roll <= 0 && G.grounded && (H.down || under) && !G.atk);

  // ---- horizontal
  const dir = stunned ? 0 : (H.right ? 1 : 0) - (H.left ? 1 : 0);
  let target = 0, accel = G.grounded ? MV.accel : MV.airAccel;
  if (G.roll > 0){ G.v = G.rollDir * MV.roll.speed * (G.roll > MV.roll.time * 0.25 ? 1 : 0.5); }
  else if (G.atk && G.atk.phase !== 'rec'){ target = 0; accel = MV.decel * 0.35; }    // planted while swinging; the lunge carries him
  else {
    G.sprinting = !!(H.sprint && dir && !G.crouch && !G.blocking && (G.grounded || G.sprinting));   // a sprint carries into a jump, not out of one
    target = dir * (G.sprinting ? MV.sprint : MV.run * IN.mag) * (G.crouch ? MV.crouchMul : 1) * (G.blocking ? MV.blockMul : 1);   // IN.mag: how far a stick is pushed
    if (G.grounded && (dir === 0 || Math.sign(G.v) === -dir || Math.abs(G.v) > Math.abs(target))) accel = MV.decel;   // stopping, turning and slowing are instant
    if (dir !== 0 && dir !== G.face && !G.atk){ G.face = dir; if (G.grounded && Math.abs(G.v) > 1.5) dust(G, 5, 1.8); }   // instant turn, a skid puff
  }
  if (G.roll <= 0 && !stunned){ const dv = target - G.v; G.v += Math.sign(dv) * Math.min(Math.abs(dv), accel * dt); }
  else if (stunned) G.v *= Math.exp(-dt * 4);

  // ---- vertical
  const wasGrounded = G.grounded;
  if (G.jumpBuf > 0 && (G.grounded || G.coyote > 0) && !stunned && G.roll <= 0){
    G.jumpBuf = 0; G.coyote = 0; G.grounded = false; G.crouch = false; G.jumpT = 0;
    G.vy = Math.sqrt(2 * MV.gravityUp * MV.jumpHeight); sfx.jump(); dust(G, 6, 1.6);
    if (G.atk && G.atk.phase === 'rec') G.atk = null;
    // a fork: jumping left from the fork landing hops across onto the high road behind it
    const p = posOf(G.s), b = !branchOf(G.s) && p.land && H.left && forkFrom(p.k);
    if (b){ G.s = G.prevS = b.s0 + 0.25; G.safeS = G.s; G.hop = 1; sfx.whoosh(); }
  }
  if (!G.grounded){
    let g = G.vy > 0 ? MV.gravityUp : MV.gravityDown;
    if (H.jump && Math.abs(G.vy) < MV.apexBand) g *= MV.apexMul;               // a little hang at the top
    if (!H.jump && G.vy > 0 && G.jumpT > MV.minHop) G.vy *= Math.pow(MV.cutMul, dt * 20);   // let go early, jump lower (a quick tap still clears a hole)
    G.vy = Math.max(-MV.maxFall, G.vy - g * dt);
  }
  // ---- move, then find the ground
  G.prevS = G.s; G.s += G.v * dt * routeSign(G.s);   // a high road winds the other way round: right goes back down it
  if (G.s < 0.05) G.s = 0.05;
  // the ends of a high road: walk off its top onto the landing it rejoins, or back off its foot onto the fork landing
  const br = branchOf(G.prevS);
  // the slab at a high road's foot: he cannot walk off it (only jump), save back onto the fork landing while it rests
  if (br && G.grounded && posOf(G.prevS).slab && !slabLets(br, G.s - br.s0)){ G.s = G.prevS; G.v = 0; }
  if (br){
    const u = G.s - br.s0;
    if (u > br.len){ G.s = G.prevS = landingS(br.kB) - (u - br.len); G.hop = 1; }
    else if (u < 0){ G.s = G.prevS = landingS(br.kA) - u; G.hop = 1; }
  }
  if (!G.grounded) G.y += G.vy * dt;
  let hole = holeAt(G.s); const gy = walkY(G.s);   // the ground he rides: the stair's slope, not each step
  if (G.grounded){
    if (hole){ G.grounded = false; G.vy = 0; G.coyote = MV.coyote; }              // the step is gone: fall, but a jump still works for a moment
    else { G.y = gy; G.safeS = G.s; }
  } else if (!hole && G.vy <= 0 && G.y <= gy + 0.02 && gy - G.y > 0.45 && holeAt(G.prevS)){
    G.s = G.prevS; G.v = 0; hole = holeAt(G.s);                                   // sunk too far into a hole to step out: the riser stops him
  } else if (!hole && G.vy <= 0 && G.y <= gy + 0.02){                            // landing; a riser a little above the feet is stepped up onto
    G.y = gy; G.vy = 0; G.grounded = true; G.landT = 0.12; G.safeS = G.s;
    if (!wasGrounded){ sfx.step(); dust(G, 8, 1.8); ST.dip = Math.max(ST.dip, TUNE.feel.stepDip * 0.8); }
  } else if (!hole && G.vy > 0 && G.y < gy - 0.3){
    G.y = gy;                                                                     // never inside the stair
  }
  if (hole && !G.grounded && G.y < hole.top - 1.4){
    // fell through a broken step: hurt, and back on the last solid ground
    hurt(1, 'Fell', null);
    G.s = G.prevS = safeSpot(G.safeS - G.face * 0.15 * routeSign(G.safeS)); G.y = walkY(G.s); G.vy = 0; G.v = 0; G.grounded = true; G.inv = Math.max(G.inv, 0.8);
  }

  // ---- footfalls: a heavy step lands every half stride
  if (G.grounded && Math.abs(G.v) > 0.4 && G.roll <= 0){
    const before = Math.sin(G.runPhase);
    G.runPhase += Math.abs(G.v) * dt * (G.stepRate || (G.crouch ? 3.4 : 2.6));   // a rig with measured strides sets stepRate: a footfall per real step
    if (Math.sign(Math.sin(G.runPhase)) !== Math.sign(before)){
      if (G.crouch) sfx.creep(); else { sfx.step(); if (Math.random() < 0.6) dust(G, 3, 1); }   // footfalls no longer dip the camera; landings still do
    }
  } else if (G.grounded && G.roll <= 0) G.runPhase = 0;
}

function startSwing(G, i){
  G.atk = { i, t: 0, phase: 'wind', hit: false, queued: false };
  G.lastAtk = ST.time;
}
export const swingInfo = G => G.atk ? { ...G.atk, sw: WEAPONS[G.weapon].combo[G.atk.i] } : null;
export { clamp };
