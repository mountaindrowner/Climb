// A small cloth: a grid of particles integrated with Verlet, pinned along its top edge, held together by distance
// constraints (structural, shear and bend), pushed out of the body's capsules and kept behind the back. Simulated in
// world space so it trails the wearer's real motion (runs, jumps, falls, rolls). About sixty particles: cheap on phones.
const THREE = window.THREE;
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
const hsh = (i, s) => { const h = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return h - Math.floor(h); };

// cols x rows particles; top row pinned. width/length/flare in the wearer's model units (scaled at run time).
export function makeCloth({ cols = 7, rows = 9, width = 0.6, length = 1.2, flare = 1.35, color = [0.34, 0.16, 0.12] } = {}){
  const n = cols * rows, pos = new Float32Array(n * 3), prev = new Float32Array(n * 3);
  const cons = [];     // [a, b, rest in model units]
  const hem = [];      // per column: how much of the full length this column keeps (the ragged hem)
  for (let i = 0; i < cols; i++) hem.push(i === 0 || i === cols - 1 ? 0.8 + 0.12 * hsh(i, 2) : 0.72 + 0.28 * hsh(i, 1));
  const segV = i => length / (rows - 1) * hem[i];
  const wAt = j => width * (1 + (flare - 1) * j / (rows - 1)) / (cols - 1);
  const id = (i, j) => j * cols + i;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
    if (i < cols - 1) cons.push([id(i, j), id(i + 1, j), wAt(j)]);
    if (j < rows - 1) cons.push([id(i, j), id(i, j + 1), segV(i)]);
    if (i < cols - 1 && j < rows - 1){ const d = Math.hypot(wAt(j), segV(i)); cons.push([id(i, j), id(i + 1, j + 1), d], [id(i + 1, j), id(i, j + 1), d]); }
    if (j < rows - 2) cons.push([id(i, j), id(i, j + 2), segV(i) * 2]);          // bend: no folding flat on itself
  }
  // the mesh: two triangles per quad, flat shaded, both sides; grime baked into vertex colour, darkest at the hem
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const col = new Float32Array(n * 3);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
    const k = id(i, j), f = (0.62 + 0.38 * hsh(k, 3)) * (1 - 0.45 * j / (rows - 1));
    col.set([color[0] * f, color[1] * f, color[2] * f], k * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const idx = [];
  for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++){ const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1); idx.push(a, c, b, b, c, d); }
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 }));
  mesh.frustumCulled = false; mesh.matrixAutoUpdate = false;

  const C = { mesh, pos, prev, cols, rows, n, cons, pins: [], lastPins: null, acc: 0, live: false };
  const pinsPrev = [];
  // hang straight down from the pins, just behind the back
  C.reset = (pins, down, back, scale) => {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
      const k = id(i, j), p = pins[i], l = length * scale * j / (rows - 1) * hem[i];
      _a.copy(p).addScaledVector(down, l).addScaledVector(back, 0.05 * scale * j / (rows - 1));
      pos.set([_a.x, _a.y, _a.z], k * 3); prev.set([_a.x, _a.y, _a.z], k * 3);
    }
    pinsPrev.length = 0; pins.forEach(p => pinsPrev.push(p.clone())); C.live = true;
  };
  // one frame: pins (world), the body's capsules [{a, b, r}] (world), the back plane {point, normal} with normal
  // pointing forward, model-to-world scale, gravity (world units/s^2)
  C.step = (dt, pins, caps, plane, scale, gravity = 16) => {
    if (!C.live){ C.reset(pins, _c.set(0, -1, 0), _b.copy(plane.normal).negate(), scale); return; }
    let jump = 0; pins.forEach((p, i) => { jump = Math.max(jump, p.distanceTo(pinsPrev[i])); });
    if (jump > 1.2 * scale){ C.reset(pins, _c.set(0, -1, 0), _b.copy(plane.normal).negate(), scale); return; }   // a teleport
    C.acc = Math.min(C.acc + dt, 4 / 90); const h = 1 / 90, steps = Math.floor(C.acc / h); C.acc -= steps * h;
    for (let s = 1; s <= steps; s++){
      const t = s / steps;
      // integrate: inertia with air drag, gravity, a little turbulence
      for (let k = cols; k < n; k++){
        const x = k * 3, w = 0.35 * Math.sin(performance.now() * 0.0031 + k * 0.7);
        const vx = (pos[x] - prev[x]) * 0.975, vy = (pos[x + 1] - prev[x + 1]) * 0.975, vz = (pos[x + 2] - prev[x + 2]) * 0.975;
        prev[x] = pos[x]; prev[x + 1] = pos[x + 1]; prev[x + 2] = pos[x + 2];
        pos[x] += vx + w * h * h; pos[x + 1] += vy - gravity * h * h; pos[x + 2] += vz + w * h * h;
      }
      // pins: slide from last frame's place to this frame's, so fast moves don't snap the cloth
      for (let i = 0; i < cols; i++){ _a.copy(pinsPrev[i]).lerp(pins[i], t); pos.set([_a.x, _a.y, _a.z], i * 3); prev.set([_a.x, _a.y, _a.z], i * 3); }
      for (let it = 0; it < 4; it++){
        for (const [a, b, rest] of cons){
          const ax = a * 3, bx = b * 3, dx = pos[bx] - pos[ax], dy = pos[bx + 1] - pos[ax + 1], dz = pos[bx + 2] - pos[ax + 2];
          const d = Math.hypot(dx, dy, dz) || 1e-6, diff = (d - rest * scale) / d, pa = a < cols, pb = b < cols;
          if (pa && pb) continue;
          const ka = pa ? 0 : pb ? 1 : 0.5, kb = pb ? 0 : pa ? 1 : 0.5;
          pos[ax] += dx * diff * ka; pos[ax + 1] += dy * diff * ka; pos[ax + 2] += dz * diff * ka;
          pos[bx] -= dx * diff * kb; pos[bx + 1] -= dy * diff * kb; pos[bx + 2] -= dz * diff * kb;
        }
        collide(caps, plane);
      }
    }
    pinsPrev.forEach((p, i) => p.copy(pins[i]));
  };
  function collide(caps, plane){
    for (let k = cols; k < n; k++){
      const x = k * 3; _a.set(pos[x], pos[x + 1], pos[x + 2]);
      // never forward of the back
      const f = _b.copy(_a).sub(plane.point).dot(plane.normal);
      if (f > 0) _a.addScaledVector(plane.normal, -f);
      // out of the body's capsules
      for (const c of caps){
        _b.copy(c.b).sub(c.a); const L2 = _b.lengthSq() || 1e-6;
        const t = Math.max(0, Math.min(1, _c.copy(_a).sub(c.a).dot(_b) / L2));
        _c.copy(c.a).addScaledVector(_b, t);            // closest point on the bone
        const d = _a.distanceTo(_c);
        if (d < c.r){ if (d < 1e-5) _a.addScaledVector(plane.normal, -c.r); else _a.sub(_c).multiplyScalar(c.r / d).add(_c); }
      }
      pos[x] = _a.x; pos[x + 1] = _a.y; pos[x + 2] = _a.z;
    }
  }
  // hand the positions to the GPU; the mesh sits under a parent whose world matrix it cancels (it lives in world space)
  C.draw = parent => {
    mesh.matrix.copy(parent.matrixWorld).invert(); mesh.matrixWorldNeedsUpdate = true;
    geo.attributes.position.needsUpdate = true;
  };
  return C;
}
