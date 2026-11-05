// The Blender warrior (assets/models/warrior/warrior.glb, built by tools/blender/warrior.py) and the driver that plays
// its clips from gameplay state. Clips are not left to run on their own clock: each frame the playhead is set from
// what the warrior is actually doing (the swing's phase, the stride, the roll's progress), so the animation stays
// locked to the controls. Clips cross-fade quickly. The cape and the squash-and-stretch are layered on in code.
import { TUNE } from '../../config/tuning.js';
import { clamp } from '../../core/math.js';
import { ST } from '../../core/state.js';
import { PL } from './player.js';
import { swingInfo } from './motor.js';
const THREE = window.THREE;
const MV = TUNE.move;

export const GLB = { ready: false, failed: false, root: null, mixer: null, act: {}, node: {}, weights: {}, idleT: 0, airT: 0 };
const KEY = 'the-climb-rig';
// Which warrior to draw: 'blender' (default once loaded) or 'hand'. A per-viewer preference.
export function rigChoice(){ try { return localStorage.getItem(KEY) || 'blender'; } catch (e) { return 'blender'; } }
export function setRigChoice(v){ try { localStorage.setItem(KEY, v); } catch (e) {} applyRigChoice(); }
export const usingGlb = () => GLB.ready && rigChoice() === 'blender';

// The hosted page serves the model as embedded-JSON glTF (it cannot serve .glb) and says so in CLIMB_WARRIOR_URL.
export function loadWarriorGlb(url = window.CLIMB_WARRIOR_URL || 'assets/models/warrior/warrior.glb'){
  if (!THREE.GLTFLoader){ GLB.failed = true; return; }
  new THREE.GLTFLoader().load(url, gltf => {
    const root = gltf.scene;
    root.traverse(o => {
      if (o.isMesh){ o.castShadow = false; o.material.flatShading = true; o.material.needsUpdate = true; o.frustumCulled = false; }
      if (o.name) GLB.node[o.name] = o;
    });
    PL.P.add(root);
    GLB.root = root;
    GLB.mixer = new THREE.AnimationMixer(root);
    for (const clip of gltf.animations){
      const a = GLB.mixer.clipAction(clip); a.play(); a.paused = true; a.setEffectiveWeight(0);
      GLB.act[clip.name] = a; GLB.weights[clip.name] = 0;
    }
    GLB.ready = true;
    applyRigChoice();
  }, undefined, () => { GLB.failed = true; });
}
export function applyRigChoice(){
  const on = usingGlb();
  if (GLB.root) GLB.root.visible = on;
  PL.body.visible = !on;
  showWeapon(PL.wepId);
}
export function showWeapon(id){
  for (const w of ['sword', 'pick', 'spear']){ const n = GLB.node['wep_' + w]; if (n) n.visible = w === (id || 'sword'); }
}

// Set one clip's playhead to a fraction of its length.
function at(name, frac){ const a = GLB.act[name]; if (a) a.time = clamp(frac, 0, 0.9999) * a.getClip().duration; }
const loop = x => x - Math.floor(x);

// Pick the clips and their weights for this frame.
function targets(G){
  const T = {};
  if (ST.mode === 'fall'){ GLB.idleT += 1 / 60; at('Flail', loop(GLB.idleT * 1.2)); T.Flail = 1; return { T, rate: 30 }; }
  if (G.hurtT > 0){ at('Hurt', 1 - G.hurtT / MV.hurtStun); T.Hurt = 1; return { T, rate: 40 }; }
  if (G.roll > 0){ at('Roll', 1 - G.roll / MV.roll.time); T.Roll = 1; return { T, rate: 45 }; }
  const A = swingInfo(G);
  if (A){
    const name = { slash: 'Slash', back: 'Back', chop: 'Chop', thrust: 'Thrust' }[A.sw.pose];
    const p = A.phase === 'wind' ? 0.3 * (A.t / A.sw.wind) : A.phase === 'active' ? 0.3 + 0.2 * (A.t / A.sw.active) : 0.5 + 0.5 * (A.t / A.sw.rec);
    at(name, p); T[name] = 1; return { T, rate: 50 };
  }
  if (!G.grounded){
    const w = clamp((G.vy + 1.5) / 7, 0, 1);
    GLB.airT += 1 / 60; at('Rise', loop(GLB.airT)); at('Fall', loop(GLB.airT));
    T.Rise = w; T.Fall = 1 - w; return { T, rate: 28 };
  }
  GLB.airT = 0;
  if (G.blocking){ const n = G.blockHigh ? 'BlockHigh' : 'Block'; at(n, 0.5); T[n] = 1; return { T, rate: 40 }; }
  const cyc = loop(G.runPhase / (Math.PI * 2));
  if (G.crouch){ at('Crouch', cyc); T.Crouch = 1; return { T, rate: 25 }; }
  const speed = clamp(Math.abs(G.v) / MV.run, 0, 1);
  GLB.idleT += 1 / 60; at('Idle', loop(GLB.idleT / 2));
  at('Run', cyc);
  T.Run = speed > 0.05 ? clamp(speed * 1.6, 0, 1) : 0; T.Idle = 1 - T.Run;
  return { T, rate: 22 };
}

export function animateGlb(G, dt){
  if (!usingGlb()) return;
  const { T, rate } = targets(G);
  const k = Math.min(1, rate * Math.max(dt, 1 / 120));
  for (const name in GLB.act){
    const w = GLB.weights[name] + ((T[name] || 0) - GLB.weights[name]) * k;
    GLB.weights[name] = w < 0.002 ? 0 : w;
    GLB.act[name].setEffectiveWeight(GLB.weights[name]);
  }
  GLB.mixer.update(0);
  // layered on top of the clips: landing squash and the cape trailing the motion
  const body = GLB.node.body;
  if (body){
    let sx = 1, sy = 1;
    if (G.landT > 0){ const q = G.landT / 0.12; sy = 1 - 0.16 * q; sx = 1 + 0.1 * q; }
    if (!G.grounded && G.vy > 0){ const t = clamp(G.vy / 9, 0, 1); sy = 1 + 0.1 * t; sx = 1 - 0.05 * t; }
    body.scale.set(sx, sy, sx);
  }
  const speed = Math.abs(G.v) / MV.run, sway = Math.sin(ST.time * 3.1) * 0.05;
  ['cape1', 'cape2', 'cape3'].forEach((n, i) => {
    const c = GLB.node[n]; if (!c) return;
    c.rotation.set(0, 0, (i ? 0.1 : -0.25) + speed * 0.35 * (i + 1) + (G.vy < 0 ? -0.2 : G.vy > 0 ? 0.25 : 0) + sway * (i + 1) + (G.crouch ? -0.4 : 0));
  });
}
