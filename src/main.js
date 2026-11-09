// Boot and the main loop. Order: gameplay step, visuals, render, HUD.
import { updateImpacts } from './fx/impact.js';
import { S, load } from './save/store.js';
import { ST } from './core/state.js';
import { TUNE } from './config/tuning.js';
import { renderer, scene, camera } from './render/renderer.js';
import { updateParticles, mote, parts, PMAX } from './render/particles.js';
import { updateCamera } from './render/camera.js';
import { updateFeedback } from './fx/feedback.js';
import { updateShaft } from './world/shaft.js';
import './world/cavern.js';
import { setAllFlights } from './world/stair.js';
import { updateProps } from './world/props.js';
import { R } from './config/constants.js';
import { newRunState, press, hurt } from './entities/player/player.js';
import * as input from './core/input.js';
import { animatePlayer } from './entities/player/animate.js';
import { loadWarriorGlb } from './entities/player/glbRig.js';
import { animateWarden } from './wardens/visuals.js';
import { drawGolem } from './boss/view.js';
import './ui/feel.js';   // F9: the movement assists on and off
import { MODES } from './modes/registry.js';
import { drawHUD } from './ui/hud.js';
import { titleMenu, updatePips } from './ui/menus.js';
import { bindInput, endFrame, IN, pollPads } from './core/input.js';
import './ui/screens/settings.js';   // pause, settings, controls (registers the pause hook)

load();

function step(dt){
  ST.time += dt;
  updateFeedback(dt);
  const mode = MODES[ST.mode];
  mode.update(dt);
  if (ST.mode !== 'climb' && ST.mode !== 'fall') endFrame();
}
function visuals(dt){
  const pw = animatePlayer(dt);
  if (ST.mode === 'climb' && Math.random() < dt * 7 && parts.length < PMAX){
    const ga = ST.cam.ang + (Math.random() - 0.5) * 0.9, gr = R - 2 + Math.random() * 3.5;
    mote(gr * Math.cos(ga), ST.cam.y + 5, gr * Math.sin(ga), 0x4a4452); // grit falling from above
  }
  updateCamera(dt);
  updateShaft(dt);
  updateProps(dt, pw);
  animateWarden(dt); drawGolem(dt);
  updateParticles(dt);
}
let last = 0;
function frame(ts){
  const now = ts / 1000;
  let dt = last ? now - last : 0.016; last = now;
  dt = Math.min(dt, 0.05) * ST.timeScale;
  pollPads();                          // the gamepad drives play and menus alike
  if (ST.paused) dt = 0;               // paused: the world holds still, the menus still work
  let sdt = dt;
  if (ST.hitstop > 0){ ST.hitstop -= dt; sdt = dt * 0.06; } // freeze-frame
  step(sdt);
  endFrame();
  visuals(sdt);
  updateImpacts(dt);                   // hit juice runs on real time, across the freeze-frame
  renderer.render(scene, camera);
  drawHUD();
  requestAnimationFrame(frame);
}

// A resting warrior for the title screen; replaced when a climb starts.
ST.G = newRunState(0); ST.G.gold = 0; ST.G.zoneShown = 0;
setAllFlights();
ST.cam.y = 3; ST.cam.ang = 0.3;
bindInput();
loadWarriorGlb();
updatePips();
titleMenu();
requestAnimationFrame(frame);

// Debug handle for the smoke test and the console. Not part of the game's API.
window.__climb = { ST, S, TUNE, step, press, hurt, input };
