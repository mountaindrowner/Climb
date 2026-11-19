// His scarf: a ribbon of cloth that trails from his neck, moved here as a chain of points (each keeps its distance from
// the one before, falls, drags, is carried by the wind and by his own movement). It is how long he has to live: every
// heart is a length of it. A blow burns the end off; a shrine, the flask, or embers taken from what he kills grow it
// back. When he dies it is the scarf that goes on, alone, back to the last shrine, and he gets up there under it.
const THREE = window.THREE;
const N = 30, SEG = 0.15;
// cols: its edge, body and shade (his is red; another's can be its own)
// the knots' looks, by relic: a colour, and a shape (five by five: k ink, c its colour, h a glint, . the cloth showing)
const SHAPES = {
  round: ['.kkk.', 'kchck', 'kccck', 'kccck', '.kkk.'], ring: ['.kkk.', 'kchck', 'kc.ck', 'kccck', '.kkk.'],
  diamond: ['..k..', '.khk.', 'kccck', '.kck.', '..k..'], square: ['kkkkk', 'khcck', 'kccck', 'kccck', 'kkkkk'],
  star: ['k.k.k', '.khk.', 'kccck', '.kck.', 'k.k.k'], bar: ['.kkk.', '.khk.', '.kck.', '.kck.', '.kkk.'],
};
export const KNOT_LOOK = {
  whetstone: { col: '#c0cbdc', shape: 'square' }, lodestone: { col: '#0099db', shape: 'round' }, featherfall: { col: '#ead4aa', shape: 'ring' },
  stormglass: { col: '#2ce8f5', shape: 'diamond' }, seedheart: { col: '#63c74d', shape: 'round' }, tally: { col: '#d77643', shape: 'bar' },
  stylus: { col: '#f6757a', shape: 'diamond' }, blankleaf: { col: '#ead4aa', shape: 'diamond' }, felt: { col: '#8b9bb4', shape: 'round' }, turnstone: { col: '#c0cbdc', shape: 'round' }, flint: { col: '#feae34', shape: 'diamond' }, boots: { col: '#b86f50', shape: 'round' }, stillair: { col: '#ffffff', shape: 'ring' }, starcompass: { col: '#fee761', shape: 'star' }, _: { col: '#fee761', shape: 'round' },
};

