// The side view, drawn flat: a stylized 2D pixel world on one palette (assets/side/palette.json, Endesga 32).
// Everything renders into a small target, 180 pixels tall at 16 pixels to a world unit, scaled up to the screen whole and
// unsmoothed, so the warrior, the creatures, the rock and the background share one big pixel. Depth is parallax only.
//
// The level is painted once, at load, by hand-made rules, not textures, in the palette's colours:
//   play   the rock as a base shape (the tile map with its corners cut and its edges worn: no boxes), a band of big
//          chunky stones at the edge with a lit lip on what faces up and moss on it, then dithered steps into a dark
//          silhouette, so solid ground always reads as solid. On it, decoration fitted to where it sits: stalactites,
//          vines, roots, chains, banners and lanterns from ceilings; crystals, mushrooms, bones and rubble on floors.
//          Sparse where he walks, thick where he cannot go. Ledges are planks, spikes are teeth.
//   back   the cave wall behind, darker and slower, big blocks, opening onto the far cavern, with ruined pillars and
//          arches and things hanging.
//   far    the painted cavern, held to the palette, nearly still.
// Torches, crystals, lanterns and the shrine glow; bloom makes bright things shine.
import { T, ROCK, LEDGE, SPIKES, EMPTY, LEVEL, tileAt } from './level.js';
const THREE = window.THREE;
export const PPU = 16;                  // pixels to a world unit: a tile is 8, the warrior ~28 tall
export const VIEW_H = 11.25;            // world units the screen is tall: 180 pixels
const TH = Math.round(VIEW_H * PPU), CELL = T * PPU;
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];   // ordered dither
// the palette, by what each colour is for here
export const PAL = { ink: '#181425', deep: '#262b44', dark: '#3a4466', mid: '#5a6988', light: '#8b9bb4', pale: '#c0cbdc', white: '#ffffff',
  teal: '#193c3e', moss0: '#265c42', moss1: '#3e8948', moss2: '#63c74d', navy: '#124e89', blue: '#0099db', cyan: '#2ce8f5',
  wood0: '#3e2731', wood1: '#733e39', wood2: '#b86f50', wood3: '#e4a672', bone: '#ead4aa', fire0: '#be4a2f', fire1: '#f77622', fire2: '#feae34', fire3: '#fee761',
  red0: '#a22633', red1: '#e43b44', plum: '#68386c', pink: '#b55088', rose: '#f6757a', skin: '#e8b796', tan: '#c28569', rust: '#d77643' };
const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PALETTE = ['#be4a2f', '#d77643', '#ead4aa', '#e4a672', '#b86f50', '#733e39', '#3e2731', '#a22633', '#e43b44', '#f77622', '#feae34', '#fee761', '#63c74d', '#3e8948', '#265c42', '#193c3e', '#124e89', '#0099db', '#2ce8f5', '#ffffff', '#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466', '#262b44', '#181425', '#ff0044', '#68386c', '#b55088', '#f6757a', '#e8b796', '#c28569'].map(rgb);
function nearest(r, g, b){ let best = 0, bd = 1e9; for (let k = 0; k < PALETTE.length; k++){ const p = PALETTE[k], d = (p[0] - r) ** 2 * 3 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 2; if (d < bd){ bd = d; best = k; } } return PALETTE[best]; }

