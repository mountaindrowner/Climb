// The Warden at the top of each region. The stair ends in a broad floor of stone, and behind it the wall of the shaft
// is gone: a cavern opens, vast and dark, and a colossus of stone stands in its depths, his torso rising above the floor,
// so big that you see him looming over the last flights of the climb to it. Step onto the floor and the stair behind you comes
// down in rubble. He does not come onto the floor: his arms reach to it.
//   the slam    a fist rises high over you, its shadow on the floor growing; it comes down there (get out from under:
//               run or roll). Then it rests on the floor a long moment: the opening, strike the fist
//   the sweep   a hand comes in low at one end of the floor and sweeps across it at chest height: crouch under it (or roll)
// Strike his fists enough and he reels: he slumps over the floor and his head comes down to rest on its edge, and every
// blow to it counts double. At half strength he roars and beats his chest, and stops warning you: the prompts go, the
// wind-ups shorten, both fists come down one after the other, each slam sends a shockwave along the floor (jump it), and
// rocks come down from the roof where dust trickles first.
// Beaten, he topples back into the dark, the rubble behind clears, and the first flight of the region above rises into
// place. The win is kept (S.bosses): a lift from the Pool runs past him, and he does not stand there again.
// Hands are kept as positions on the floor's own terms: s along the lane, r out from the shaft's centre, h above the
// floor; hands[0] works the low end of the floor, hands[1] the high end. The view (view.js) reaches the arms to them.
import { R, OMEGA, FL } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../config/zones.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { clamp } from '../core/math.js';
import { sfx } from '../audio/sfx.js';
import { vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { float, setToast, hitstop, shake } from '../fx/feedback.js';
import { impact } from '../fx/impact.js';
import { floorOf, floorSpan, flightY, zoneOf } from '../world/path.js';
import { sinkFlight } from '../world/stair.js';
import { hurt, head, isLow, isInvulnerable } from '../entities/player/player.js';
import { addGold } from '../run/run.js';
import { buildGolemView, removeGolemView, golemHandPoint, golemHeadPoint, sealFall, sealClear } from './view.js';
const T = TUNE.golem;
const PH = (v, W) => Array.isArray(v) ? v[W.phase - 1] : v;
const ease = { out: f => 1 - (1 - f) * (1 - f), in: f => f * f, io: f => f * f * (3 - 2 * f), lin: f => f };
export const PROMPT = { slam: '{roll}', sweep: '{down}' };   // what answers each, phase 1 only

// ---- he is there a few flights before the floor, looming, before you ever reach it
export function updGolem(dt){
  const G = ST.G; if (!G || ST.practice) return;
  if (!ST.W){
    for (let f = 0; f <= Math.ceil(T.wake); f++){
      const kB = floorOf(G.s + f * FL);
      if (kB >= 0 && !S.bosses.includes(kB) && G.s > floorSpan(kB).s0 - T.wake * FL){ wake(kB); break; }
    }
    if (!ST.W) return;
  }
  const W = ST.W, { s0, s1 } = W.span;
  if (W.st === 'wait' && G.s < s0 - (T.wake + 0.6) * FL){ removeGolem(); return; }   // gone back down: put him away
  W.tm += dt; W.time += dt; W.flash = Math.max(0, W.flash - dt); W.hitT = Math.max(0, W.hitT - dt);
  stepWaves(W, dt); stepRocks(W, dt);
  for (const hd of W.hands) stepHand(W, hd, dt);
  switch (W.st){
    case 'wait': if (G.s > s0 + T.trigger) seal(W); break;
    case 'intro': W.ik = Math.max(0, W.ik - dt * 3); if (W.tm > T.intro) go(W, 'fight'); break;
    case 'taunt': W.ik = Math.max(0, W.ik - dt * 3); if (W.tm > T.taunt) go(W, 'fight'); break;
    case 'fight':
      W.ik = Math.min(1, W.ik + dt * 2);
      if (W.hands.every(h => !h.act)){
        if (W.phase === 2 && !W.taunted){ W.taunted = true; go(W, 'taunt'); sfx.roar(); shake(0.5); W.rockT = 1.5; break; }
        if (W.tm > PH(T.pause, W)) choose(W);
      }
      break;
    case 'reel': {
      const r = T.reel, hold = PH(r.hold, W);
      W.reelF = W.tm < r.down ? ease.io(W.tm / r.down) : W.tm < r.down + hold ? 1 : 1 - ease.io(Math.min(1, (W.tm - r.down - hold) / r.up));
      if (W.tm > r.down + hold + r.up){ W.reelF = 0; for (const hd of W.hands) toRest(W, hd, 0.6); go(W, 'fight'); }
      break;
    }
    case 'dying': W.ik = Math.max(0, W.ik - dt * 2); if (W.tm > T.dying) crumble(W); break;
    case 'risen': {
      const f = clamp(W.tm / T.rise, 0, 1); sinkFlight(W.kB + 1, 7 * (1 - f) * (1 - f));
      if (W.tm > Math.max(T.rise, T.crumble)){ sinkFlight(W.kB + 1, 0); removeGolem(); return; }
      break;
    }
  }
  if (!ST.W) return;
  // the rubble behind, the edge ahead
  if (W.sealed && W.st !== 'risen'){
    const lo = s0 + 0.45, hi = s1 - 0.35;
    if (G.s < lo){ G.s = lo; if (G.v < 0) G.v = 0; }
    if (G.s > hi){ G.s = hi; if (G.v > 0) G.v = 0; }
  }
}
const alive = W => W.st !== 'dying' && W.st !== 'risen';
function wake(kB){
  const z = zoneOf(kB), span = floorSpan(kB), hp = T.hp(z), mid = (span.s0 + span.s1) / 2;
  const W = ST.W = { kB, z, span, mid, y: flightY(kB), name: ZONES[z].boss, hp, max: hp, phase: 1, st: 'wait', tm: 0, time: 0, ik: 1, reelF: 0,
    flash: 0, hitT: 0, poise: 0, sealed: false, waves: [], rocks: [], rockT: 0, taunted: false, hands: [] };
  for (const i of [0, 1]){ const hd = { i, pos: null, from: null, to: null, t: 0, dur: 1, ez: ease.io, act: null, open: false, resting: true }; hd.pos = restOf(W, hd); hd.from = { ...hd.pos }; hd.to = { ...hd.pos }; W.hands.push(hd); }
  buildGolemView(W);
}
function go(W, st){ W.st = st; W.tm = 0; }
function seal(W){
  W.sealed = true; sealFall(W); go(W, 'intro');
  sfx.rumble(); sfx.slam(); shake(0.5); setTimeout(() => sfx.roar(), 500);
  setToast(W.name, 'The stair ends here. There is no way on but through him.', 3);
}
// ---- the hands
const restOf = (W, hd) => { const r = T.rest, sw = Math.sin(W.time * 0.9 + hd.i * 2.1); return { s: W.mid + (hd.i ? 1 : -1) * r.s + sw * 0.3, r: R + r.r + sw * 0.4, h: r.h + Math.sin(W.time * 1.3 + hd.i) * 0.5 }; };
function moveTo(hd, to, dur, ez = ease.io){ hd.from = { ...hd.pos }; hd.to = { ...to }; hd.t = 0; hd.dur = Math.max(1e-3, dur); hd.ez = ez; }
function toRest(W, hd, dur){ hd.act = null; hd.open = false; moveTo(hd, restOf(W, hd), dur); hd.resting = true; }
function stepHand(W, hd, dt){
  hd.t += dt;
  if (hd.resting) hd.to = restOf(W, hd);   // drifting with his breathing between blows
  const f = hd.ez(Math.min(1, hd.t / hd.dur));
  for (const k of ['s', 'r', 'h']) hd.pos[k] = hd.from[k] + (hd.to[k] - hd.from[k]) * f;
  const A = hd.act; if (!A) return;
  A.pt += dt;
  const G = ST.G, [ph, dur] = A.phases[A.pi];
  if (A.kind === 'slam' && ph === 'wind' && A.pt < dur * 0.65){ A.tgt = clamp(G.s, W.span.s0 + 0.8, W.span.s1 - 0.6); hd.to.s = A.tgt; }   // it follows you, then it commits
  if (A.kind === 'sweep' && ph === 'cross' && !A.hit){
    const sw = T.sweep;
    if (Math.abs(G.s - hd.pos.s) < sw.half && !isLow(G) && G.y < W.y + sw.h - 0.4 && !isInvulnerable(G)){ A.hit = true; hurt(sw.damage, 'Swept', hd.pos.s - A.dir); }
  }
  if (A.pt < dur) return;
  // a phase ends
  A.pt = 0; A.pi++;
  const next = A.phases[A.pi];
  if (A.kind === 'slam'){
    const sl = T.slam;
    if (ph === 'wind') moveTo(hd, { s: A.tgt, r: R + 0.55, h: 1.35 }, next[1], ease.in);
    else if (ph === 'strike'){
      if (Math.abs(G.s - A.tgt) < sl.half && G.y < W.y + 3.2) hurt(sl.damage, 'Crushed', A.tgt + (G.s < A.tgt ? 1 : -1));
      dust(A.tgt, 34); shake(0.55); sfx.slam(); hitstop(0.05);
      if (W.phase === 2) for (const dir of [1, -1]) W.waves.push({ s: A.tgt + dir * 1.6, dir, hit: false });
      hd.open = true;
    }
    else if (ph === 'hold'){ hd.open = false; moveTo(hd, restOf(W, hd), next[1]); }
  }
  if (A.kind === 'sweep'){
    if (ph === 'wind') moveTo(hd, { s: A.end, r: R + 0.35, h: T.sweep.h }, next[1], ease.lin);
    else if (ph === 'cross') moveTo(hd, restOf(W, hd), next[1]);
  }
  if (A.pi >= A.phases.length){ hd.act = null; hd.resting = true; W.tm = 0; }
}
function slam(W, hd, delay = 0){
  const sl = T.slam, wm = T.windMul(W.z), G = ST.G;
  hd.resting = false; hd.open = false;
  const tgt = clamp(G.s, W.span.s0 + 0.8, W.span.s1 - 0.6);
  hd.act = { kind: 'slam', tgt, pi: 0, pt: -delay, phases: [['wind', PH(sl.wind, W) * wm], ['strike', sl.strike], ['hold', PH(sl.hold, W)], ['rec', sl.rec]] };
  moveTo(hd, { s: tgt, r: R + 2.8, h: 9.5 }, PH(sl.wind, W) * wm + delay, ease.out);
  sfx.crack();
}
function sweep(W, hd){
  const sw = T.sweep, wm = T.windMul(W.z), { s0, s1 } = W.span, startLow = hd.i === 0;
  hd.resting = false; hd.open = false;
  const start = startLow ? s0 + 0.5 : s1 - 0.4, end = startLow ? s1 - 0.4 : s0 + 0.5;
  hd.act = { kind: 'sweep', start, end, dir: startLow ? 1 : -1, hit: false, pi: 0, pt: 0, phases: [['wind', PH(sw.wind, W) * wm], ['cross', PH(sw.cross, W)], ['rec', sw.rec]] };
  moveTo(hd, { s: start, r: R + 0.6, h: sw.h + 1.6 }, PH(sw.wind, W) * wm, ease.out);
  sfx.crack();
}
// ---- what next: a fist on your side of the floor, or a sweep from the end farther from you; at half strength, both fists
function choose(W){
  const G = ST.G, near = G.s < W.mid ? 0 : 1, r = Math.random();
  if (W.phase === 2 && r < 0.35){ slam(W, W.hands[near]); slam(W, W.hands[1 - near], 0.55); }
  else if (r < (W.phase === 2 ? 0.65 : 0.7) || W.lastSweep){ slam(W, W.hands[near]); W.lastSweep = false; }
  else { const far = Math.abs(G.s - W.span.s0) > Math.abs(G.s - W.span.s1) ? 0 : 1; sweep(W, W.hands[far]); W.lastSweep = true; }
}
function dust(s, n){ const W = ST.W; burst(vArc(s * OMEGA, R + 0.4, W.y + 0.3), n, ZONES[W.z].stone, 5, 8, 0.14); }
function stepWaves(W, dt){
  const G = ST.G, w = T.wave;
  for (const v of W.waves){
    v.s += v.dir * w.speed * dt;
    if (!v.hit && Math.abs(G.s - v.s) < w.half && G.y < W.y + w.height && !isInvulnerable(G)){ v.hit = true; hurt(w.damage, 'Shockwave', v.s - v.dir); }
  }
  W.waves = W.waves.filter(v => v.s > W.span.s0 + 0.2 && v.s < W.span.s1 - 0.1);
}
// phase 2: dust trickles from the roof, then the rocks come down
function stepRocks(W, dt){
  const G = ST.G, R_ = T.rocks;
  if (W.phase === 2 && alive(W) && W.st === 'fight' && W.sealed){
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
function reel(W){
  W.poise = 0; go(W, 'reel'); W.waves = [];
  // he catches himself on both hands, either side of the floor, and his head comes down between them
  for (const hd of W.hands){ hd.act = null; hd.open = false; hd.resting = false; moveTo(hd, { s: W.mid + (hd.i ? 1 : -1) * 5.3, r: R + 1.7, h: 0.7 }, T.reel.down * 0.8, ease.in); }
  sfx.roar(); sfx.slam(); shake(0.6); float('He reels', head(1.2), '#e8b04a');
}

// ---- your blows: on a fist resting on the floor, or his head when it is down. Returns whether the swing was spent.
export function hitGolem(dmg, swing, reach){
  const W = ST.W, G = ST.G;
  if (!W || !alive(W) || W.st === 'wait' || W.st === 'intro') return false;
  let at = null, n = dmg, hd = null;
  if (W.st === 'reel' && W.reelF > 0.75 && Math.abs(G.s - W.mid) < T.reel.reach){ at = golemHeadPoint(); n = dmg * T.headMul; }
  else {
    hd = W.hands.find(h => h.open && Math.abs(h.pos.s - G.s) < T.slam.hand + reach * 0.4 && (h.pos.s - G.s) * G.face > -0.7);
    if (!hd) return false;
    at = golemHandPoint(hd.i);
  }
  W.hp -= n; W.flash = 0.12; W.hitT = 0.18; sfx.hit();
  impact(at, ({ slash: -1.25, back: -1.1, chop: 1.0 }[swing.pose] || 0) * G.face, { heavy: swing.dmg >= 2 || !hd });
  burst(at, 12, '#ffd9a8', 3.5); float('-' + Math.round(n * 10) / 10, at, '#ffd9a8');
  if (W.hp <= 0){
    W.hp = 0; W.waves = []; W.rocks = []; go(W, 'dying'); sfx.roar(); shake(0.7); hitstop(TUNE.feel.hitstopKill);
    for (const h of W.hands){ h.act = null; h.open = false; h.resting = false; }
    return true;
  }
  if (W.phase === 1 && W.hp <= W.max / 2){ W.phase = 2; setToast('He stops warning you', 'Watch his hands, not the prompts', 2.2); }
  if (hd){ W.poise += dmg; if (W.poise >= T.poise(W.z) && W.st === 'fight') reel(W); }
  return true;
}
// ---- the end of him
function crumble(W){
  const G = ST.G, z = W.z;
  go(W, 'risen');
  const g = addGold(GOLD.warden(z)), well = T.well(z); G.well += well;
  float('+' + g, head(), '#e8b04a'); float('+' + well + ' ✦', head(1.9), '#7cf0d8');
  burst(head(1), 30, '#5ce1c6', 3, -1.5, 0.07);
  S.bosses.push(W.kB); S.gold = G.gold; save();
  sealClear(W); sfx.rumble(); shake(0.6); sinkFlight(W.kB + 1, 7);
  setToast(W.name + ' falls', 'The stair above rises. A lift from the Pool runs past him now.', 3.4);
}
export function removeGolem(){ if (ST.W){ if (ST.W.st === 'risen') sinkFlight(ST.W.kB + 1, 0); removeGolemView(ST.W); } ST.W = null; }
// for the HUD and the bot: each hand winding up, how far into it, and how long until it lands
export function telegraphs(W){
  const out = [];
  if (!W) return out;
  for (const hd of W.hands){
    const A = hd.act; if (!A || A.pi !== 0 || A.pt < 0) continue;
    const wind = A.phases[0][1];
    out.push({ kind: A.kind, i: hd.i, t: A.pt, T: A.kind === 'slam' ? wind + T.slam.strike : wind, tgt: A.tgt, start: A.start });
  }
  return out;
}
