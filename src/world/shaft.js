// The round shaft: wall, outer caverns, floor, the Pool, chains in the open centre, dust, the giant silhouette and the darkness above.
import { MAXK, FH, RW, RP, R, ZF, BOSS_FLIGHT, ARENA_FLIGHTS } from '../config/constants.js';
import { hash } from '../core/math.js';
import { FEATURES } from '../config/features.js';
import { ZONES } from '../config/zones.js';
import { ST } from '../core/state.js';
import { scene, poolLight, fogCol, camera } from '../render/renderer.js';
import { wallTex, outerTex, chainTex, silTex } from '../render/textures.js';
import { bgeo, lam, bas, tmpC } from '../render/primitives.js';
import { zoneOf, gateK, kAtY, flightY, landingY, HALLS, hallA, hallLine } from './path.js';
import { carveFor } from './branches.js';
const THREE = window.THREE;

const TOTAL_H = flightY(MAXK) + 30;
function zoneColorAtY(y, key, f){ const z = ZONES[zoneOf(kAtY(y))]; return new THREE.Color(z[key]).multiplyScalar(f); }
// The collapsed sections: along each Warden's stretch the wall has fallen away and the cavern behind is open.
export const OPEN_BANDS = [];
for (let z = 0; z < ZONES.length; z++){ const k0 = z * ZF + BOSS_FLIGHT - ARENA_FLIGHTS + 1; OPEN_BANDS.push({ z, y0: flightY(k0) + 1.5, y1: flightY(z * ZF + BOSS_FLIGHT + 1) - 0.5 }); }
export const inOpenBand = y => OPEN_BANDS.some(b => y > b.y0 && y < b.y1);
// Each hidden hall's stretch of wall, by vertex, so breaking it in opens the wall along the hall and a new run shuts it.
const HALL_VERTS = new Map();
function hallBand(angle, y){
  const turn = 2 * Math.PI;
  for (const h of HALLS){
    const da = ((angle - hallA(h, 0)) % turn + turn) % turn, u = da * h.r;
    if (u > h.len + 0.3) continue;
    const yl = hallLine(h, u); if (y > yl - 0.9 && y < yl + 3.5) return { h, u };
  }
  return null;
}
let wallMesh = null;
// open the wall in front of hall h up to distance uOpen along it (-Infinity: shut it all)
export function openHallWall(h, uOpen){
  const vs = HALL_VERTS.get(h); if (!vs || !wallMesh) return;
  const col = wallMesh.geometry.attributes.color;
  for (const v of vs) col.array[v.i * 4 + 3] = v.u <= uOpen ? 0 : 1;
  col.needsUpdate = true;
}
function shaftCylinder(radius, tex, repU, key, f, alphaTest, open, carve){
  const segs = MAXK * (carve ? 4 : 2);   // the carved wall is finer, so the openings along the high roads are cleaner
  const geo = new THREE.CylinderGeometry(radius, radius, TOTAL_H, carve ? 144 : 72, segs, true);
  geo.translate(0, TOTAL_H / 2 - 10, 0);
  const pos = geo.attributes.position, cols = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++){
    const y = pos.getY(i), c = zoneColorAtY(y, key, f);
    cols[i * 4] = c.r; cols[i * 4 + 1] = c.g; cols[i * 4 + 2] = c.b;
    // alpha 0 inside an open band; the ring nearest each edge is torn at random so the break is ragged
    let a = 1;
    if (open){
      for (const b of OPEN_BANDS){
        if (y > b.y0 && y < b.y1) a = 0;
        else if (Math.abs(y - b.y0) < 2.2 || Math.abs(y - b.y1) < 2.2){ if (hash(Math.round(pos.getX(i) * 7), Math.round(pos.getZ(i) * 7) + Math.round(y)) < 0.45) a = 0; }
      }
    }
    const ang = Math.atan2(pos.getZ(i), pos.getX(i));
    if (carve && carveFor(ang, y)) a = 0;   // the opening along a high road
    if (carve && a > 0){ const hb = hallBand(ang, y); if (hb){ (HALL_VERTS.get(hb.h) || HALL_VERTS.set(hb.h, []).get(hb.h)).push({ i, u: hb.u }); a = 0; } }   // a hall's front: shut until it is broken open (openHallWall)
    cols[i * 4 + 3] = a;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 4));
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set(repU, TOTAL_H / 24);
  const m = new THREE.MeshLambertMaterial({ map: t, vertexColors: true, side: THREE.DoubleSide, alphaTest: alphaTest || 0 });
  return new THREE.Mesh(geo, m);
}
wallMesh = shaftCylinder(RW, wallTex, 5 * RW / 8.8, 'wall', 0.68, 0.5, FEATURES.wardens, true);
for (const h of HALL_VERTS.keys()) openHallWall(h, -Infinity);   // built shut
scene.add(wallMesh);   // tiling scales with the radius: bricks keep their size   // the wall, with openings, gone along the Wardens' stretches
scene.add(shaftCylinder(RW + 8.2, outerTex, 18 * (RW + 8.2) / 17, 'wall', 0.4));       // deeper caverns seen through them

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
  const zNow = ZONES[zoneOf(kAtY(Math.max(0, cam.y - 2)))];
  tmpC.set(zNow.bg); fogCol.lerp(tmpC, Math.min(1, dt * 1.5)); scene.fog.color.copy(fogCol); scene.background.copy(fogCol);
  dustMat.color.set(zNow.glow);
  poolMat.color.setHSL(0.47, 0.6, 0.38 + 0.05 * Math.sin(time * 2));
  poolLight.intensity = 1.8 + 0.3 * Math.sin(time * 1.7);
  // chains follow the camera height, snapped so the links stay put in the world
  const snap = Math.round(cam.y);
  // the camera looks across the open centre at him: a chain between the two would cut through the view, so it goes
  for (const c of chains){
    c.position.y = snap;
    const ex = R * Math.cos(cam.ang), ez = R * Math.sin(cam.ang), cx = camera.position.x, cz = camera.position.z;
    const dx = ex - cx, dz = ez - cz, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((c.position.x - cx) * dx + (c.position.z - cz) * dz) / L2));
    c.visible = Math.hypot(c.position.x - (cx + dx * t), c.position.z - (cz + dz * t)) > 2.2;
  }
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
    sil.position.set((RW + 3.7) * Math.cos(sa), sy, (RW + 3.7) * Math.sin(sa)); sil.lookAt(0, sy, 0);
    silEyes.position.copy(sil.position).multiplyScalar(0.98); silEyes.position.y += 4.8;
    silEyes.color.set(ZONES[zoneOf(gk)].glow); silEyes.intensity = 1.2;
  } else { sil.visible = false; silEyes.intensity = 0; }
  if (gk !== Infinity){ ceil.visible = true; ceil.position.y = landingY(gk) + 7.5; }
  else ceil.visible = false;
}
export { R };
