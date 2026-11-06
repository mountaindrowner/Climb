// The camera sits near the centre of the shaft and circles with the warrior, so the wall keeps sweeping past behind him.
import { R } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { ST } from '../core/state.js';
import { camera, view } from './renderer.js';
import { posOf } from '../world/path.js';
const CT = TUNE.camera;

// On a small screen (a phone on its side) the camera comes in, so he is not a speck; full size from about 900 px tall.
const near = () => 0.62 + 0.38 * Math.max(0, Math.min(1, (view.H - 420) / 480));
export function updateCamera(dt){
  const { mode, G, B, FALL, cam } = ST;
  let tA, tY, lookY, tR = -3.2, lookA;
  if (mode === 'fall' && FALL){ tA = FALL.a; tY = FALL.y + 1.2; lookY = FALL.y - 0.5; tR = CT.fall.back; lookA = FALL.a; }
  else if (mode === 'pool'){ tA = cam.ang; tY = CT.pool.up; lookY = CT.pool.look; lookA = cam.ang; tR = CT.pool.back; }
  else if (mode === 'title'){ tA = cam.ang; tY = CT.title.up; lookY = CT.title.look; lookA = cam.ang; tR = CT.title.back; }
  else if (G){
    // lead where he faces (eased, so a turn swings the view rather than snapping it); follow the stair, and only part of a jump
    const p = posOf(G.s), c = B ? CT.fight : CT.climb;
    G.camLead += (c.lead * G.face - G.camLead) * Math.min(1, dt * 3.5);
    const y = p.y + Math.max(0, G.y - p.y) * 0.35;
    tA = p.a + G.camLead; tY = y + c.up; lookY = y + c.look; lookA = tA + 0.02; tR = c.back * near();
  }
  else { tA = cam.ang; tY = cam.y; lookY = cam.y - 2; lookA = cam.ang; }
  const fk = mode === 'fall' ? 1 : Math.min(1, dt * 4);
  let dA = tA - cam.ang; dA = Math.atan2(Math.sin(dA), Math.cos(dA));   // shortest way round: a root one turn down must not spin the camera
  cam.ang += dA * fk; cam.y += (tY - cam.y) * (mode === 'fall' ? 1 : Math.min(1, dt * 5));
  cam.r += (tR - cam.r) * Math.min(1, dt * 3);
  const shx = (Math.random() - 0.5) * ST.shake, shy = (Math.random() - 0.5) * ST.shake;
  camera.position.set(cam.r * Math.cos(cam.ang) + shx, cam.y - ST.dip + shy, cam.r * Math.sin(cam.ang));
  const lookAng = mode === 'fall' ? lookA : cam.ang + 0.02;
  camera.lookAt(R * Math.cos(lookAng), lookY - ST.dip * 0.5, R * Math.sin(lookAng));
}
