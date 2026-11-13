// What there is to find, and who there is to meet, made from the region's markers:
//   urn      a pot: a cut, a plunge or a roll breaks it; shards fall out
//   chest    cut it open (or stand at it and press down): shards, a scarf thread, or a relic (`holds`)
//   thread   a length of red thread caught on something: walk into it
//   npc      one of the three who climb with him (`who`); stand by them and press down to talk
// and the shards themselves: they scatter, lie where they fall, and come to him when he is near.
//   makeItems(scene, R, n) -> { step(dt, t, P, evs), strike(from, reach, evs), slam(P, radius, evs), near(P), left(), list, people }
// Events pushed for the game to act on: shard { v }, thread, relic { id }, chest, urn, each with `at`.
import { T, LEVEL, tileAt, ROCK, LEDGE } from './level.js';
import { PPU, PAL, makeSprite } from './render.js';
import { took, take, has } from './state.js';
import { PEOPLE } from './talk.js';
const THREE = window.THREE;
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const texOf = c => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const ground = (x, y) => { const i = Math.floor(x / T); for (let j = Math.floor((y + 0.05) / T); j >= 0; j--){ const t = tileAt(i, j); if (t === ROCK || t === LEDGE) return (j + 1) * T; } return -Infinity; };

function urnTex(){
  const c = cnv(9, 11), g = c.getContext('2d'), half = [1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 2];
  half.forEach((h, k) => { px(g, PAL.ink, 4 - h - 1, k, h * 2 + 3); px(g, k === 4 ? PAL.fire2 : k === 0 || k === 10 ? PAL.wood3 : PAL.rust, 4 - h, k, h * 2 + 1); px(g, PAL.wood3, 4 - h, k); if (h > 1) px(g, PAL.wood1, 4 + h, k); });
  return texOf(c);
}
// a chest, shut and open, side by side (18 x 14 each)
function chestTex(rich){
  const c = cnv(36, 14), g = c.getContext('2d'), band = rich ? PAL.fire3 : PAL.fire2, wood = rich ? PAL.red0 : PAL.wood1, lite = rich ? PAL.red1 : PAL.wood3;
  for (const o of [0, 18]){
    px(g, PAL.ink, o + 1, 6, 16, 8); px(g, wood, o + 2, 7, 14, 6); px(g, lite, o + 2, 7, 14, 1); px(g, PAL.wood0, o + 2, 12, 14, 1);
    for (const bx of [3, 13]) px(g, band, o + bx, 7, 2, 6);
    if (!o){ px(g, PAL.ink, 1, 1, 16, 6); px(g, wood, 2, 2, 14, 4); px(g, lite, 2, 2, 14, 1); px(g, band, 3, 2, 2, 4); px(g, band, 13, 2, 2, 4); px(g, PAL.ink, 8, 5, 3, 4); px(g, PAL.fire3, 9, 6, 1, 2); }
    else { px(g, PAL.ink, o + 1, 0, 16, 4); px(g, wood, o + 2, 1, 14, 2); px(g, lite, o + 2, 1, 14, 1); px(g, band, o + 3, 1, 2, 2); px(g, band, o + 13, 1, 2, 2); px(g, PAL.ink, o + 2, 4, 14, 3); px(g, PAL.fire3, o + 4, 5, 10, 1); px(g, PAL.white, o + 6, 5, 6, 1); }
  }
  const t = texOf(c); t.repeat.set(0.5, 1); return t;
}
function threadTex(){
  const c = cnv(9, 13), g = c.getContext('2d'), path = [[4, 0], [5, 1], [5, 2], [4, 3], [3, 4], [3, 5], [4, 6], [5, 7], [5, 8], [4, 9], [3, 10], [3, 11], [4, 12]];
  for (const [x, y] of path) px(g, PAL.ink, x - 1, y, 3, 1); for (const [x, y] of path){ px(g, PAL.red1, x, y); if (y % 4 === 1) px(g, PAL.rose, x, y); }
  return texOf(c);
}
const glowTex = (() => { let t; return () => { if (t) return t; const c = cnv(32, 32), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return t = new THREE.CanvasTexture(c); }; })();

