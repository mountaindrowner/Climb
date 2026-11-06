// Falling is gameplay: you drop down the open centre, time slows near each root, tap ▲ to catch one. Miss them all and you splash into the Pool.
import { R, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { scene } from '../render/renderer.js';
import { mbox, placeArc, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { float, setToast } from '../fx/feedback.js';
import { posOf, topAt, meters } from '../world/path.js';
import { removeBoss } from '../wardens/warden.js';
import { playerWorld } from '../entities/player/player.js';
import { consume } from '../core/input.js';
const THREE = window.THREE;
const FT = TUNE.fall;

const rootGroup = new THREE.Group(); scene.add(rootGroup);
function clearRoots(){ while (rootGroup.children.length) rootGroup.remove(rootGroup.children[0]); }

export function startFall(){
  const G = ST.G, pw = playerWorld(), p = posOf(G.s);
  // one root every full turn of the spiral beneath you
  const ledges = [];
  for (let n = 1; ; n++){
    const s = G.s - n * Math.PI * 2 * R;
    if (s < 3) break;
    ledges.push({ s, y: topAt(s) + 0.2, id: n });
  }
  clearRoots();
  for (const L of ledges){
    const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: 0x6a4a32, emissive: 0x000000 });
    for (let j = 0; j < 4; j++){ const m = mbox(0.32, 0.26, 0.5, mat, 0, Math.sin(j * 1.7) * 0.08, -j * 0.42); m.rotation.x = Math.sin(j) * 0.3; g.add(m); }
    placeArc(g, L.s * OMEGA, R - 1.25, L.y); rootGroup.add(g); L.g = g; L.mat = mat;
  }
  ST.FALL = { y: pw.y, a: p.a, r: R, v: FT.startSpeed, y0: pw.y, vmax: FT.maxSpeed(pw.y), ledges, tried: new Set(), spin: 0 };
  ST.mode = 'fall'; removeBoss(); sfx.fall(); ST.hint = null;
  setToast('You fall', 'Grab a root with {jump} as it passes', 2);
}
export function grab(){
  const G = ST.G, FALL = ST.FALL;
  if (G.grabCd > 0) return;
  G.grabCd = TUNE.player.grabCooldown;
  for (const L of FALL.ledges){
    if (FALL.tried.has(L.id)) continue;
    if (Math.abs(FALL.y - L.y) < FT.grabWindow){
      G.s = L.s; G.prevS = L.s; G.hp = Math.max(1, Math.ceil(G.maxHp * TUNE.player.rootHpFraction)); G.inv = 1.2;
      G.y = posOf(L.s).y; G.vy = 0; G.v = 0; G.grounded = true; G.safeS = L.s; G.roll = 0; G.atk = null; G.hurtT = 0;
      G.thudId = null; ST.mode = 'climb'; ST.slowmo = 1;
      const lost = meters(FALL.y0) - meters(L.y);
      ST.FALL = null; sfx.block(); ST.shake = 0.3;
      clearRoots();
      setToast('Caught a root', 'Lost ' + lost + ' m', 2);
      return;
    }
  }
  float('Missed', vArc(FALL.a, FALL.r, FALL.y + 1.5), '#968ca3');
}
export function updFall(dt){
  const G = ST.G, FALL = ST.FALL;
  G.grabCd = Math.max(0, G.grabCd - dt);
  if (consume('jump')) grab();
  let near = false;
  for (const L of FALL.ledges){
    if (FALL.tried.has(L.id)) continue;
    const d = FALL.y - L.y, hot = Math.abs(d) < FT.grabWindow;
    L.mat.emissive.setHex(hot ? 0xb07a22 : 0x000000);
    if (d > -FT.grabWindow && d < 3.4) near = true;
    if (FALL.y < L.y - FT.grabWindow){ FALL.tried.add(L.id); L.mat.emissive.setHex(0); }
  }
  ST.slowmo = near ? FT.slowmo : 1;
  const ddt = dt * ST.slowmo;
  FALL.v = Math.min(FALL.vmax, FALL.v + FT.gravity * ddt);
  FALL.y -= FALL.v * ddt; FALL.spin += ddt * 7;
  FALL.r += (R - 2.4 - FALL.r) * Math.min(1, ddt * 4);
  if (FALL.y <= -0.1){
    FALL.y = -0.1; ST.slowmo = 1; sfx.splash(); ST.shake = 0.4;
    burst(vArc(FALL.a, FALL.r, 0), 40, '#5ce1c6', 6, 8);
    const lost = G.gold - Math.floor(G.gold / 2);
    ST.lastFall = { h: meters(FALL.y0), lost };
    if (!ST.practice){ S.falls++; S.gold = Math.floor(G.gold / 2); save(); }
    clearRoots();
    ST.mode = 'pool'; ST.poolT = 0;
  }
}
