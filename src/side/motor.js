// The side view's motor: Movement v2 (the 3D climb's motor, entities/player/motor.js) on a 2D tile world instead of a
// single lane. Same tuning (TUNE.move), same feel switches (the F9 panel), same input queue: fast from the first step,
// the double jump with its somersault, the launch float, air control that fades, coyote time and a jump buffer, the
// roll that cancels anything, the plunge, heavy landings, the ledge grab, crouching; and what a tile world adds:
// walls and ceilings, one-way ledges (dropped through with down + jump), steps climbed as you walk, low tunnels you
// crouch or roll through, spikes. Position: x is his middle, y his feet, both in world units, y up.
import { TUNE } from '../config/tuning.js';
import { WEAPONS } from '../config/weapons.js';
import { IN, consume, pending } from '../core/input.js';
import { FEEL } from '../config/feel.js';
import { T, ROCK, LEDGE, SPIKES, LEVEL, tileAt, updraftAt } from './level.js';
const MV = TUNE.move;
// the side view's warrior is drawn tall and lean (gothic action proportions, ~40 pixels): his body is taller than the
// climb's, and his jumps and run scale with him so they keep the same feel against his height
export const BODY = { hw: 0.34, stand: 2.4, crouch: 1.4, roll: 1.25 };
// against the climb's tuning (TUNE.move, shared with the 3D game): he jumps higher and runs faster for his height, and
// rises and falls quicker (grav), so the same arc takes less time: a snappier jump, not a floatier one
export const SCALE = { jump: 1.48, run: 1.38, grav: 1.22 };
const MANTLE = 2.6, STEP = T + 0.02;
// what he has learned on the way up (the game sets these from what he has beaten; a keeper teaches one as it falls):
//   breaker  the Warden's weight: his plunge and his finishing cut break cracked rock
//   dash     the Toll's step: a roll begun in the air flies level and fast for a moment, once each time he leaves the ground
//   glide    the Wyrm's wind: jump again when the jumps are spent, and hold: the scarf spreads and he falls slowly; held in
//            rising air, it lifts him
export const CAN = { breaker: false, dash: false, glide: false };
export const GLIDE = { fall: 2.3, rise: 8.5, accel: 5, run: 0.88 }, AIRDASH = { time: 0.2, speed: 1.4 }, BLOOM = { height: 7 };

// ---- tiles under, beside and over a box
const tx = x => Math.floor(x / T), ty = y => Math.floor(y / T);
function rockIn(x0, y0, x1, y1){   // any rock tile overlapping the box (edges exclusive)
  for (let j = ty(y0 + 1e-4); j <= ty(y1 - 1e-4); j++) for (let i = tx(x0 + 1e-4); i <= tx(x1 - 1e-4); i++) if (tileAt(i, j) === ROCK) return true;
  return false;
}
const boxRock = (P, x, y, h = P.h) => rockIn(x - BODY.hw, y, x + BODY.hw, y + h);
// what holds his feet up at height y: rock, or a ledge (unless he is dropping through ledges)
function support(P, x, y){
  const j = ty(y - 0.02); if (Math.abs((j + 1) * T - y) > 0.03) return null;
  for (let i = tx(x - BODY.hw + 1e-3); i <= tx(x + BODY.hw - 1e-3); i++){ const t = tileAt(i, j); if (t === ROCK || (t === LEDGE && P.drop <= 0) || t === SPIKES) return t; }
  return null;
}
const spikesUnder = (P) => { const j = ty(P.y - 0.02); for (let i = tx(P.x - BODY.hw + 1e-3); i <= tx(P.x + BODY.hw - 1e-3); i++) if (tileAt(i, j) === SPIKES) return true; return false; };

// the launch speed that rises exactly `height` (as the 3D motor finds it)
const V0 = new Map();
const gravEase = (t, ease) => !FEEL.launch || !ease ? 1 : MV.launch.at + (1 - MV.launch.at) * Math.min(1, t / ease);
function launchSpeed(height, ease){
  const key = height + '|' + ease + '|' + FEEL.launch;
  if (V0.has(key)) return V0.get(key);
  const rise = v0 => { let v = v0, y = 0, t = 0; const h = 1 / 480; while (v > 0){ let g = (MV.gravityUp * SCALE.grav) * gravEase(t, ease); if (Math.abs(v) < MV.apexBand) g *= MV.apexMul; v -= g * h; y += v * h; t += h; } return y; };
  let lo = 0, hi = 30; for (let i = 0; i < 40; i++){ const m = (lo + hi) / 2; if (rise(m) < height) lo = m; else hi = m; }
  V0.set(key, hi); return hi;
}

