// The backbone mode: the warrior auto-climbs, you answer what comes. Stops at rest stops and Warden arenas.
import { MAXK, R } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../config/zones.js';
import { S, save } from '../core/save.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { setToast } from '../fx/feedback.js';
import { posOf, zoneOf, special, landingS, meters } from '../world/path.js';
import { flight, newRun } from '../world/generate.js';
import { newRunState, PL } from '../entities/player/player.js';
import { setWeaponModel } from '../entities/player/model.js';
import { ENTITIES } from '../entities/registry.js';
import { startBoss } from '../wardens/warden.js';
import { openCamp } from '../ui/menus.js';
const C = TUNE.climb;

export function climbSpeed(G, p){
  let spd = C.baseSpeed + C.speedPerZone * zoneOf(p.k);
  if (G.stumble > 0) spd *= C.stumbleMul;
  if (G.engaged) spd *= C.engagedMul;
  if (p.land && special(p.k) === 'lift' && !S.lifts.includes(p.k)) spd *= C.brokenLiftMul;
  return spd;
}

export function updClimb(dt){
  const G = ST.G, p0 = posOf(G.s);
  const spd = climbSpeed(G, p0);
  G.engaged = false;
  G.prevS = G.s; G.s += spd * dt;
  // landmarks on this flight's landing
  const ls = landingS(p0.k);
  if (G.prevS < ls && G.s >= ls){
    const sp = special(p0.k);
    if (sp === 'camp' && !G.campDone.has(p0.k)){ G.s = ls; G.campDone.add(p0.k); S.gold = G.gold; save(); openCamp(p0.k); return; }
    if (sp === 'boss' && !S.bosses.includes(p0.k)){ G.s = ls; startBoss(p0.k); return; }
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
      if (ST.mode !== 'climb') return;
    }
    for (const g of c.gold){
      if (!g.taken && G.prevS < g.s && G.s >= g.s){ g.taken = true; G.gold += GOLD.nugget; sfx.gold(); burst(g.m.position, 6, '#e8b04a', 2); }
    }
  }
  const lp = posOf(G.s);
  if (lp.land && special(lp.k) === 'lift' && !S.lifts.includes(lp.k)) ST.hint = 'Tap ▲ to repair the lift. It becomes a shortcut from the Pool.';
  const m = meters(lp.y); if (m > S.best) S.best = m;
}

// Begin a climb from path distance startS (0 for the bottom, or a repaired lift's landing).
export function startClimb(startS){
  newRun();
  ST.G = newRunState(startS);
  setWeaponModel(PL, ST.G.weapon);
  const p = posOf(startS); ST.cam.y = p.y + 2.6; ST.cam.ang = p.a + 0.14;
  ST.mode = 'climb'; ST.B = null; ST.FALL = null;
}
