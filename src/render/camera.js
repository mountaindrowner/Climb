// The camera sits across the open centre of the shaft and circles with the warrior, so the wall keeps sweeping past
// behind him. Camera v2 frames by situation, all blended slowly so it never lurches:
//   explore   leads the way he faces; wider on gentle grades and galleries (to show the space ahead), tighter on steep
//             flights, and looks up a steep climb (down it when he turns back)
//   combat    with awake creatures near, it shifts to frame him and them, and pulls out as more join
//   punches   a short push in on kills and parries
// Fork, arena and cinematic framing come with those features.
import { R, RW, FL, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { ST } from '../core/state.js';
import { camera, view } from './renderer.js';
import { SET } from '../core/settings.js';
import { posOf, riseOf, rampY } from '../world/path.js';
import { content } from '../world/generate.js';
import { catalogById } from '../entities/catalog.js';
import { clamp } from '../core/math.js';
const CT = TUNE.camera;

// On a small screen (a phone on its side) the camera comes in, so he is not a speck; full size from about 900 px tall.
const near = () => 0.62 + 0.38 * clamp((view.H - 420) / 480, 0, 1);
// the grade over the next few steps the way he faces
function gradeAhead(G){
  let sum = 0, n = 0;
  for (let d = 0; d <= 6; d += 1.5){ sum += riseOf(Math.floor(Math.max(0, G.s + d * G.face) / FL)); n++; }
  return sum / n;
}
// awake creatures near him, as path offsets from him
function foesNear(G){
  const out = [], k = Math.floor(G.s / FL);
  for (let kk = k - 1; kk <= k + 1; kk++){
    const c = content.get(kk); if (!c) continue;
    for (const o of c.obs){
      if (!o.alive || o.done || o.st === 'idle' || o.st === 'gone') continue;
      const t = catalogById(o.type); if (!t || t.kind !== 'enemy') continue;
      const d = o.s - G.s; if (Math.abs(d) < 7) out.push(d);
    }
  }
  return out;
}
export const FRAME = { zoom: 1, lead: 0, look: 0, state: 'explore', y: null, vy: 0 };   // the blended framing (read by tests and tools)
const FOLLOW = 5.5;   // how quickly the camera's height follows him (a critically damped spring, about 0.35 s to catch up)

export function updateCamera(dt){
  const { mode, G, B, FALL, cam } = ST;
  let tA, tY, lookY, tR = -3.2, lookA;
  if (mode === 'fall' && FALL){ tA = FALL.a; tY = FALL.y + 1.2; lookY = FALL.y - 0.5; tR = CT.fall.back; lookA = FALL.a; }
  else if (mode === 'pool'){ tA = cam.ang; tY = CT.pool.up; lookY = CT.pool.look; lookA = cam.ang; tR = CT.pool.back; }
  else if (mode === 'title'){ tA = cam.ang; tY = CT.title.up; lookY = CT.title.look; lookA = cam.ang; tR = CT.title.back; }
  else if (G){
    const p = posOf(G.s), c = B ? CT.fight : CT.climb, k = Math.min(1, dt);
    // explore: the grade ahead sets the zoom and the tilt
    const g = gradeAhead(G);
    let zoom = clamp(1.25 - 0.5 * g, 0.88, 1.15), lead = c.lead * G.face * (G.sprinting ? 1.6 : 1);   // a sprint looks further ahead
    const look = clamp((g - 0.45) * 2.2, -0.6, 0.8) * G.face;
    // combat: frame him and what is coming for him
    const foes = foesNear(G);
    if (foes.length){
      const mid = foes.reduce((a, b) => a + b, 0) / foes.length, spread = Math.max(...foes.map(Math.abs));
      lead = clamp(mid * OMEGA * 0.45, -0.22, 0.22) * 0.7 + lead * 0.3;
      zoom *= 1 + 0.06 * Math.min(foes.length, 3) + 0.02 * Math.min(spread, 6);
    }
    FRAME.state = foes.length ? 'combat' : 'explore';
    // punches: a push in on kills and parries
    ST.punch = Math.max(0, (ST.punch || 0) - dt * 6);
    zoom *= 1 - 0.07 * ST.punch;
    FRAME.zoom += (zoom - FRAME.zoom) * Math.min(1, k * (ST.punch > 0 ? 8 : 1.5));
    FRAME.lead += (lead - FRAME.lead) * Math.min(1, k * 2.5);
    FRAME.look += (look - FRAME.look) * Math.min(1, k * 2);
    G.camLead = FRAME.lead;
    // height: the slope line under him (not the steps), a little of any jump, through a spring: no hop per step
    const yWant = rampY(G.s) + Math.max(0, G.y - p.y) * 0.35;
    if (FRAME.y == null || Math.abs(yWant - FRAME.y) > 4){ FRAME.y = yWant; FRAME.vy = 0; }   // a cut: start, respawn, a lift
    FRAME.vy += ((yWant - FRAME.y) * FOLLOW * FOLLOW - 2 * FOLLOW * FRAME.vy) * k; FRAME.y += FRAME.vy * k;
    const y = FRAME.y;
    // the zoom scales his distance from the camera (the camera stays inside the shaft)
    const dist = (R - c.back * near()) * FRAME.zoom, back = -Math.min(RW - 1.2, Math.max(0, dist - R));
    tA = p.a + FRAME.lead; tY = y + c.up + FRAME.look * 0.5; lookY = y + c.look + FRAME.look; lookA = tA + 0.02; tR = back;
  }
  else { tA = cam.ang; tY = cam.y; lookY = cam.y - 2; lookA = cam.ang; }
  const fk = mode === 'fall' ? 1 : Math.min(1, dt * 4);
  let dA = tA - cam.ang; dA = Math.atan2(Math.sin(dA), Math.cos(dA));   // shortest way round: a root one turn down must not spin the camera
  cam.ang += dA * fk; cam.y += (tY - cam.y) * (mode === 'fall' ? 1 : Math.min(1, dt * 5));
  cam.r += (tR - cam.r) * Math.min(1, dt * 3);
  const sk = ST.shake * SET.shake, shx = (Math.random() - 0.5) * sk, shy = (Math.random() - 0.5) * sk;   // the screen-shake setting scales every shake
  camera.position.set(cam.r * Math.cos(cam.ang) + shx, cam.y - ST.dip + shy, cam.r * Math.sin(cam.ang));
  const lookAng = mode === 'fall' ? lookA : cam.ang + 0.02;
  const lr = G && mode !== 'fall' && mode !== 'title' && mode !== 'pool' ? posOf(G.s).r : R;   // a high road runs further out
  camera.lookAt(lr * Math.cos(lookAng), lookY - ST.dip * 0.5, lr * Math.sin(lookAng));
}
