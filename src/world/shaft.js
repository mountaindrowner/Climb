// The round shaft: wall, outer caverns, floor, the Pool, chains in the open centre, dust, the giant silhouette and the darkness above.
import { MAXK, FH, RW, RP, R } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { ST } from '../core/state.js';
import { scene, poolLight, fogCol } from '../render/renderer.js';
import { wallTex, outerTex, chainTex, silTex } from '../render/textures.js';
import { bgeo, lam, bas, tmpC } from '../render/primitives.js';
import { zoneOf, gateK } from './path.js';
const THREE = window.THREE;

const TOTAL_H = MAXK * FH + 30;
function zoneColorAtY(y, key, f){ const z = ZONES[zoneOf(Math.floor(y / FH))]; return new THREE.Color(z[key]).multiplyScalar(f); }
function shaftCylinder(radius, tex, repU, key, f, alphaTest){
  const segs = MAXK + 4;
  const geo = new THREE.CylinderGeometry(radius, radius, TOTAL_H, 72, segs, true);
  geo.translate(0, TOTAL_H / 2 - 10, 0);
  const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++){ const c = zoneColorAtY(pos.getY(i), key, f); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set(repU, TOTAL_H / 24);
  const m = new THREE.MeshLambertMaterial({ map: t, vertexColors: true, side: THREE.DoubleSide, alphaTest: alphaTest || 0 });
  return new THREE.Mesh(geo, m);
}
scene.add(shaftCylinder(RW, wallTex, 5, 'wall', 0.68, 0.5));   // the wall, with openings
scene.add(shaftCylinder(17, outerTex, 18, 'wall', 0.4));       // deeper caverns seen through them

const floor = new THREE.Mesh(new THREE.RingGeometry(RP, RW + 0.2, 64), lam(0x55506a));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const poolMat = new THREE.MeshBasicMaterial({ color: 0x2fb8a2 });
const pool = new THREE.Mesh(new THREE.CircleGeometry(RP, 48), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = -0.3; scene.add(pool);
const poolRim = new THREE.Mesh(new THREE.RingGeometry(RP - 0.25, RP, 48), bas(0x8ff5e2)); poolRim.rotation.x = -Math.PI / 2; poolRim.position.y = -0.28; scene.add(poolRim);

// the Warden's silhouette climbing a parallel cavern behind the wall
const silMat = new THREE.MeshBasicMaterial({ map: silTex, transparent: true, depthWrite: false, opacity: 0.85 });
const sil = new THREE.Mesh(new THREE.PlaneGeometry(9, 13.5), silMat); scene.add(sil);
const silEyes = new THREE.PointLight(0xa07cff, 0, 8, 2); scene.add(silEyes);

// chains hanging in the open centre, passing in front of the stair as the camera turns
const chainMat = new THREE.MeshLambertMaterial({ map: chainTex.clone(), alphaTest: 0.5, color: 0x7a7480 });
chainMat.map.needsUpdate = true; chainMat.map.repeat.set(1, 60);
const chains = [];
for (let i = 0; i < 5; i++){
  const c = new THREE.Mesh(bgeo(0.26, 60, 0.26), chainMat);
  const a = i * (Math.PI * 2 / 5) + 0.3, r = 3.7 + (i % 2) * 0.6;
  c.position.set(r * Math.cos(a), 0, r * Math.sin(a)); scene.add(c); chains.push(c);
}

// drifting dust motes
const dustN = 150, dustPos = new Float32Array(dustN * 3), dustSeed = [];
for (let i = 0; i < dustN; i++) dustSeed.push({ a: Math.random() * 6.28, r: 1 + Math.random() * (RP - 1.5), y: Math.random() * 24, v: 0.2 + Math.random() * 0.4 });
const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ color: 0xa07cff, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false });
scene.add(new THREE.Points(dustGeo, dustMat));

// darkness that hides everything above the next unbeaten Warden
export const ceil = new THREE.Mesh(new THREE.CircleGeometry(RW + 2, 48), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
ceil.rotation.x = Math.PI / 2; scene.add(ceil);

export function updateShaft(dt){
  const { cam, time, mode } = ST;
  // zone tint follows the camera height
  const zNow = ZONES[zoneOf(Math.floor(Math.max(0, cam.y - 2) / FH))];
  tmpC.set(zNow.bg); fogCol.lerp(tmpC, Math.min(1, dt * 1.5)); scene.fog.color.copy(fogCol); scene.background.copy(fogCol);
  dustMat.color.set(zNow.glow);
  poolMat.color.setHSL(0.47, 0.6, 0.38 + 0.05 * Math.sin(time * 2));
  poolLight.intensity = 1.8 + 0.3 * Math.sin(time * 1.7);
  // chains follow the camera height, snapped so the links stay put in the world
  const snap = Math.round(cam.y);
  for (const c of chains){ c.position.y = snap; }
  for (let i = 0; i < dustN; i++){
    const d = dustSeed[i]; const yy = ((d.y + time * d.v) % 24 + 24) % 24;
    dustPos[i * 3] = d.r * Math.cos(d.a + time * 0.05); dustPos[i * 3 + 1] = cam.y - 12 + yy; dustPos[i * 3 + 2] = d.r * Math.sin(d.a + time * 0.05);
  }
  dustGeo.attributes.position.needsUpdate = true;
  const gk = gateK();
  if (gk !== Infinity && mode !== 'fall' && !ST.B){   // the Warden itself replaces the silhouette during its fight
    const ph = (time % 30) / 30;
    sil.visible = true;
    const sa = cam.ang + 0.35 * Math.sin(time * 0.07), sy = cam.y - 14 + ph * 26;
    sil.position.set(12.5 * Math.cos(sa), sy, 12.5 * Math.sin(sa)); sil.lookAt(0, sy, 0);
    silEyes.position.copy(sil.position).multiplyScalar(0.98); silEyes.position.y += 4.8;
    silEyes.color.set(ZONES[zoneOf(gk)].glow); silEyes.intensity = 1.2;
  } else { sil.visible = false; silEyes.intensity = 0; }
  if (gk !== Infinity){ ceil.visible = true; ceil.position.y = gk * FH + FH + 7.5; }
  else ceil.visible = false;
}
export { R };
