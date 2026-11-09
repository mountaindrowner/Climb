// The side view, drawn flat: a 2D pixel-art world. Everything renders into a small target, 360 pixels tall at 32 pixels
// to a world unit, and that is scaled up to the screen whole, unsmoothed, so the warrior, the creatures, the rock and the
// background all share one pixel. Depth comes from parallax only: layers that slide past slower, never perspective.
//
// The level is painted once, at load, into pixel canvases:
//   play   the rock as a base shape (the tile map, its corners cut and its edges worn so there are no boxes), filled
//          with big stone and brick, an outline, a lit lip on what faces up and dithered dark going in; then the
//          decoration on it, fitted to where it sits: roots, vines, chains and stalactites from ceilings, crystals,
//          mushrooms, bones and rubble on floors, cobwebs in corners. Sparse where he walks, thick where he cannot go.
//          Ledges (planks) and spikes are painted here too.
//   back   the cave wall behind the play, darker and slower, opening onto the far cavern in the big spaces, with ruins
//          (pillars, arches, a statue) and roots and chains of its own.
//   far    the painted cavern (PixelLab), furthest back and nearly still.
// Torches, crystals and the shrine add glow on top; bloom makes bright things shine.
import { T, ROCK, LEDGE, SPIKES, EMPTY, LEVEL, tileAt } from './level.js';
const THREE = window.THREE;
export const PPU = 32;                  // pixels to a world unit: a tile is 16, the warrior ~56 tall
export const VIEW_H = 11.25;            // world units the screen is tall: 360 pixels
const TH = Math.round(VIEW_H * PPU), CELL = T * PPU;
const TILES = new URLSearchParams(location.search).get('tiles') === 'cave' ? 'cave' : 'mix';   // ?tiles=cave: no brick
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];   // ordered dither

function rng(seed){ let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function canvasTex(c){ const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
function glowTex(color){
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
const loadImg = url => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
function pixels(img){ const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height); }
// smooth value noise in 2D
function noise2(seed){
  const r = rng(seed), N = 256, v = new Float32Array(N * N); for (let k = 0; k < v.length; k++) v[k] = r();
  const g = (i, j) => v[((j & (N - 1)) * N) + (i & (N - 1))];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, w = y - j, a = u * u * (3 - 2 * u), b = w * w * (3 - 2 * w);
    return (g(i, j) * (1 - a) + g(i + 1, j) * a) * (1 - b) + (g(i, j + 1) * (1 - a) + g(i + 1, j + 1) * a) * b; };
}
// a darkened copy of an image, for the back wall
function shaded(img, k, tint = [0.75, 0.85, 1.1]){
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4){ p[i] *= k * tint[0]; p[i + 1] *= k * tint[1]; p[i + 2] = Math.min(255, p[i + 2] * k * tint[2]); }
  g.putImageData(d, 0, 0); return c;
}
// a canvas onto the scene as planes no bigger than 1024 pixels (old phones cap textures), its top-left at (x, y)
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

