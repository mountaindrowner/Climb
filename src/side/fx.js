// Little effects for the side view, all bright enough to bloom: dust at the feet, a ring of light (the double jump, the
// plunge's slam), the arc of a sword cut, sparks. Pooled quads, additive.
const THREE = window.THREE;
export function spawnFx(scene){
  const N = 260, parts = [];
  const geo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < N; i++){ const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); parts.push({ m, life: 0 }); }
  let k = 0;
  const take = () => { const p = parts[k]; k = (k + 1) % N; return p; };
  const emit = (x, y, vx, vy, size, color, life, grav = 0, grow = 0, sx = 0) => { const p = take(); Object.assign(p, { x, y, vx, vy, size, life, max: life, grav, grow, sx }); p.m.material.color.setHex(color); p.m.visible = true; p.m.position.set(x, y, 0.2); p.m.scale.set(sx || size, size, 1); p.m.rotation.z = 0; };
  // pixel dust: solid square pixels in the palette's stone greys (not glowing), kicked along the ground, falling back
  const DN = 220, dust = [], DUST = [0xc0cbdc, 0x8b9bb4, 0x8b9bb4, 0x5a6988];
  for (let i = 0; i < DN; i++){ const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff })); m.visible = false; scene.add(m); dust.push({ m, life: 0 }); }
  let dk = 0;
  const grit = (x, y, vx, vy, px, life) => { const p = dust[dk]; dk = (dk + 1) % DN; Object.assign(p, { x, y, vx, vy, life, max: life, px, floor: y }); p.m.material.color.setHex(DUST[Math.floor(Math.random() * DUST.length)]); p.m.visible = true; p.m.scale.set(px / 16, px / 16, 1); };
  // the crescent of a cut: a band of light drawn in pixels, flashed in front of him
  const cres = (() => { const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d');
    for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++){ const dx = x - 14, dy = y - 24, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx), band = 22 - Math.abs(a) * 7;
      if (dx > -4 && Math.abs(a) < 1.35 && r > 22 - band * 0.5 && r < 23){ g.fillStyle = r > 21 ? '#ffffff' : r > 18 ? '#c0f4ff' : '#2ce8f5'; g.fillRect(x, y, 1, 1); } }
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; return t; })();
  const arcs = []; for (let i = 0; i < 4; i++){ const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: cres, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); arcs.push({ m, life: 0 }); }
  let ak = 0;
  const F = { parts, grits: dust, arcs };
  // dust kicked one way (dir) along the floor at his feet; dust thrown both ways (a landing)
  F.kick = (at, dir, n, spd = 2.4) => { for (let i = 0; i < n; i++) grit(at.x + (Math.random() - 0.5) * 0.3, at.y + 0.03, dir * spd * (0.3 + Math.random()) + (Math.random() - 0.5) * 0.5, 0.6 + Math.random() * 1.8, Math.random() < 0.3 ? 2 : 1, 0.25 + Math.random() * 0.3); };
  F.puff = (at, n, spd = 2.6) => { F.kick(at, -1, n >> 1, spd); F.kick(at, 1, n - (n >> 1), spd); };
  // the swoosh of a cut: big for a finisher, gold
  F.crescent = (at, face, big, tilt = 0) => { const p = arcs[ak]; ak = (ak + 1) % arcs.length; const sz = big ? 2.9 : 2.3;
    Object.assign(p, { x: at.x, y: at.y, life: big ? 0.16 : 0.12, max: big ? 0.16 : 0.12, sz, face }); p.m.visible = true; p.m.material.color.setHex(big ? 0xd8c080 : 0xb8c8d8);   // additive: kept below white so he shows through
    p.m.position.set(at.x, at.y, 0.3); p.m.scale.set(sz * face, sz, 1); p.m.rotation.z = tilt * face; };
  // speed: thin streaks of light left behind a dash
  F.streak = (at, dir) => { for (let i = 0; i < 3; i++) emit(at.x - dir * Math.random() * 0.6, at.y + 0.3 + Math.random() * 1.8, -dir * (2 + Math.random() * 2), 0, 1 / 16, 0xbff4ff, 0.16 + Math.random() * 0.1, 0, 0, 0.6 + Math.random() * 0.9); };
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
    p.m.position.set(p.x, p.y, 0.2); p.m.scale.set(p.sx ? p.sx * (p.life / p.max) : p.size, p.size, 1); p.m.material.opacity = Math.max(0, p.life / p.max);
  }
  // grit: falls back to the floor it was kicked from and stops; on the pixel grid
  for (const p of F.grits){
    if (p.life <= 0){ if (p.m.visible) p.m.visible = false; continue; }
    p.life -= dt; p.vy -= 9 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y < p.floor){ p.y = p.floor; p.vy = 0; p.vx *= 0.6; }
    p.m.position.set(Math.round(p.x * 16) / 16, Math.round(p.y * 16) / 16, 0.15); if (p.life < p.max * 0.35) p.m.scale.setScalar(1 / 16);
  }
  for (const p of F.arcs){
    if (p.life <= 0){ if (p.m.visible) p.m.visible = false; continue; }
    p.life -= dt; const u = 1 - p.life / p.max; p.m.material.opacity = u < 0.3 ? 1 : 1 - (u - 0.3) / 0.7; p.m.scale.set(p.sz * (1 + u * 0.15) * p.face, p.sz * (1 + u * 0.15), 1);
  }
}
