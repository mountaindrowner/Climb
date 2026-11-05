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
import { posOf, zoneOf, special, landingS, meters, arenaOf, topAt } from '../world/path.js';
import { stepMotor } from '../entities/player/motor.js';
import { flight, newRun } from '../world/generate.js';
import { newRunState, PL } from '../entities/player/player.js';
import { setWeaponModel } from '../entities/player/model.js';
import { showWeapon } from '../entities/player/glbRig.js';
import { release } from '../core/input.js';
import { ENTITIES } from '../entities/registry.js';
import { FEATURES } from '../config/features.js';
import { PRACTICE_FLIGHTS } from '../world/layout.js';
import { practiceDone } from '../ui/screens/practice.js';
import { startBoss, updWarden } from '../wardens/warden.js';
import { startFall } from './fall.js';
import { openCamp } from '../ui/screens/camp.js';
const C = TUNE.climb;

export function updClimb(dt){
  const G = ST.G, k0 = posOf(G.s).k;
  G.blockHigh = false;
  stepMotor(G, dt);
  if (ST.mode !== 'climb') return;
  // the parked Warden fight
  const kb = FEATURES.wardens ? arenaOf(k0) : -1;
  if (kb >= 0 && !S.bosses.includes(kb) && !ST.B) startBoss(kb);
  if (ST.B){
    if (G.s >= (kb + 1) * FL){ ST.G.s = (kb + 1) * FL - 0.01; setToast('The stair gives way', 'It tore the steps out from under you', 2); startFall(); return; }
    updWarden(dt); if (ST.mode !== 'climb') return;
  }
  // landmarks on a landing, reached going up
  const ls = landingS(k0);
  if (G.prevS < ls && G.s >= ls){
    const sp = special(k0);
    if (ST.practice && k0 >= PRACTICE_FLIGHTS){ practiceDone(); return; }
    if (sp === 'camp' && !G.campDone.has(k0) && !ST.practice){ G.campDone.add(k0); G.v = 0; S.gold = G.gold; save(); openCamp(k0); return; }
  }
  const p = posOf(G.s);
  if (zoneOf(p.k) !== G.zoneShown){ G.zoneShown = zoneOf(p.k); setToast(ZONES[G.zoneShown].name, 'Zone ' + (G.zoneShown + 1) + ' of ' + ZONES.length, 2.6); }
  ST.hint = null;
  for (let kk = p.k - 2; kk <= p.k + 2; kk++){
    if (kk < 0 || kk >= MAXK) continue;
    const c = flight(kk);
    for (const o of c.obs){
      const d = o.s - G.s;
      if (o.hint && !o.done && o.alive && d > -0.5 && d < C.hintRange) ST.hint = o.hint;
      o.flash = Math.max(0, o.flash - dt);
      ENTITIES[o.type].update(o, dt);
      if (o.hint && o.done && !ST.practice && !S.seen.includes(o.type)){ S.seen.push(o.type); save(); }
      if (ST.mode !== 'climb') return;
    }
    for (const g of c.gold){
      if (!g.taken && Math.abs(g.s - G.s) < 0.45 && G.y < topAt(g.s) + 1.6){ g.taken = true; G.gold += GOLD.nugget; sfx.gold(); burst(g.m.position, 6, '#e8b04a', 2); }
    }
  }
  if (!ST.hint && G.s < 6 && !ST.practice && !S.best) ST.hint = 'Hold ▶ to climb, ◀ to go back down. ▲ jumps, hold ▼ to crouch.';
  if (!ST.practice && p.land && special(p.k) === 'lift' && !S.lifts.includes(p.k)) ST.hint = 'Stand on the landing and tap ▲ to repair the lift. It becomes a shortcut from the Pool.';
  const m = meters(G.y); if (m > S.best && !ST.practice) S.best = m;
}

// Begin a climb from path distance startS (0 for the bottom, or a repaired lift's landing).
export function startClimb(startS){
  newRun();
  ST.G = newRunState(startS);
  setWeaponModel(PL, ST.G.weapon); showWeapon(ST.G.weapon);
  const p = posOf(startS); ST.cam.y = p.y + 2.6; ST.cam.ang = p.a + 0.14;
  release();
  ST.mode = 'climb'; ST.B = null; ST.FALL = null;
}