// ---- each of the three has a station: a thing of their own beside them, lit. Drawn here in the palette, small and bold
// like the rest of the decoration. (x, y): where the thing stands. Each returns its picture and where its light is
const STATION = {
  // Ordric's: an iron lamp-post, its lantern lit, a ladder against it, a can of oil
  lamplighter: { name: "ORDRIC'S VIGIL", col: 0xffb060, w: 16, h: 44, at: 7, glow: [8, 9], draw(g){
    px(g, PAL.ink, 6, 8, 4, 36); px(g, PAL.dark, 7, 9, 2, 35); px(g, PAL.mid, 7, 9, 1, 35);
    px(g, PAL.ink, 2, 4, 12, 3); px(g, PAL.dark, 3, 5, 10, 1);
    px(g, PAL.ink, 4, 7, 8, 9); px(g, PAL.fire2, 5, 8, 6, 7); px(g, PAL.fire3, 6, 9, 4, 4); px(g, PAL.white, 7, 10, 2, 2); px(g, PAL.ink, 7, 7, 2, 9);
    px(g, PAL.ink, 3, 42, 10, 2); px(g, PAL.dark, 4, 42, 8, 1);
    for (let y = 18; y < 42; y += 4){ px(g, PAL.wood1, 10, y, 4, 1); } px(g, PAL.wood0, 10, 18, 1, 24); px(g, PAL.wood0, 13, 18, 1, 24);
    px(g, PAL.ink, 0, 37, 5, 7); px(g, PAL.rust, 1, 38, 3, 5); px(g, PAL.fire2, 1, 38, 3, 1); } },
  // Mirel's: a small fire in a ring of stones, her bedroll beside it
  wren: { name: "MIREL'S REST", col: 0xff8a40, w: 30, h: 14, at: 9, glow: [9, 8], fire: [9, 9], draw(g){
    for (const [x, y] of [[3, 11], [6, 12], [10, 12], [14, 11]]){ px(g, PAL.ink, x - 1, y - 1, 4, 3); px(g, PAL.mid, x, y - 1, 2, 2); px(g, PAL.light, x, y - 1, 2, 1); }
    px(g, PAL.wood0, 5, 10, 9, 2); px(g, PAL.wood1, 6, 10, 7, 1);
    px(g, PAL.ink, 18, 9, 12, 5); px(g, PAL.moss1, 19, 10, 10, 3); px(g, PAL.moss2 || '#63c74d', 19, 10, 10, 1); px(g, PAL.red0, 26, 10, 3, 3); px(g, PAL.bone, 19, 12, 2, 1); } },
  // Corwen's: a folding desk, an open book on it, an ink pot, a candle, scrolls under it
  scribe: { name: "CORWEN'S DESK", col: 0xffd27a, w: 22, h: 24, at: 11, glow: [17, 6], draw(g){
    px(g, PAL.ink, 1, 11, 20, 3); px(g, PAL.wood1, 2, 12, 18, 1); px(g, PAL.wood3, 2, 11, 18, 1);
    px(g, PAL.ink, 3, 14, 2, 10); px(g, PAL.wood0, 3, 14, 1, 10); px(g, PAL.ink, 17, 14, 2, 10); px(g, PAL.wood0, 17, 14, 1, 10); px(g, PAL.wood0, 4, 18, 14, 1);
    px(g, PAL.ink, 5, 7, 11, 4); px(g, PAL.bone, 6, 7, 4, 3); px(g, PAL.bone, 11, 7, 4, 3); px(g, PAL.ink, 10, 7, 1, 4); for (let y = 8; y < 10; y++){ px(g, PAL.light, 7, y, 2, 1); px(g, PAL.light, 12, y, 2, 1); }
    px(g, PAL.ink, 2, 9, 3, 2); px(g, PAL.navy, 3, 9, 1, 1);
    px(g, PAL.ink, 16, 5, 3, 6); px(g, PAL.bone, 17, 6, 1, 5); px(g, PAL.fire3, 17, 4, 1, 1); px(g, PAL.fire2, 17, 3, 1, 1);
    for (const x of [6, 10]){ px(g, PAL.ink, x, 20, 5, 4); px(g, PAL.bone, x + 1, 21, 3, 2); px(g, PAL.wood2, x + 2, 21, 1, 2); } } },
};
// a fire: four frames, flickering
function fireTex(){ const c = cnv(24, 9), g = c.getContext('2d');
  for (let f = 0; f < 4; f++) for (let y = 0; y < 9; y++) for (let x = 0; x < 6; x++){ const half = [3, 3, 2.6, 2.2, 2, 1.5, 1, 0.6, 0.3][y] + (f % 2 && y > 4 ? -0.4 : 0), sway = Math.sin(f * 1.6 + y * 0.7) * y / 8 * 1.2, d = Math.abs(x + 0.5 - 3 - sway); if (d > half) continue; px(g, d < half * 0.4 && y < 5 ? (y < 2 ? PAL.white : PAL.fire3) : d < half * 0.75 ? PAL.fire2 : PAL.fire1, f * 6 + x, 8 - y); }
  const t = texOf(c); t.repeat.set(0.25, 1); return t; }
