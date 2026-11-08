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
import { posOf, walkY, topAt, special, landingS, routeSign, safeSpot, BR_BASE, hallOf, hallAt, HALL } from '../../world/path.js';
import { decksAt, decksNear, stairHole, TURN, MANTLE } from '../../world/decks.js';
import { IN, consume } from '../../core/input.js';
import { holeAt, ceilingAt } from '../../world/ground.js';
import { strike, drink, repairLift, hurt, fallHurt } from './player.js';
import { swingRate, rollCooldown, sprintMul } from '../../run/run.js';
const MV = TUNE.move;
const dust = (G, n, spd, c) => { const p = posOf(G.s); burst(vArc(p.a, p.r, G.y + 0.05), n, c || '#b4aac8', spd || 1.4, 5, 0.08); };

export function stepMotor(G, dt){
  const H = IN.held;
  // ---- timers
  G.inv = Math.max(0, G.inv - dt); G.hurtT = Math.max(0, G.hurtT - dt); G.rollCd = Math.max(0, G.rollCd - dt);
  G.coyote = Math.max(0, G.coyote - dt); G.jumpBuf = Math.max(0, G.jumpBuf - dt); G.landT = Math.max(0, G.landT - dt); G.jumpT += dt;
  if (G.roll > 0){ G.roll = Math.max(0, G.roll - dt); if (G.roll === 0) G.rollCd = rollCooldown(G, MV.roll.cooldown); }
  const stunned = G.hurtT > 0;

  // ---- presses
  if (consume('flask')) drink();
  if (consume('jump')){
    const p = posOf(G.s);
    const hl = !ST.practice && G.grounded && p.land && Math.abs(G.v) < 1 && hallAt(G.s);
    if (!ST.practice && G.grounded && p.land && special(p.k) === 'lift' && !S.lifts.includes(p.k) && Math.abs(G.v) < 1) repairLift(p.k);
    else if (hl && hl.broken){ G.s = G.prevS = hl.s0 + HALL.mouth; G.v = 0; G.hop = 1; sfx.step(); dust(G, 6, 1.2); }   // standing in a broken wall's opening: step through into the hall
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
    A.t += dt * swingRate(G);                       // the oath of the Knell quickens every phase
    if (A.phase === 'wind' && A.t >= sw.wind){ A.phase = 'active'; A.t = 0; G.v += G.face * sw.lunge / sw.active; sfx.slash(); }
    if (A.phase === 'active'){
      if (!A.hit){ A.hit = true; if (strike(sw, A.i === w.combo.length - 1)){ A.landed = true; } }
      if (A.t >= sw.active){ A.phase = 'rec'; A.t = 0; }
    }
    if (A.phase === 'rec'){
      if (A.queued && A.i + 1 < w.combo.length && A.t >= sw.rec * 0.25) startSwing(G, A.i + 1);
      else if (A.t >= sw.rec) G.atk = null;
      else if (A.t >= sw.rec * 0.4 && (H.left || H.right || G.jumpBuf > 0)) G.atk = null;   // recovery cancels into movement
    }
  }

  // ---- crouch: held down on the ground; forced while a beam is overhead
  const under = !G.on && ceilingAt(G.s);   // (a ledge is above any beam)
  G.crouch = !!(G.roll <= 0 && G.grounded && (H.down || under) && !G.atk);

  // ---- horizontal
  const dir = stunned ? 0 : (H.right ? 1 : 0) - (H.left ? 1 : 0);
  let target = 0, accel = G.grounded ? MV.accel : MV.airAccel;
  if (G.roll > 0){ G.v = G.rollDir * MV.roll.speed * (G.roll > MV.roll.time * 0.25 ? 1 : 0.5); }
  else if (G.atk && G.atk.phase !== 'rec'){ target = 0; accel = MV.decel * 0.35; }    // planted while swinging; the lunge carries him
  else {
    G.sprinting = !!(H.sprint && dir && !G.crouch && !G.blocking && (G.grounded || G.sprinting));   // a sprint carries into a jump, not out of one
    target = dir * (G.sprinting ? MV.sprint * sprintMul(G) : MV.run * IN.mag) * (G.crouch ? MV.crouchMul : 1) * (G.blocking ? MV.blockMul : 1);   // IN.mag: how far a stick is pushed
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
    G.on = null;                                       // off a ledge too
  }
  if (!G.grounded){
    let g = G.vy > 0 ? MV.gravityUp : MV.gravityDown;
    if (H.jump && Math.abs(G.vy) < MV.apexBand) g *= MV.apexMul;               // a little hang at the top
    if (!H.jump && G.vy > 0 && G.jumpT > MV.minHop) G.vy *= Math.pow(MV.cutMul, dt * 20);   // let go early, jump lower (a quick tap still clears a hole)
    G.vy = Math.max(-MV.maxFall, G.vy - g * dt);
  }
  // ---- hauling himself up onto an edge: it carries him, nothing else moves him
  if (G.mantle){
    const M = G.mantle; M.t += dt; const u = Math.min(1, M.t / M.dur), e = u * u * (3 - 2 * u);
    G.prevS = G.s; G.s = M.s0 + (M.s1 - M.s0) * Math.max(0, (u - 0.45) / 0.55); G.y = M.y0 + (M.y1 - M.y0) * Math.min(1, e * 1.25); G.v = 0; G.vy = 0;
    if (u >= 1){ G.mantle = null; G.grounded = true; G.on = M.deck; G.y = M.y1; G.airTop = G.y; G.landT = 0.12; G.safeS = G.s; sfx.step(); dust(G, 6, 1.4); }
    footfalls(G, dt); return;
  }
  // ---- move, then find the ground
  G.prevS = G.s; G.s += G.v * dt * routeSign(G.s);
  if (G.s < 0.05) G.s = 0.05;
  const hl = hallOf(G.prevS);
  if (hl){
    const u = G.s - hl.s0;
    if (u < 0){ G.s = G.prevS = landingS(hl.kH) + (u - HALL.mouth) * R / hl.r; G.hop = 1; }                       // back out through the opening onto its landing
    else if (u > hl.len){ G.s = G.prevS = hl.sOut + (u - hl.len) * R / hl.r; G.grounded = false; G.vy = Math.min(G.vy, 0); G.hop = 1; }   // off the ledge: a drop onto the stair below
  }
  const y0 = G.y;
  if (!G.grounded){ G.y += G.vy * dt; G.airTop = Math.max(G.airTop == null ? G.y : G.airTop, G.y); }
  const main = G.s < BR_BASE;
  // up through a gap in the stair a turn above (a switchback comes out this way): past its surface, he is on that turn
  if (main && !G.grounded && G.vy > 0 && stairHole(G.s + TURN) && G.y > topAt(G.s + TURN) + 0.02){ G.s += TURN; G.prevS += TURN; }
  // ---- the ledges (decks.js): one-way, on the stair's own lane
  if (main && G.on){
    const d = G.on.gone ? null : decksAt(G.s).filter(x => Math.abs(x.top - G.y) < 0.5).sort((p, q) => q.top - p.top)[0];
    if (d){ G.on = d; G.y = d.top; G.grounded = true; G.safeS = G.s; footfalls(G, dt); return; }
    G.on = null;
    const gyM = walkY(G.s);
    if (!holeAt(G.s) && Math.abs(gyM - G.y) < 0.5){ G.y = gyM; G.grounded = true; G.safeS = G.s; }        // off its end onto the stair
    else { G.grounded = false; G.vy = 0; G.coyote = MV.coyote; G.airTop = G.y; }                    // off its end into the air
    footfalls(G, dt); return;
  }
  if (main && !G.grounded && G.vy <= 0){
    const d = decksAt(G.s).filter(x => y0 >= x.top - 0.03 && G.y <= x.top + 0.02).sort((p, q) => q.top - p.top)[0];
    if (d && (holeAt(G.s) || d.top > walkY(G.s) + 0.05)){
      G.on = d; G.y = d.top; G.vy = 0; G.grounded = true; G.landT = 0.12; G.safeS = G.s; landed(G, wasGrounded);
      footfalls(G, dt); return;
    }
  }
  // ---- catching an edge in the air: a ledge (or the stair) just ahead, its top within reach above his feet
  if (main && !G.grounded && G.roll <= 0 && !stunned){
    const dir = H.right ? 1 : H.left ? -1 : 0;
    if (G.vy < 5){
      const sa = G.s + dir * 0.6, here = decksAt(G.s);
      let best = null;
      for (const d of decksNear(Math.min(G.s, sa) - 0.01, Math.max(G.s, sa) + 0.01)){
        const up = d.top - G.y; if (!(up > 0.35 && up <= MANTLE) || (best && d.top <= best.y1)) continue;
        if (here.includes(d)){
          // under it, close to an edge: up at that edge (the one he is heading for, else the nearer)
          const toS0 = G.s - d.s0, toS1 = d.s1 - G.s, e = dir < 0 ? (toS0 < 0.7 ? d.s0 : toS1 < 0.7 ? d.s1 : null) : dir > 0 ? (toS1 < 0.7 ? d.s1 : toS0 < 0.7 ? d.s0 : null) : (Math.min(toS0, toS1) < 0.7 ? (toS0 < toS1 ? d.s0 : d.s1) : null);
          if (e != null) best = { deck: d, y1: d.top, s1: e + (e === d.s0 ? 0.35 : -0.35) };
        } else if (dir){
          const edge = dir > 0 ? d.s0 : d.s1;
          if ((edge - G.s) * dir >= -0.05) best = { deck: d, y1: d.top, s1: edge + dir * 0.35 };
        }
      }
      if (!best && dir && stairHole(G.s) && !holeAt(sa)){   // (out of a platforming gap; a broken step is a pit, not a ledge) const up = topAt(sa) - G.y; if (up > 0.35 && up <= MANTLE) best = { deck: null, y1: walkY(sa + dir * 0.3), s1: sa + dir * 0.3 }; }
      if (best){ G.mantle = { t: 0, dur: 0.32, s0: G.s, s1: best.s1, y0: G.y, y1: best.y1, deck: best.deck }; G.vy = 0; G.v = 0; G.atk = null; sfx.whoosh(); footfalls(G, dt); return; }
    }
  }
  let hole = holeAt(G.s); const gy = walkY(G.s);   // the ground he rides: the stair's slope, not each step
  if (G.grounded){
    if (hole){ G.grounded = false; G.vy = 0; G.coyote = MV.coyote; G.airTop = G.y; }   // the step is gone: fall, but a jump still works for a moment
    else { G.y = gy; G.safeS = G.s; G.airTop = G.y; }
  } else if (!hole && G.vy <= 0 && G.y <= gy + 0.02 && gy - G.y > 0.45 && holeAt(G.prevS)){
    G.s = G.prevS; G.v = 0; hole = holeAt(G.s);                                   // sunk too far into a hole to step out: the riser stops him
  } else if (!hole && G.vy <= 0 && G.y <= gy + 0.02){                            // landing; a riser a little above the feet is stepped up onto
    G.y = gy; G.vy = 0; G.grounded = true; G.landT = 0.12; G.safeS = G.s;
    landed(G, wasGrounded);
  } else if (!hole && G.vy > 0 && G.y < gy - 0.3){
    G.y = gy;                                                                     // never inside the stair
  }
  if (hole && !G.grounded && G.y < hole.top - 1.4){
    if (ST.practice){
      // a practice run: hurt, and back on the last solid ground, to try it again
      hurt(1, 'Fell', null);
      let back = safeSpot(G.safeS - G.face * 0.15 * routeSign(G.safeS));
      // the last solid ground may have crumbled since: step back off the hole, and keep a step's run-up before it
      for (let i = 0; i < 24 && (holeAt(back) || holeAt(back + G.face * routeSign(back)) || holeAt(back + 0.5 * G.face * routeSign(back))); i++) back -= 0.25 * G.face * routeSign(back);
      G.s = G.prevS = back; G.y = walkY(G.s); G.vy = 0; G.v = 0; G.grounded = true; G.inv = Math.max(G.inv, 0.8);
    } else if (main){
      // a climb: through, and down to whatever is below: the ledges under this turn, or the stair a whole turn down
      if (G.s - TURN > 0.05){ G.s -= TURN; G.prevS -= TURN; }
      else { G.s = G.prevS = Math.max(0.05, G.s - TURN); }
    }
  }
  footfalls(G, dt);
}
// a landing: dust and a thud; and a long drop hurts (more for a longer one)
function landed(G, wasGrounded){
  if (!wasGrounded){ sfx.step(); dust(G, 8, 1.8); ST.dip = Math.max(ST.dip, TUNE.feel.stepDip * 0.8); }
  const drop = (G.airTop == null ? G.y : G.airTop) - G.y; G.airTop = G.y;
  if (drop > MV.fallSafe && !ST.practice){ ST.dip = Math.max(ST.dip, 0.35); fallHurt(1 + Math.floor((drop - MV.fallSafe) / MV.fallPer), drop); }
}
function footfalls(G, dt){
  // a heavy step lands every half stride
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
