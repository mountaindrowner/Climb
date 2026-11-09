// Little effects for the side view, all bright enough to bloom: dust at the feet, a ring of light (the double jump, the
// plunge's slam), the arc of a sword cut, sparks. Pooled quads, additive.
const THREE = window.THREE;
export function spawnFx(scene){
  const N = 260, parts = [];
  const geo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < N; i++){ const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); parts.push({ m, life: 0 }); }
  let k = 0;
  const take = () => { const p = parts[k]; k = (k + 1) % N; return p; };
  const emit = (x, y, vx, vy, size, color, life, grav = 0, grow = 0) => { const p = take(); Object.assign(p, { x, y, vx, vy, size, life, max: life, grav, grow }); p.m.material.color.setHex(color); p.m.visible = true; p.m.position.set(x, y, 0.2); p.m.scale.setScalar(size); p.m.rotation.z = 0; };
  const F = { parts };
  F.dust = (at, n, spd) => { for (let i = 0; i < n; i++){ const a = Math.PI * (0.1 + 0.8 * Math.random()); emit(at.x + (Math.random() - 0.5) * 0.4, at.y + 0.05, Math.cos(a) * spd * (Math.random() + 0.3) * (Math.random() < 0.5 ? -1 : 1), Math.sin(a) * spd * 0.4, 0.08 + Math.random() * 0.06, 0x8aa0c8, 0.35 + Math.random() * 0.3, -1.5); } };
  F.ring = (at, color) => { for (let i = 0; i < 18; i++){ const a = i / 18 * Math.PI * 2; emit(at.x, at.y + 0.1, Math.cos(a) * 3.2, Math.sin(a) * 1.2, 0.09, color, 0.35); } };
  F.burst = (at, n, color) => { for (let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 3; emit(at.x, at.y, Math.cos(a) * s, Math.sin(a) * s, 0.07, color, 0.3 + Math.random() * 0.2, 4); } };
  F.slash = (at, face, big) => {
    // an arc of bright motes sweeping round in front of him
    const n = big ? 16 : 11, r = big ? 1.15 : 0.95;
    for (let i = 0; i < n; i++){ const u = i / (n - 1), a = (1.15 - u * 2.2); emit(at.x + face * Math.cos(a) * r * 0.9 - face * 0.4, at.y + Math.sin(a) * r, face * 1.2, 0, (big ? 0.2 : 0.15) * (1 - Math.abs(u - 0.5)), big ? 0xffe3a0 : 0xbff4ff, 0.14 + u * 0.06, 0, -0.4); }
  };
  return F;
}
export function stepFx(F, dt){
  for (const p of F.parts){
    if (p.life <= 0){ if (p.m.visible) p.m.visible = false; continue; }
    p.life -= dt; p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.size = Math.max(0.01, p.size + p.grow * dt);
    p.m.position.set(p.x, p.y, 0.2); p.m.scale.setScalar(p.size); p.m.material.opacity = Math.max(0, p.life / p.max);
  }
}
