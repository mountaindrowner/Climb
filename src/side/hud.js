// What is drawn over the game: his life (the scarf, a length for each heart) and embers, the flask, the boss's bar,
// the map and how high he is, a creature's tell, the words that come up (a region's name, a boss's, a shrine), the bars
// that close in for a boss, the dark between regions. All of it is drawn small, at the game's own resolution, and
// scaled up whole with it, so the HUD is made of the same pixel as the world; its lettering is pixelfont.js.
import { text, width, fine } from './pixelfont.js';
const C = { ink: '#181425', deep: '#262b44', dark: '#3a4466', mid: '#5a6988', light: '#8b9bb4', pale: '#c0cbdc', white: '#ffffff', bone: '#ead4aa', cream: '#fff2d0',
  red0: '#a22633', red1: '#e43b44', fire1: '#f77622', fire2: '#feae34', fire3: '#fee761', teal: '#193c3e', cyan: '#2ce8f5', blue: '#0099db', navy: '#124e89', rust: '#d77643', wood1: '#733e39' };
const MASK = ['.#####.', '#######', '#.###.#', '#.###.#', '#######', '.##.##.', '.#####.', '..###..'];   // his mask, for beside his life
export function makeHud(hud){
  const hx = hud.getContext('2d'), lo = document.createElement('canvas'), g = lo.getContext('2d');
  const px = (c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const H = { W: 320, Hh: 180, bossLag: 1, bars: 0, hintT: 0 };
  // start a frame: the small canvas cleared, sized to the game's picture
  H.begin = (w) => { const W = Math.max(160, Math.round(w)); if (lo.width !== W || lo.height !== 180){ lo.width = W; lo.height = 180; } H.W = W; g.clearRect(0, 0, W, 180); g.globalAlpha = 1; g.imageSmoothingEnabled = false; return g; };
  // end it: up onto the screen, whole pixels
  H.end = () => {
    const w = hud.clientWidth, h = hud.clientHeight, dpr = devicePixelRatio || 1; if (hud.width !== Math.round(w * dpr) || hud.height !== Math.round(h * dpr)){ hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr); }
    hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, hud.width, hud.height); hx.imageSmoothingEnabled = false; hx.drawImage(lo, 0, 0, hud.width, hud.height);
  };
  H.g = g; H.px = px; H.text = (...a) => text(g, ...a); H.width = width; H.C = C;
  // a line with a diamond at its middle: under a name
  H.rule = (cx, y, half, col) => { px(col, cx - half, y, half - 4, 1); px(col, cx + 5, y, half - 4, 1); for (let k = 0; k < 3; k++){ px(col, cx - k, y - 2 + k, 1 + k * 2, 1); px(col, cx - k, y + 2 - k, 1 + k * 2, 1); } };

  // his life, embers and flask, top left
  H.status = (P, embers, emberMax, flaskMax, t) => {
    for (let r = 0; r < MASK.length; r++) for (let c = 0; c < 7; c++) if (MASK[r][c] === '#') px(r >= 2 && r <= 3 && (c === 1 || c === 5) ? C.ink : C.white, 6 + c, 5 + r);
    px(C.ink, 5, 5, 1, 7); px(C.ink, 13, 5, 1, 7); px(C.ink, 6, 4, 7, 1); px(C.ink, 7, 13, 5, 1); px(C.ink, 7, 7, 1, 2); px(C.ink, 11, 7, 1, 2);
    const x0 = 16;
    for (let i = 0; i < P.maxHp; i++){
      const x = x0 + i * 8, on = i < P.hp, last = i === P.hp - 1, low = P.hp <= 1 && on && Math.floor(t * 5) % 2;
      px(C.ink, x, 6, 8, 6); px(on ? (low ? C.fire2 : C.red1) : C.deep, x, 7, 7, 4); if (on){ px(low ? C.fire3 : C.rose || '#f6757a', x, 7, 7, 1); px(C.red0, x, 10, 7, 1); if (last){ px(C.ink, x + 6, 7, 1, 1); px(C.ink, x + 6, 10, 1, 1); } }
    }
    const ew = P.maxHp * 8 - 1; px(C.ink, x0 - 1, 13, ew + 2, 3); px(C.deep, x0, 14, ew, 1); px(embers >= emberMax ? C.fire3 : C.fire2, x0, 14, Math.round(ew * Math.min(1, embers / emberMax)), 1);
    let fx = x0 + P.maxHp * 8 + 5;
    for (let i = 0; i < flaskMax; i++){ const on = i < P.flask, x = fx + i * 8;
      px(C.ink, x + 1, 5, 3, 2); px(C.ink, x, 7, 5, 6); px(C.light, x + 2, 5, 1, 2); px(on ? C.cyan : C.deep, x + 1, 8, 3, 4); if (on){ px(C.white, x + 1, 8, 1, 1); px(C.blue, x + 1, 11, 3, 1); } }
  };
  // what he has gathered, after the flask: shards (the number comes forward when it changes) and the threads toward a heart
  H.purse = (P, flaskMax, shards, pop, threads, per) => {
    const x = 16 + P.maxHp * 8 + 5 + flaskMax * 8 + 5;
    for (let k = 0; k < 3; k++){ px(C.ink, x + 2 - k - 1, 6 + k, k * 2 + 3, 1); px(C.ink, x + 2 - k - 1, 11 - k, k * 2 + 3, 1); } for (let k = 0; k < 3; k++){ px(k ? C.cyan : C.white, x + 2 - k, 6 + k + 0, k * 2 + 1, 1); px(C.blue, x + 2 - k, 11 - k, k * 2 + 1, 1); }
    g.globalAlpha = pop > 0 ? 1 : 0.75; text(g, String(shards), x + 8, 6, pop > 0 ? C.cream : C.pale, 1, 'left'); g.globalAlpha = 1;
    for (let k = 0; k < per; k++){ const tx = 16 + k * 4; px(C.ink, tx, 17, 3, 3); px(k < threads ? C.red1 : C.deep, tx, 17, 2, 2); }
  };
  // a key over something he can use
  H.prompt = (sx, sy, str, t) => { const w = width(str) + 6, x = Math.round(sx - w / 2), y = Math.round(sy + Math.sin(t * 3) * 1.5); px(C.ink, x, y, w, 11); px(C.bone, x, y, w, 1); px(C.bone, x, y + 10, w, 1); text(g, str, x + 3, y + 2, C.cream, 1, 'left', null); px(C.ink, sx - 1, y + 11, 3, 1); px(C.ink, sx, y + 12, 1, 1); };
  H.fine = (...a) => fine(g, ...a);
  H.place = (name, alpha) => { g.globalAlpha = alpha; fine(g, name, 6, 23, C.pale); g.globalAlpha = 1; };
  // the boss's bar: its name, its health, and behind that what it has just lost, running down after
  H.boss = (b, dt) => {
    if (!b){ H.bossLag = 1; return; }
    H.bossLag = Math.max(b.frac, H.bossLag - dt * 0.35); const w = Math.min(170, H.W - 150), x = Math.round((H.W - w) / 2), y = 16;
    text(g, b.name, H.W / 2, 5, C.cream, 1, 'center');
    px(C.ink, x - 2, y - 2, w + 4, 8); px(C.deep, x, y, w, 4); px(C.white, x, y, Math.round(w * H.bossLag), 4); px(b.phase === 2 ? C.fire1 : C.red1, x, y, Math.round(w * b.frac), 4); px(b.phase === 2 ? C.fire3 : '#f6757a', x, y, Math.round(w * b.frac), 1);
    px(b.phase === 2 ? C.fire2 : C.pale, x + Math.round(w / 2), y - 1, 1, 6);   // the mark at half: where it turns
    for (const sx of [x - 5, x + w + 4]) for (let k = 0; k < 3; k++){ px(C.bone, sx - k, y - 1 + k, 1 + k * 2, 1); px(C.bone, sx - k, y + 4 - k, 1 + k * 2, 1); }
  };
  // the map (each room once he has been in it) and how high on the mountain he is, top right
  // the map in the corner: the rooms he has been in, at one scale whatever the size of the region (a pixel for two
  // tiles), centred on him and scrolling with him; `at` is where he is in the world
  H.map = (mapCanvas, LW, LH, seen, room, T, dots, height, span, index, t, at) => {
    const k = 0.5, mw = 64, mh = 50, mx = H.W - mw - 16, my = 6;
    const ox = Math.round(mx + mw / 2 - (at ? at.x / T : LW / 2) * k), oy = Math.round(my + mh / 2 - (LH - (at ? at.y / T : LH / 2)) * k);
    px(C.ink, mx - 2, my - 2, mw + 4, mh + 4); px(C.deep, mx - 1, my - 1, mw + 2, mh + 2); px(C.ink, mx, my, mw, mh);
    g.save(); g.beginPath(); g.rect(mx, my, mw, mh); g.clip();
    for (const r of seen){ const sx = r.x0 / T, sy = LH - r.y1 / T, sw = (r.x1 - r.x0) / T, sh = (r.y1 - r.y0) / T; g.globalAlpha = r === room ? 1 : 0.6; g.drawImage(mapCanvas, sx, sy, sw, sh, ox + Math.round(sx * k), oy + Math.round(sy * k), Math.round(sw * k), Math.round(sh * k)); }
    g.globalAlpha = 1;
    for (const d of dots) if (!d.blink || Math.floor(t * 3) % 2 === 0) px(d.c, ox + Math.round(d.x / T * k) - (d.r || 0), oy + Math.round((LH - d.y / T) * k) - (d.r || 0), 1 + (d.r || 0) * 2, 1 + (d.r || 0) * 2);
    g.restore();
    // the mountain: a length for each region, one over the other, and a mark
    const gx = H.W - 9, gy = my, gh = Math.max(40, mh), f = span[index][0] + (span[index][1] - span[index][0]) * height;
    px(C.ink, gx - 1, gy - 1, 5, gh + 2);
    [C.blue, C.rust, C.pale, C.mid, '#63c74d', C.fire3].forEach((c, n) => { const a = span[n]; if (!a) return; g.globalAlpha = n === index ? 1 : 0.4; px(c, gx, gy + Math.round(gh * (1 - a[1])), 3, Math.max(1, Math.round(gh * (a[1] - a[0])) - 1)); }); g.globalAlpha = 1;
    const yy = gy + Math.round(gh * (1 - f)); px(C.ink, gx - 3, yy - 2, 9, 3); px(C.fire3, gx - 2, yy - 1, 7, 1);
    fine(g, Math.round(f * 1000) + ' M', H.W - 5, gy + gh + 4, C.pale, 'right');
  };
  // the whole map (from the pause): the region fitted to the picture, the rooms he has been in, the room he is in
  // outlined, and what is marked on it, with a key
  H.fullmap = (mapCanvas, LW, LH, seen, room, T, dots, t, name) => {
    H.dark(0.86);
    text(g, name.toUpperCase(), H.W / 2, 8, C.cream, 1, 'center'); H.rule(Math.round(H.W / 2), 18, 50, C.bone);
    const k = Math.min((H.W - 40) / LW, 116 / LH, 2), mw = Math.round(LW * k), mh = Math.round(LH * k), mx = Math.round((H.W - mw) / 2), my = 24 + Math.round((116 - mh) / 2);
    px(C.ink, mx - 2, my - 2, mw + 4, mh + 4); px(C.deep, mx - 1, my - 1, mw + 2, mh + 2); px(C.ink, mx, my, mw, mh);
    for (const r of seen){ const sx = r.x0 / T, sy = LH - r.y1 / T, sw = (r.x1 - r.x0) / T, sh = (r.y1 - r.y0) / T; g.globalAlpha = r === room ? 1 : 0.75; g.drawImage(mapCanvas, sx, sy, sw, sh, mx + Math.round(sx * k), my + Math.round(sy * k), Math.round(sw * k), Math.round(sh * k)); }
    g.globalAlpha = 1;
    if (room){ const x0 = mx + Math.round(room.x0 / T * k), y0 = my + Math.round((LH - room.y1 / T) * k), w = Math.round((room.x1 - room.x0) / T * k), h = Math.round((room.y1 - room.y0) / T * k);
      px(C.cream, x0 - 1, y0 - 1, w + 2, 1); px(C.cream, x0 - 1, y0 + h, w + 2, 1); px(C.cream, x0 - 1, y0, 1, h); px(C.cream, x0 + w, y0, 1, h); }
    for (const d of dots) if (!d.blink || Math.floor(t * 3) % 2 === 0){ const r = d.blink ? 1 : 1; px(C.ink, mx + Math.round(d.x / T * k) - r - 1, my + Math.round((LH - d.y / T) * k) - r - 1, r * 2 + 3, r * 2 + 3); px(d.c, mx + Math.round(d.x / T * k) - r, my + Math.round((LH - d.y / T) * k) - r, r * 2 + 1, r * 2 + 1); }
    // the key
    const KEY = [['#ffffff', 'HIM'], ['#fee761', 'FLAME'], ['#feae34', 'ORDRIC'], ['#63c74d', 'MIREL'], ['#2ce8f5', 'CORWEN'], ['#e43b44', 'KEEPER']];
    if (dots.some(d => d.find)) KEY.push(['#f6757a', 'UNFOUND']);
    let kx = Math.round(H.W / 2 - KEY.reduce((a, [, s]) => a + width(s) + 12, 0) / 2);
    for (const [c, s] of KEY){ px(C.ink, kx - 1, 147, 5, 5); px(c, kx, 148, 3, 3); text(g, s, kx + 6, 146, C.pale, 1, 'left'); kx += width(s) + 12; }
  };
  // words that come up in the middle: a name large, a line under it
  H.banner = (a, b, alpha) => {
    if (alpha <= 0) return; g.globalAlpha = Math.min(1, alpha);
    const big = width(a, 2) <= H.W - 24 ? 2 : 1; text(g, a, H.W / 2, 50, C.cream, big, 'center');
    if (b){ H.rule(Math.round(H.W / 2), 50 + 7 * big + 5, Math.min(70, Math.round(width(a, big) / 2) + 8), C.bone); text(g, b, H.W / 2, 50 + 7 * big + 11, C.pale, 1, 'center'); }
    g.globalAlpha = 1;
  };
  // a boss comes: black closes in above and below, and its name is set out
  H.cinema = (on, dt, name, epithet, t) => {
    H.bars += ((on ? 1 : 0) - H.bars) * Math.min(1, dt * 5); const hgt = Math.round(H.bars * 16);
    if (hgt > 0){ px(C.ink, 0, 0, H.W, hgt); px(C.ink, 0, 180 - hgt, H.W, hgt); }
    if (on && name && t > 0.5){ const a = Math.min(1, (t - 0.5) / 0.5); g.globalAlpha = a; text(g, name, H.W / 2, 122, C.cream, 3, 'center'); H.rule(Math.round(H.W / 2), 148, 80, C.bone); text(g, epithet, H.W / 2, 154, C.pale, 1, 'center'); g.globalAlpha = 1; }
  };
  H.tell = (sx, sy) => { for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (Math.hypot(x, y) < 5.2) px(Math.hypot(x, y) > 4 ? C.red1 : C.ink, sx + x, sy + y); px(C.red1, sx, sy - 3, 1, 4); px(C.red1, sx, sy + 2, 1, 1); };
  H.hint = (lines, alpha) => { if (alpha <= 0) return; g.globalAlpha = alpha; lines.forEach((l, i) => fine(g, l, H.W / 2, 180 - 8 - (lines.length - 1 - i) * 7, C.pale, 'center')); g.globalAlpha = 1; };
  H.dark = (alpha, col = C.ink) => { if (alpha <= 0) return; g.globalAlpha = Math.min(1, alpha); px(col, 0, 0, H.W, 180); g.globalAlpha = 1; };
  H.label = (str) => { g.globalAlpha = 0.35; fine(g, str, H.W - 3, 180 - 7, C.light, 'right'); g.globalAlpha = 1; };
  return H;
}