// ---- the play layer
function paintPlay(art){
  const Wc = LEVEL.W, Hc = LEVEL.H, pw = Wc * CELL, ph = Hc * CELL, rock = (i, j) => tileAt(i, j) === ROCK ? 1 : 0;
  const n1 = noise2(11), n2 = noise2(23), n3 = noise2(37);
  // where an edge must stay true: the top of anything he stands on, and the air just over it
  const crisp = new Uint8Array(Wc * Hc);
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++){ const t = tileAt(i, j), up = tileAt(i, j + 1), dn = tileAt(i, j - 1); if ((t === ROCK && up !== ROCK) || (t !== ROCK && dn === ROCK)) crisp[j * Wc + i] = 1; }
  // the shape: the cells' corners cut (bilinear between cell centres, so steps read as slopes and corners as bevels),
  // then the edge worn by noise except where he stands
  const mask = new Uint8Array(pw * ph);
  for (let py = 0; py < ph; py++){
    const wy = (ph - py - 0.5) / CELL - 0.5, j0 = Math.floor(wy), ty = wy - j0, cj = Math.floor((ph - py - 0.5) / CELL);
    for (let px = 0; px < pw; px++){
      const wx = (px + 0.5) / CELL - 0.5, i0 = Math.floor(wx), tx = wx - i0;
      const a = rock(i0, j0), b = rock(i0 + 1, j0), c = rock(i0, j0 + 1), d = rock(i0 + 1, j0 + 1), s = a + b + c + d;
      let v;
      if (s === 4) v = 1; else if (s === 0) v = 0;
      else {
        v = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
        if (!crisp[cj * Wc + Math.floor((px + 0.5) / CELL)]) v += (n1(px / 9, py / 9) - 0.5) * 0.5 + (n2(px / 3.5, py / 3.5) - 0.5) * 0.16;
      }
      mask[py * pw + px] = v >= 0.5 ? 1 : 0;
    }
  }
  // how deep each rock pixel is (to the nearest air)
  const dist = new Uint16Array(pw * ph);
  for (let k = 0; k < dist.length; k++) dist[k] = mask[k] ? 999 : 0;
  for (let py = 0; py < ph; py++) for (let px = 0; px < pw; px++){ const k = py * pw + px; if (!dist[k]) continue; let m = dist[k];
    if (px > 0) m = Math.min(m, dist[k - 1] + 1); if (py > 0){ m = Math.min(m, dist[k - pw] + 1); if (px > 0) m = Math.min(m, dist[k - pw - 1] + 1); if (px < pw - 1) m = Math.min(m, dist[k - pw + 1] + 1); } dist[k] = m; }
  for (let py = ph - 1; py >= 0; py--) for (let px = pw - 1; px >= 0; px--){ const k = py * pw + px; if (!dist[k]) continue; let m = dist[k];
    if (px < pw - 1) m = Math.min(m, dist[k + 1] + 1); if (py < ph - 1){ m = Math.min(m, dist[k + pw] + 1); if (px < pw - 1) m = Math.min(m, dist[k + pw + 1] + 1); if (px > 0) m = Math.min(m, dist[k + pw - 1] + 1); } dist[k] = m; }
  // the fill: big cave stone, with patches of old brick (ruins the cave grew over)
  const cave = art.caveTile.data, brick = art.brickTile.data;
  const cnv = document.createElement('canvas'); cnv.width = pw; cnv.height = ph; const g = cnv.getContext('2d');
  const out = g.createImageData(pw, ph), o = out.data;
  for (let py = 0; py < ph; py++) for (let px = 0; px < pw; px++){
    const k = py * pw + px, d = dist[k]; if (!d) continue;
    const s = TILES === 'mix' && n3(px / 260, py / 260) > 0.6 ? brick : cave;
    const ti = ((py % 32) * 32 + (px % 32)) * 4;
    let r = s[ti], gg = s[ti + 1], b = s[ti + 2];
    const top = (py > 1 && !mask[k - pw]) || (py > 2 && !mask[k - pw * 2]) || (py > 3 && !mask[k - pw * 3]);
    // solid ground reads as solid: a band of lit stone at its edge, then into a dark silhouette (the back wall, hazy and
    // blue, is lighter than this, so what you can stand on never looks like what is behind)
    const dd = d + (B4[(py & 3) * 4 + (px & 3)] / 16 - 0.5) * 6;
    let f = dd < 10 ? 1 : dd < 17 ? 0.6 : dd < 24 ? 0.34 : 0;
    if (d === 1){ r = 8; gg = 9; b = 20; f = 1; }                                                  // outline
    else if (top && d <= 3){ r = r * 1.5 + 18; gg = gg * 1.55 + 34; b = b * 1.45 + 36; f = 1; }   // the lit lip of what faces up
    const q = k * 4;
    if (f === 0){ o[q] = 9; o[q + 1] = 10; o[q + 2] = 20; o[q + 3] = 255; continue; }
    o[q] = Math.min(255, Math.max(9, r * f * 0.9)); o[q + 1] = Math.min(255, Math.max(10, gg * f)); o[q + 2] = Math.min(255, Math.max(20, b * f * 1.1)); o[q + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const r = rng(99), Y = j => (Hc - j) * CELL;   // the canvas y of the bottom of row j (= the top of row j - 1)
  // moss in low clumps along lips, now and then a drip down the face below: patches, not a carpet
  for (let py = 1; py < ph - 6; py++) for (let px = 2; px < pw - 6; px++){
    const k = py * pw + px; if (!mask[k] || mask[k - pw] || n2(px / 11, py / 11) < 0.6 || r() > 0.22) continue;
    const w = 2 + Math.floor(r() * 4);
    g.fillStyle = '#1d6e66'; g.fillRect(px, py, w, 2);
    g.fillStyle = '#3fb89c'; g.fillRect(px + 1, py - 1, Math.max(1, w - 2), 1);
    if (r() < 0.25){ g.fillStyle = '#1d6e66'; g.fillRect(px + Math.floor(w / 2), py + 2, 1, 1 + Math.floor(r() * 4)); }
  }
  // ledges: planks with a lit top, seams, nails and a dark underside
  for (let j = 0; j < Hc; j++){
    let i = 0;
    while (i < Wc){
      if (tileAt(i, j) !== LEDGE){ i++; continue; }
      let e = i; while (tileAt(e + 1, j) === LEDGE) e++;
      const x0 = i * CELL, x1 = (e + 1) * CELL, y0 = Y(j + 1);
      g.fillStyle = '#120a08'; g.fillRect(x0 - 1, y0 - 1, x1 - x0 + 2, 8);
      g.fillStyle = '#6e4a2e'; g.fillRect(x0, y0, x1 - x0, 6);
      g.fillStyle = '#a8784a'; g.fillRect(x0, y0, x1 - x0, 1);
      g.fillStyle = '#4a2f1c'; g.fillRect(x0, y0 + 5, x1 - x0, 1);
      for (let x = x0 + 6 + Math.floor(r() * 6); x < x1 - 3; x += 9 + Math.floor(r() * 8)){ g.fillStyle = '#3a2416'; g.fillRect(x, y0 + 1, 1, 4); g.fillStyle = '#c9b48a'; g.fillRect(x + 2, y0 + 2, 1, 1); }
      // a bracket into a wall at either end, or a hanging rope, or nothing
      for (const [x, dir] of [[x0, -1], [x1 - 1, 1]]){
        if (tileAt(dir < 0 ? i - 1 : e + 1, j) === ROCK){ g.fillStyle = '#2a1a10'; for (let k = 0; k < 7; k++) g.fillRect(x - dir * k, y0 + 6 + k, 2, 1); }
        else if (r() < 0.5){ g.fillStyle = '#8a6a44'; g.fillRect(x - dir * 2, y0 + 6, 1, 6 + Math.floor(r() * 10)); }
      }
      i = e + 1;
    }
  }
  // spikes: bone-white teeth with a dark outline
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (tileAt(i, j) === SPIKES){
    const x0 = i * CELL, yb = Y(j);
    for (let s = 0; s < 3; s++){ const cx = x0 + 3 + s * 5, h = 9 + (s === 1 ? 3 : 0);
      for (let y = 0; y < h; y++){ const half = Math.max(0, Math.round((h - y) / h * 2.5)); g.fillStyle = '#1a1020'; g.fillRect(cx - half - 1, yb - y - 1, half * 2 + 3, 1); g.fillStyle = y > h - 3 ? '#fff6e8' : '#d9d0c4'; g.fillRect(cx - half, yb - y - 1, half * 2 + 1, 1); } }
  }
  // ---- decoration, fitted to where it sits
  const D = art.deco, put = (img, x, y, flip, vflip) => { if (!img) return; g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(flip ? -1 : 1, vflip ? -1 : 1); g.drawImage(img, flip ? -img.width : 0, vflip ? -img.height : 0); g.restore(); };
  const isRock = (i, j) => tileAt(i, j) === ROCK, isAir = (i, j) => tileAt(i, j) === EMPTY;
  const airBelow = (i, j) => { let n = 0; while (n < 20 && isAir(i, j - n)) n++; return n; };
  const walkedNear = (i, j) => { for (let d = 1; d <= 6; d++) if (isAir(i, j - d) && (isRock(i, j - d - 1) || tileAt(i, j - d - 1) === LEDGE)) return true; return false; };
  const marksNear = (i, j, rr) => LEVEL.marks.some(m => Math.abs(m.x - i) <= rr && Math.abs(m.y - j) <= rr);
  // ceilings: what hangs, by how much room there is under it
  for (let j = 1; j < Hc - 1; j++){
    let skip = 0;
    for (let i = 1; i < Wc - 1; i++){
      if (skip > 0){ skip--; continue; }
      if (!(isAir(i, j) && isRock(i, j + 1) && isRock(i - 1, j + 1) && isRock(i + 1, j + 1) && isAir(i - 1, j) && isAir(i + 1, j))) continue;
      const room = airBelow(i, j), busy = walkedNear(i, j) || room < 9, y = Y(j + 1) - 3, x = i * CELL - 8;
      if (r() > (busy ? 0.18 : 0.42)) continue;
      const pick = r();
      if (busy || room < 7) put(D.stalactites, x - 8, y + 1, r() < 0.5, true);
      else if (pick < 0.3) put(D.vines, x, y, r() < 0.5);
      else if (pick < 0.55) put(D.roots, x - 8, y, r() < 0.5);
      else if (pick < 0.68) put(D.chain, x, y, false);
      else if (pick < 0.76 && !marksNear(i, j, 3)) put(D.banner, x, y, r() < 0.5);
      else if (pick < 0.82) put(D.lantern, x, y, false);
      else put(D.stalactites, x - 8, y + 1, r() < 0.5, true);
      skip = 2 + Math.floor(r() * 5);
    }
  }
  // floors: low things, fewer out on the open floor, none on markers
  for (let j = 1; j < Hc - 1; j++){
    let skip = 0;
    for (let i = 1; i < Wc - 1; i++){
      if (skip > 0){ skip--; continue; }
      if (!(isAir(i, j) && isRock(i, j - 1) && isRock(i - 1, j - 1) && isRock(i + 1, j - 1) && isAir(i, j + 1))) continue;
      if (marksNear(i, j, 2)) continue;
      const nearWall = isRock(i - 2, j) || isRock(i + 2, j) || isRock(i - 1, j + 1) || isRock(i + 1, j + 1);
      if (r() > (nearWall ? 0.5 : 0.16)) continue;
      const set = nearWall ? ['rubble', 'stalagmites', 'crystals', 'bones', 'mushrooms', 'crystals_pink'] : ['mushrooms', 'lichen', 'crystals', 'rubble', 'bones'];
      const img = D[set[Math.floor(r() * set.length)]]; if (!img) continue;
      put(img, i * CELL + 8 - img.width / 2, Y(j) + 2 - img.height, r() < 0.5);
      skip = 3 + Math.floor(r() * 6);
    }
  }
  return cnv;
}

// ---- the back wall, in its own space: what is behind world point w is drawn at FB * w
const FB = 0.86, MARGIN_X = 15, MARGIN_Y = 7;
function paintBack(art){
  const Lw = LEVEL.W * T, Lh = LEVEL.H * T, bw = Math.ceil((FB * Lw + MARGIN_X * 2) * PPU), bh = Math.ceil((FB * Lh + MARGIN_Y * 2) * PPU);
  const Wc = LEVEL.W, Hc = LEVEL.H;
  // how open each cell is: tiles to the nearest rock
  const open = new Float32Array(Wc * Hc).fill(99);
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (tileAt(i, j) === ROCK) open[j * Wc + i] = 0;
  for (let pass = 0; pass < 2; pass++) for (let s = 0; s < Wc * Hc; s++){
    const k = pass ? Wc * Hc - 1 - s : s, i = k % Wc, j = (k - i) / Wc, sg = pass ? 1 : -1;
    for (const [a, b] of [[sg, 0], [0, sg], [sg, sg], [-sg, sg]]){ const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < Wc && jj < Hc) open[k] = Math.min(open[k], open[jj * Wc + ii] + (a && b ? 1.41 : 1)); }
  }
  const openAt = (wx, wy) => { const i = Math.floor(wx / T), j = Math.floor(wy / T); if (i < 0 || j < 0 || i >= Wc || j >= Hc) return 0; return open[j * Wc + i]; };
  const n1 = noise2(51), n2 = noise2(77);
  const cnv = document.createElement('canvas'); cnv.width = bw; cnv.height = bh; const g = cnv.getContext('2d');
  const out = g.createImageData(bw, bh), o = out.data, tile = art.caveTile.data, hole = new Uint8Array(bw * bh);
  for (let py = 0; py < bh; py++) for (let px = 0; px < bw; px++){
    const wx = (px / PPU - MARGIN_X) / FB, wy = ((bh - py) / PPU - MARGIN_Y) / FB;
    const v = openAt(wx, wy) + (n1(px / 40, py / 40) - 0.5) * 5 + (n2(px / 8, py / 8) - 0.5) * 1.2;
    if (v > 4.6){ hole[py * bw + px] = 1; continue; }            // the far cavern shows through
    // hazy: the stone's contrast halved and pulled toward the cavern's blue, a lighter rim round each opening
    const ti = ((py % 32) * 32 + (px % 32)) * 4, rim = v > 3.9 ? 1.35 : 1, q = (py * bw + px) * 4;
    o[q] = (tile[ti] * 0.35 + 22) * rim; o[q + 1] = (tile[ti + 1] * 0.35 + 40) * rim; o[q + 2] = (tile[ti + 2] * 0.35 + 64) * rim; o[q + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  // ruins and growth on the back wall: standing on the bottoms of openings, hanging from their tops
  const r = rng(321), D = art.backDeco;
  for (let py = 8; py < bh - 8; py += 2) for (let px = 0; px < bw; px += 2){
    const k = py * bw + px;
    if (hole[k] && !hole[k + bw * 2] && r() < 0.012){
      const pick = r(), img = pick < 0.35 ? D.pillar : pick < 0.55 ? D.arch : pick < 0.7 ? D.statue : pick < 0.85 ? D.stalagmites : D.rubble;
      if (img) g.drawImage(img, px - img.width / 2, py - img.height + 6);
    }
    if (hole[k] && !hole[k - bw * 2] && r() < 0.01){
      const pick = r(), img = pick < 0.4 ? D.roots : pick < 0.7 ? D.vines : D.chain;
      if (img) g.drawImage(img, px - img.width / 2, py - 4);
    }
  }
  return { cnv, bw, bh };
}

export function makeRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.autoClear = false;
  canvas.style.imageRendering = 'pixelated';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b1024);
  const camera = new THREE.OrthographicCamera(-10, 10, VIEW_H / 2, -VIEW_H / 2, -200, 200); camera.position.z = 100;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa6d0, 0.95));
  const heroLight = new THREE.PointLight(0xffd2a0, 0.6, 7, 2); scene.add(heroLight);
  const W = LEVEL.W * T, Hh = LEVEL.H * T, rnd = rng(7);
  const torchGlow = glowTex('rgba(255,170,60,1)'), crystalGlow = glowTex('rgba(80,240,255,1)');
  // ---- the far cavern: three times its pixels, nearly still
  const FF = 0.06, farTex = new THREE.TextureLoader().load('assets/side/bg/far.png', t => { t.needsUpdate = true; }); farTex.magFilter = farTex.minFilter = THREE.NearestFilter; farTex.generateMipmaps = false;
  const far = new THREE.Mesh(new THREE.PlaneGeometry(400 * 3 / PPU, 224 * 3 / PPU), new THREE.MeshBasicMaterial({ map: farTex, color: 0x8a96b8 })); far.position.z = -60; scene.add(far);
  const layers = [{ obj: far, f: FF, ax: W / 2, ay: Hh / 2 }];   // drawn at anchor + (camera - anchor) * (1 - f)
  const exits = [], lights = [], flames = [];
  // ---- the painted layers, once their art is in
  const ready = (async () => {
    const names = ['vines', 'roots', 'stalactites', 'stalagmites', 'mushrooms', 'crystals', 'crystals_pink', 'bones', 'rubble', 'chain', 'lantern', 'banner', 'pillar', 'statue', 'arch', 'torch', 'lichen'];
    const imgs = await Promise.all(names.map(n => loadImg(`assets/side/deco/${n}.png`)));
    const deco = {}; names.forEach((n, k) => { deco[n] = imgs[k]; });
    const [caveImg, brickImg] = await Promise.all([loadImg('assets/side/tiles/cave/tile_06.png'), loadImg('assets/side/tiles/stone/tile_06.png')]);
    const art = { deco, caveTile: pixels(caveImg), brickTile: pixels(brickImg), backDeco: {} };
    for (const n of ['pillar', 'arch', 'statue', 'stalagmites', 'rubble', 'roots', 'vines', 'chain']) if (deco[n]) art.backDeco[n] = shaded(deco[n], 0.6, [0.7, 0.9, 1.15]);
    const back = paintBack(art), backGroup = canvasPlanes(scene, back.cnv, 0, 0, -30, false);
    layers.push({ obj: backGroup, back: true, h: back.bh / PPU });
    const play = paintPlay(art), g = play.getContext('2d'), Y = j => (LEVEL.H - j) * CELL;
    // markers painted into the play layer, and their glow
    for (const m of LEVEL.marks){
      const x = (m.x + 0.5) * T, y = m.y * T, px = Math.round(x * PPU);
      if (m.type === 'torch'){
        if (deco.torch) g.drawImage(deco.torch, px - deco.torch.width / 2, Y(m.y) - deco.torch.height - 4);
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffb060, blending: THREE.AdditiveBlending, opacity: 0.8 }));
        fl.position.set(x, y + 0.75, 1); scene.add(fl); flames.push({ m: fl, ph: rnd() * 9 });
        lights.push({ x, y: y + 0.8, color: 0xff9a40, power: 1.5, range: 7, ph: rnd() * 9 });
      }
      if (m.type === 'crystal'){
        if (deco.crystals) g.drawImage(deco.crystals, px - deco.crystals.width / 2, Y(m.y) - deco.crystals.height + 2);
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: crystalGlow, transparent: true, depthWrite: false, color: 0x60e8ff, blending: THREE.AdditiveBlending, opacity: 0.5 }));
        gl.position.set(x, y + 0.45, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: true });
        lights.push({ x, y: y + 0.5, color: 0x40e0ff, power: 1.1, range: 6, ph: rnd() * 9 });
      }
      if (m.type === 'shrine'){
        const b = Y(m.y);
        g.fillStyle = '#0c0a18'; g.fillRect(px - 15, b - 10, 30, 10); g.fillStyle = '#5a5470'; g.fillRect(px - 14, b - 9, 28, 9); g.fillStyle = '#8a84a8'; g.fillRect(px - 14, b - 9, 28, 1);
        for (let k = 0; k < 22; k++){ const half = Math.round(Math.sin(Math.PI * k / 22) * 5); g.fillStyle = '#1a1020'; g.fillRect(px - half - 1, b - 10 - k, half * 2 + 3, 1); g.fillStyle = k > 14 ? '#fff0b0' : '#ffd27a'; g.fillRect(px - half, b - 10 - k, half * 2 + 1, 1); }
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffd27a, blending: THREE.AdditiveBlending, opacity: 0.6 }));
        gl.position.set(x, y + 0.7, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: true });
        lights.push({ x, y: y + 1, color: 0xffc860, power: 1.8, range: 7, ph: rnd() * 9 });
      }
    }
    canvasPlanes(scene, play, 0, Hh, 0, true);
    // the foreground: a few dark shapes in front, faster than the world, low at the foot of the larger rooms
    const sil = {}; for (const n of ['stalagmites', 'rubble', 'roots', 'mushrooms']) if (deco[n]) sil[n] = shaded(deco[n], 0.08, [1, 1.2, 1.8]);
    const fr = rng(555);
    for (const room of LEVEL.rooms){
      const spots = [];
      for (let j = room.ty0 + 1; j < room.ty1 - 4; j++) for (let i = room.tx0 + 2; i < room.tx1 - 2; i++)
        if (tileAt(i, j) === EMPTY && tileAt(i, j - 1) === ROCK && tileAt(i - 2, j - 1) === ROCK && tileAt(i + 2, j - 1) === ROCK && !LEVEL.marks.some(m => Math.abs(m.x - i) < 4 && Math.abs(m.y - j) < 4)) spots.push([i, j]);
      for (let n = 0; n < 2 && spots.length; n++){
        const [i, j] = spots.splice(Math.floor(fr() * spots.length), 1)[0], keys = Object.keys(sil), img = sil[keys[Math.floor(fr() * keys.length)]]; if (!img) continue;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(img.width * 2 / PPU, img.height * 2 / PPU), new THREE.MeshBasicMaterial({ map: canvasTex(img), transparent: true, alphaTest: 0.5 }));
        if (fr() < 0.5) m.scale.x = -1;
        const ax = (i + 0.5) * T, ay = j * T + img.height / PPU - 0.6;
        m.position.set(ax, ay, 5); scene.add(m); layers.push({ obj: m, f: 1.25, ax, ay });
      }
    }
  })();
  // the way on: shut until the Warden falls
  for (const m of LEVEL.marks) if (m.type === 'exit'){
    const x = (m.x + 0.5) * T, y = m.y * T;
    const c = document.createElement('canvas'); c.width = 48; c.height = 64; const gg = c.getContext('2d');
    gg.fillStyle = '#1a1020'; gg.fillRect(4, 8, 40, 56); gg.fillStyle = '#fff0c0'; gg.fillRect(8, 12, 32, 52); gg.fillStyle = '#ffe08a'; gg.fillRect(12, 16, 24, 48);
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(48 / PPU, 64 / PPU), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true }));
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
      blur.uniforms.tex.value = b1.texture; blur.uniforms.dir.value.set(2 / b1.width, 0); pass(blur, b2);
      blur.uniforms.tex.value = b2.texture; blur.uniforms.dir.value.set(0, 2 / b1.height); pass(blur, b1);
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
