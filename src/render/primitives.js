// Cached box geometry and flat materials, plus helpers for placing things on the spiral.
import { yawFor } from '../core/math.js';
const THREE = window.THREE;

const geoCache = new Map(), matCache = new Map();
export function bgeo(w, h, d){
  const k = w + ',' + h + ',' + d; let g = geoCache.get(k);
  if (!g){ g = new THREE.BoxGeometry(w, h, d); geoCache.set(k, g); }
  return g;
}
export function lam(c){ const k = 'l' + c; let m = matCache.get(k); if (!m){ m = new THREE.MeshLambertMaterial({ color: c }); matCache.set(k, m); } return m; }
export function bas(c){ const k = 'b' + c; let m = matCache.get(k); if (!m){ m = new THREE.MeshBasicMaterial({ color: c }); matCache.set(k, m); } return m; }
export function mbox(w, h, d, mat, x, y, z){ const m = new THREE.Mesh(bgeo(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); return m; }
// Put an object on the spiral at angle `a`, radius `r`, height `y`, facing along the path.
export function placeArc(obj, a, r, y, flip){ obj.position.set(r * Math.cos(a), y, r * Math.sin(a)); obj.rotation.y = yawFor(a) + (flip ? Math.PI : 0); }
export const vArc = (a, r, y, out) => (out || new THREE.Vector3()).set(r * Math.cos(a), y, r * Math.sin(a));
export const dummy = new THREE.Object3D();
export const tmpC = new THREE.Color();