export const STATION_NAMES = Object.fromEntries(Object.entries(STATION).map(([k, v]) => [k, v.name]));
export function makeItems(scene, R, n){
  const list = [], people = [], shards = [], rnd = Math.random;
  const flat = (map, w, h, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w / PPU, h / PPU), new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...o })); m.geometry.translate(0, h / PPU / 2, 0); scene.add(m); return m; };
  const halo = (color, size, opacity) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(m); return m; };
  const ut = urnTex(), tt = threadTex();
  for (const mk of LEVEL.marks){
    const x = (mk.x + 0.5) * T, y = mk.y * T, id = mk.type[0] + mk.x + ',' + mk.y;
    if (mk.type === 'urn'){ if (took(n, id)) continue; const m = flat(ut, 9, 11); m.position.set(x, y, 0.025); list.push({ type: 'urn', id, x, y, m, w: 0.4, h: 0.7 }); }
    else if (mk.type === 'chest'){
      const rich = /^relic|^thread/.test(mk.holds || ''), tex = chestTex(rich), open = took(n, id), m = flat(tex, 18, 14); m.position.set(x, y, 0.025); if (open) tex.offset.x = 0.5;
      const gl = rich && !open ? halo(0xffd27a, 2.2, 0.3) : null; if (gl) gl.position.set(x, y + 0.5, 0.02);
      list.push({ type: 'chest', id, x, y, m, tex, gl, open, holds: mk.holds || 'shards', w: 0.6, h: 0.85 });
    }
    else if (mk.type === 'thread'){ if (took(n, id)) continue; const m = flat(tt, 9, 13), gl = halo(0xff5040, 1.6, 0.45); m.position.set(x, y + 0.5, 0.04); gl.position.set(x, y + 0.9, 0.03); list.push({ type: 'thread', id, x, y, m, gl, ph: rnd() * 6 }); }
    else if (mk.type === 'npc'){
      const who = mk.who, P0 = PEOPLE[who]; if (!P0) continue; const P = P0.late && n >= P0.late.from ? { ...P0, art: P0.late.art } : P0;
      // the station beside them, toward the middle of the room
      const ST = STATION[who], room = LEVEL.rooms.find(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1), side = room && x > (room.x0 + room.x1) / 2 ? -1 : 1, sx = x + side * (ST.at / 16 + 0.7);
      const sc = cnv(ST.w, ST.h); ST.draw(sc.getContext('2d')); const sm = flat(texOf(sc), ST.w, ST.h); sm.position.set(Math.round(sx * PPU) / PPU, y, 0.015);
      let fm = null; if (ST.fire){ fm = new THREE.Mesh(new THREE.PlaneGeometry(6 / PPU, 9 / PPU), new THREE.MeshBasicMaterial({ map: fireTex(), transparent: true, alphaTest: 0.5 })); fm.position.set(Math.round((sx - ST.w / 2 / PPU + (ST.fire[0] + 0.5) / PPU) * PPU) / PPU, y + (ST.h - ST.fire[1]) / PPU + 4.5 / PPU, 0.02); scene.add(fm); }
      const lx = sx - ST.w / 2 / PPU + ST.glow[0] / PPU, ly = y + (ST.h - ST.glow[1]) / PPU, halo = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: glowTex(), color: ST.col, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(lx, ly, 0.01); scene.add(halo);
      const N = { type: 'npc', who, art: P.art, station: { name: ST.name, x: sx, y, lx, ly, col: ST.col, fm, halo, room: mk.station }, x, y, face: -1, sprite: null, meta: null, stand: null, ph: rnd() * 6 };
      N.stand = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.9), new THREE.MeshBasicMaterial({ color: 0x262b44 })); N.stand.position.set(x, y + 0.95, 0.02); scene.add(N.stand);
      fetch(`assets/side/${P.art}/sprite.json`).then(r => r.ok ? r.json() : null).then(meta => { if (meta){ N.meta = meta; N.sprite = makeSprite(scene, `assets/side/${P.art}`, meta); N.stand.visible = false; } }).catch(() => {});
      people.push(N);
    }
  }
  // the shards: a pool of small bright pieces
  const SN = 90, sgeo = new THREE.PlaneGeometry(3 / PPU, 3 / PPU); let sk = 0;
  for (let i = 0; i < SN; i++){ const m = new THREE.Mesh(sgeo, new THREE.MeshBasicMaterial({ color: 0x2ce8f5 })); m.rotation.z = Math.PI / 4; m.visible = false; scene.add(m); shards.push({ m, on: false }); }
  const spill = (x, y, total) => { let left = total; while (left > 0){ const v = left >= 12 && rnd() < 0.6 ? 5 : 1; left -= v; const s = shards[sk]; sk = (sk + 1) % SN; const a = Math.PI * (0.15 + 0.7 * rnd());
    Object.assign(s, { on: true, x, y: y + 0.3, vx: Math.cos(a) * (2 + rnd() * 3), vy: Math.sin(a) * (4 + rnd() * 3), v, t: 0, rest: false }); s.m.visible = true; s.m.material.color.setHex(v > 1 ? 0xfee761 : 0x2ce8f5); s.m.scale.setScalar(v > 1 ? 1.4 : 1); } };
  const give = (it, evs) => {
    const at = { x: it.x, y: it.y + 0.6 };
    if (it.type === 'urn'){ it.gone = true; scene.remove(it.m); take(n, it.id); spill(it.x, it.y, 3 + Math.floor(rnd() * 4)); evs.push({ type: 'urn', at }); }
    else if (it.type === 'chest' && !it.open){ it.open = true; it.tex.offset.x = 0.5; if (it.gl){ scene.remove(it.gl); it.gl = null; } take(n, it.id); it.t = 0;
      evs.push({ type: 'chest', at });
      if (it.holds.startsWith('relic:')) evs.push({ type: 'relic', id: it.holds.slice(6), at }); else if (it.holds === 'thread') evs.push({ type: 'thread', at }); else spill(it.x, it.y + 0.4, 26 + Math.floor(rnd() * 12)); }
  };
  const I = { list, people, spill };
  I.step = (dt, t, P, evs) => {
    for (const it of list){
      if (it.gone) continue;
      if (it.type === 'thread'){ it.m.position.y = it.y + 0.5 + Math.sin(t * 2 + it.ph) * 0.12; it.gl.material.opacity = 0.35 + Math.sin(t * 3 + it.ph) * 0.12; if (P.hp > 0 && Math.abs(P.x - it.x) < 0.7 && P.y < it.y + 1.6 && P.y + P.h > it.y + 0.3){ it.gone = true; scene.remove(it.m); scene.remove(it.gl); take(n, it.id); evs.push({ type: 'thread', at: { x: it.x, y: it.y + 0.8 } }); } }
      else if (it.type === 'urn' && P.roll > 0 && Math.abs(P.x - it.x) < 0.55 && Math.abs(P.y - it.y) < 0.6) give(it, evs);   // rolled through
      else if (it.type === 'chest' && it.gl) it.gl.material.opacity = 0.26 + Math.sin(t * 2.4) * 0.08;
    }
    for (const N of people){
      // the station's light, kept up while it is near (the fire flickers; the lamp and the candle are steadier)
      const S = N.station, near = Math.abs(S.lx - P.x) < 14 && Math.abs(S.ly - P.y) < 9, fl = S.fm ? 1 + Math.sin(t * 13 + N.ph) * 0.12 + Math.sin(t * 7.1) * 0.08 : 1 + Math.sin(t * 2.3 + N.ph) * 0.04;
      if (near) R.glint(S.lx, S.ly, S.col, 0.85 * fl, S.fm ? 6 : 5.5); S.halo.material.opacity = 0.3 * fl; if (S.fm) S.fm.material.map.offset.x = Math.floor(t * 10 + N.ph) % 4 / 4;
      N.face = Math.sign(P.x - N.x) || N.face; if (N.sprite) N.sprite.show(N.meta.anims.idle ? 'idle' : 'stand', t / 1.6 + N.ph, N.x, N.y - 2 / 16, N.face, 0.03); }
    const reach = has('lodestone') ? 5 : 2.2, hx = P.x, hy = P.y + 1.1;
    for (const s of shards){
      if (!s.on) continue; s.t += dt;
      const dx = hx - s.x, dy = hy - s.y, d = Math.hypot(dx, dy);
      if (s.t > 0.35 && d < reach && P.hp > 0){ const pull = 26 + s.t * 30; s.vx += dx / d * pull * dt; s.vy += dy / d * pull * dt; s.vx *= Math.exp(-dt * 5); s.vy *= Math.exp(-dt * 5); s.rest = false; if (d < 0.5){ s.on = false; s.m.visible = false; evs.push({ type: 'shard', v: s.v, at: { x: s.x, y: s.y } }); continue; } }
      else if (!s.rest){ s.vy -= 22 * dt; const g = ground(s.x, s.y + 0.4); if (s.y + s.vy * dt <= g + 0.1 && s.vy < 0){ s.y = g + 0.1; s.vy = -s.vy * 0.35; s.vx *= 0.5; if (Math.abs(s.vy) < 1){ s.vy = 0; s.vx = 0; s.rest = true; } } if (tileAt(Math.floor((s.x + s.vx * dt) / T), Math.floor(s.y / T)) === ROCK) s.vx = -s.vx * 0.4; }
      if (!s.rest){ s.x += s.vx * dt; s.y += s.vy * dt; }
      s.m.position.set(Math.round(s.x * PPU) / PPU, Math.round((s.y + (s.rest ? Math.sin(t * 4 + s.x * 3) * 0.04 : 0)) * PPU) / PPU, 0.21);
      if (s.t > 40){ s.on = false; s.m.visible = false; }
    }
  };
  // a cut: what is in front of the blade
  I.strike = (from, reach, evs) => { for (const it of list){ if (it.gone || it.type === 'thread' || (it.type === 'chest' && it.open)) continue; const ahead = (it.x - from.x) * from.face; if (ahead > -0.4 && ahead < reach + it.w && it.y + it.h > from.y - 0.2 && it.y < from.y + 2.7) give(it, evs); } };
  I.slam = (P, radius, evs) => { for (const it of list){ if (it.gone || it.type === 'thread' || (it.type === 'chest' && it.open)) continue; if (Math.abs(it.x - P.x) < radius + it.w && Math.abs(it.y - P.y) < 1.2) give(it, evs); } };
  // what he can use where he stands: a person to talk to, or a shut chest
  // the station he is beside, if any (for the place's name)
  I.people = people;   // for tests and checks
  I.station = P => { for (const N of people) if (Math.abs(N.x - P.x) < 4.5 && Math.abs(N.y - P.y) < 2.5) return N; return null; };
  I.near = P => { for (const N of people) if (Math.abs(P.x - N.x) < 1.3 && Math.abs(P.y - N.y) < 1.2) return N; for (const it of list) if (it.type === 'chest' && !it.open && Math.abs(P.x - it.x) < 1 && Math.abs(P.y - it.y) < 1) return it; return null; };
  I.open = (it, evs) => give(it, evs);
  // what is still to be found here
  I.left = () => ({ threads: list.filter(i => !i.gone && (i.type === 'thread' || (i.type === 'chest' && !i.open && i.holds === 'thread'))).length, chests: list.filter(i => i.type === 'chest' && !i.open).length, relic: list.some(i => i.type === 'chest' && !i.open && i.holds.startsWith('relic:')), all: list.filter(i => !i.gone && (i.type === 'thread' || (i.type === 'chest' && !i.open))) });
  return I;
}
