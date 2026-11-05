// Craggy low-poly rocks: a displaced icosahedron with flat shading and per-face brightness jitter.
// Used for the Wardens and anything else that should read as broken stone. Deterministic per seed.
import { hash, rng } from '../core/math.js';
const THREE = window.THREE;

const geoCache = new Map();
// A rock of roughly w × h × d. `jag` is how far faces push in and out (0.15 is weathered, 0.45 is shattered).
export function rockGeometry({ seed = 1, w = 1, h = 1, d = 1, detail = 1, jag = 0.3 } = {}){
  const key = [seed, w, h, d, detail, jag].join(',');
  let g = geoCache.get(key); if (g) return g;
  g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position, n = pos.count, col = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++){
    v.fromBufferAttribute(pos, i);
    // the same original vertex (shared by neighbouring faces) must move the same way, so hash its quantised position
    const qx = Math.round(v.x * 500), qy = Math.round(v.y * 500), qz = Math.round(v.z * 500);
    const f = 1 - jag + 2 * jag * hash(qx * 31 + qy * 7 + seed, qz * 13 + seed * 3);
    v.multiplyScalar(f); v.x *= w / 2; v.y *= h / 2; v.z *= d / 2;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  // per-face brightness so the facets read even under flat light
  for (let i = 0; i < n; i += 3){
    const b = 0.78 + 0.32 * hash(i + seed * 17, seed);
    for (let k = 0; k < 3; k++){ col[(i + k) * 3] = b; col[(i + k) * 3 + 1] = b; col[(i + k) * 3 + 2] = b; }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  geoCache.set(key, g); return g;
}
export function rockMaterial(color, { rough = 0.95, metal = 0.02 } = {}){
  return new THREE.MeshStandardMaterial({ color, vertexColors: true, flatShading: true, roughness: rough, metalness: metal, emissive: 0x000000 });
}
// A rock mesh at (x, y, z), optionally tilted. `r` is a seeded generator for the tilt and shape.
export function rock(mat, opts, x, y, z, r){
  const seed = opts.seed != null ? opts.seed : Math.floor((r ? r() : Math.random()) * 1e6);
  const m = new THREE.Mesh(rockGeometry({ ...opts, seed }), mat);
  m.position.set(x || 0, y || 0, z || 0);
  if (r) m.rotation.set((r() - 0.5) * (opts.tilt == null ? 0.6 : opts.tilt), (r() - 0.5) * 1.2, (r() - 0.5) * (opts.tilt == null ? 0.6 : opts.tilt));
  return m;
}
// A tall crystal shard (glow material), pointing +y.
const shardGeo = new Map();
export function shard(mat, w, h, x, y, z){
  const key = w + ',' + h; let g = shardGeo.get(key);
  if (!g){ g = new THREE.OctahedronGeometry(1, 0); g.scale(w / 2, h / 2, w / 2); shardGeo.set(key, g); }
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); return m;
}
export { rng };
