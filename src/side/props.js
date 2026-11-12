// What stands in the world and changes: star-glass ledges that keep time, blooms that throw him, rising air, and cracked
// rock that breaks. The painted layers leave these out (render.js, paintAt); they are drawn here, small meshes over them.
//   makeProps(scene, R) -> { step(dt, t, P), bounce(mark), breakAt(x, y, r) -> [{ id, x, y }], breakId(id), cracks }
import { T, LEVEL, CRACKED, GLASS_A, GLASS_B, EMPTY, rawAt, glassOn, PHASE } from './level.js';
import { PPU, PAL, lit, themeNow } from './render.js';
const THREE = window.THREE;
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const texOf = c => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const rng = seed => { let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// a plank of star-glass, n tiles long: pale, bright along its top, a star set in it here and there
function glassTex(n, warm){
  const w = n * 8, c = cnv(w, 6), g = c.getContext('2d'), hi = warm ? PAL.fire3 : PAL.white, mid = warm ? PAL.fire2 : PAL.cyan, low = warm ? PAL.fire1 : PAL.blue;
  px(g, hi, 1, 0, w - 2, 1); px(g, mid, 0, 1, w, 2); px(g, low, 1, 3, w - 2, 1);
  for (let x = 0; x < w; x++){ if (B4[(x & 3) * 4 + 1] < 6) px(g, low, x, 2); if (x % 8 === 4) px(g, hi, x, 1, 1, 2); if (B4[(x & 3) * 4 + 2] < 5) px(g, mid, x, 4); if (x % 16 === 9) px(g, low, x, 5); }
  return texOf(c);
}
// a bloom: broad leaves, a wide flower open to the sky, its heart bright
function bloomTex(){
  const c = cnv(28, 16), g = c.getContext('2d');
  for (let x = 0; x < 28; x++){ const d = Math.abs(x - 13.5), h = Math.round(3 - d * 0.16); if (d > 13) continue; px(g, PAL.ink, x, 16 - h - 1, 1, h + 1); px(g, d > 8 ? PAL.moss0 : PAL.moss1, x, 16 - h, 1, h); if (x % 5 === 2) px(g, PAL.moss2, x, 16 - h); }
  for (let y = 0; y < 9; y++) for (let x = 0; x < 24; x++){   // the cup of petals
    const cx = x - 11.5, top = 4 + (cx * cx) / 26, bot = 12.2 - Math.abs(cx) * 0.05; if (y + 2 < top || y + 2 > bot || Math.abs(cx) > 11.6) continue;
    const edge = y + 2 - top < 1 || Math.abs(cx) > 10.6 || y + 2 > bot - 1;
    px(g, edge ? PAL.ink : Math.abs(cx) > 7 ? PAL.pink : (Math.round(cx) % 4 === 0 ? PAL.pink : PAL.rose), x + 2, y + 2); }
  px(g, PAL.ink, 10, 4, 8, 4); px(g, PAL.fire2, 11, 5, 6, 3); px(g, PAL.fire3, 12, 5, 4, 1); px(g, PAL.white, 13, 5, 1, 1);
  return texOf(c);
}
// cracked rock, w x h tiles: the region's own stone, split
function crackTex(w, h, seed){
  const c = cnv(w * 8, h * 8), g = c.getContext('2d'), r = rng(seed), S = themeNow().stone, col = k => PAL[S[k]] || PAL.mid;
  px(g, col('a'), 0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++){ const row = Math.floor(y / 6); if (y % 6 === 0 || (x + row * 5) % 11 === 0) px(g, col('aSeam'), x, y); else if (B4[(y & 3) * 4 + (x & 3)] < 3) px(g, col('b'), x, y); }
  px(g, col('lip2'), 1, 1, c.width - 2, 1);
  for (let k = 0; k < Math.max(2, Math.round(w * h / 5)); k++){   // the cracks: from an edge inward, forking
    let x = Math.floor(r() * c.width), y = r() < 0.5 ? 0 : c.height - 1, dy = y ? -1 : 1;
    for (let n = 0; n < c.height * 0.8; n++){ px(g, PAL.ink, x, y); if (r() < 0.5) x += r() < 0.5 ? -1 : 1; else y += dy; if (r() < 0.12) px(g, PAL.ink, x + (r() < 0.5 ? -1 : 1), y, 2, 1); if (y < 0 || y >= c.height) break; } }
  g.strokeStyle = PAL.ink; g.lineWidth = 1; g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
  return texOf(c);
}

export function makeProps(scene, R){
  const W = LEVEL.W, H = LEVEL.H, glass = [], blooms = [], drafts = [], cracks = [], rnd = rng(99), warm = LEVEL.theme === 'gardens';
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, ...o });
  // ---- star-glass: each run along a row is one plank
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){
    const k = rawAt(i, j); if ((k !== GLASS_A && k !== GLASS_B) || rawAt(i - 1, j) === k) continue;
    let e = i; while (rawAt(e + 1, j) === k) e++;
    const n = e - i + 1, m = new THREE.Mesh(new THREE.PlaneGeometry(n * T, 6 / PPU), basic(glassTex(n, warm)));
    m.position.set((i + n / 2) * T, (j + 1) * T - 3 / PPU, 0.02); scene.add(m);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(n * T + 0.6, 0.9), basic(null, { color: warm ? 0xffc060 : 0x60d8ff, blending: THREE.AdditiveBlending, opacity: 0.16 })); gl.position.set(m.position.x, m.position.y - 0.05, 0.015); scene.add(gl);
    glass.push({ k, m, gl, x: m.position.x, y: m.position.y, was: null });
  }
  // ---- blooms
  const bt = bloomTex();
  for (const mk of LEVEL.marks) if (mk.type === 'bloom'){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(28 / PPU, 16 / PPU), basic(bt, { alphaTest: 0.5 })); m.geometry.translate(0, 8 / PPU, 0);
    m.position.set((mk.x + 0.5) * T, mk.y * T, 0.03); scene.add(m); blooms.push({ mk, m, t: 9 });
  }
  // ---- rising air: pale streaks going up through it
  for (const u of LEVEL.updrafts){
    const n = Math.max(8, Math.round((u.x1 - u.x0) * (u.y1 - u.y0) * 0.9));
    for (let k = 0; k < n; k++){ const len = 3 + Math.floor(rnd() * 7), m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, len / PPU), basic(null, { color: rnd() < 0.3 ? 0xffffff : 0xa8d8ff, blending: THREE.AdditiveBlending, opacity: 0.5 }));
      m.position.set(u.x0 + rnd() * (u.x1 - u.x0), u.y0 + rnd() * (u.y1 - u.y0), 0.6); scene.add(m); drafts.push({ m, u, v: 5 + rnd() * 6, ph: rnd() * 9, x: m.position.x }); }
  }
  // ---- cracked rock: each patch of it is one block
  const seen = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){
    if (rawAt(i, j) !== CRACKED || seen[j * W + i]) continue;
    const tiles = [], st = [[i, j]]; seen[j * W + i] = 1; let x0 = i, x1 = i, y0 = j, y1 = j;
    while (st.length){ const [a, b] = st.pop(); tiles.push([a, b]); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
      for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const na = a + da, nb = b + db; if (na >= 0 && nb >= 0 && na < W && nb < H && !seen[nb * W + na] && rawAt(na, nb) === CRACKED){ seen[nb * W + na] = 1; st.push([na, nb]); } } }
    const w = x1 - x0 + 1, h = y1 - y0 + 1, m = new THREE.Mesh(new THREE.PlaneGeometry(w * T, h * T), lit({ map: crackTex(w, h, i * 131 + j * 17 + 5), transparent: false }));
    m.position.set((x0 + w / 2) * T, (y0 + h / 2) * T, 0.01); scene.add(m);
    cracks.push({ id: `${i},${j}`, tiles, m, x: m.position.x, y: m.position.y, w: w * T, h: h * T, gone: false });
  }
  const shatter = (C, quiet) => { if (C.gone) return; C.gone = true; for (const [a, b] of C.tiles) LEVEL.tiles[b * W + a] = EMPTY; scene.remove(C.m); C.m.geometry.dispose(); C.m.material.map.dispose(); C.m.material.dispose(); };
  return {
    cracks, glass, blooms,
    step(dt, t){
      const left = PHASE.period - (PHASE.t % PHASE.period);   // until the beat turns
      for (const G of glass){ const on = glassOn(G.k), going = on && left < 0.5 && !PHASE.all;
        G.m.material.opacity = on ? (going && Math.floor(t * 16) % 2 ? 0.45 : 1) : 0.13; G.gl.material.opacity = on ? 0.16 + Math.sin(t * 3 + G.x) * 0.04 : 0.02; G.turned = G.was !== null && G.was !== on; G.was = on; }
      for (const B of blooms){ B.t += dt; const u = Math.min(1, B.t / 0.5), k = u < 0.18 ? 1 - u / 0.18 * 0.55 : 0.45 + 0.55 * (1 - Math.cos((u - 0.18) / 0.82 * Math.PI * 2.5) * Math.exp(-(u - 0.18) * 5)) ; B.m.scale.set(1 + (1 - Math.min(1, k)) * 0.35, Math.max(0.4, k) + Math.sin(t * 1.7 + B.mk.x) * 0.02, 1); }
      for (const D of drafts){ const m = D.m; m.position.y += D.v * dt; m.position.x = D.x + Math.sin(t * 2 + D.ph) * 0.12; if (m.position.y > D.u.y1){ m.position.y = D.u.y0; D.x = D.u.x0 + rnd() * (D.u.x1 - D.u.x0); }
        const f = Math.min(1, (m.position.y - D.u.y0) / 1.2, (D.u.y1 - m.position.y) / 1.5); m.material.opacity = 0.5 * Math.max(0, f); }
    },
    bounce(mk){ const B = blooms.find(b => b.mk === mk); if (B) B.t = 0; },
    // everything cracked within r of (x, y) breaks; returns what broke
    breakAt(x, y, r){ const out = []; for (const C of cracks){ if (C.gone) continue; const dx = Math.max(Math.abs(x - C.x) - C.w / 2, 0), dy = Math.max(Math.abs(y - C.y) - C.h / 2, 0); if (Math.hypot(dx, dy) <= r){ shatter(C); out.push(C); } } return out; },
    nearCrack(x, y, r){ return cracks.find(C => !C.gone && Math.hypot(Math.max(Math.abs(x - C.x) - C.w / 2, 0), Math.max(Math.abs(y - C.y) - C.h / 2, 0)) <= r) || null; },
    breakId(id){ const C = cracks.find(c => c.id === id); if (C) shatter(C, true); },
  };
}
