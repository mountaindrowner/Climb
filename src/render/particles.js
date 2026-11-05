// Chunky cube particles drawn as one instanced mesh.
import { scene } from './renderer.js';
import { bgeo, dummy, tmpC } from './primitives.js';
const THREE = window.THREE;

export const PMAX = 420;
export const parts = [];
const partMesh = new THREE.InstancedMesh(bgeo(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), PMAX);
partMesh.frustumCulled = false; scene.add(partMesh);
for (let i = 0; i < PMAX; i++){
  dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.0001); dummy.updateMatrix();
  partMesh.setMatrixAt(i, dummy.matrix); partMesh.setColorAt(i, tmpC.set(0xffffff));
}
export function burst(p, n, color, spd, grav, size){
  const c = new THREE.Color(color);
  for (let i = 0; i < n && parts.length < PMAX; i++){
    const th = Math.random() * 6.28, ph = Math.random() * 3.14, v = (0.4 + Math.random()) * (spd || 3);
    parts.push({ x: p.x, y: p.y, z: p.z, vx: Math.cos(th) * Math.sin(ph) * v, vy: Math.cos(ph) * v + (spd || 3) * 0.4, vz: Math.sin(th) * Math.sin(ph) * v,
      life: 0, max: 0.5 + Math.random() * 0.5, size: size || (0.08 + Math.random() * 0.1), c, grav: grav == null ? 9 : grav });
  }
}
// A single slow mote, used for grit falling from above.
export function mote(x, y, z, color){
  if (parts.length >= PMAX) return;
  parts.push({ x, y, z, vx: 0, vy: -1, vz: 0, life: 0, max: 1.8, size: 0.04 + Math.random() * 0.05, c: new THREE.Color(color), grav: 5 });
}
export function updateParticles(dt){
  for (let i = parts.length - 1; i >= 0; i--){
    const p = parts[i]; p.life += dt; p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.life > p.max) parts.splice(i, 1);
  }
  for (let i = 0; i < PMAX; i++){
    const p = parts[i];
    if (p){ dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(Math.max(0.0001, p.size * (1 - p.life / p.max) * 1.4)); dummy.updateMatrix(); partMesh.setMatrixAt(i, dummy.matrix); partMesh.setColorAt(i, p.c); }
    else { dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.0001); dummy.updateMatrix(); partMesh.setMatrixAt(i, dummy.matrix); }
  }
  partMesh.instanceMatrix.needsUpdate = true;
  if (partMesh.instanceColor) partMesh.instanceColor.needsUpdate = true;
}