export function makeScarf(scene0, cols = { edge: 0x181425, body: 0xe43b44, shade: 0xa22633, glow: 0xffa040 }){
  const scene = new THREE.Group(); scene0.add(scene);   // all its pieces in one group (S.g): kept whole when he walks from one region into the next
  const pts = []; for (let i = 0; i < N; i++) pts.push({ x: 0, y: 0, px: 0, py: 0 });
  const strip = (color, z) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    const idx = []; for (let i = 0; i < N - 1; i++){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } geo.setIndex(idx);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); m.frustumCulled = false; m.position.z = z; scene.add(m); return m; };
  const edge = strip(cols.edge, 0.036), body = strip(cols.body, 0.038), shade = strip(cols.shade, 0.04);
  const tipGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: cols.glow || 0xffa040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); tipGlow.material.map = new THREE.CanvasTexture(c); }
  tipGlow.position.z = 0.05; scene.add(tipGlow);
  // the knots: each relic he wears is tied into the cloth, a small gold knot along it, near his neck (state.js, KNOTS).
  // Drawn over the cloth and under him: with the see-through things, after the cloth, before him (a hair nearer than the
  // cloth and further than him, and not depth-tested, since the low picture's depth cannot tell a hair's difference)
  // each relic's knot has its own colour and shape (KNOT_LOOK): a five-pixel picture, inked round, so each can be told
  // from the others on the cloth. `m` is that picture; `o` (the old plain knot's outline) is kept but no longer shown
  const knotTex = {}, knotMap = id => { if (knotTex[id]) return knotTex[id]; const L = KNOT_LOOK[id] || KNOT_LOOK._, c = document.createElement('canvas'); c.width = c.height = 5; const g = c.getContext('2d');
    SHAPES[L.shape].forEach((row, y) => { for (let x = 0; x < 5; x++){ const ch = row[x]; if (ch === '.') continue; g.fillStyle = ch === 'k' ? '#181425' : ch === 'h' ? '#ffffff' : L.col; g.fillRect(x, y, 1, 1); } });
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return knotTex[id] = t; };
  const KN = []; for (let k = 0; k < 6; k++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(5 / 16, 5 / 16), new THREE.MeshBasicMaterial({ color: 0xfee761, transparent: true, depthTest: false, depthWrite: false })); const o = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.27), new THREE.MeshBasicMaterial({ color: cols.edge, transparent: true, depthTest: false, depthWrite: false }));
    m.position.z = 0.047; o.position.z = 0.046; m.visible = o.visible = false; scene.add(o); scene.add(m); KN.push([m, o]); }
  const S = { pts, len: N, set: false, t: 0, g: scene };
  S.shift = (dx, dy) => { for (const p of pts){ p.x += dx; p.px += dx; p.y += dy; p.py += dy; } };   // the world's numbers changed under him (main.js cross): it hangs as it hung
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
      for (let k = 0; k < 3; k++){
        for (let i = 1; i < N; i++){
          const a = pts[i - 1], p = pts[i], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy) || 1e-4, f = (d - SEG) / d;
          if (i === 1){ p.x -= dx * f; p.y -= dy * f; } else { p.x -= dx * f * 0.5; p.y -= dy * f * 0.5; a.x += dx * f * 0.5; a.y += dy * f * 0.5; }
        }
        // the rock: a point in it is pushed out the shortest way and slides along the face (it used to be put back where it
        // was, which held it there, caught, while he went on). Where the cloth is drawn much tighter than its length (it is
        // caught round a corner behind him) it is let go, and slips through
        if (solid){ let run = 0;
          for (let i = 2; i < N; i++){ const a = pts[i - 1], p = pts[i]; run += Math.hypot(p.x - a.x, p.y - a.y);
            if (Math.hypot(p.x - ax, p.y - ay) > i * SEG * 1.02 && run > i * SEG * 1.35) break;   // caught: the rest goes free
            if (solid(p.x, p.y)) pushOut(p, solid); } }
      }
    }
  };
  // out of the rock by the shortest way: tried in eight directions, a little further each time; it keeps what it was
  // doing along the face, and loses what went into it
  function pushOut(p, solid){
    for (let r = 0.04; r <= 0.5; r += 0.04) for (let k = 0; k < 8; k++){
      const a = k * Math.PI / 4, nx = Math.cos(a), ny = Math.sin(a), x = p.x + nx * r, y = p.y + ny * r;
      if (solid(x, y)) continue;
      const vx = p.x - p.px, vy = p.y - p.py, into = vx * nx + vy * ny;   // the motion into the face is lost, the motion along it kept (a little dragged)
      p.x = x; p.y = y; p.px = x - (vx - Math.min(0, into) * nx) * 0.8; p.py = y - (vy - Math.min(0, into) * ny) * 0.8; return;
    }
  }
  // draw what there is of it: a ribbon about each link, three pixels wide at his neck, one at its end
  S.draw = (visible, glow = 0, knots = 0) => {
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
    const ids = Array.isArray(knots) ? knots : Array.from({ length: knots }, () => '_');   // the relics tied (their ids), or a count
    KN.forEach(([m, o], k) => { const at = 4 + k * 3, on = visible && k < ids.length && at < last; m.visible = on; o.visible = false;
      if (on){ const p = pts[at], map = knotMap(ids[k]); if (m.material.map !== map){ m.material.map = map; m.material.color.setHex(0xffffff); m.material.needsUpdate = true; } m.position.x = p.x; m.position.y = p.y; } });
    const tip = pts[last]; tipGlow.visible = visible && glow > 0.02; tipGlow.position.x = tip.x; tipGlow.position.y = tip.y; tipGlow.material.opacity = glow * (0.5 + 0.2 * Math.sin(S.t * 8));
  };
  S.tip = () => pts[Math.min(N - 1, Math.max(1, Math.ceil(S.len) - 1))];
  S.at = i => pts[Math.max(0, Math.min(N - 1, i))];
  return S;
}
export const SCARF = { base: 4, perHeart: 2.6, more: 1.5 };   // `more`: for each heart over the first five   // links: a stub at his neck, and so many for each heart
