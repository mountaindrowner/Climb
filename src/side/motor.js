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
import { T, ROCK, LEDGE, SPIKES, LEVEL, tileAt, updraftAt, gustAt, flowAt, moversNow, liveAt, RULE, facedAt, waterOver, roughAt } from './level.js';
const MV = TUNE.move;
// the side view's warrior is drawn tall and lean (gothic action proportions, ~40 pixels): his body is taller than the
// climb's, and his jumps and run scale with him so they keep the same feel against his height
export const BODY = { hw: 0.34, stand: 2.4, crouch: 1.4, roll: 1.25 };
// against the climb's tuning (TUNE.move, shared with the 3D game): he jumps higher and runs faster for his height, and
// rises and falls quicker (grav), so the same arc takes less time: a snappier jump, not a floatier one
export const SCALE = { jump: 1.48, run: 1.38, grav: 1.22 };
const MANTLE = 2.6, STEP = T + 0.02;
// taking an edge is for the way up (build 77, from a playtest: with shelves close together he hauled himself onto
// every lip he passed). He takes one while he is rising, or in the first moment after the top of a jump (`top`,
// seconds): the jump that falls just short. Coming down he never does. `topT` is how long since he was last rising
export const GRAB = { top: 0.12 };
// what he has learned on the way up (the game sets these from what he has beaten; a keeper teaches one as it falls):
//   breaker  the Warden's gift, the spade: only it breaks cracked rock (main.js breakRock)
//   dash     the Toll's step: a roll begun in the air flies level and fast for a moment, once each time he leaves the ground
//   glide    the Wyrm's wind: jump again when the jumps are spent, and hold: the scarf spreads and he falls slowly; held in
//            rising air, it lifts him
export const CAN = { breaker: false, dash: false, glide: false, grip: false };
// the Auger's grip (phase 17): on rough rock (level.js roughAt) he clings, and climbs. How fast up it and down it, how
// hard he throws himself off it, and how long before he can take hold again
export const GRIP = { up: 4.4, down: 6.5, off: 6.6, again: 0.28 };
// deep water (phase 16; level.js waters). It bears him up: without the Wyrm's wind his feet go no deeper than `float`
// under its top, and he swims along it. With the wind the thread carries him under: jump held he rises, down held he
// sinks, neither and he hangs, sinking a very little. `in`: how much of him is in it before it has him. `hop`: the
// leap out of it from its top (how high), `out`: how long that leap is its own before the water can have him back
export const SWIM = { in: 0.9, float: 1.5, speed: 5.2, top: 4.2, rise: 5.4, sink: 5.4, drift: 0.45, accel: 7, grip: 16, hop: 1.9, out: 0.34, wade: 0.62, bell: 1.25 };
export const FLOW = { push: 6, grip: 40, fall: 9, carry: 1.2, air: 5 };   // running water: how fast a channel carries him (his run is 7.6), how hard it takes hold, how fast a fall of it bears him down
export const GLIDE = { fall: 2.3, rise: 8.5, accel: 5, run: 0.88, cold: 0.62 }, AIRDASH = { time: 0.22, speed: 1.4 }, BLOOM = { height: 7 };