function rng(seed){ let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function canvasTex(c){ const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
function glowTex(color){
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
const loadImg = url => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
function noise2(seed){
  const r = rng(seed), N = 256, v = new Float32Array(N * N); for (let k = 0; k < v.length; k++) v[k] = r();
  const g = (i, j) => v[((j & (N - 1)) * N) + (i & (N - 1))];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, w = y - j, a = u * u * (3 - 2 * u), b = w * w * (3 - 2 * w);
    return (g(i, j) * (1 - a) + g(i + 1, j) * a) * (1 - b) + (g(i, j + 1) * (1 - a) + g(i + 1, j + 1) * a) * b; };
}
// an image held to the palette (the far painting)
function onPalette(img, dim = 1){
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data, cache = new Map();
  for (let i = 0; i < p.length; i += 4){ const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2]; let q = cache.get(key); if (!q){ q = nearest(p[i] * dim, p[i + 1] * dim, p[i + 2] * dim); cache.set(key, q); } p[i] = q[0]; p[i + 1] = q[1]; p[i + 2] = q[2]; }
  g.putImageData(d, 0, 0); return c;
}
// a canvas onto the scene as planes no bigger than 1024 pixels, its top-left at (x, y)
function canvasPlanes(scene, c, x, y, z, lit){
  const group = new THREE.Group(), S = 1024;
  for (let oy = 0; oy < c.height; oy += S) for (let ox = 0; ox < c.width; ox += S){
    const w = Math.min(S, c.width - ox), h = Math.min(S, c.height - oy), part = document.createElement('canvas'); part.width = w; part.height = h;
    part.getContext('2d').drawImage(c, ox, oy, w, h, 0, 0, w, h);
    const mat = lit ? new THREE.MeshLambertMaterial({ map: canvasTex(part), transparent: true, alphaTest: 0.5 }) : new THREE.MeshBasicMaterial({ map: canvasTex(part), transparent: true, alphaTest: 0.5 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w / PPU, h / PPU), mat);
    m.position.set((ox + w / 2) / PPU, -(oy + h / 2) / PPU, 0); group.add(m);
  }
  group.position.set(x, y, z); scene.add(group); return group;
}

// ---- the decoration, drawn small and bold in the palette. (x, y) is where it is fixed: the top of what hangs, the foot
// of what stands. Each returns nothing; some leave a glow to add (lanterns, crystals)
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const DECO = {
  stalactite(g, x, y, r){ const w = 3 + Math.floor(r() * 4), L = 4 + Math.floor(r() * 8);
    for (let k = 0; k < L; k++){ const half = Math.max(0, Math.round((1 - k / L) * w / 2)); px(g, PAL.ink, x - half - 1, y + k, half * 2 + 3); px(g, k < 2 ? PAL.light : PAL.mid, x - half, y + k, half * 2 + 1); if (half > 0) px(g, PAL.dark, x + half, y + k); } },
  vine(g, x, y, r){ const L = 6 + Math.floor(r() * 16); let cx = x;
    for (let k = 0; k < L; k++){ cx += (r() < 0.3 ? (r() < 0.5 ? -1 : 1) : 0); px(g, PAL.moss0, cx, y + k); if (k % 3 === 1) px(g, PAL.moss2, cx + (k % 6 === 1 ? 1 : -1), y + k); }
    px(g, PAL.moss2, cx, y + L); },
  root(g, x, y, r){ const branch = (bx, by, L, dir) => { let cx = bx; for (let k = 0; k < L; k++){ if (r() < 0.35) cx += dir; px(g, k < L / 2 ? PAL.wood1 : PAL.wood0, cx, by + k); if (k === Math.floor(L / 3) && L > 5) branch(cx, by + k, Math.floor(L / 2), -dir); } };
    branch(x, y, 6 + Math.floor(r() * 9), r() < 0.5 ? -1 : 1); },
  chain(g, x, y, r){ const L = 8 + Math.floor(r() * 16); for (let k = 0; k < L; k++){ px(g, k % 2 ? PAL.mid : PAL.light, x, y + k); if (k % 2) px(g, PAL.ink, x + 1, y + k); }
    px(g, PAL.dark, x - 1, y + L, 3, 2); },
  banner(g, x, y, r){ const w = 7, L = 12 + Math.floor(r() * 6); px(g, PAL.wood1, x - 1, y, w + 2, 1);
    for (let k = 1; k < L; k++){ const rag = k > L - 3 ? (k + x) % 3 : 0; px(g, PAL.ink, x - 1 + rag, y + k, w + 2 - rag * 2); px(g, k % 5 === 2 ? PAL.fire2 : PAL.red0, x + rag, y + k, w - rag * 2); px(g, PAL.red1, x + rag, y + k); } },
  lantern(g, x, y, r, glow){ px(g, PAL.mid, x, y, 1, 3); px(g, PAL.ink, x - 2, y + 3, 5, 6); px(g, PAL.wood1, x - 2, y + 3, 5, 1); px(g, PAL.fire2, x - 1, y + 4, 3, 4); px(g, PAL.fire3, x, y + 5, 1, 2); px(g, PAL.wood1, x - 2, y + 8, 5, 1); glow && glow(x, y + 6, 'lamp'); },
  crystal(g, x, y, r, glow){ const n = 1 + Math.floor(r() * 3);
    for (let s = 0; s < n; s++){ const h = 4 + Math.floor(r() * 6), cx = x + (s - (n - 1) / 2) * 3, lean = s - (n - 1) / 2;
      for (let k = 0; k < h; k++){ const half = k > h - 3 ? 0 : 1; const xx = cx + Math.round(lean * k / h); px(g, PAL.ink, xx - half - 1, y - k, half * 2 + 3); px(g, k > h - 3 ? PAL.white : PAL.blue, xx - half, y - k, half * 2 + 1); px(g, PAL.cyan, xx - half, y - k); } }
    glow && glow(x, y - 3, 'crystal'); },
  mushroom(g, x, y, r){ const n = 1 + Math.floor(r() * 3), hot = r() < 0.5;
    for (let s = 0; s < n; s++){ const h = 2 + Math.floor(r() * 3), cx = x + s * 4 - n * 2, w = 2 + Math.floor(r() * 2);
      px(g, PAL.bone, cx, y - h, 1, h); px(g, PAL.ink, cx - w - 1, y - h - 2, w * 2 + 3, 3); px(g, hot ? PAL.pink : PAL.navy, cx - w, y - h - 2, w * 2 + 1, 2); px(g, hot ? PAL.rose : PAL.cyan, cx - w + 1, y - h - 2, w, 1); } },
  bones(g, x, y, r){ px(g, PAL.ink, x - 4, y - 3, 9, 3); px(g, PAL.bone, x - 3, y - 2, 7, 1); px(g, PAL.bone, x - 4, y - 3, 1, 1); px(g, PAL.bone, x + 4, y - 3, 1, 1);
    if (r() < 0.6){ px(g, PAL.ink, x + 1, y - 6, 5, 5); px(g, PAL.bone, x + 2, y - 5, 3, 3); px(g, PAL.ink, x + 2, y - 4, 1, 1); px(g, PAL.ink, x + 4, y - 4, 1, 1); } },
  rubble(g, x, y, r){ const n = 2 + Math.floor(r() * 3);
    for (let s = 0; s < n; s++){ const w = 2 + Math.floor(r() * 3), h = 1 + Math.floor(r() * 2), cx = x + Math.floor((r() - 0.5) * 8); px(g, PAL.ink, cx - 1, y - h - 1, w + 2, h + 1); px(g, PAL.mid, cx, y - h, w, h); px(g, PAL.light, cx, y - h, w, 1); } },
  stalagmite(g, x, y, r){ const w = 3 + Math.floor(r() * 3), L = 3 + Math.floor(r() * 5);
    for (let k = 0; k < L; k++){ const half = Math.max(0, Math.round((1 - k / L) * w / 2)); px(g, PAL.ink, x - half - 1, y - k - 1, half * 2 + 3); px(g, PAL.mid, x - half, y - k - 1, half * 2 + 1); px(g, PAL.light, x - half, y - k - 1); } },
  torch(g, x, y){ px(g, PAL.ink, x - 1, y - 7, 3, 8); px(g, PAL.wood1, x, y - 6, 1, 6); px(g, PAL.mid, x - 1, y - 7, 3, 1); },
  // the back wall's ruins: a pillar, an arch
  pillar(g, x, y, r, _, k = 1){ const h = 24 + Math.floor(r() * 24), w = 7, broken = r() < 0.6;
    for (let yy = 0; yy < h; yy++){ const top = broken && yy > h - 4 ? (yy + x) % 3 : 0; px(g, PAL.ink, x - 1 + top, y - yy, w + 2 - top); px(g, PAL.dark, x + top, y - yy, w - top * 2 - 1); px(g, PAL.mid, x + top, y - yy); if (yy % 8 === 0) px(g, PAL.ink, x, y - yy, w - 1); }
    px(g, PAL.ink, x - 2, y - 2, w + 4, 3); px(g, PAL.dark, x - 1, y - 2, w + 2, 1); },
  arch(g, x, y, r){ const w = 22, h = 26;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++){
      const cx = xx - w / 2 + 0.5, inner = yy < h - 8 ? Math.abs(cx) < w / 2 - 4 : Math.hypot(cx, (yy - (h - 8)) * 1.1) < w / 2 - 4, outer = yy < h - 8 ? true : Math.hypot(cx, (yy - (h - 8)) * 1.1) < w / 2;
      if (!outer || inner) continue; const edge = (yy < h - 8 && (Math.abs(cx) > w / 2 - 1 || Math.abs(cx) < w / 2 - 3)) || (yy >= h - 8 && Math.hypot(cx, (yy - (h - 8)) * 1.1) > w / 2 - 1);
      px(g, edge ? PAL.ink : (xx + yy) % 7 === 0 ? PAL.ink : PAL.dark, x - w / 2 + xx, y - yy); }
    if (r() < 0.6) for (let k = 0; k < 6; k++) px(g, PAL.ink, x + w / 2 - 3 - k, y - h + k, 3 + k, 1); },
};