export function newPlayer(x, y){
  return { x, y, vx: 0, vy: 0, h: BODY.stand, face: 1, grounded: true, coyote: 0, jumpBuf: 0, jumpT: 1, launch: 0, airT: 0, airJumps: 1, airTop: y,
    flip: 0, roll: 0, rollCd: 0, rollDir: 1, dive: null, plant: 0, crouch: false, mantle: null, landT: 0, drop: 0,
    glide: false, airDash: 1, dashT: 0, bounce: false,
    hp: TUNE.player.hp, maxHp: TUNE.player.hp, flask: TUNE.player.flask, flaskMax: TUNE.player.flask, inv: 0, hurtT: 0, atk: null, weapon: 'blade', runPhase: 0, events: [] };
}
const ev = (P, type, extra) => P.events.push({ type, ...extra });
function takeOff(P, air){
  const ease = air ? MV.launch.air : MV.launch.ground;
  P.vy = launchSpeed((air ? MV.airJumpHeight : MV.jumpHeight) * SCALE.jump, ease); P.launch = ease; P.jumpT = 0;
  P.grounded = false; P.crouch = false;
  if (P.atk && P.atk.phase === 'rec') P.atk = null;
  if (P.roll > 0){ P.roll = 0; P.rollCd = MV.roll.cooldown; }
}
// how far above whatever he would land on
function heightAbove(P){
  for (let j = ty(P.y - 0.01); j >= Math.max(0, ty(P.y) - 40); j--)
    for (let i = tx(P.x - BODY.hw + 1e-3); i <= tx(P.x + BODY.hw - 1e-3); i++){ const t = tileAt(i, j); if (t === ROCK || t === LEDGE || t === SPIKES) return P.y - (j + 1) * T; }
  return Infinity;
}

export function hurt(P, n, fromX, msg){
  if (P.inv > 0 || isRollInv(P)) return false;
  P.hp -= n; P.inv = TUNE.player.invuln || 1; P.hurtT = MV.hurtStun; P.atk = null; P.dive = null;
  const away = fromX == null ? -P.face : Math.sign(P.x - fromX) || -P.face;
  P.vx = away * MV.knock; P.vy = MV.knockUp; P.grounded = false;
  ev(P, 'hurt', { n, msg });
  return true;
}
export const isRollInv = P => P.roll > 0 && (MV.roll.time - P.roll) >= MV.roll.iframeFrom && (MV.roll.time - P.roll) <= MV.roll.iframeTo;

