// Parts for creatures: flat-shaded materials, tapered limb segments, membranes and glow bits.
// A creature is a tree of groups (joints) so its entity module can animate it.
const THREE = window.THREE;

export function flatMat(color, { rough = 0.8, metal = 0.05, emissive = 0x000000, opacity = 1 } = {}){
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: rough, metalness: metal, emissive, transparent: opacity < 1, opacity });
}
export const glowMat = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });

const cache = new Map();
function cached(key, make){ let g = cache.get(key); if (!g){ g = make(); cache.set(key, g); } return g; }
// A tapered segment of length `len` hanging from its joint along +y (rotate the joint to aim it).
export function segment(mat, len, r0, r1, sides = 5){
  const g = cached(`seg${len},${r0},${r1},${sides}`, () => { const c = new THREE.CylinderGeometry(r1, r0, len, sides, 1); c.translate(0, len / 2, 0); return c; });
  return new THREE.Mesh(g, mat);
}
// A pointed shard of length `len` along +y from its base.
export function spike(mat, len, r, sides = 4){
  const g = cached(`spk${len},${r},${sides}`, () => { const c = new THREE.ConeGeometry(r, len, sides, 1); c.translate(0, len / 2, 0); return c; });
  return new THREE.Mesh(g, mat);
}
// A faceted blob (low-poly sphere), squashed to w × h × d.
export function blob(mat, w, h, d, detail = 1){
  const g = cached(`blob${detail}`, () => new THREE.IcosahedronGeometry(0.5, detail));
  const m = new THREE.Mesh(g, mat); m.scale.set(w, h, d); return m;
}
// A wing membrane: a fan of triangles from the shoulder (origin) out along +z, spanning `span`, `chord` deep.
export function membrane(mat, span, chord){
  return new THREE.Mesh(cached(`mem${span},${chord}`, () => {
    const g = new THREE.BufferGeometry();
    const v = [0, 0, 0,  chord * 0.2, 0, span * 0.5,  -chord * 0.35, 0, span * 0.45,
               chord * 0.2, 0, span * 0.5,  chord * 0.05, 0, span,  -chord * 0.35, 0, span * 0.45,
               0, 0, 0,  -chord * 0.35, 0, span * 0.45,  -chord * 0.6, 0, span * 0.15];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  }), mat);
}
export function joint(parent, x, y, z){ const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); parent.add(g); return g; }
// A glowing outline: the same shape, a little larger, drawn back-faces only, so a dark creature lifts off dark stone.
export function outline(mesh, mat, k = 1.14){
  const o = new THREE.Mesh(mesh.geometry, mat); o.scale.setScalar(k); o.renderOrder = -1; mesh.add(o); return o;
}
export const outlineMat = (color, opacity = 0.5) => new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, transparent: true, opacity, depthWrite: false });