// ---- the play layer
function paintPlay(glows){
  const Wc = LEVEL.W, Hc = LEVEL.H, pw = Wc * CELL, ph = Hc * CELL, rock = (i, j) => tileAt(i, j) === ROCK ? 1 : 0;
  const n1 = noise2(11), n2 = noise2(23);
  const crisp = new Uint8Array(Wc * Hc);   // edges that stay true: the top of anything he stands on, and the air over it
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++){ const t = tileAt(i, j), up = tileAt(i, j + 1), dn = tileAt(i, j - 1); if ((t === ROCK && up !== ROCK) || (t !== ROCK && dn === ROCK)) crisp[j * Wc + i] = 1; }
  // the shape: cell corners cut (bilinear between centres), edges worn by noise except where he stands
  const mask = new Uint8Array(pw * ph);
  for (let py = 0; py < ph; py++){
    const wy = (ph - py - 0.5) / CELL - 0.5, j0 = Math.floor(wy), ty = wy - j0, cj = Math.floor((ph - py - 0.5) / CELL);
    for (let x = 0; x < pw; x++){
      const wx = (x + 0.5) / CELL - 0.5, i0 = Math.floor(wx), tx = wx - i0;
      const a = rock(i0, j0), b = rock(i0 + 1, j0), c = rock(i0, j0 + 1), d = rock(i0 + 1, j0 + 1), s = a + b + c + d;
      let v = s === 4 ? 1 : s === 0 ? 0 : (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
      if (s % 4 && !crisp[cj * Wc + Math.floor((x + 0.5) / CELL)]) v += (n1(x / 5, py / 5) - 0.5) * 0.55;
      mask[py * pw + x] = v >= 0.5 ? 1 : 0;
    }
  }
  const dist = new Uint16Array(pw * ph);
  for (let k = 0; k < dist.length; k++) dist[k] = mask[k] ? 999 : 0;
  for (let py = 0; py < ph; py++) for (let x = 0; x < pw; x++){ const k = py * pw + x; if (!dist[k]) continue; let m = dist[k];
    if (x > 0) m = Math.min(m, dist[k - 1] + 1); if (py > 0){ m = Math.min(m, dist[k - pw] + 1); if (x > 0) m = Math.min(m, dist[k - pw - 1] + 1); if (x < pw - 1) m = Math.min(m, dist[k - pw + 1] + 1); } dist[k] = m; }
  for (let py = ph - 1; py >= 0; py--) for (let x = pw - 1; x >= 0; x--){ const k = py * pw + x; if (!dist[k]) continue; let m = dist[k];
    if (x < pw - 1) m = Math.min(m, dist[k + 1] + 1); if (py < ph - 1){ m = Math.min(m, dist[k + pw] + 1); if (x < pw - 1) m = Math.min(m, dist[k + pw + 1] + 1); if (x > 0) m = Math.min(m, dist[k + pw - 1] + 1); } dist[k] = m; }
  // big chunky stones in the edge band: rows of blocks of uneven length, a seam between
  const cnv = document.createElement('canvas'); cnv.width = pw; cnv.height = ph; const g = cnv.getContext('2d');
  const out = g.createImageData(pw, ph), o = out.data, C = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, rgb(v)]));
  const seam = (x, y) => { const row = Math.floor(y / 6); if (y % 6 === 0) return true; const off = (row * 37) % 11, bx = x + off; const len = 8 + ((Math.floor(bx / 9) * 7 + row * 3) % 5); return bx % len === 0; };
  for (let py = 0; py < ph; py++) for (let x = 0; x < pw; x++){
    const k = py * pw + x, d = dist[k]; if (!d) continue;
    const top = (py > 0 && !mask[k - pw]) || (py > 1 && !mask[k - pw * 2]);
    const dd = d + (B4[(py & 3) * 4 + (x & 3)] / 16 - 0.5) * 3;
    let c;
    if (d === 1) c = C.ink;
    else if (top && d === 2) c = C.pale;
    else if (top && d <= 4) c = C.light;
    else if (dd < 6) c = seam(x, py) ? C.dark : C.mid;
    else if (dd < 9) c = seam(x, py) ? C.deep : C.dark;
    else if (dd < 12) c = C.deep;
    else c = C.ink;
    o[k * 4] = c[0]; o[k * 4 + 1] = c[1]; o[k * 4 + 2] = c[2]; o[k * 4 + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const r = rng(99), Y = j => (Hc - j) * CELL;
  // moss on the lips: clumps, and a drip now and then down the face
  for (let py = 1; py < ph - 6; py++) for (let x = 2; x < pw - 6; x++){
    const k = py * pw + x; if (!mask[k] || mask[k - pw] || n2(x / 6, py / 6) < 0.58 || r() > 0.3) continue;
    const w = 2 + Math.floor(r() * 3); px(g, PAL.moss1, x, py, w, 1); px(g, PAL.moss2, x + Math.floor(w / 2), py - 1, 1, 1);
    if (r() < 0.2) px(g, PAL.moss0, x + 1, py + 1, 1, 1 + Math.floor(r() * 3));
  }
  // ledges: planks
  for (let j = 0; j < Hc; j++){
    let i = 0;
    while (i < Wc){
      if (tileAt(i, j) !== LEDGE){ i++; continue; }
      let e = i; while (tileAt(e + 1, j) === LEDGE) e++;
      const x0 = i * CELL, x1 = (e + 1) * CELL, y0 = Y(j + 1);
      px(g, PAL.ink, x0 - 1, y0 - 1, x1 - x0 + 2, 5); px(g, PAL.wood1, x0, y0, x1 - x0, 3); px(g, PAL.wood3, x0, y0, x1 - x0, 1); px(g, PAL.wood0, x0, y0 + 2, x1 - x0, 1);
      for (let x = x0 + 4 + Math.floor(r() * 4); x < x1 - 2; x += 6 + Math.floor(r() * 5)) px(g, PAL.wood0, x, y0 + 1, 1, 1);
      for (const [x, dir] of [[x0, -1], [x1 - 1, 1]]){
        if (tileAt(dir < 0 ? i - 1 : e + 1, j) === ROCK) for (let k = 0; k < 4; k++) px(g, PAL.wood0, x - dir * k, y0 + 3 + k);
        else if (r() < 0.5) px(g, PAL.wood2, x - dir, y0 + 3, 1, 3 + Math.floor(r() * 5));
      }
      i = e + 1;
    }
  }
  // spikes
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (tileAt(i, j) === SPIKES){
    const x0 = i * CELL, yb = Y(j);
    for (let s = 0; s < 2; s++){ const cx = x0 + 2 + s * 4, h = 5 + s;
      for (let y = 0; y < h; y++){ const half = Math.round((h - y) / h * 1.5); px(g, PAL.ink, cx - half - 1, yb - y - 1, half * 2 + 3); px(g, y > h - 2 ? PAL.white : PAL.pale, cx - half, yb - y - 1, half * 2 + 1); } }
  }
  // decoration, by where it sits
  const isRock = (i, j) => tileAt(i, j) === ROCK, isAir = (i, j) => tileAt(i, j) === EMPTY;
  const airBelow = (i, j) => { let n = 0; while (n < 20 && isAir(i, j - n)) n++; return n; };
  const walkedNear = (i, j) => { for (let d = 1; d <= 6; d++) if (isAir(i, j - d) && (isRock(i, j - d - 1) || tileAt(i, j - d - 1) === LEDGE)) return true; return false; };
  const marksNear = (i, j, rr) => LEVEL.marks.some(m => Math.abs(m.x - i) <= rr && Math.abs(m.y - j) <= rr);
  for (let j = 1; j < Hc - 1; j++){
    let skip = 0;
    for (let i = 1; i < Wc - 1; i++){
      if (skip > 0){ skip--; continue; }
      if (!(isAir(i, j) && isRock(i, j + 1) && isRock(i - 1, j + 1) && isRock(i + 1, j + 1) && isAir(i - 1, j) && isAir(i + 1, j))) continue;
      const room = airBelow(i, j), busy = walkedNear(i, j) || room < 9, x = i * CELL + 4, y = Y(j + 1) - 1;
      if (r() > (busy ? 0.3 : 0.6)) continue;
      const p = r();
      if (busy || room < 7) DECO[p < 0.7 ? 'stalactite' : 'vine'](g, x, y, r, glows);
      else DECO[p < 0.28 ? 'vine' : p < 0.5 ? 'root' : p < 0.62 ? 'chain' : p < 0.7 && !marksNear(i, j, 3) ? 'banner' : p < 0.78 ? 'lantern' : 'stalactite'](g, x, y, r, glows);
      skip = 1 + Math.floor(r() * 4);
    }
  }
  for (let j = 1; j < Hc - 1; j++){
    let skip = 0;
    for (let i = 1; i < Wc - 1; i++){
      if (skip > 0){ skip--; continue; }
      if (!(isAir(i, j) && isRock(i, j - 1) && isRock(i - 1, j - 1) && isRock(i + 1, j - 1) && isAir(i, j + 1)) || marksNear(i, j, 2)) continue;
      const nearWall = isRock(i - 2, j) || isRock(i + 2, j) || isRock(i - 1, j + 1) || isRock(i + 1, j + 1);
      if (r() > (nearWall ? 0.55 : 0.18)) continue;
      const set = nearWall ? ['rubble', 'stalagmite', 'crystal', 'bones', 'mushroom'] : ['mushroom', 'rubble', 'crystal', 'bones'];
      DECO[set[Math.floor(r() * set.length)]](g, i * CELL + 4, Y(j), r, glows);
      skip = 2 + Math.floor(r() * 5);
    }
  }
  return cnv;
}

// ---- the back wall, in its own space: what is behind world point w is drawn at FB * w
const FB = 0.86, MARGIN_X = 15, MARGIN_Y = 7;
function paintBack(){
  const Lw = LEVEL.W * T, Lh = LEVEL.H * T, bw = Math.ceil((FB * Lw + MARGIN_X * 2) * PPU), bh = Math.ceil((FB * Lh + MARGIN_Y * 2) * PPU);
  const Wc = LEVEL.W, Hc = LEVEL.H;
  const open = new Float32Array(Wc * Hc).fill(99);   // tiles to the nearest rock
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (tileAt(i, j) === ROCK) open[j * Wc + i] = 0;
  for (let pass = 0; pass < 2; pass++) for (let s = 0; s < Wc * Hc; s++){
    const k = pass ? Wc * Hc - 1 - s : s, i = k % Wc, j = (k - i) / Wc, sg = pass ? 1 : -1;
    for (const [a, b] of [[sg, 0], [0, sg], [sg, sg], [-sg, sg]]){ const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < Wc && jj < Hc) open[k] = Math.min(open[k], open[jj * Wc + ii] + (a && b ? 1.41 : 1)); }
  }
  const openAt = (wx, wy) => { const i = Math.floor(wx / T), j = Math.floor(wy / T); if (i < 0 || j < 0 || i >= Wc || j >= Hc) return 0; return open[j * Wc + i]; };
  const n1 = noise2(51), n2 = noise2(77), n3 = noise2(91);
  const cnv = document.createElement('canvas'); cnv.width = bw; cnv.height = bh; const g = cnv.getContext('2d');
  const out = g.createImageData(bw, bh), o = out.data, hole = new Uint8Array(bw * bh), deep = rgb(PAL.deep), dark = rgb(PAL.dark), ink = rgb(PAL.ink);
  for (let py = 0; py < bh; py++) for (let x = 0; x < bw; x++){
    const wx = (x / PPU - MARGIN_X) / FB, wy = ((bh - py) / PPU - MARGIN_Y) / FB;
    const v = openAt(wx, wy) + (n1(x / 20, py / 20) - 0.5) * 5 + (n2(x / 5, py / 5) - 0.5) * 1.2;
    if (v > 4.6){ hole[py * bw + x] = 1; continue; }
    // cracked cave stone: the contour lines of a noise field are the cracks between stones
    const cn = n3(x / 15, py / 11), isSeam = Math.abs(cn - 0.5) < 0.022;
    const tone = n1(x / 70 + 9, py / 70) + (B4[(py & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.12;   // broad patches, dithered
    const c = v > 4.0 ? (B4[(py & 3) * 4 + (x & 3)] < 8 ? dark : deep) : isSeam ? ink : tone > 0.62 ? dark : tone < 0.3 ? ink : deep;
    const q = (py * bw + x) * 4; o[q] = c[0]; o[q + 1] = c[1]; o[q + 2] = c[2]; o[q + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const r = rng(321);
  for (let py = 6; py < bh - 6; py += 2) for (let x = 0; x < bw; x += 2){
    const k = py * bw + x;
    if (hole[k] && !hole[k + bw * 2] && r() < 0.02) DECO[r() < 0.6 ? 'pillar' : 'arch'](g, x, py + 2, r);
    if (hole[k] && !hole[k - bw * 2] && r() < 0.02){ const p = r(); g.globalAlpha = 1; DECO[p < 0.4 ? 'root' : p < 0.75 ? 'chain' : 'stalactite'](g, x, py - 1, r); }
  }
  // the back is behind: everything on it pushed toward the dark
  const d2 = g.getImageData(0, 0, bw, bh), p2 = d2.data, cache = new Map();
  for (let i = 0; i < p2.length; i += 4){ if (!p2[i + 3]) continue; const key = (p2[i] << 16) | (p2[i + 1] << 8) | p2[i + 2]; let q = cache.get(key); if (!q){ q = nearest(p2[i] * 0.7, p2[i + 1] * 0.72, p2[i + 2] * 0.85); cache.set(key, q); } p2[i] = q[0]; p2[i + 1] = q[1]; p2[i + 2] = q[2]; }
  g.putImageData(d2, 0, 0);
  return { cnv, bw, bh };
}

export function makeRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.autoClear = false;
  canvas.style.imageRendering = 'pixelated';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(PAL.ink);
  const camera = new THREE.OrthographicCamera(-10, 10, VIEW_H / 2, -VIEW_H / 2, -200, 200); camera.position.z = 100;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa6d0, 0.95));
  const heroLight = new THREE.PointLight(0xffd2a0, 0.6, 7, 2); scene.add(heroLight);
  const W = LEVEL.W * T, Hh = LEVEL.H * T, rnd = rng(7);
  const torchGlow = glowTex('rgba(255,170,60,1)'), crystalGlow = glowTex('rgba(80,240,255,1)');
  // ---- the far cavern: held to the palette, a pixel a pixel, nearly still
  const FF = 0.04, far = new THREE.Mesh(new THREE.PlaneGeometry(400 / PPU, 224 / PPU), new THREE.MeshBasicMaterial({ color: 0xffffff })); far.position.z = -60; scene.add(far);
  loadImg('assets/side/bg/far.png').then(img => { if (img){ far.material.map = canvasTex(onPalette(img, 0.85)); far.material.needsUpdate = true; } });
  const layers = [{ obj: far, f: FF, ax: W / 2, ay: Hh / 2 }];   // drawn at anchor + (camera - anchor) * (1 - f)
  const exits = [], lights = [], flames = [];
  // ---- the painted layers
  const glowAt = (x, y, kind) => {   // canvas pixels of the play layer to a glow in the world
    const wx = x / PPU, wy = (LEVEL.H * CELL - y) / PPU, warm = kind === 'lamp';
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(warm ? 1.4 : 1.2, warm ? 1.4 : 1.2), new THREE.MeshBasicMaterial({ map: warm ? torchGlow : crystalGlow, transparent: true, depthWrite: false, color: warm ? 0xffb060 : 0x60e8ff, blending: THREE.AdditiveBlending, opacity: warm ? 0.7 : 0.4 }));
    gl.position.set(wx, wy, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: !warm });
    if (rnd() < 0.5) lights.push({ x: wx, y: wy, color: warm ? 0xff9a40 : 0x40e0ff, power: warm ? 1.0 : 0.7, range: 5, ph: rnd() * 9 });
  };
  const ready = (async () => {
    const back = paintBack(), backGroup = canvasPlanes(scene, back.cnv, 0, 0, -30, false);
    layers.push({ obj: backGroup, back: true, h: back.bh / PPU });
    const play = paintPlay(glowAt), g = play.getContext('2d'), Y = j => (LEVEL.H - j) * CELL, rr = rng(5);
    for (const m of LEVEL.marks){
      const x = (m.x + 0.5) * T, y = m.y * T, cx = Math.round(x * PPU);
      if (m.type === 'torch'){
        DECO.torch(g, cx, Y(m.y) - 2);
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffb060, blending: THREE.AdditiveBlending, opacity: 0.85 }));
        fl.position.set(x, y + 0.65, 1); scene.add(fl); flames.push({ m: fl, ph: rnd() * 9 });
        const core = new THREE.Mesh(new THREE.PlaneGeometry(3 / PPU, 4 / PPU), new THREE.MeshBasicMaterial({ color: 0xfee761 })); core.position.set(x, y + 0.62, 0.9); scene.add(core); flames.push({ m: core, ph: rnd() * 9 });
        lights.push({ x, y: y + 0.8, color: 0xff9a40, power: 1.5, range: 7, ph: rnd() * 9 });
      }
      if (m.type === 'crystal') DECO.crystal(g, cx, Y(m.y), rr, glowAt);
      if (m.type === 'shrine'){
        const b = Y(m.y);
        px(g, PAL.ink, cx - 8, b - 6, 17, 6); px(g, PAL.dark, cx - 7, b - 5, 15, 5); px(g, PAL.light, cx - 7, b - 5, 15, 1);
        for (let k = 0; k < 12; k++){ const half = Math.round(Math.sin(Math.PI * k / 12) * 3); px(g, PAL.ink, cx - half - 1, b - 6 - k, half * 2 + 3); px(g, k > 7 ? PAL.fire3 : PAL.fire2, cx - half, b - 6 - k, half * 2 + 1); }
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffd27a, blending: THREE.AdditiveBlending, opacity: 0.6 }));
        gl.position.set(x, y + 0.7, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: true });
        lights.push({ x, y: y + 1, color: 0xffc860, power: 1.8, range: 7, ph: rnd() * 9 });
      }
    }
    canvasPlanes(scene, play, 0, Hh, 0, true);
  })();
  // the way on: shut until the Warden falls
  for (const m of LEVEL.marks) if (m.type === 'exit'){
    const x = (m.x + 0.5) * T, y = m.y * T;
    const c = document.createElement('canvas'); c.width = 24; c.height = 32; const gg = c.getContext('2d');
    gg.fillStyle = PAL.ink; gg.fillRect(2, 4, 20, 28); gg.fillStyle = PAL.fire3; gg.fillRect(4, 6, 16, 26); gg.fillStyle = PAL.white; gg.fillRect(7, 9, 10, 23);
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(24 / PPU, 32 / PPU), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true }));
    arch.position.set(x, y + 1, 0.02); scene.add(arch);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffe0a0, blending: THREE.AdditiveBlending, opacity: 0.7 })); gl.position.set(x, y + 1, 1); scene.add(gl);
    const light = { x, y: y + 1, color: 0xffe0a0, power: 2.4, range: 9, ph: 0, off: true }; lights.push(light);
    arch.visible = gl.visible = false; exits.push({ x, y, set(on){ arch.visible = gl.visible = on; light.off = !on; } });
  }
  // ---- the air: motes, a pixel each, drifting
  const motes = [];
  for (let k = 0; k < 70; k++){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, 1 / PPU), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: rnd() < 0.3 ? 0xffd8a0 : 0x9fe8ff }));
    m.position.set(rnd() * W, rnd() * Hh, 2); scene.add(m); motes.push({ m, vx: (rnd() - 0.5) * 0.2, vy: 0.05 + rnd() * 0.15, ph: rnd() * 9 });
  }
  // ---- soft shafts of light under openings in a roof, dithered
  const sc = document.createElement('canvas'); sc.width = 16; sc.height = 64;
  { const gg = sc.getContext('2d'); gg.fillStyle = 'rgba(170,230,255,0.55)'; for (let y = 0; y < 64; y++) for (let x = 0; x < 16; x++){ const a = (1 - y / 64) * (1 - Math.abs(x - 7.5) / 8) * 0.7; if (B4[(y & 3) * 4 + (x & 3)] / 16 < a) gg.fillRect(x, y, 1, 1); } }
  const shaftTex = canvasTex(sc);
  for (let i = 1; i < LEVEL.W - 1; i++) for (let j = 2; j < LEVEL.H - 1; j++){
    if (tileAt(i, j) !== 0 || tileAt(i, j + 1) !== 0 || tileAt(i - 1, j + 1) === 0 || i % 3) continue;
    let up = 0; while (up < 8 && tileAt(i, j + up) === 0) up++;
    if (up < 8 || tileAt(i, j - 1) !== 0) continue;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }));
    sh.position.set((i + 0.5) * T, (j + 1) * T - 3.5, -1); sh.rotation.z = 0.18; scene.add(sh);
  }
  const pool = []; for (let k = 0; k < 6; k++){ const L = new THREE.PointLight(0xffffff, 0, 7, 2); scene.add(L); pool.push(L); }

  // ---- the frame: the scene into the small target, glow added, then up to the screen whole
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  let main = rt(4, 4), b1 = rt(2, 2), b2 = rt(2, 2), size = { w: 4, h: TH };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); const qScene = new THREE.Scene(); qScene.add(quad); const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  const bright = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, th: { value: 0.7 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float th; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(th, 1.0, l), 1.); }' });
  const blur = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb * 0.227; for (int i = 1; i < 5; i++){ float w = i == 1 ? 0.195 : i == 2 ? 0.122 : i == 3 ? 0.054 : 0.016; c += (texture2D(tex, vUv + dir * float(i)).rgb + texture2D(tex, vUv - dir * float(i)).rgb) * w; } gl_FragColor = vec4(c, 1.); }' });
  const comp = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, glow: { value: null }, amt: { value: 1.1 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform sampler2D glow; uniform float amt; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb + texture2D(glow, vUv).rgb * amt; c = c / (1.0 + 0.1 * c); gl_FragColor = vec4(c, 1.); }' });
  main.texture.minFilter = main.texture.magFilter = THREE.NearestFilter;
  function pass(mat, target){ quad.material = mat; renderer.setRenderTarget(target); renderer.clear(); renderer.render(qScene, qCam); }
  function resize(){
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight;
    const w = Math.round(TH * cw / ch / 2) * 2;
    if (w === size.w && cw === size.cw && ch === size.ch) return;
    size = { w, h: TH, cw, ch }; renderer.setSize(cw, ch, false);
    main.setSize(w, TH); b1.setSize(w >> 1, TH >> 1); b2.setSize(w >> 1, TH >> 1);
    const hw = w / 2 / PPU; camera.left = -hw; camera.right = hw; camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  const cam = { x: 0, y: 0 }, snap = v => Math.round(v * PPU) / PPU;
  return {
    scene, camera, exits, ready, size: () => size,
    // where something at parallax f (1 moves with the world, 0 with the camera), anchored at (ax, ay), is drawn now
    parallax: (f, ax, ay) => ({ x: snap(ax + (cam.x - ax) * (1 - f)), y: snap(ay + (cam.y - ay) * (1 - f)) }),
    setCamera(x, y){
      cam.x = snap(x); cam.y = snap(y); camera.position.set(cam.x, cam.y, 100);
      for (const L of layers){
        // the back canvas: back-space point b sits at b + camera * (1 - FB), so what is behind w shows behind w
        if (L.back){ L.obj.position.set(snap(cam.x * (1 - FB) - MARGIN_X), snap(cam.y * (1 - FB) - MARGIN_Y + L.h), L.obj.position.z); continue; }
        L.obj.position.set(snap(L.ax + (cam.x - L.ax) * (1 - L.f)), snap(L.ay + (cam.y - L.ay) * (1 - L.f)), L.obj.position.z);
      }
    },
    frame(t, hero){
      resize();
      for (const o of motes){ o.m.position.x += (o.vx + Math.sin(t * 0.7 + o.ph) * 0.05) * 0.016; o.m.position.y += o.vy * 0.016; if (o.m.position.y > cam.y + 7) o.m.position.y = cam.y - 7; if (Math.abs(o.m.position.x - cam.x) > 12) o.m.position.x = cam.x + (rnd() - 0.5) * 22; o.m.material.opacity = 0.5 + 0.5 * Math.sin(t * 2 + o.ph); }
      for (const f of flames){ const k = f.slow ? 0.06 : 0.12; f.m.scale.setScalar(1 + Math.sin(t * (f.slow ? 2 : 13) + f.ph) * k + (f.slow ? 0 : Math.sin(t * 7.3 + f.ph) * 0.06)); }
      const near = lights.filter(l => !l.off).map(l => ({ l, d: Math.hypot(l.x - cam.x, l.y - cam.y) })).sort((a, b) => a.d - b.d);
      pool.forEach((L, k) => { const n = near[k]; if (!n || n.d > 16){ L.intensity = 0; return; } L.position.set(n.l.x, n.l.y, 1.2); L.color.setHex(n.l.color); L.distance = n.l.range; L.intensity = n.l.power * (1 + Math.sin(t * 11 + n.l.ph) * 0.06); });
      if (hero) heroLight.position.set(hero.x, hero.y + 1.4, 1.6);
      renderer.setRenderTarget(main); renderer.clear(); renderer.render(scene, camera);
      bright.uniforms.tex.value = main.texture; pass(bright, b1);
      blur.uniforms.tex.value = b1.texture; blur.uniforms.dir.value.set(1 / b1.width, 0); pass(blur, b2);
      blur.uniforms.tex.value = b2.texture; blur.uniforms.dir.value.set(0, 1 / b1.height); pass(blur, b1);
            comp.uniforms.tex.value = main.texture; comp.uniforms.glow.value = b1.texture; pass(comp, null);
    },
  };
}