export function stepPlayer(P, dt){
  const H = IN.held;
  // ---- timers
  P.inv = Math.max(0, P.inv - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.rollCd = Math.max(0, P.rollCd - dt);
  P.coyote = Math.max(0, P.coyote - dt); P.jumpBuf = Math.max(0, P.jumpBuf - dt); P.landT = Math.max(0, P.landT - dt); P.jumpT += dt;
  P.flip = Math.max(0, P.flip - dt); P.plant = Math.max(0, P.plant - dt); P.drop = Math.max(0, P.drop - dt);
  if (P.roll > 0){ P.roll = Math.max(0, P.roll - dt); if (P.roll === 0) P.rollCd = MV.roll.cooldown; }
  if (!FEEL.coyote) P.coyote = 0;
  P.airT = P.grounded || P.mantle ? 0 : P.airT + dt;
  if (P.grounded || P.mantle){ P.airJumps = FEEL.doubleJump ? 1 : 0; P.airDash = 1; P.glide = false; }
  P.dashT = Math.max(0, P.dashT - dt);
  const stunned = P.hurtT > 0;

  // ---- hauling himself up onto an edge: it carries him
  if (P.mantle){
    const M = P.mantle; M.t += dt; const u = Math.min(1, M.t / M.dur), e = u * u * (3 - 2 * u);
    P.x = M.x0 + (M.x1 - M.x0) * Math.max(0, (u - 0.45) / 0.55); P.y = M.y0 + (M.y1 - M.y0) * Math.min(1, e * 1.25); P.vx = P.vy = 0;
    if (u >= 1){ P.mantle = null; P.grounded = true; P.y = M.y1; P.airTop = P.y; P.landT = 0.12; ev(P, 'land', { drop: 0 }); }
    return;
  }

  // ---- presses
  if (consume('jump')){
    if (P.grounded && H.down && support(P, P.x, P.y) === LEDGE){ P.drop = 0.25; P.grounded = false; P.y -= 0.03; ev(P, 'dropThrough'); }   // down + jump: through a ledge
    else if (!P.grounded && P.coyote <= 0 && !stunned && P.airJumps > 0 && !(P.vy <= 0 && heightAbove(P) < -P.vy * MV.buffer + 0.25)){
      P.airJumps--; takeOff(P, true); P.flip = MV.flip; P.dive = null; P.glide = false; ev(P, 'doubleJump');
    }
    else if (CAN.glide && !P.grounded && P.coyote <= 0 && !stunned && !P.dive && P.airJumps <= 0 && heightAbove(P) > 1){ P.glide = true; P.flip = 0; ev(P, 'glide'); }   // the jumps are spent: the scarf
    else P.jumpBuf = FEEL.buffer ? MV.buffer : 1e-3;
  }
  if (P.roll <= 0 && P.rollCd <= 0 && !stunned && !P.dive && (FEEL.rollCancel || !P.atk || P.atk.phase !== 'active') && consume('roll')){
    const dir = H.right ? 1 : H.left ? -1 : P.face;
    P.roll = MV.roll.time; P.rollDir = dir; P.face = dir; P.atk = null; P.crouch = false; P.plant = 0; P.glide = false;
    if (!P.grounded && CAN.dash && P.airDash > 0){ P.airDash--; P.dashT = AIRDASH.time; P.vy = 0; ev(P, 'airDash'); } else ev(P, 'roll');
  }
  // attack during a roll: the dash cut
  if (P.roll > 0 && P.roll < MV.roll.time * 0.85 && weaponOf(P).dash && !boxRock(P, P.x, P.y, BODY.stand) && consume('attack')){
    P.roll = 0; P.rollCd = MV.roll.cooldown; P.face = P.rollDir; P.dashFrom = P.x; startSwing(P, 0, 'dash'); ev(P, 'dashCut');
  }
  const rollEnding = P.roll > 0 && FEEL.rollCancel && P.roll < MV.roll.time * MV.roll.cancel;
  if (rollEnding && pending('attack') && !boxRock(P, P.x, P.y, BODY.stand)){ P.roll = 0; P.rollCd = MV.roll.cooldown; }
  if (consume('block')) P.blockAt = performance.now() / 1000;
  P.blocking = H.block && P.roll <= 0 && !stunned && !P.atk;
  if (P.roll <= 0 && !stunned && !P.dive && P.plant <= 0 && consume('attack')){
    if (FEEL.dive && !P.grounded && H.down && heightAbove(P) > MV.dive.min){ P.dive = { t: 0 }; P.atk = null; P.vx = 0; P.vy = -MV.dive.speed; P.flip = 0; ev(P, 'dive'); }
    else if (!P.atk) startSwing(P, 0, P.grounded && H.down && weaponOf(P).rise ? 'rise' : null);   // from a crouch: the rising cut
    else P.atk.queued = true;
  }
  if (consume('flask')) ev(P, 'flask');

  // ---- the swing
  if (P.atk){
    const A = P.atk, w = weaponOf(P), sw = swingOf(P, A);
    A.t += dt;
    if (A.phase === 'wind' && A.t >= sw.wind){ A.phase = 'active'; A.t = 0; P.vx += P.face * sw.lunge / sw.active; ev(P, 'strike', { sw, finisher: !!A.special || A.i === w.combo.length - 1 }); }
    if (A.phase === 'active' && A.t >= sw.active){ A.phase = 'rec'; A.t = 0; }
    if (A.phase === 'rec'){
      if (A.queued && !A.special && A.i + 1 < w.combo.length && A.t >= sw.rec * 0.25) startSwing(P, A.i + 1);
      else if (A.t >= sw.rec) P.atk = null;
      else if (A.t >= sw.rec * 0.4 && (H.left || H.right || P.jumpBuf > 0)) P.atk = null;
    }
  }

  // ---- body height: crouched by choice, or forced under a low roof; rolling low
  const wantCrouch = P.grounded && P.roll <= 0 && !P.atk && H.down;
  const roofLow = boxRock(P, P.x, P.y, BODY.stand);
  P.crouch = P.grounded && P.roll <= 0 && (wantCrouch || roofLow);
  P.h = P.roll > 0 ? BODY.roll : P.crouch ? BODY.crouch : BODY.stand;

  // ---- horizontal
  const dir = stunned ? 0 : (H.right ? 1 : 0) - (H.left ? 1 : 0);
  let target = 0, accel = P.grounded ? MV.accel : MV.airAccel;
  if (!P.grounded && FEEL.airFade) accel *= Math.max(MV.airFloor, 1 - P.airT / MV.airFade);
  if (P.dive){ P.vx = 0; }
  else if (P.roll > 0){ P.vx = P.rollDir * MV.roll.speed * SCALE.run * (P.dashT > 0 ? AIRDASH.speed : P.roll > MV.roll.time * 0.25 ? 1 : 0.5); }
  else if (P.plant > 0){ target = 0; accel = MV.decel; }
  else if (P.atk && P.atk.phase !== 'rec' && swingOf(P, P.atk).dash){ target = P.face * swingOf(P, P.atk).dash; accel = 1e4; }   // the dash cut's drive
  else if (P.atk && P.atk.phase !== 'rec'){
    target = 0; accel = MV.decel * 0.35;
    if (FEEL.turn && dir && dir !== P.face && P.atk.phase === 'wind' && P.atk.t < swingOf(P, P.atk).wind * 0.7) P.face = dir;
  }
  else {
    target = dir * MV.run * SCALE.run * IN.mag * (P.crouch ? MV.crouchMul : 1) * (P.blocking ? MV.blockMul : 1) * (P.glide ? GLIDE.run : 1);
    if (P.glide) accel = MV.airAccel;   // under the scarf he steers freely
    if (P.grounded && (dir === 0 || Math.sign(P.vx) === -dir || Math.abs(P.vx) > Math.abs(target))) accel = MV.decel;
    if (dir !== 0 && dir !== P.face && (!P.atk || FEEL.turn)){ P.face = dir; if (P.grounded && Math.abs(P.vx) > 1.5) ev(P, 'skid'); }
  }
  if (P.roll <= 0 && !stunned && !P.dive){ const dv = target - P.vx; P.vx += Math.sign(dv) * Math.min(Math.abs(dv), accel * dt); }
  else if (stunned) P.vx *= Math.exp(-dt * 4);

  // ---- vertical
  if (P.jumpBuf > 0 && (P.grounded || P.coyote > 0) && !stunned && (P.roll <= 0 || rollEnding) && P.plant <= 0 && !P.dive && !boxRock(P, P.x, P.y, BODY.stand)){
    P.jumpBuf = 0; P.coyote = 0; takeOff(P, false); ev(P, 'jump');
  }
  // the scarf: held open while jump is held; in rising air it opens of itself
  const up = CAN.glide && !P.grounded ? updraftAt(P.x, P.y + 1) : null;
  if (P.glide && (!H.jump || P.grounded || P.dive || stunned)) P.glide = false;
  if (!P.glide && up && H.jump && !P.dive && !stunned && P.roll <= 0 && P.vy < 4){ P.glide = true; ev(P, 'glide'); }
  if (!P.grounded){
    if (P.dive){ P.vy = -MV.dive.speed; P.dive.t += dt; }
    else if (P.dashT > 0) P.vy = 0;
    else if (P.glide && (up || P.vy <= 0)){
      if (up) P.vy += (GLIDE.rise - P.vy) * Math.min(1, dt * GLIDE.accel);
      else P.vy += (-GLIDE.fall - P.vy) * Math.min(1, dt * 9);
      P.airTop = P.y; P.flip = 0;   // however far he came down under it, it was not a fall
    }
    else {
      let g = P.vy > 0 ? (MV.gravityUp * SCALE.grav) * gravEase(P.jumpT, P.launch) : (MV.gravityDown * SCALE.grav);
      if (H.jump && Math.abs(P.vy) < MV.apexBand) g *= MV.apexMul;
      if (!H.jump && P.vy > 0 && P.jumpT > MV.minHop && !P.bounce) P.vy *= Math.pow(MV.cutMul, dt * 20);
      if (P.vy <= 0) P.bounce = false;
      P.vy = Math.max(-MV.maxFall, P.vy - g * dt);
    }
  }

  // ---- move: across (climbing steps on the way), then up or down
  const wasGrounded = P.grounded, y0 = P.y;
  moveX(P, P.vx * dt);
  if (P.grounded){
    if (!support(P, P.x, P.y)){ P.grounded = false; P.vy = 0; P.coyote = MV.coyote; P.airTop = P.y; }
  }
  if (!P.grounded){ moveY(P, P.vy * dt, y0); P.airTop = Math.max(P.airTop, P.y); }
  if (P.grounded && !wasGrounded) landed(P);
  // a bloom underfoot throws him high (and gives him his air jump back)
  if (P.grounded && LEVEL.pads.size && P.hp > 0){
    const m = LEVEL.pads.get(ty(P.y + 0.01) * LEVEL.W + tx(P.x));
    if (m){ P.vy = launchSpeed(BLOOM.height, MV.launch.ground); P.launch = MV.launch.ground; P.jumpT = 0; P.grounded = false; P.crouch = false; P.roll = 0; P.plant = 0; P.atk = null; P.bounce = true; P.airJumps = FEEL.doubleJump ? 1 : 0; P.airTop = P.y; ev(P, 'bloom', { m }); }
  }
  // ---- catching an edge in the air: a wall just ahead whose top is within reach above his feet
  if (!P.grounded && FEEL.ledge && P.roll <= 0 && !stunned && !P.dive && P.vy < 5){
    const d = H.right ? 1 : H.left ? -1 : 0;
    if (d) tryMantle(P, d);
  }
  if (P.grounded && spikesUnder(P)) hurt(P, 1, P.x - P.face, 'Spikes');
  // footfalls
  if (P.grounded && Math.abs(P.vx) > 0.4 && P.roll <= 0){ const b = Math.sin(P.runPhase); P.runPhase += Math.abs(P.vx) * dt * 2.6; if (Math.sign(Math.sin(P.runPhase)) !== Math.sign(b)) ev(P, 'step'); }
}
function moveX(P, dx){
  if (!dx) return;
  const n = Math.ceil(Math.abs(dx) / 0.1), d = dx / n;
  for (let k = 0; k < n; k++){
    const nx = P.x + d;
    if (!boxRock(P, nx, P.y)){ P.x = nx; continue; }
    // a step: if it is no higher than a tile and there is room over it, he walks up onto it
    if (P.grounded){
      const y1 = (Math.floor((P.y + 1e-3) / T) + 1) * T;   // the top of the tile in his way
      if (y1 - P.y <= STEP && !boxRock(P, nx, y1)){ P.y = y1; P.x = nx; ev(P, 'stepUp'); continue; }
    }
    // a wall: stop flush against it
    P.x = d > 0 ? (tx(nx + BODY.hw) * T - BODY.hw - 1e-4) : ((tx(nx - BODY.hw) + 1) * T + BODY.hw + 1e-4);
    P.vx = 0; break;
  }
}
function moveY(P, dy, yStart){
  if (!dy) return;
  const n = Math.ceil(Math.abs(dy) / 0.1), d = dy / n;
  for (let k = 0; k < n; k++){
    const ny = P.y + d;
    if (d < 0){
      // landing: on rock, spikes, or a ledge he was above a moment ago
      const j = ty(ny), top = (j + 1) * T;
      if (top <= P.y + 1e-4 && top > ny){
        let hit = false;
        for (let i = tx(P.x - BODY.hw + 1e-3); i <= tx(P.x + BODY.hw - 1e-3); i++){ const t = tileAt(i, j); if (t === ROCK || t === SPIKES || (t === LEDGE && P.drop <= 0 && yStart >= top - 1e-3)) hit = true; }
        if (hit){ P.y = top; P.vy = 0; P.grounded = true; return; }
      }
      P.y = ny;
    } else {
      if (boxRock(P, P.x, ny)){ P.y = ty(ny + P.h) * T - P.h - 1e-4; P.vy = 0; ev(P, 'bonk'); return; }   // a ceiling
      P.y = ny;
    }
  }
}
function tryMantle(P, d){
  const front = P.x + d * (BODY.hw + 0.12), i = tx(front);
  // the lowest top of a wall in front within reach: the tile there is solid, the one over it is open
  for (let j = ty(P.y + 0.3); j <= ty(P.y + MANTLE); j++){
    const t = tileAt(i, j), above = tileAt(i, j + 1);
    if ((t === ROCK || t === LEDGE) && above !== ROCK){
      const top = (j + 1) * T, x1 = d > 0 ? i * T + BODY.hw + 0.08 : (i + 1) * T - BODY.hw - 0.08;
      if (top - P.y < 0.35 || boxRock(P, x1, top, BODY.stand) || boxRock(P, P.x, P.y, top - P.y + BODY.crouch)) return;   // room on top, and room to rise to it
      // a full hang and haul takes 0.45 s; a ledge already at his knees, a quick scramble. `wall` is the face he climbs
      P.mantle = { t: 0, dur: Math.max(0.18, Math.min(0.45, 0.14 + 0.12 * (top - P.y))), x0: P.x, x1, y0: P.y, y1: top, wall: d > 0 ? i * T : (i + 1) * T, d }; P.vx = P.vy = 0; P.atk = null; P.flip = 0; ev(P, 'mantle');
      return;
    }
    if (t === ROCK && above === ROCK) continue;
  }
}
function landed(P){
  let drop = P.airTop - P.y; P.airTop = P.y; P.flip = 0; P.bounce = false; P.glide = false;
  if (P.dive){ P.dive = null; P.plant = MV.dive.rec; P.vx = 0; P.landT = 0.2; drop -= MV.dive.soak; ev(P, 'slam'); }
  else {
    P.landT = 0.12;
    if (drop > MV.hardLand){ P.vx *= 0.5; P.landT = 0.2; ev(P, 'land', { drop, hard: true }); } else ev(P, 'land', { drop });
  }
  if (drop > SIDE.fallSafe && !SIDE.feather){ P.hp -= 1; P.inv = Math.max(P.inv, 0.6); ev(P, 'hurt', { n: 1, msg: 'Fell' }); }
}
// the masked warrior's curved blade: three heavy cuts (an overhead chop, an overhead slam, a spinning cut) and, from a
// crouch, a rising cut. Each swing names its drawing and the moment in it the blade lands (hit, a fraction of the
// drawing; hitEnd where a long cut stops): the wind-up plays up to that frame, the cut lands on it, the follow-through
// plays out the rest
export const BLADE = { name: 'Curved blade', reach: 1.9, combo: [
  { dmg: 1, wind: 0.21, active: 0.09, rec: 0.3, lunge: 0.8, anim: 'atk_slam_v3', hit: 7 / 11 },
  { dmg: 1, wind: 0.23, active: 0.09, rec: 0.3, lunge: 0.9, anim: 'atk_slam_px', hit: 9 / 13 },
  { dmg: 2, wind: 0.09, active: 0.26, rec: 0.3, lunge: 1.1, anim: 'atk_spin_px', hit: 2 / 13, hitEnd: 10 / 13 },   // the cut lasts the whole turn
], rise: { dmg: 2, wind: 0.28, active: 0.09, rec: 0.33, lunge: 0.4, anim: 'atk_rise_px', hit: 9 / 13 },
  // out of a roll: he is driven forward (dash, units a second) through the wind-up and the cut, then skids out of it
  dash: { dmg: 2, wind: 0.15, active: 0.08, rec: 0.28, lunge: 0, dash: 11, anim: 'atk_dash_px', hit: 7 / 13, hitEnd: 8 / 13 } };
export const weaponOf = P => P.weapon === 'blade' ? BLADE : WEAPONS[P.weapon];
export const swingOf = (P, A) => A.special ? weaponOf(P)[A.special] : weaponOf(P).combo[A.i];
export const SIDE = { fallSafe: 9, feather: false };   // a metroidvania's shafts are deep: only a long drop hurts
// set by the game: which way a foe is that a swing should turn to (0 for none), for the aim assist
export const HOOKS = { aim: null };
function startSwing(P, i, special = null){
  if (FEEL.aim && HOOKS.aim && !IN.held.left && !IN.held.right){ const d = HOOKS.aim(P); if (d) P.face = d; }
  P.atk = { i, t: 0, phase: 'wind', queued: false, special };
}
