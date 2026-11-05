// The warrior: his run state (ST.G), what threats ask of him (airborne, low, blocking, invulnerable), taking hits,
// drinking, and landing blows. Movement and the action verbs live in motor.js; the pose in animate.js.
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { WEAPONS } from '../../config/weapons.js';
import { S, save } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { sfx, buzz } from '../../audio/sfx.js';
import { scene } from '../../render/renderer.js';
import { vArc } from '../../render/primitives.js';
import { burst } from '../../render/particles.js';
import { float, setToast, hitstop } from '../../fx/feedback.js';
import { posOf, landingS, meters } from '../../world/path.js';
import { flight } from '../../world/generate.js';
import { ENTITIES } from '../registry.js';
import { makePlayer, setWeaponModel } from './model.js';
import { bossHit } from '../../wardens/warden.js';
import { startFall } from '../../modes/fall.js';
import { updatePips } from '../../ui/overlay.js';
import { tap } from '../../core/input.js';
const P = TUNE.player, MV = TUNE.move;

export const PL = makePlayer(); scene.add(PL.P); setWeaponModel(PL, S.weapon);

export function newRunState(startS){
  return {
    s: startS, prevS: startS, v: 0, y: posOf(startS).y, vy: 0, grounded: true, face: 1, safeS: startS,
    coyote: 0, jumpBuf: 0, crouch: false, roll: 0, rollCd: 0, rollDir: 1,
    atk: null, blocking: false, blockAt: -9, blockHigh: false, hurtT: 0, inv: 0, landT: 0, jumpT: 0,
    runPhase: 0, plantSide: 0, camLead: 0.17,
    hp: P.hp, maxHp: P.hp, flask: P.flask, flaskMax: P.flask,
    gold: S.gold, weapon: S.weapon, bonusDmg: 0, hearts: 0,
    campDone: new Set(), zoneShown: -1, grabCd: 0, lastAtk: -9,
    // kept for the parked Warden fight
    fightSlow: false, slowK: 0,
  };
}

// ---- what threats ask
export const isAirborne = G => !G.grounded;
export const isLow = G => G.crouch || G.roll > 0;                   // under a beam, under a swing
export const isRollInvulnerable = G => G.roll > 0 && (MV.roll.time - G.roll) >= MV.roll.iframeFrom && (MV.roll.time - G.roll) <= MV.roll.iframeTo;
export const isInvulnerable = G => G.inv > 0 || isRollInvulnerable(G);
export const isBlocking = G => G.blocking && G.roll <= 0;
export const isParry = G => isBlocking(G) && ST.time - G.blockAt <= P.parryWindow;
// The warrior's crown and middle, for things that hit at a height.
export const crownY = G => G.y + (isLow(G) ? 1.05 : 2.45);
export const midY = G => G.y + (isLow(G) ? 0.75 : 1.4);

export function playerWorld(out){ const G = ST.G; return vArc(G.s * OMEGA, R, G.y, out); }
export const head = h => { const v = playerWorld(); v.y += (h == null ? 2.5 : h); return v; };

// Take a hit from something at path distance fromS. Knocks you away from it. Returns whether it landed.
export function hurt(n, msg, fromS){
  const G = ST.G;
  if (!G || isInvulnerable(G)) return false;
  G.hp -= n; G.inv = P.invuln; G.hurtT = MV.hurtStun; G.atk = null;
  const away = fromS == null ? -G.face : Math.sign(G.s - fromS) || -G.face;
  G.v = away * MV.knock; if (G.grounded){ G.vy = MV.knockUp; G.grounded = false; }
  ST.shake = TUNE.feel.shakeHurt; ST.flash = 0.35; sfx.hurt(); buzz(50); hitstop(TUNE.feel.hitstopHurt);
  float(msg || ('-' + n), head(), '#ff8a78');
  if (G.hp <= 0){ G.hp = 0; startFall(); }
  return true;
}
export function drink(){
  const G = ST.G;
  if (!G || ST.mode !== 'climb') return;
  if (G.flask <= 0){ float('Flask empty', head(), '#968ca3'); return; }
  if (G.hp >= G.maxHp){ float('Already full', head(), '#968ca3'); return; }
  G.flask--; G.hp = Math.min(G.maxHp, G.hp + P.flaskHeal); sfx.drink(); updatePips();
  burst(head(0.6), 12, '#5ce1c6', 2, -2); float('+' + P.flaskHeal, head(), '#5ce1c6');
}
// The active frames of a swing: strike everything hittable within reach in front of him.
export function strike(swing){
  const G = ST.G, w = WEAPONS[G.weapon], dmg = swing.dmg + G.bonusDmg;
  if (ST.B && bossHit(dmg)) return true;
  const k = posOf(G.s).k; let any = false;
  for (let kk = k - 2; kk <= k + 2; kk++){
    if (kk < 0) continue;
    for (const o of flight(kk).obs){
      const e = ENTITIES[o.type];
      if (!e.hittable || !e.hittable(o)) continue;
      const ahead = (o.s - G.s) * G.face;
      const inReach = e.inReach ? e.inReach(o, w.reach) : (ahead > -0.3 && ahead < w.reach);
      if (inReach){ e.hit(o, dmg); any = true; }
    }
  }
  return any;
}
export function repairLift(k){
  const y = posOf(landingS(k)).y;
  S.lifts.push(k); save(); sfx.repair();
  burst(vArc(landingS(k) * OMEGA, R - 1.0, y + 2.2), 18, '#e8b04a', 3);
  setToast('Lift repaired', 'It now runs from the Pool to ' + meters(y) + ' m', 2.4);
}
export function setWeapon(id){ ST.G && (ST.G.weapon = id); S.weapon = id; save(); setWeaponModel(PL, id); }
// Older callers and tools: a single tap of a button.
export function press(k){ tap({ up: 'jump', down: 'down', a: 'attack', b: 'block' }[k] || k); }
