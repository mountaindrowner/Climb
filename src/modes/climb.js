// The backbone mode: the warrior auto-climbs, you answer what comes. Stops at rest stops and Warden arenas.
import { MAXK, R, FL } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../config/zones.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { setToast } from '../fx/feedback.js';
import { posOf, zoneOf, special, landingS, meters, arenaOf } from '../world/path.js';
import { flight, newRun } from '../world/generate.js';
import { newRunState, PL } from '../entities/player/player.js';
import { setWeaponModel } from '../entities/player/model.js';
import { ENTITIES } from '../entities/registry.js';
import { FEATURES } from '../config/features.js';
import { PRACTICE_FLIGHTS } from '../world/layout.js';
import { practiceDone } from '../ui/screens/practice.js';
import { startBoss, updWarden } from '../wardens/warden.js';
import { startFall } from './fall.js';
import { openCamp } from '../ui/screens/camp.js';
const C = TUNE.climb;

export function climbSpeed(G, p){
  let spd = C.baseSpeed + C.speedPerZone * zoneOf(p.k);
  if (G.stumble > 0) spd *= C.stumbleMul;
  if (G.engaged) spd *= C.engagedMul;
  spd *= 1 - G.slowK * (1 - TUNE.warden.fightSlowMul);   // the Warden's slow-down, blended so it never snaps
  if (p.land && special(p.k) === 'lift' && !S.lifts.includes(p.k)) spd *= C.brokenLiftMul;
  return spd;
}

export function updClimb(dt){
  const G = ST.G, p0 = posOf(G.s);
  const spd = climbSpeed(G, p0);
  G.engaged = false;
  G.slowK += ((G.fightSlow ? 1 : 0) - G.slowK) * Math.min(1, dt * 6); G.fightSlow = false;
  G.spd = spd; G.blockHigh = false;
  G.prevS = G.s; G.s += spd * dt;
  // the Warden's stretch: it hunts you from behind the wall while you keep climbing
  const kb = FEATURES.wardens ? arenaOf(p0.k) : -1;
  if (kb >= 0 && !S.bosses.includes(kb) && !ST.B) startBoss(kb);
  if (ST.B){
    if (G.s >= (kb + 1) * FL){ ST.G.s = (kb + 1) * FL - 0.01; setToast('The stair gives way', 'It tore the steps out from under you', 2); startFall(); return; }
    updWarden(dt); if (ST.mode !== 'climb') return;
  }
  // landmarks on this flight's landing
  const ls = landingS(p0.k);
  if (G.prevS < ls && G.s >= ls){
    const sp = special(p0.k);
    if (ST.practice && p0.k >= PRACTICE_FLIGHTS){ G.s = ls; practiceDone(); return; }
    if (sp === 'camp' && !G.campDone.has(p0.k) && !ST.practice){ G.s = ls; G.campDone.add(p0.k); S.gold = G.gold; save(); openCamp(p0.k); return; }
  }
  const p = posOf(G.s);
  if (zoneOf(p.k) !== G.zoneShown){ G.zoneShown = zoneOf(p.k); setToast(ZONES[G.zoneShown].name, 'Zone ' + (G.zoneShown + 1) + ' of ' + ZONES.length, 2.6); }
  // the heavy step: thud, squash, dust and a camera dip the moment the foot plants
  const tid = p.land ? 'L' + p.k : p.k * 100 + p.i;
  if ((p.land || p.fr >= C.thudAt) && G.thudId !== tid){
    G.thudId = tid;
    if (G.jump <= 0){ G.squash = 1; ST.dip = TUNE.feel.stepDip; sfx.step(); burst(vArc(p.a, R, p.y + 0.05), 5, '#b4aac8', 1.2, 4, 0.08); }
  }
  ST.hint = null;
  for (let kk = p.k - 1; kk <= p.k + 2; kk++){
    if (kk < 0 || kk >= MAXK) continue;
    const c = flight(kk);
    for (const o of c.obs){
      const d = o.s - G.s;
      if (o.hint && !o.done && o.alive && d > -0.2 && d < C.hintRange) ST.hint = o.hint;
      o.flash = Math.max(0, o.flash - dt);
      ENTITIES[o.type].update(o, dt);
      if (o.hint && o.done && !ST.practice && !S.seen.includes(o.type)){ S.seen.push(o.type); save(); }
      if (ST.mode !== 'climb') return;
    }
    for (const g of c.gold){
      if (!g.taken && G.prevS < g.s && G.s >= g.s){ g.taken = true; G.gold += GOLD.nugget; sfx.gold(); burst(g.m.position, 6, '#e8b04a', 2); }
    }
  }
  const lp = posOf(G.s);
  if (!ST.practice && lp.land && special(lp.k) === 'lift' && !S.lifts.includes(lp.k)) ST.hint = 'Tap ▲ to repair the lift. It becomes a shortcut from the Pool.';
  const m = meters(lp.y); if (m > S.best && !ST.practice) S.best = m;
}

// Begin a climb from path distance startS (0 for the bottom, or a repaired lift's landing).
export function startClimb(startS){
  newRun();
  ST.G = newRunState(startS);
  setWeaponModel(PL, ST.G.weapon);
  const p = posOf(startS); ST.cam.y = p.y + 2.6; ST.cam.ang = p.a + 0.14;
  ST.mode = 'climb'; ST.B = null; ST.FALL = null;
}
