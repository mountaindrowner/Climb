// The Warden on the floor. At the top of each region the stair ends: its last flight is a flat floor of stone with a
// sheer edge where the steps above have fallen away, and the golem waits there. Step onto the floor and the stair behind
// you comes down in a heap of rubble; there is no way on but through him.
//
// He is a body on the lane like any creature (a standing man cannot walk through him; a roll can), and he reads his
// distance to you:
//   close   the slam (both fists raised high, brought down in front of him: get out of reach), then a long moment with
//           his fists on the floor: the opening. The sweep (an arm flung back, swung across at chest height: crouch
//           under it, roll, or block; a parry knocks him onto one knee). The stomp.
//   apart   the stomp (a foot raised high and driven down: a shockwave runs along the floor both ways: jump it), or he
//           walks at you; at range, the leap (he crouches and comes down where you stood: move).
// At half his strength he roars, beats his chest, and stops warning you: the prompts go, the wind-ups shorten, the slam and
// the leap send shockwaves too, and the roof comes down in rocks where dust trickles first.
// Enough damage in a row knocks him onto one knee for a moment (poise); so does a parried sweep.
// Beaten, he crumbles, the rubble behind clears, and the first flight of the region above rises into place. The win is
// kept (S.bosses): a lift from the Pool runs past him, and he does not stand there again.
// State: ST.W. The visuals: view.js.
import { OMEGA, FL } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../config/zones.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { clamp } from '../core/math.js';
import { sfx } from '../audio/sfx.js';
import { vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { float, setToast, hitstop, shake, flash } from '../fx/feedback.js';
import { impact } from '../fx/impact.js';
import { floorOf, floorSpan, flightY, zoneOf } from '../world/path.js';
import { sinkFlight } from '../world/stair.js';
import { hurt, head, isLow, isBlocking, isParry, isInvulnerable } from '../entities/player/player.js';
import { addGold, onParry } from '../run/run.js';
import { buildGolemView, removeGolemView, golemPoint, sealFall, sealClear } from './view.js';
const T = TUNE.golem;
const PH = (v, W) => Array.isArray(v) ? v[W.phase - 1] : v;
// the phases of each attack, in order: [name, seconds]
function phasesOf(kind, W){
  const a = T[kind], wm = T.windMul(W.z);
  if (kind === 'slam') return [['wind', PH(a.wind, W) * wm], ['strike', a.strike], ['hold', PH(a.hold, W)], ['rec', a.rec]];
  if (kind === 'sweep') return [['wind', PH(a.wind, W) * wm], ['strike', a.strike], ['rec', a.rec]];
  if (kind === 'stomp') return [['wind', PH(a.wind, W) * wm], ['strike', a.strike], ['rec', a.rec]];
  return [['wind', PH(a.wind, W) * wm], ['air', a.air], ['land', a.land], ['rec', PH(a.rec, W)]];   // leap
}
export const PROMPT = { slam: '{roll}', sweep: '{down}', stomp: '{jump}', leap: '{roll}' };   // what answers each, phase 1 only

// ---- the floor ahead: he stands there waiting from two flights off, so you see him as you come up
export function updGolem(dt){
  const G = ST.G; if (!G || ST.practice) return;
  if (!ST.W){
    const kB = floorOf(G.s + 2 * FL), near = kB >= 0 ? kB : floorOf(G.s + FL) >= 0 ? floorOf(G.s + FL) : floorOf(G.s);
    if (near >= 0 && !S.bosses.includes(near) && G.s > floorSpan(near).s0 - 2 * FL) wake(near);
    if (!ST.W) return;
  }
  const W = ST.W, { s0, s1 } = W.span;
  if (W.st === 'wait' && G.s < s0 - 2.5 * FL){ removeGolem(); return; }   // he went back down: put the floor away
  W.tm += dt; W.flash = Math.max(0, W.flash - dt); W.hitT = Math.max(0, W.hitT - dt);
  stepWaves(W, dt); stepRocks(W, dt);
  switch (W.st){
    case 'wait': if (G.s > s0 + T.trigger) seal(W); break;
    case 'intro': if (W.tm > T.intro) go(W, 'idle'); break;
    case 'idle': turn(W); if (W.tm > PH(T.pause, W)) choose(W); break;
    case 'walk': {
      turn(W); const d = Math.abs(G.s - W.s);
      W.s += W.face * PH(T.walk, W) * dt; W.walked += PH(T.walk, W) * dt;
      if (d < T.close || W.tm > 2.4) choose(W, true);
      break;
    }
    case 'atk': attack(W, dt); break;
    case 'stagger': if (W.tm > PH(T.stagger, W)) go(W, 'idle'); break;
    case 'taunt': if (W.tm > T.taunt) go(W, 'idle'); break;
    case 'dying': if (W.tm > T.dying) crumble(W); break;
    case 'risen': {
      const f = clamp(W.tm / T.rise, 0, 1); sinkFlight(W.kB + 1, 7 * (1 - f) * (1 - f));
      if (f >= 1){ sinkFlight(W.kB + 1, 0); removeGolem(); return; }
      break;
    }
  }
  if (!ST.W) return;
  W.s = clamp(W.s, s0 + 1.6, s1 - 1.5);   // room behind him either side: a roll past him always has somewhere to land
  if (W.sealed && W.st !== 'risen'){
    // the rubble behind, the edge ahead
    const lo = s0 + 0.45, hi = s1 - 0.35;
    if (G.s < lo){ G.s = lo; if (G.v < 0) G.v = 0; }
    if (G.s > hi){ G.s = hi; if (G.v > 0) G.v = 0; }
    // a body, not a point: standing (or jumping, he is twice your height), you cannot pass him; a roll can
    if (alive(W) && W.yOff < 1.6 && G.roll <= 0){
      const gap = G.s - W.s;
      if (Math.abs(gap) < T.body){ const side = Math.sign(G.prevS - W.s) || -W.face; G.s = W.s + side * T.body; if (Math.sign(G.v) !== side) G.v = 0; }
    }
  }
}
const alive = W => W.st !== 'dying' && W.st !== 'crumbled' && W.st !== 'risen';
function wake(kB){
  const z = zoneOf(kB), span = floorSpan(kB), hp = T.hp(z);
  ST.W = { kB, z, span, y: flightY(kB), name: ZONES[z].boss, hp, max: hp, phase: 1, st: 'wait', tm: 0, s: span.s1 - 2.2, face: -1, yOff: 0,
    atk: null, flash: 0, hitT: 0, poise: 0, sealed: false, waves: [], rocks: [], rockT: 0, walked: 0, last: null, taunted: false };
  buildGolemView(ST.W);
}
function go(W, st){ W.st = st; W.tm = 0; if (st !== 'atk') W.atk = null; if (st === 'walk') W.walked = 0; }
function turn(W){ const d = ST.G.s - W.s; if (Math.abs(d) > 0.3) W.face = Math.sign(d); }
function seal(W){
  W.sealed = true; sealFall(W); go(W, 'intro');
  sfx.rumble(); sfx.slam(); shake(0.5); setTimeout(() => sfx.roar(), 500);
  setToast(W.name, 'The stair ends here. There is no way on but through him.', 3);
}
// ---- what next: by how far you are
function choose(W, fromWalk){
  if (W.phase === 2 && !W.taunted){ W.taunted = true; go(W, 'taunt'); sfx.roar(); shake(0.4); W.rockT = 1.2; return; }
  const d = Math.abs(ST.G.s - W.s), r = Math.random();
  let kind;
  if (d < 3.4) kind = r < 0.4 ? 'slam' : r < 0.8 ? 'sweep' : 'stomp';
  else if (d < 6.5) kind = fromWalk ? (r < 0.6 ? 'stomp' : 'leap') : r < 0.4 ? 'stomp' : r < 0.6 + (W.phase === 2 ? 0.15 : 0) ? 'leap' : null;
  else kind = r < 0.55 ? 'leap' : r < 0.8 ? 'stomp' : null;
  if (kind && kind === W.last && kind !== 'slam' && Math.random() < 0.6) kind = d < 3.4 ? (kind === 'sweep' ? 'slam' : 'sweep') : null;   // rarely the same twice
  if (!kind){ go(W, 'walk'); return; }
  W.last = kind; turn(W);
  go(W, 'atk'); W.atk = { kind, phases: phasesOf(kind, W), i: 0, t: 0, done: false };
  sfx.crack();
}
// ---- an attack, phase by phase
function attack(W, dt){
  const A = W.atk, G = ST.G, a = T[A.kind];
  A.t += dt;
  const [ph, dur] = A.phases[A.i];
  const ahead = (G.s - W.s) * W.face, floorTop = W.y;
  if (A.kind === 'leap' && ph === 'air'){
    const f = clamp(A.t / dur, 0, 1); W.s = A.from + (A.to - A.from) * (f * f * (3 - 2 * f)); W.yOff = Math.sin(Math.PI * f) * 4.2;
  }
  if (A.kind === 'sweep' && ph === 'strike' && !A.done && A.t > dur * 0.35){
    A.done = true;
    if (ahead > a.reach[0] && ahead < a.reach[1] && !isLow(G) && G.y < floorTop + 2.3){
      if (isBlocking(G) && G.face === -W.face){
        if (isParry(G)){ onParry(G, head(1.6)); sfx.parry(); flash(-0.25); hitstop(TUNE.feel.hitstopParry); float('Parry!', head(), '#9fd0ff'); knockDown(W); return; }
        sfx.block(); float('Blocked', head(), '#c9d2e0'); G.v = W.face * 4.5; hitstop(0.06);
      } else hurt(a.damage, 'Swept', W.s);
    }
  }
  if (A.t < dur) return;
  // the moment a phase ends
  A.t = 0; A.i++;
  if (ph === 'wind' && A.kind === 'leap'){
    A.from = W.s; A.to = clamp(G.s + (W.phase === 2 ? G.v * 0.35 : 0), W.span.s0 + 1.6, W.span.s1 - 1.5); W.face = Math.sign(A.to - A.from) || W.face;
    sfx.roar();
  }
  if (ph === 'strike' && A.kind === 'slam'){
    const at = W.s + W.face * 2.4;
    if (ahead > a.reach[0] && ahead < a.reach[1] && G.y < floorTop + 3) hurt(a.damage, 'Crushed', W.s);
    dust(at, 26); shake(0.45); sfx.slam(); hitstop(0.05);
    if (W.phase === 2) wavesFrom(W, at, 0.6);
  }
  if (ph === 'strike' && A.kind === 'stomp'){
    const at = W.s + W.face * 0.6;
    dust(at, 18); shake(0.4); sfx.slam(); wavesFrom(W, at, 0.9);
  }
  if (ph === 'air'){   // the leap comes down
    W.yOff = 0; W.s = A.to;
    if (Math.abs(G.s - W.s) < a.crush && G.y < floorTop + 2.5) hurt(a.damage, 'Crushed', W.s);
    dust(W.s, 34); shake(0.6); sfx.slam(); hitstop(0.05);
    if (W.phase === 2) wavesFrom(W, W.s, 1.1);
  }
  if (A.i >= A.phases.length) go(W, 'idle');
}
function wavesFrom(W, at, off){ for (const dir of [1, -1]) W.waves.push({ s: at + dir * off, dir, hit: false, life: 0 }); }
function dust(s, n){ const W = ST.W; burst(vArc(s * OMEGA, 11, W.y + 0.3), n, ZONES[W.z].stone, 4.5, 8, 0.13); }
function stepWaves(W, dt){
  const G = ST.G, w = T.wave;
  for (const v of W.waves){
    v.s += v.dir * w.speed * dt; v.life += dt;
    if (!v.hit && Math.abs(G.s - v.s) < w.half && G.y < W.y + w.height && !isInvulnerable(G)){ v.hit = true; hurt(T.stomp.damage, 'Shockwave', v.s - v.dir); }
  }
  W.waves = W.waves.filter(v => v.s > W.span.s0 + 0.2 && v.s < W.span.s1 - 0.1);
}
// phase 2: dust trickles from the roof, then the rocks come down
function stepRocks(W, dt){
  const G = ST.G, R_ = T.rocks;
  if (W.phase === 2 && alive(W) && W.st !== 'taunt' && W.sealed){
    W.rockT -= dt;
    if (W.rockT <= 0){
      W.rockT = R_.every * (0.8 + Math.random() * 0.4);
      const at = [G.s, G.s + (1.6 + Math.random() * 1.4), G.s - (1.6 + Math.random() * 1.4)];
      for (let i = 0; i < R_.n; i++) W.rocks.push({ s: clamp(at[i], W.span.s0 + 0.6, W.span.s1 - 0.5), t: -i * 0.18, hit: false });
    }
  }
  for (const r of W.rocks){
    r.t += dt;
    if (!r.hit && r.t >= R_.warn){ r.hit = true; dust(r.s, 10); sfx.crack(); if (Math.abs(G.s - r.s) < R_.half && G.y < W.y + 2.6) hurt(R_.damage, 'Rockfall', r.s); }
  }
  W.rocks = W.rocks.filter(r => r.t < R_.warn + 0.6);
}
function knockDown(W){ W.poise = 0; W.yOff = 0; go(W, 'stagger'); sfx.crack(); shake(0.3); }

// ---- your blows. Returns whether the swing was spent on him.
export function hitGolem(dmg, swing, reach){
  const W = ST.W, G = ST.G;
  if (!W || W.st === 'wait' || W.st === 'intro' || !alive(W) || W.yOff > 1.6) return false;
  const ahead = (W.s - G.s) * G.face;
  if (ahead < -0.4 || ahead > reach + T.body) return false;
  W.hp -= dmg; W.flash = 0.12; W.hitT = 0.18; W.poise += dmg; sfx.hit();
  const at = golemPoint(1.9 + Math.random() * 0.8);
  impact(at, ({ slash: -1.25, back: -1.1, chop: 1.0 }[swing.pose] || 0) * G.face, { heavy: swing.dmg >= 2 });
  burst(at, 10, '#ffd9a8', 3.5); float('-' + Math.round(dmg * 10) / 10, at, '#ffd9a8');
  if (W.hp <= 0){ W.hp = 0; W.waves = []; W.rocks = []; go(W, 'dying'); sfx.roar(); shake(0.6); hitstop(TUNE.feel.hitstopKill); return true; }
  if (W.phase === 1 && W.hp <= W.max / 2){ W.phase = 2; setToast('He stops warning you', 'Watch him, not the prompts', 2.2); }
  const busy = W.st === 'atk' && W.atk && W.atk.kind === 'leap' && W.atk.phases[W.atk.i][0] !== 'rec';
  if (W.poise >= T.poise(W.z) && W.st !== 'stagger' && W.st !== 'taunt' && !busy){ knockDown(W); float('Staggered', golemPoint(3.4), '#e8b04a'); }
  return true;
}
// ---- the end of him
function crumble(W){
  const G = ST.G, z = W.z;
  go(W, 'risen');
  const g = addGold(GOLD.warden(z)), well = T.well(z); G.well += well;
  float('+' + g, head(), '#e8b04a'); float('+' + well + ' ✦', head(1.9), '#7cf0d8');
  burst(golemPoint(2), 60, ZONES[z].stone, 6, 6, 0.16); burst(golemPoint(2), 30, '#5ce1c6', 3, -1.5, 0.07);
  S.bosses.push(W.kB); S.gold = G.gold; save();
  sealClear(W); sfx.rumble(); shake(0.5); sinkFlight(W.kB + 1, 7);
  setToast(W.name + ' falls', 'The stair above rises. A lift from the Pool runs past him now.', 3.4);
}
export function removeGolem(){ if (ST.W){ if (ST.W.st === 'risen') sinkFlight(ST.W.kB + 1, 0); removeGolemView(ST.W); } ST.W = null; }
// for the HUD: where he is in the attack, and how long it has to go
export function telegraph(W){
  if (!W || W.st !== 'atk' || !W.atk) return null;
  const A = W.atk, wind = A.phases[0][1];
  if (A.i === 0) return { kind: A.kind, t: A.t, T: A.kind === 'sweep' ? wind + T.sweep.strike * 0.35 : wind + (A.kind === 'leap' ? T.leap.air : 0) };
  if (A.kind === 'leap' && A.i === 1) return { kind: A.kind, t: wind + A.t, T: wind + T.leap.air };
  return null;
}