// ---- tiles under, beside and over a box
const tx = x => Math.floor(x / T), ty = y => Math.floor(y / T);
function rockIn(x0, y0, x1, y1){   // any rock tile overlapping the box (edges exclusive)
  for (let j = ty(y0 + 1e-4); j <= ty(y1 - 1e-4); j++) for (let i = tx(x0 + 1e-4); i <= tx(x1 - 1e-4); i++) if (tileAt(i, j) === ROCK) return true;
  return false;
}
const boxRock = (P, x, y, h = P.h) => rockIn(x - BODY.hw, y, x + BODY.hw, y + h);
// something else moving him sideways (a creature he walks into): as far toward x as the rock lets him, never into it.
// Returns whether he got all the way
export function shove(P, x){
  if (!boxRock(P, x, P.y)){ P.x = x; return true; }
  const d = Math.sign(x - P.x); let at = P.x;
  for (let k = 0; k < 40; k++){ const n = at + d * 0.02; if ((x - n) * d < 0 || boxRock(P, n, P.y)) break; at = n; }
  P.x = at; return false;
}
// the safety net: if he is ever inside rock (whatever put him there), out to the nearest open place, sideways first,
// then up; so nothing can leave him stuck in a wall
function unstick(P){
  const h = Math.min(P.h, BODY.crouch);
  if (!rockIn(P.x - BODY.hw, P.y + 0.02, P.x + BODY.hw, P.y + h)) return;
  for (let r = 0.05; r <= 2.5; r += 0.05) for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [r, r], [-r, r]]){
    const x = P.x + dx, y = P.y + dy;
    if (!rockIn(x - BODY.hw, y + 0.02, x + BODY.hw, y + h)){ P.x = x; P.y = y; P.vx = 0; P.vy = Math.min(0, P.vy); P.grounded = false; return; }
  }
}
// what holds his feet up at height y: rock, or a ledge (unless he is dropping through ledges)
const onMover = (P, m) => P.x + BODY.hw > m.x - m.w / 2 && P.x - BODY.hw < m.x + m.w / 2;
function support(P, x, y){
  const j = ty(y - 0.02); if (Math.abs((j + 1) * T - y) > 0.03) return null;
  for (let i = tx(x - BODY.hw + 1e-3); i <= tx(x + BODY.hw - 1e-3); i++){ const t = tileAt(i, j); if (t === ROCK || (t === LEDGE && P.drop <= 0) || t === SPIKES) return t; }
  return null;
}
// is he standing on the stones of the way, and on nothing else (a foot on rock or a plank is the ground)
// is there rough rock beside him on that side, anywhere along his height
const roughBeside = (P, d) => { const i = tx(P.x + d * (BODY.hw + 0.1)); for (let j = ty(P.y + 0.15); j <= ty(P.y + BODY.stand - 0.25); j++) if (roughAt(i, j)) return true; return false; };
const wayUnder = (P) => { const j = ty(P.y - 0.02); let way = false; for (let i = tx(P.x - BODY.hw + 1e-3); i <= tx(P.x + BODY.hw - 1e-3); i++){ if (facedAt(i, j)) way = true; else { const t = tileAt(i, j); if (t === ROCK || t === LEDGE) return false; } } return way; };
const liveUnder = (P) => { if (SIDE.boots) return false; const j = ty(P.y - 0.02); for (let i = tx(P.x - BODY.hw + 1e-3); i <= tx(P.x + BODY.hw - 1e-3); i++) if (liveAt(i, j)) return true; return false; };
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
    flip: 0, roll: 0, rollCd: 0, rollDir: 1, dive: null, plant: 0, crouch: false, mantle: null, topT: 9, landT: 0, drop: 0,
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
  if (P.inv > 0 || isRollInv(P) || SIDE.watching || (P.art && P.art.safe && !(P.art.k === 'gust' && P.art.t > ARTS.gust.safe))) return false;   // watching (main.js: the keepers' entrances) nothing touches him
  const spared = SIDE.leaf; if (spared) SIDE.leaf = false; else P.hp -= n;
  if (P.hp <= 0 && SIDE.hour){ SIDE.hour = false; P.hp = 1; ev(P, 'lastpage'); }   // the Almanac's last page: once each rest, the blow that would end him leaves him one heart
  P.inv = (TUNE.player.invuln || 1) * (SIDE.stone ? 1.6 : 1); P.hurtT = MV.hurtStun; P.atk = null; P.dive = null;
  const away = fromX == null ? -P.face : Math.sign(P.x - fromX) || -P.face;
  P.vx = away * MV.knock; P.vy = MV.knockUp; P.grounded = false;
  ev(P, spared ? 'spared' : 'hurt', { n, msg });
  return true;
}
export const isRollInv = P => P.roll > 0 && (MV.roll.time - P.roll) >= MV.roll.iframeFrom && (MV.roll.time - P.roll) <= MV.roll.iframeTo;

