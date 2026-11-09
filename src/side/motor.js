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
import { T, ROCK, LEDGE, SPIKES, tileAt } from './level.js';
const MV = TUNE.move;
export const BODY = { hw: 0.3, stand: 1.75, crouch: 1.05, roll: 0.95 };
const MANTLE = 2.0, STEP = T + 0.02;

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
  const rise = v0 => { let v = v0, y = 0, t = 0; const h = 1 / 480; while (v > 0){ let g = MV.gravityUp * gravEase(t, ease); if (Math.abs(v) < MV.apexBand) g *= MV.apexMul; v -= g * h; y += v * h; t += h; } return y; };
  let lo = 0, hi = 30; for (let i = 0; i < 40; i++){ const m = (lo + hi) / 2; if (rise(m) < height) lo = m; else hi = m; }
  V0.set(key, hi); return hi;
}

export function newPlayer(x, y){
  return { x, y, vx: 0, vy: 0, h: BODY.stand, face: 1, grounded: true, coyote: 0, jumpBuf: 0, jumpT: 1, launch: 0, airT: 0, airJumps: 1, airTop: y,
    flip: 0, roll: 0, rollCd: 0, rollDir: 1, dive: null, plant: 0, crouch: false, mantle: null, landT: 0, drop: 0,
    hp: TUNE.player.hp, maxHp: TUNE.player.hp, flask: TUNE.player.flask, inv: 0, hurtT: 0, atk: null, weapon: 'sword', runPhase: 0, events: [] };
}
const ev = (P, type, extra) => P.events.push({ type, ...extra });
function takeOff(P, air){
  const ease = air ? MV.launch.air : MV.launch.ground;
  P.vy = launchSpeed(air ? MV.airJumpHeight : MV.jumpHeight, ease); P.launch = ease; P.jumpT = 0;
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
  if (P.grounded || P.mantle) P.airJumps = FEEL.doubleJump ? 1 : 0;
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
      P.airJumps--; takeOff(P, true); P.flip = MV.flip; P.dive = null; ev(P, 'doubleJump');
    }
    else P.jumpBuf = FEEL.buffer ? MV.buffer : 1e-3;
  }
  if (P.roll <= 0 && P.rollCd <= 0 && !stunned && !P.dive && (FEEL.rollCancel || !P.atk || P.atk.phase !== 'active') && consume('roll')){
    const dir = H.right ? 1 : H.left ? -1 : P.face;
    P.roll = MV.roll.time; P.rollDir = dir; P.face = dir; P.atk = null; P.crouch = false; P.plant = 0; ev(P, 'roll');
  }
  const rollEnding = P.roll > 0 && FEEL.rollCancel && P.roll < MV.roll.time * MV.roll.cancel;
  if (rollEnding && pending('attack') && !boxRock(P, P.x, P.y, BODY.stand)){ P.roll = 0; P.rollCd = MV.roll.cooldown; }
  if (consume('block')) P.blockAt = performance.now() / 1000;
  P.blocking = H.block && P.roll <= 0 && !stunned && !P.atk;
  if (P.roll <= 0 && !stunned && !P.dive && P.plant <= 0 && consume('attack')){
    if (FEEL.dive && !P.grounded && H.down && heightAbove(P) > MV.dive.min){ P.dive = { t: 0 }; P.atk = null; P.vx = 0; P.vy = -MV.dive.speed; P.flip = 0; ev(P, 'dive'); }
    else if (!P.atk) startSwing(P, 0);
    else P.atk.queued = true;
  }
  if (consume('flask')) ev(P, 'flask');

  // ---- the swing
  if (P.atk){
    const A = P.atk, w = WEAPONS[P.weapon], sw = w.combo[A.i];
    A.t += dt;
    if (A.phase === 'wind' && A.t >= sw.wind){ A.phase = 'active'; A.t = 0; P.vx += P.face * sw.lunge / sw.active; ev(P, 'strike', { sw, finisher: A.i === w.combo.length - 1 }); }
    if (A.phase === 'active' && A.t >= sw.active){ A.phase = 'rec'; A.t = 0; }
    if (A.phase === 'rec'){
      if (A.queued && A.i + 1 < w.combo.length && A.t >= sw.rec * 0.25) startSwing(P, A.i + 1);
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
  else if (P.roll > 0){ P.vx = P.rollDir * MV.roll.speed * (P.roll > MV.roll.time * 0.25 ? 1 : 0.5); }
  else if (P.plant > 0){ target = 0; accel = MV.decel; }
  else if (P.atk && P.atk.phase !== 'rec'){
    target = 0; accel = MV.decel * 0.35;
    if (FEEL.turn && dir && dir !== P.face && P.atk.phase === 'wind' && P.atk.t < WEAPONS[P.weapon].combo[P.atk.i].wind * 0.7) P.face = dir;
  }
  else {
    target = dir * MV.run * IN.mag * (P.crouch ? MV.crouchMul : 1) * (P.blocking ? MV.blockMul : 1);
    if (P.grounded && (dir === 0 || Math.sign(P.vx) === -dir || Math.abs(P.vx) > Math.abs(target))) accel = MV.decel;
    if (dir !== 0 && dir !== P.face && (!P.atk || FEEL.turn)){ P.face = dir; if (P.grounded && Math.abs(P.vx) > 1.5) ev(P, 'skid'); }
  }
  if (P.roll <= 0 && !stunned && !P.dive){ const dv = target - P.vx; P.vx += Math.sign(dv) * Math.min(Math.abs(dv), accel * dt); }
  else if (stunned) P.vx *= Math.exp(-dt * 4);

  // ---- vertical
  if (P.jumpBuf > 0 && (P.grounded || P.coyote > 0) && !stunned && (P.roll <= 0 || rollEnding) && P.plant <= 0 && !P.dive && !boxRock(P, P.x, P.y, BODY.stand)){
    P.jumpBuf = 0; P.coyote = 0; takeOff(P, false); ev(P, 'jump');
  }
  if (!P.grounded){
    if (P.dive){ P.vy = -MV.dive.speed; P.dive.t += dt; }
    else {
      let g = P.vy > 0 ? MV.gravityUp * gravEase(P.jumpT, P.launch) : MV.gravityDown;
      if (H.jump && Math.abs(P.vy) < MV.apexBand) g *= MV.apexMul;
      if (!H.jump && P.vy > 0 && P.jumpT > MV.minHop) P.vy *= Math.pow(MV.cutMul, dt * 20);
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
      P.mantle = { t: 0, dur: 0.3, x0: P.x, x1, y0: P.y, y1: top }; P.vx = P.vy = 0; P.atk = null; P.flip = 0; ev(P, 'mantle');
      return;
    }
    if (t === ROCK && above === ROCK) continue;
  }
}
function landed(P){
  let drop = P.airTop - P.y; P.airTop = P.y; P.flip = 0;
  if (P.dive){ P.dive = null; P.plant = MV.dive.rec; P.vx = 0; P.landT = 0.2; drop -= MV.dive.soak; ev(P, 'slam'); }
  else {
    P.landT = 0.12;
    if (drop > MV.hardLand){ P.vx *= 0.5; P.landT = 0.2; ev(P, 'land', { drop, hard: true }); } else ev(P, 'land', { drop });
  }
  if (drop > SIDE.fallSafe){ P.hp -= 1; P.inv = Math.max(P.inv, 0.6); ev(P, 'hurt', { n: 1, msg: 'Fell' }); }
}
export const SIDE = { fallSafe: 9 };   // a metroidvania's shafts are deep: only a long drop hurts
// set by the game: which way a foe is that a swing should turn to (0 for none), for the aim assist
export const HOOKS = { aim: null };
function startSwing(P, i){
  if (FEEL.aim && HOOKS.aim && !IN.held.left && !IN.held.right){ const d = HOOKS.aim(P); if (d) P.face = d; }
  P.atk = { i, t: 0, phase: 'wind', queued: false };
}
