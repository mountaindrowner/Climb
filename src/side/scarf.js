// His scarf: a ribbon of cloth that trails from his neck, moved here as a chain of points (each keeps its distance from
// the one before, falls, drags, is carried by the wind and by his own movement). It is how long he has to live: every
// heart is a length of it. A blow burns the end off; a shrine, the flask, or embers taken from what he kills grow it
// back. When he dies it is the scarf that goes on, alone, back to the last shrine, and he gets up there under it.
const THREE = window.THREE;
const N = 30, SEG = 0.15;
// cols: its edge, body and shade (his is red; another's can be its own)
export function makeScarf(scene, cols = { edge: 0x181425, body: 0xe43b44, shade: 0xa22633, glow: 0xffa040 }){
  const pts = []; for (let i = 0; i < N; i++) pts.push({ x: 0, y: 0, px: 0, py: 0 });
  const strip = (color, z) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    const idx = []; for (let i = 0; i < N - 1; i++){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } geo.setIndex(idx);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); m.frustumCulled = false; m.position.z = z; scene.add(m); return m; };
  const edge = strip(cols.edge, 0.036), body = strip(cols.body, 0.038), shade = strip(cols.shade, 0.04);
  const tipGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: cols.glow || 0xffa040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); tipGlow.material.map = new THREE.CanvasTexture(c); }
  tipGlow.position.z = 0.05; scene.add(tipGlow);
  const S = { pts, len: N, set: false, t: 0 };
  // put it all at one place (a start, a wake)
  S.reset = (x, y) => { for (const p of pts){ p.x = p.px = x; p.y = p.py = y; } S.set = true; };
  // ax, ay: his neck. want: how many links long it should be. wind: the air's push. solid(x, y): rock there?
  // lift: under a glide it is held up and open over him
  S.step = (dt, ax, ay, face, want, wind, solid, lift = 0) => {
    if (!S.set || Math.hypot(pts[0].x - ax, pts[0].y - ay) > 4) S.reset(ax, ay);   // a start, or he was put somewhere else
    S.t += dt; S.len += (want - S.len) * Math.min(1, dt * 5);
    const n = Math.max(1, Math.round(dt / (1 / 120))), h = dt / n;
    for (let s = 0; s < n; s++){
      pts[0].x = ax; pts[0].y = ay;
      for (let i = 1; i < N; i++){
        const p = pts[i], vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985; p.px = p.x; p.py = p.y;
        const gust = Math.sin(S.t * 2.3 + i * 0.5) * 2.2 + Math.sin(S.t * 5.1 + i * 0.9) * 1.1;
        p.x += vx + (wind + gust * (0.4 + Math.abs(wind) * 0.3) - face * 3.2) * h * h; p.y += vy + (-7.5 + lift + Math.sin(S.t * 3.7 + i * 0.7) * 2.5) * h * h;
      }
      for (let k = 0; k < 3; k++) for (let i = 1; i < N; i++){
        const a = pts[i - 1], p = pts[i], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy) || 1e-4, f = (d - SEG) / d;
        if (i === 1){ p.x -= dx * f; p.y -= dy * f; } else { p.x -= dx * f * 0.5; p.y -= dy * f * 0.5; a.x += dx * f * 0.5; a.y += dy * f * 0.5; }
      }
      if (solid) for (let i = 2; i < N; i++){ const p = pts[i]; if (solid(p.x, p.y)){ p.x = p.px; p.y = p.py; } }
    }
  };
  // draw what there is of it: a ribbon about each link, three pixels wide at his neck, one at its end
  S.draw = (visible, glow = 0) => {
    const live = Math.max(2, Math.min(N, S.len)), last = Math.min(N - 1, Math.ceil(live) - 1);
    for (const [mesh, grow, shift] of [[edge, 0.07, 0], [body, 0, 0], [shade, -0.045, -0.04]]){
      const pos = mesh.geometry.attributes.position.array; mesh.visible = visible;
      for (let i = 0; i < N; i++){
        const j = Math.min(i, last), p = pts[j], q = pts[Math.min(N - 1, j + 1)], o = pts[Math.max(0, j - 1)];
        let dx = q.x - o.x, dy = q.y - o.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
        const t = j / Math.max(1, last), w = Math.max(0.015, (0.105 - 0.06 * t) + grow) * (i > last ? 0 : 1), nx = -dy, ny = dx;
        pos[i * 6] = p.x + nx * w + nx * shift; pos[i * 6 + 1] = p.y + ny * w + ny * shift; pos[i * 6 + 2] = 0;
        pos[i * 6 + 3] = p.x - nx * w + nx * shift; pos[i * 6 + 4] = p.y - ny * w + ny * shift; pos[i * 6 + 5] = 0;
      }
      mesh.geometry.attributes.position.needsUpdate = true;
    }
    const tip = pts[last]; tipGlow.visible = visible && glow > 0.02; tipGlow.position.x = tip.x; tipGlow.position.y = tip.y; tipGlow.material.opacity = glow * (0.5 + 0.2 * Math.sin(S.t * 8));
  };
  S.tip = () => pts[Math.min(N - 1, Math.max(1, Math.ceil(S.len) - 1))];
  S.at = i => pts[Math.max(0, Math.min(N - 1, i))];
  return S;
}
export const SCARF = { base: 4, perHeart: 2.6, more: 1.5 };   // `more`: for each heart over the first five   // links: a stub at his neck, and so many for each heart
