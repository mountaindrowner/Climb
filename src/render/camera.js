// The camera sits near the centre of the shaft and circles with the warrior, so the wall keeps sweeping past behind him.
import { R } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { ST } from '../core/state.js';
import { camera } from './renderer.js';
import { posOf } from '../world/path.js';
const CT = TUNE.camera;

export function updateCamera(dt){
  const { mode, G, B, FALL, cam } = ST;
  let tA, tY, lookY, tR = -3.2, lookA;
  if (mode === 'fall' && FALL){ tA = FALL.a; tY = FALL.y + 1.2; lookY = FALL.y - 0.5; tR = CT.fall.back; lookA = FALL.a; }
  else if (mode === 'pool'){ tA = cam.ang; tY = CT.pool.up; lookY = CT.pool.look; lookA = cam.ang; tR = CT.pool.back; }
  else if (mode === 'title'){ tA = cam.ang; tY = CT.title.up; lookY = CT.title.look; lookA = cam.ang; tR = CT.title.back; }
  else if (G){ const p = posOf(G.s), c = B ? CT.fight : CT.climb; tA = p.a + c.lead; tY = p.y + c.up; lookY = p.y + c.look; lookA = tA + 0.02; tR = c.back; }   // the fight camera pulls out to show the wall
  else { tA = cam.ang; tY = cam.y; lookY = cam.y - 2; lookA = cam.ang; }
  const fk = mode === 'fall' ? 1 : Math.min(1, dt * 4);
  cam.ang += (tA - cam.ang) * fk; cam.y += (tY - cam.y) * (mode === 'fall' ? 1 : Math.min(1, dt * 5));
  cam.r += (tR - cam.r) * Math.min(1, dt * 3);
  const shx = (Math.random() - 0.5) * ST.shake, shy = (Math.random() - 0.5) * ST.shake;
  camera.position.set(cam.r * Math.cos(cam.ang) + shx, cam.y - ST.dip + shy, cam.r * Math.sin(cam.ang));
  const lookAng = mode === 'fall' ? lookA : cam.ang + 0.02;
  camera.lookAt(R * Math.cos(lookAng), lookY - ST.dip * 0.5, R * Math.sin(lookAng));
}