// ---- a sprite: frames from a strip (tools/pixellab.py), on a lit plane, feet on its position, mirrored to face left,
// placed on the pixel grid. A strip says its own pixels to a unit (32 now; the first art was drawn at 64)
function strip(url, frames){
  const t = new THREE.TextureLoader().load(url, tx => { tx.needsUpdate = true; });
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.repeat.set(1 / frames, 1);
  return t;
}
export function makeSprite(scene, base, meta){
  const g = new THREE.Group(); scene.add(g);
  const mat = new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x000000 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); g.add(plane);
  const tex = {}; for (const a in meta.anims) tex[a] = strip(`${base}/${a}.png`, meta.anims[a].frames);
  const ppu = meta.ppu || 64, S = { g, plane, mat, anim: null };
  S.show = (anim, frac, x, y, face, z = 0.05, rot = 0) => {
    const A = meta.anims[anim] || meta.anims.stand; if (!A) return;
    if (S.anim !== anim){ mat.map = tex[anim] || tex.stand; mat.needsUpdate = true; S.anim = anim; }
    const n = A.frames, i = Math.min(n - 1, Math.floor(((frac % 1) + 1) % 1 * n));
    mat.map.offset.set(i / n, 0);
    const w = A.w / ppu, h = A.h / ppu;
    plane.scale.set(w * (face < 0 ? -1 : 1), h, 1);
    // its feet (the painted bottom) on y, its middle on x; turned (a somersault) about its middle, not its feet
    const PIV = 0.85, ox = (A.w / 2 - A.cx) / ppu * (face < 0 ? -1 : 1), oy = A.foot / ppu - h / 2 - 0.02 - PIV, c = Math.cos(rot), s = Math.sin(rot);
    plane.position.set(ox * c - oy * s, ox * s + oy * c, 0); plane.rotation.z = rot;
    g.position.set(Math.round(x * PPU) / PPU, Math.round((y + PIV) * PPU) / PPU, z);
  };
  return S;
}
