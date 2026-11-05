// WebGL renderer, scene, camera and the 2D HUD canvas. The 3D view renders at roughly 600px tall and is scaled up with hard pixel edges.
import { clamp } from '../core/math.js';
import { TUNE } from '../config/tuning.js';
import { ZONES } from '../config/zones.js';
const THREE = window.THREE;

export const glCanvas = document.getElementById('gl');
export const hudCanvas = document.getElementById('hud');
export const hx = hudCanvas.getContext('2d');
export const stageEl = document.getElementById('stage');

export const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, powerPreference: 'high-performance' });
export const scene = new THREE.Scene();
export const fogCol = new THREE.Color(ZONES[0].bg);
scene.background = fogCol.clone();
scene.fog = new THREE.FogExp2(fogCol.clone(), TUNE.camera.fogDensity);
export const camera = new THREE.PerspectiveCamera(TUNE.camera.fovPortrait, 0.6, 0.1, 120);

// Logical view size in CSS pixels, read by the HUD.
export const view = { W: 300, H: 500, dpr: 1 };

export function resize(){
  const r = stageEl.getBoundingClientRect();
  view.W = Math.max(200, r.width); view.H = Math.max(200, r.height);
  const pr = clamp(600 / view.H, 0.4, 1.5);
  renderer.setPixelRatio(pr); renderer.setSize(view.W, view.H, false);
  camera.aspect = view.W / view.H;
  camera.fov = view.W / view.H > 1 ? TUNE.camera.fovLandscape : TUNE.camera.fovPortrait;
  camera.updateProjectionMatrix();
  view.dpr = Math.min(2, window.devicePixelRatio || 1);
  hudCanvas.width = Math.round(view.W * view.dpr); hudCanvas.height = Math.round(view.H * view.dpr);
  hx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Lights. The torch follows the warrior, the Pool glows up the shaft, fireLight is borrowed by whichever campfire, lift lamp or Warden is nearest.
scene.add(new THREE.AmbientLight(0x8a84a8, 0.3));
scene.add(new THREE.HemisphereLight(0xa8a0d0, 0x141018, 0.28));
export const torch = new THREE.PointLight(0xffb36b, 1.8, 15, 2); scene.add(torch);
export const poolLight = new THREE.PointLight(0x5ce1c6, 2, 34, 2); poolLight.position.set(0, 2.5, 0); scene.add(poolLight);
export const fireLight = new THREE.PointLight(0xff8a3c, 0, 11, 2); scene.add(fireLight);