export function stepPlayer(P, dt){
  const H = IN.held;
  // ---- timers
  P.inv = Math.max(0, P.inv - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.rollCd = Math.max(0, P.rollCd - dt);
  if (P.grounded && !P.mantle && liveUnder(P)) hurt(P, 1, P.x - P.face, 'Shocked');   // a live gantry: before anything else this step (no jumping off it in the same instant)
  P.coyote = Math.max(0, P.coyote - dt); P.jumpBuf = Math.max(0, P.jumpBuf - dt); P.landT = Math.max(0, P.landT - dt); P.jumpT += dt;
  P.flip = Math.max(0, P.flip - dt); P.plant = Math.max(0, P.plant - dt); P.drop = Math.max(0, P.drop - dt);
  if (P.roll > 0){ P.roll = Math.max(0, P.roll - dt); if (P.roll === 0) P.rollCd = MV.roll.cooldown; }
  if (!FEEL.coyote) P.coyote = 0;
  P.airT = P.grounded || P.mantle ? 0 : P.airT + dt;
  P.topT = P.grounded || P.mantle ? 9 : P.vy > 0 ? 0 : (P.topT || 0) + dt;   // (on the ground: 9, so stepping off an edge is a fall from the start)
  if (P.grounded || P.mantle){ P.airJumps = FEEL.doubleJump ? 1 : 0; P.airDash = 1; P.glide = false; }
  P.dashT = Math.max(0, P.dashT - dt); RULE.tearing = P.dashT > 0;   // in the Toll's step, vellum does not stop him
  // the stones of the way (the Pilgrims' Cairns): the way he faced when he stepped onto them is the way he must keep
  // facing. If he turns round on them they are gone, all of them, until he stands on the ground again
  if (P.grounded){ if (wayUnder(P)){ if (P.wayFace == null) P.wayFace = P.face; else if (P.face !== P.wayFace) RULE.turned = true; } else { P.wayFace = null; RULE.turned = false; } }
  const stunned = P.hurtT > 0;
  if (!P.mantle) unstick(P);

  // ---- hauling himself up onto an edge: it carries him
  if (P.mantle){
    const M = P.mantle; M.t += dt * (SIDE.rope ? 2 : 1); const u = Math.min(1, M.t / M.dur), e = u * u * (3 - 2 * u);
    P.x = M.x0 + (M.x1 - M.x0) * Math.max(0, (u - 0.45) / 0.55); P.y = M.y0 + (M.y1 - M.y0) * Math.min(1, e * 1.25); P.vx = P.vy = 0;
    if (u >= 1){ P.mantle = null; P.dive = null; P.grounded = true; P.y = M.y1; P.airTop = P.y; P.landT = 0.12; ev(P, 'land', { drop: 0 }); }
    return;
  }

  // ---- the Auger's grip: against a rough face, going into it, he takes hold. Held, he goes up it; down held, down it;
  // jump throws him off it; away lets go. At its top he pulls himself up onto it
  P.clingCd = Math.max(0, (P.clingCd || 0) - dt);
  { const toward = H.right && !H.left ? 1 : H.left && !H.right ? -1 : 0;
    if (!P.cling && CAN.grip && toward && P.clingCd <= 0 && !stunned && P.roll <= 0 && !P.dive && !P.swim && !P.art && P.hp > 0 && roughBeside(P, toward) && boxRock(P, P.x + toward * 0.08, P.y)){ P.cling = { d: toward }; P.atk = null; P.crouch = false; ev(P, 'cling'); }
    if (P.cling){ const d = P.cling.d;
      if (stunned || P.hp <= 0 || !CAN.grip || !roughBeside(P, d)) P.cling = null;
      else if (consume('jump')){ P.cling = null; P.clingCd = GRIP.again; P.grounded = false; takeOff(P, false); P.vx = -d * GRIP.off; P.face = -d; P.airJumps = FEEL.doubleJump ? 1 : 0; ev(P, 'jump'); }
      else if (toward === -d){ P.cling = null; P.clingCd = GRIP.again; P.grounded = false; }
      else { const want = H.down ? -GRIP.down : toward === d || H.up ? GRIP.up : 0; P.vx = 0; P.vy = want; P.face = d; P.glide = false; P.flip = 0; P.airTop = P.y; P.airDash = 1; P.airJumps = FEEL.doubleJump ? 1 : 0; P.climbing = want;
        if (want){ P.grounded = false; moveY(P, want * dt, P.y); if (P.grounded && want < 0) P.cling = null; }
        if (P.cling && want > 0){ tryMantle(P, d); if (P.mantle) P.cling = null; }
        if (P.cling){ P.climbT = (P.climbT || 0) + Math.abs(want) * dt; if (want && Math.floor(P.climbT * 1.4) !== Math.floor((P.climbT - Math.abs(want) * dt) * 1.4)) ev(P, 'step'); return; } } } }
  // ---- presses
  if (consume('jump')){
    if (P.grounded && H.down && (support(P, P.x, P.y) === LEDGE || P.ride)){ P.drop = 0.25; P.dropping = true; P.grounded = false; P.y -= 0.03; ev(P, 'dropThrough'); }   // down + jump: through a ledge
    else if (P.swim){ if (P.depth < SWIM.float + 0.45 && !stunned){ P.swim = false; P.dive = null; P.hopT = SWIM.out; P.vy = launchSpeed(SWIM.hop, 0); P.launch = 0; P.jumpT = 0; P.airJumps = 0; P.airTop = P.y; ev(P, 'surface'); } }   // at the water's top: out of it
    // (close over the ground a press is kept for the ground, so the next jump is a full one: but not at the end of a
    // fall long enough to hurt, where the second jump is what he pressed it for)
    else if (!P.grounded && P.coyote <= 0 && !stunned && P.airJumps > 0 && !(P.vy <= 0 && heightAbove(P) < -P.vy * MV.buffer + 0.25 && P.airTop - P.y + heightAbove(P) <= SIDE.fallSafe)){
      P.airJumps--; takeOff(P, true); P.flip = MV.flip; P.dive = null; P.glide = false; P.airTop = P.y; ev(P, 'doubleJump');   // (the second jump breaks a fall: what he fell before it does not count)
    }
    else if (CAN.glide && !P.grounded && P.coyote <= 0 && !stunned && !P.dive && P.airJumps <= 0 && heightAbove(P) > 1){ P.glide = true; P.flip = 0; ev(P, 'glide'); }   // the jumps are spent: the scarf
    else P.jumpBuf = FEEL.buffer ? MV.buffer : 1e-3;
  }
  if (P.roll <= 0 && P.rollCd <= 0 && !stunned && !P.dive && !P.art && (FEEL.rollCancel || !P.atk || P.atk.phase !== 'active') && consume('roll')){
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
  P.blocking = H.block && P.roll <= 0 && !stunned && !P.atk && weaponOf(P).guard !== false;
  if (P.roll <= 0 && !stunned && !P.dive && !P.art && P.plant <= 0 && consume('attack')){
    if (FEEL.dive && !P.grounded && !P.swim && H.down && heightAbove(P) > MV.dive.min){ P.dive = { t: 0 }; P.atk = null; P.vx = 0; P.vy = -MV.dive.speed; P.flip = 0; ev(P, 'dive'); }   // (never begun in deep water: see below)
    else if (!P.atk) startSwing(P, 0, ((P.grounded && H.down) || H.up) && weaponOf(P).rise ? 'rise' : null);   // from a crouch: the rising cut. With up held, on the ground or in the air: the same cut, struck upward (P.atk.up)
    else P.atk.queued = true;
  }
  if (consume('flask')) ev(P, 'flask');
  if (!P.atk && !P.art && !P.dive && !stunned && consume('swap')) ev(P, 'swap');   // main.js: whether he has another to swap to
  if (!P.art && !P.dive && !stunned && consume('art')) ev(P, 'art', { down: !!H.down, air: !P.grounded });   // (a press while he cannot waits its moment)   // main.js: which, and whether he has the embers
  if (P.art){ P.art.t += dt; if (P.art.t >= P.art.dur) P.art = null; }

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
  else if (P.art && P.art.k === 'cleave'){ P.vx = P.art.dir * ARTS.cleave.speed; }
  else if (P.art && P.art.k === 'slam'){ P.vx = 0; }
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
  // deep water: where he is in it (its top over his feet), and whether it has him
  { P.hopT = Math.max(0, (P.hopT || 0) - dt);
    const top = waterOver(P.x, P.y + SWIM.in) ?? waterOver(P.x, P.y + 0.05), wz = top != null, was = P.swim; P.depth = wz ? top - P.y : 0; P.wet = wz && P.depth > 0.3; P.under = wz && P.depth > BODY.stand - 0.2;
    if (wz && !CAN.glide && P.grounded && P.depth > SWIM.float + 0.2){ P.grounded = false; P.coyote = 0; P.crouch = false; }   // too deep to stand in: it lifts him off his feet
    P.swim = wz && P.depth > SWIM.in && !P.grounded && !P.mantle && P.hopT <= 0 && P.dashT <= 0;
    // deep water ends a slam, however it was begun (build 79, from a playtest). One begun while he floated was never
    // ended: it held him still in the water, and a leap out of it then became the slam again, seven metres straight
    // down, under water he could not yet go under and so under whatever the water was there to bar
    // (build 81: one begun in the moment of a leap out of it was not ended, and an ended one kept its speed while the
    // leap's moment lasted: to the floor, and under the Great Shaft's arch. Now it is ended whenever it is in the water,
    // loses its speed with it, and without the wind the water turns him back up however he is in it)
    if (wz && P.depth > SWIM.in && P.dive){ P.dive = null; if (P.vy < -6) P.vy = -6; }
    if (wz && !CAN.glide && !P.grounded && P.depth > SWIM.float + 0.7 && P.vy < 2) P.vy = 2;
    if (P.swim && !was){ ev(P, 'splash', { v: -P.vy }); P.dive = null; P.glide = false; P.flip = 0; P.airJumps = 0; if (P.vy < -6) P.vy = -6; }
    if (P.swim){ P.airTop = P.y; P.airDash = 1;
      if (P.roll <= 0 && !stunned && !(P.atk && P.atk.phase !== 'rec' && swingOf(P, P.atk).dash)){ target = dir * (CAN.glide ? SWIM.speed : SWIM.top) * (SIDE.bell && CAN.glide ? SWIM.bell : 1) * IN.mag; accel = SWIM.grip; if (dir && dir !== P.face && !P.atk) P.face = dir; } }
    else if (P.wet && P.grounded && P.depth > SWIM.in) target *= SWIM.wade; }   // wading: slower
  // running water (the Aqueducts; level.js flowAt): what stands in a channel is carried along it
  const fl = flowAt(P.x, P.y + 0.2); P.flow = fl;
  if (fl && fl.dx){ target += fl.dx * FLOW.push; if (P.grounded) accel = Math.max(accel, FLOW.grip); P.carry = FLOW.carry; }
  else if (P.carry > 0){ P.carry = P.grounded ? 0 : P.carry - dt; if (!P.grounded && Math.abs(P.vx) > Math.abs(target) && (dir === 0 || Math.sign(P.vx) === dir)) accel = FLOW.air; }   // thrown off the end of a channel, he keeps what it gave him a while: a long leap
  if (P.roll <= 0 && !stunned && !P.dive){ const dv = target - P.vx; P.vx += Math.sign(dv) * Math.min(Math.abs(dv), accel * dt); }
  else if (stunned) P.vx *= Math.exp(-dt * 4);

  // ---- vertical
  if (P.jumpBuf > 0 && (P.grounded || P.coyote > 0) && !stunned && (P.roll <= 0 || rollEnding) && P.plant <= 0 && !P.dive && !boxRock(P, P.x, P.y, BODY.stand)){
    P.jumpBuf = 0; P.coyote = 0; takeOff(P, false); ev(P, 'jump');
  }
  // the scarf: held open while jump is held; in rising air it opens of itself
  const up = CAN.glide && !P.grounded ? updraftAt(P.x, P.y + 1) : null;
  // the wind on the Spires' faces while the Wyrm holds it (level.js gustAt): in its beats it bears down on him in the air
  if (!P.grounded && !P.dive && gustAt(P.x, P.y + 1)){ P.vy -= 34 * dt; P.gusted = 0.2; } else if (P.gusted > 0) P.gusted -= dt;
  if (P.glide && (!H.jump || P.grounded || P.dive || stunned)) P.glide = false;
  if (!P.glide && up && !up.cold && H.jump && !P.dive && !stunned && P.roll <= 0 && P.vy < 4 && !P.swim){ P.glide = true; ev(P, 'glide'); }
  if (P.swim){
    // the water has him. With the wind he goes where he means to; without it he is borne up to its top and kept there
    let want = CAN.glide ? (H.jump || H.up ? SWIM.rise : H.down ? -SWIM.sink : -SWIM.drift) : SWIM.rise;
    if (want > 0 && P.depth <= SWIM.float) want = (SWIM.float - P.depth) * -6;   // at its top: held there, bobbing
    if (stunned) want = Math.min(want, 0);
    P.vy += (want - P.vy) * Math.min(1, dt * SWIM.accel); P.glide = false;
    if (!CAN.glide && P.depth > SWIM.float + 0.7 && P.vy < 2) P.vy = 2;   // it will not let him under, however he came into it
  }
  else if (!P.grounded){
    if (P.dive){ P.vy = -MV.dive.speed; P.dive.t += dt; }
    else if (P.dashT > 0 || (P.art && P.art.k === 'cleave')) P.vy = 0;
    else if (P.glide && (up || P.vy <= 0)){
      if (up && up.cold) P.vy += (-GLIDE.fall * GLIDE.cold - P.vy) * Math.min(1, dt * 9);   // cold air coming up (the Great Shaft): it does not lift him, it holds him back
      else if (up) P.vy += (GLIDE.rise - P.vy) * Math.min(1, dt * GLIDE.accel);
      else P.vy += (-GLIDE.fall * (SIDE.calm ? 0.6 : 1) - P.vy) * Math.min(1, dt * 9);
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

  if (fl && fl.dy && !P.dive && !P.grounded){ P.vy = Math.min(P.vy, -FLOW.fall); P.glide = false; P.airTop = Math.min(P.airTop, P.y + 2); }   // falling water: nothing rises through it, and it sets him down (it was not a fall)
  // ---- what he stands on has moved (the Orrery Wing; level.js movers): it takes him with it. A wall in the way
  // stops him and it goes on without him; going down it sets him on whatever floor it passes
  const MS = moversNow();
  if (P.ride && P.ride.kind === 'raft') P.ride.load = 0.12;
  if (P.ride){ const m = P.ride; if (!P.grounded || m.ghost || !MS.length) P.ride = null; else { const dx = m.x - P.rideX, dy = m.y - P.rideY; P.rideX = m.x; P.rideY = m.y; if (dx) moveX(P, dx);
      if (dy > 0){ if (boxRock(P, P.x, P.y + dy)){ P.ride = null; P.grounded = false; P.vy = 0; } else P.y = m.y; } else if (dy < 0){ P.grounded = false; moveY(P, m.y - P.y, P.y + 0.05); if (!P.grounded){ P.y = m.y; P.grounded = true; } else if (P.y > m.y + 1e-3) P.ride = null; } } }
  // ---- move: across (climbing steps on the way), then up or down
  const wasGrounded = P.grounded, y0 = P.y;
  moveX(P, P.vx * dt);
  if (P.grounded){
    const on = P.ride && onMover(P, P.ride) && P.drop <= 0; if (P.ride && !on) P.ride = null;
    if (!on && !support(P, P.x, P.y)){ const m = MS.length && P.drop <= 0 ? MS.find(q => Math.abs(q.y - P.y) < 0.03 && onMover(P, q)) : null; if (m){ P.ride = m; P.rideX = m.x; P.rideY = m.y; } else { P.grounded = false; P.vy = 0; P.coyote = MV.coyote; P.airTop = P.y; } }
  }
  if (!P.grounded){ moveY(P, P.vy * dt, y0); P.airTop = Math.max(P.airTop, P.y); }
  if (P.grounded && !wasGrounded) landed(P);
  // a bloom underfoot throws him high (and gives him his air jump back)
  if (P.grounded && LEVEL.pads.size && P.hp > 0){
    const m = LEVEL.pads.get(ty(P.y + 0.01) * LEVEL.W + tx(P.x));
    if (m){ P.vy = launchSpeed(BLOOM.height, MV.launch.ground); P.launch = MV.launch.ground; P.jumpT = 0; P.grounded = false; P.crouch = false; P.roll = 0; P.plant = 0; P.atk = null; P.bounce = true; P.airJumps = FEEL.doubleJump ? 1 : 0; P.airTop = P.y; ev(P, 'bloom', { m }); }
  }
  // ---- catching an edge in the air: a wall just ahead whose top is within reach above his feet, and he pressing
  // toward it. Only on the way up (GRAB): never while he is coming down, dropping through a plank, or holding down.
  // (Out of water he hauls himself at its top whichever way he is moving: that is leaving the water, not a jump)
  const goingUp = P.vy > 0 || P.topT < GRAB.top;
  if (!P.grounded && FEEL.ledge && P.roll <= 0 && !stunned && !P.dive && P.vy < 5 && !P.dropping && !H.down && (P.swim ? P.depth < SWIM.float + 0.6 : goingUp)){   // (under the water he does not haul himself onto every edge he passes: only out of it, at its top)   // dropping: from a drop through a plank until he lands
    const d = H.right ? 1 : H.left ? -1 : 0;
    if (d) tryMantle(P, d);
    if (!P.mantle) tryPlank(P);
  }
  if (P.grounded && spikesUnder(P)) hurt(P, 1, P.x - P.face, 'Spikes');
  else if (P.grounded && liveUnder(P)) hurt(P, 1, P.x - P.face, 'Shocked');   // a gantry the storm still runs through
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
      // landing on a thing that moves: he was over its top (as it is, or as it was a step ago) and comes down to it
      if (P.drop <= 0){ const MS = moversNow(); for (const m of MS) if (ny <= m.y && P.y >= Math.min(m.y, m.py) - 0.02 && yStart >= Math.min(m.y, m.py) - 0.06 && onMover(P, m)){ P.y = m.y; P.vy = 0; P.grounded = true; P.ride = m; P.rideX = m.x; P.rideY = m.y; return; } }
      P.y = ny;
    } else {
      if (boxRock(P, P.x, ny)){ P.y = ty(ny + P.h) * T - P.h - 1e-4; P.vy = 0; ev(P, 'bonk'); return; }   // a ceiling
      P.y = ny;
    }
  }
}
// a plank overhead, anywhere along it (not only at its end): his hands pass its top, and he hauls himself up through
// it. A plank is passed from below, so what an edge allows at its end, its middle allows too
function tryPlank(P){
  if (P.flow && P.flow.dy) return;   // not in falling water: there is no hauling up through it
  const i = tx(P.x);
  for (let j = ty(P.y + 0.3); j <= ty(P.y + MANTLE); j++){
    if (tileAt(i, j) !== LEDGE) continue;
    if (tileAt(i, j + 1) === ROCK) return;
    const top = (j + 1) * T;
    if (top - P.y < 0.35 || boxRock(P, P.x, top, BODY.stand) || boxRock(P, P.x, P.y, top - P.y + BODY.crouch)) return;
    P.mantle = { t: 0, dur: Math.max(0.18, Math.min(0.4, 0.14 + 0.1 * (top - P.y))), x0: P.x, x1: P.x, y0: P.y, y1: top, wall: null, d: P.face }; P.vx = P.vy = 0; P.atk = null; P.flip = 0; ev(P, 'mantle');
    return;
  }
}
function tryMantle(P, d){
  if (P.flow && P.flow.dy) return;
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
  let drop = P.airTop - P.y; P.airTop = P.y; P.flip = 0; P.bounce = false; P.glide = false; P.dropping = false;
  if (P.dive){ const art = !!P.dive.art; P.dive = null; P.plant = MV.dive.rec; P.vx = 0; P.landT = 0.2; drop -= MV.dive.soak; ev(P, 'slam', { art }); }
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
export const BLADE = { name: 'Curved blade', reach: 2.1, combo: [
  { dmg: 1, wind: 0.21, active: 0.09, rec: 0.3, lunge: 0.8, anim: 'atk_slam_v3', hit: 7 / 11 },
  { dmg: 1, wind: 0.23, active: 0.09, rec: 0.3, lunge: 0.9, anim: 'atk_slam_px', hit: 9 / 13 },
  { dmg: 2, wind: 0.09, active: 0.26, rec: 0.3, lunge: 1.1, anim: 'atk_spin_px', hit: 2 / 13, hitEnd: 10 / 13 },   // the cut lasts the whole turn
], rise: { dmg: 2, wind: 0.28, active: 0.09, rec: 0.33, lunge: 0.4, anim: 'atk_rise_px', hit: 9 / 13 },
  // out of a roll: he is driven forward (dash, units a second) through the wind-up and the cut, then skids out of it
  dash: { dmg: 2, wind: 0.15, active: 0.08, rec: 0.28, lunge: 0, dash: 11, anim: 'atk_dash_px', hit: 7 / 13, hitEnd: 8 / 13 } };
// the Warden's spade (decision 0.4): a whole weapon, slow and heavy. Three blows: a level sweep, a rising heave, and the
// great overhead blow, which sends a wave forward along the ground (`wave`, main.js). It reaches further than the blade
// and every blow breaks cracked stone (`digs`); so does its plunge. He cannot guard with it, it has no rising or
// dashing cut, and in the air its swings land weakly (main.js). The Warden leaves it (main.js, the gift)
// The Warden's hammer (it was the spade until build 86; decision 0.14. Its key in the code and its drawings' names are
// still 'spade'). A sledge: two heavy blows and a slam with a wave along the ground. Each blow does three times the
// blade's, in a wide arc (a little behind him and over him: enemies.js), and knocks what it hits back and stops it for
// a breath: that is the reason to choose it. It is slow, it cannot block, and it is weak in the air (main.js)
export const SPADE = { name: 'Warden\'s hammer', reach: 2.85, guard: false, digs: true, wide: true, knock: 1.4, stagger: 0.4, combo: [
  { dmg: 3, wind: 0.32, active: 0.1, rec: 0.38, lunge: 0.5, anim: 'hm_atk1', hit: 6 / 8 },
  { dmg: 3, wind: 0.34, active: 0.1, rec: 0.4, lunge: 0.6, anim: 'hm_atk2', hit: 4 / 8 },
  { dmg: 6, wind: 0.46, active: 0.1, rec: 0.5, lunge: 0.5, anim: 'hm_atk3', hit: 7 / 12, wave: true },
] };
export const weaponOf = P => P.weapon === 'blade' ? BLADE : P.weapon === 'spade' ? SPADE : WEAPONS[P.weapon];
export const swingOf = (P, A) => A.special ? weaponOf(P)[A.special] : weaponOf(P).combo[A.i];
export const SIDE = { fallSafe: 9, feather: false, watching: false, leaf: false, stone: false, boots: false, calm: false, hour: false, bell: false, rope: false, tally: false };   // calm: a Breath of the Eye is worn: under the glide he sinks more slowly
//   // boots: the Wright's Boots are worn: live iron does not shock him
//   // stone: the Pilgrim's Stone is worn: after a blow nothing can hurt him for longer
//   // leaf: the Copyist's Blank Leaf is unspent: the next blow that lands does no harm
// the ember arts (main.js spends the embers and says which): each a keeper's gift turned to a blow.
//   slam   the Warden's weight: down on the ground (from the air, a plunge first); the blow runs along the floor both ways
//   cleave the Toll's step: a level rush forward through everything in the way, untouchable while it lasts
//   gust   the Wyrm's wind: up, turning, in a rising wind that throws what is round him
export const ARTS = { cost: 10, slam: { time: 0.32 }, cleave: { time: 0.26, speed: 19 }, gust: { up: 14, time: 0.42, safe: 0.3 } };
export function startArt(P, kind){
  P.atk = null; P.roll = 0; P.glide = false; P.blocking = false;
  if (kind === 'slam' && !P.grounded && !P.swim && !P.mantle && !P.climbing && heightAbove(P) > 0.6){ P.dive = { t: 0, art: true }; P.vx = 0; P.vy = -MV.dive.speed * 1.2; P.flip = 0; return 'dive'; }
  if (kind === 'slam'){ P.art = { k: 'slam', t: 0, dur: ARTS.slam.time }; P.vx = 0; return 'slam'; }
  if (kind === 'cleave'){ P.art = { k: 'cleave', t: 0, dur: ARTS.cleave.time, dir: P.face, safe: true, from: P.x }; P.vy = Math.max(0, P.vy); return 'cleave'; }
  P.art = { k: 'gust', t: 0, dur: ARTS.gust.time, safe: true }; P.vy = ARTS.gust.up; P.grounded = false; P.coyote = 0; P.flip = 0; return 'gust';
}   // a metroidvania's shafts are deep: only a long drop hurts
// set by the game: which way a foe is that a swing should turn to (0 for none), for the aim assist
export const HOOKS = { aim: null };
function startSwing(P, i, special = null){
  if (FEEL.aim && HOOKS.aim && !IN.held.left && !IN.held.right){ const d = HOOKS.aim(P); if (d) P.face = d; }
  P.atk = { i, t: 0, phase: 'wind', queued: false, special, up: !!IN.held.up };   // up: struck upward (main.js gives it a box over him, not in front)
}
