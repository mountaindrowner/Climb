// The Pilgrims' Cairns: the Spires' wing, west of the mountain's caves (docs/world.md, docs/phase11-sheet.md). Where
// pilgrims who turned back built a cairn before they went down, each stone a reason. Nine screens, set into the Spires
// by level.js (WINGS): three columns added to the west, under the open sky.
//   windgap    out of the eyrie's west wall onto the mountain's shoulder: a gap with the wind rising in it. Only the
//              Wyrm's wind crosses (a glide in the rising air, up onto the far cliff)
//   field      the cairn-field, two screens: a slope of terraces going down westward, cairns on every one
//   reasons    under the field, two screens: the way across is a line of flat stones over a drop. They hold while he
//              does not turn round
//   turned     a long slope: the Turned stands on it, facing downhill, and lets no one up past him. Uphill of him is
//              his cairn; downhill, a hole to the scree: the way out is always open
//   hiscairn   a cairn with his name on it, from before he fell. He can knock it down. The relic
//   scree      the scree run: down from the slope's foot to Ordric's hollow. From below it cannot be climbed
// Its rules. A cairn (the creature) is only stones while he looks at it; with his back to it, it comes apart and comes
// after him. The stones of the way (rooms.js FACED) are gone from under him if he turns round on them. So: on the
// ground, turn and face what follows; on the way, do not turn.
// All of it but the wind gap's near ledge and the scree has `gate: 'glide'`; the tests hold that none of that is reached without the Wyrm's wind.
import { room, rect, door, ledge, mark, EMPTY, ROCK, FACED } from '../rooms.js';

const TITLE = 'THE PILGRIMS\' CAIRNS';
const named = (fn, gate = 'glide', more = {}) => { const f = () => { const r = fn(); r.title = TITLE; r.gate = gate; Object.assign(r, more); return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const reason = (r, x, y, says) => deco(r, 'reason', x, y, { says });
const cave = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, r.w - 3, r.h - 3, EMPTY); return r; };

function windgap(){
  const r = room(); r.open = true;
  rect(r, 0, 0, 39, 1);                                            // the gap's floor: he can walk it, and climb back out to the east
  rect(r, 30, 2, 39, 4); rect(r, 36, 11, 39, 22);                  // the ledge outside the eyrie's wall, and the mountain's face over it
  rect(r, 0, 2, 9, 16); rect(r, 10, 15, 12, 16);                   // the far cliff, its lip leaning out: not climbed from below, nor leapt to
  mark(r, 'updraft', 13, 2, { w: 16, h: 20, gate: 'glide' });                     // the wind, rising in the gap
  reason(r, 33, 5, 'TOO COLD.'); deco(r, 'cairn', 5, 17); deco(r, 'cairn', 36, 5);
  mark(r, 'crystal', 20, 2); mark(r, 'urn', 24, 2);
  for (const x of [2, 4, 6, 8]) keep(r, x, 18);
  return r;
}
function field(){
  const r = room(2, 1); r.open = true;
  // terraces down the mountain's shoulder, westward; a horn of rock at the far end, and under it the way down
  rect(r, 60, 0, 79, 16); rect(r, 44, 0, 59, 12); rect(r, 28, 0, 43, 8); rect(r, 0, 0, 27, 4); rect(r, 0, 5, 2, 18);
  rect(r, 4, 0, 9, 4, EMPTY); ledge(r, 4, 9, 4);                   // boards over the way down to the reasons
  rect(r, 34, 9, 36, 19); mark(r, 'thread', 35, 20); mark(r, 'updraft', 37, 9, { w: 6, h: 13 });   // a needle of rock, and the wind beside it: for one who glides
  for (const [x, y] of [[70, 17], [52, 13], [46, 13], [22, 5], [14, 5]]) mark(r, 'cairn', x, y);
  for (const [x, y] of [[76, 17], [65, 17], [56, 13], [40, 9], [31, 9], [18, 5], [25, 5], [11, 5]]) deco(r, 'cairn', x, y);
  reason(r, 62, 17, 'NOT YET.'); reason(r, 49, 13, 'MY KNEE.'); reason(r, 29, 9, 'NOT ME.'); reason(r, 16, 5, 'THE WIND.');
  mark(r, 'urn', 73, 17); mark(r, 'urn', 20, 5); mark(r, 'crystal', 58, 13); mark(r, 'crystal', 7, 5);
  for (const x of [5, 8]) keep(r, x, 6);
  return r;
}
function reasons(){
  const r = cave(2, 1); door(r, 'top', 4, 9); for (const y of [22, 18, 14]) ledge(r, 4, 9, y);   // down from the field
  rect(r, 2, 2, 13, 12);                                           // where the way begins
  // the way: flat stones over the drop, at one height. The first lies against the ledge, over a step: there, turning
  // round costs nothing, and shows what it does
  for (const [a, b] of [[14, 16], [20, 23], [27, 30], [34, 37], [44, 65]]) rect(r, a, 12, b, 12, FACED);
  rect(r, 38, 2, 43, 12);                                          // a stack of rock halfway: there he may turn
  rect(r, 66, 2, 77, 12);                                          // where it ends; and the way down through it, to the slope
  rect(r, 70, 0, 75, 12, EMPTY); for (const y of [12, 8, 4, 0]) ledge(r, 70, 75, y);
  for (const y of [5, 9]){ ledge(r, 14, 16, y); ledge(r, 44, 46, y); }   // from the floor under the way, back up to it
  mark(r, 'cairn', 6, 13); mark(r, 'cairn', 41, 13);
  reason(r, 10, 13, 'NEXT YEAR.'); reason(r, 39, 13, 'THE CHILDREN.'); reason(r, 68, 13, 'IT IS ENOUGH TO HAVE SEEN IT.');
  for (const [x, y] of [[22, 2], [30, 2], [50, 2], [58, 2], [3, 13], [76, 13]]) deco(r, 'cairn', x, y);
  mark(r, 'torch', 5, 17); mark(r, 'torch', 40, 17); mark(r, 'torch', 73, 17); mark(r, 'crystal', 26, 2); mark(r, 'crystal', 54, 2); mark(r, 'urn', 34, 2); mark(r, 'chest', 62, 2, { holds: 'shards' });
  for (const x of [15, 21, 28, 35, 45, 52, 60]) keep(r, x, 14);
  return r;
}
const slopeTop = x => Math.round(14 - 12 * (x - 2) / 75);         // the Turned's slope: its top row at column x
function turned(){
  const r = cave(2, 1); for (let x = 2; x <= 77; x++) rect(r, x, 2, x, slopeTop(x));
  door(r, 'top', 30, 35); for (const y of [19, 15]) ledge(r, 30, 35, y);   // down from the reasons, onto the slope below him
  door(r, 'left', 15, 20);                                         // uphill, past him: his cairn
  rect(r, 70, 0, 75, 4, EMPTY);                                    // downhill: the hole to the scree. Nothing stops him leaving
  mark(r, 'turned', 20, slopeTop(20) + 1, { dir: 1 });
  reason(r, 44, slopeTop(44) + 1, 'GO DOWN.');
  for (const x of [8, 26, 38, 52, 60]) deco(r, 'cairn', x, slopeTop(x) + 1);
  mark(r, 'torch', 6, 18); mark(r, 'torch', 40, 14); mark(r, 'torch', 66, 9); mark(r, 'crystal', 56, slopeTop(56) + 1);
  for (const x of [30, 32, 34]) keep(r, x, 13); for (const x of [4, 8, 12, 16, 20, 24]) keep(r, x, 17);
  return r;
}
function hiscairn(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 15, 37, 20, EMPTY); door(r, 'right', 15, 20);
  mark(r, 'hiscairn', 14, 15); mark(r, 'chest', 6, 15, { holds: 'relic:turnstone' });
  for (const x of [22, 28, 33]) deco(r, 'cairn', x, 15);
  mark(r, 'crystal', 10, 15); mark(r, 'torch', 20, 18); mark(r, 'torch', 34, 18);
  for (const x of [6, 10, 14, 18]) keep(r, x, 17);
  return r;
}
function scree(){
  const r = cave(); door(r, 'top', 30, 35); door(r, 'right', 12, 17);
  rect(r, 20, 2, 35, 9); rect(r, 36, 2, 37, 11);   // the bank of scree he comes down onto (high enough that the drop does not hurt), and down from it to the door; from it the hole is out of reach
  ledge(r, 16, 19, 5);                                             // from the floor beside it back up onto the bank
  mark(r, 'chest', 6, 2, { holds: 'shards' });
  for (const [x, y] of [[10, 2], [15, 2], [23, 10]]) deco(r, 'cairn', x, y);
  mark(r, 'torch', 4, 9); mark(r, 'torch', 24, 12); mark(r, 'urn', 12, 2); mark(r, 'crystal', 17, 2);
  for (const x of [30, 32, 34]) for (const y of [12, 16, 19]) keep(r, x, y);
  return r;
}

// set into the Spires: three columns to the west of it (as the region counts cells: the caves are column 0), from the
// eyrie's height down to the hollow's. Under and beside its rooms is the mountain's rock
export const wing = { left: 3, build(X){
  const ey = X.roomOf('eyrie'), ho = X.roomOf('hollow'); if (!ey || !ho) return;
  const row = Math.round((ey.ty0 - X.Y0) / 23), low = Math.round((ho.ty0 - X.Y0) / 23), x1 = X.X0;
  for (let y = X.Y0; y < X.Y0 + (row - 1) * 23; y++) for (let x = 0; x < x1; x++) X.set(x, y, ROCK);   // the shoulder itself
  for (let y = X.Y0 + (row - 1) * 23; y < X.Y0 + row * 23; y++) for (let x = x1 - 40; x < x1; x++) X.set(x, y, ROCK);   // under the wind gap
  X.addRoom(-1, row, named(windgap, '', { open: true }), { open: true });   // anyone may come out onto the ledge and look across
  X.addRoom(-3, row, named(field, 'glide', { open: true }), { open: true });
  X.addRoom(-3, row - 1, named(reasons));
  X.addRoom(-2, row - 2, named(turned));
  X.addRoom(-3, row - 2, named(hiscairn));
  X.addRoom(-1, low, named(scree, ''));
  // the two doors in the mountain's own wall: out of the eyrie (over the step at its west end), and into the hollow
  const cut = (R, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = R.tx0; x < R.tx0 + 6; x++){ if (x >= R.tx0 + 2 && X.at(x, R.ty0 + y) !== ROCK) break; X.set(x, R.ty0 + y, EMPTY); } };
  cut(ey, 5, 10); cut(ho, 12, 17);
} };
export const QUIET = ['hiscairn'];

// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // a cairn: a few flat stones, one on another
  cairn(g, x, y, r){ const n = 3 + Math.floor(r() * 3); let w = 9 + Math.floor(r() * 4), yy = y; for (let k = 0; k < n; k++){ const h = 2 + (r() < 0.4 ? 1 : 0), off = Math.floor(r() * 3) - 1; px(g, PAL.ink, x - Math.floor(w / 2) + off - 1, yy - h - 1, w + 2, h + 1); px(g, k % 2 ? PAL.mid : PAL.light, x - Math.floor(w / 2) + off, yy - h, w, h); px(g, PAL.pale, x - Math.floor(w / 2) + off, yy - h, Math.max(1, w - 3), 1); yy -= h; w = Math.max(3, w - 2 - Math.floor(r() * 2)); } },
  // a stone with words scratched on it (main.js says them when he stands by it)
  reason(g, x, y, r){ px(g, PAL.ink, x - 5, y - 9, 11, 9); px(g, PAL.mid, x - 4, y - 8, 9, 8); px(g, PAL.light, x - 4, y - 8, 9, 1); px(g, PAL.ink, x - 3, y - 10, 7, 1); px(g, PAL.light, x - 2, y - 9, 5, 1); for (let k = 0; k < 3; k++){ const a = Math.floor(r() * 2); px(g, PAL.pale, x - 3 + a, y - 6 + k * 2, 5 - a + Math.floor(r() * 2), 1); } },
});

// ---- who is in it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
let STONE = null;
const stoneTex = T3 => { if (STONE) return STONE; const c = document.createElement('canvas'); c.width = 12; c.height = 5; const g = c.getContext('2d'), f = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  f('#181425', 1, 0, 10, 5); f('#181425', 0, 1, 12, 3); f('#8b9bb4', 1, 1, 10, 3); f('#c0cbdc', 2, 1, 7, 1); f('#5a6988', 2, 3, 9, 1); f('#5a6988', 9, 2, 2, 1);
  const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return (STONE = t); };
// a stack of stones as its own picture: n stones, the widest lowest. `loose`: they tumble along after it
function stones(e, c, n, dt, loose){
  const T3 = three(); if (!T3) return;
  if (!e.g){ e.g = []; let w = 0.5 + n * 0.11, y = 0; for (let k = 0; k < n; k++){ const h = 0.3, m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: stoneTex(T3), transparent: true, alphaTest: 0.5 })); c.E.scene.add(m);
      e.g.push({ m, w, at: y + h / 2, off: ((k * 37) % 5 - 2) * 0.03, x: e.x, y: e.y + y + h / 2, r: 0 }); y += h - 0.02; w = Math.max(0.3, w - 0.11); }
    if (e.d.rag){ const m = new T3.Mesh(new T3.PlaneGeometry(0.16, 0.5), new T3.MeshBasicMaterial({ color: 0xe43b44 })); c.E.scene.add(m); e.rag = m; } }
  e.g.forEach((s, k) => { const tx = loose ? e.x - e.face * k * 0.34 : e.x + s.off, ty = loose ? e.y + 0.2 + Math.abs(Math.sin(e.tm * 10 + k * 1.3)) * 0.55 : e.y + s.at, u = Math.min(1, dt * (loose ? 14 : 10));
    s.x += (tx - s.x) * u; s.y += (ty - s.y) * u; s.r = loose ? s.r + dt * 8 * (k % 2 ? 1 : -1) : s.r * (1 - u); s.m.position.set(s.x, s.y, 0.035 + k * 0.0005); s.m.rotation.z = s.r; s.m.material.color.setHex(e.flash > 0 ? 0xffffff : loose ? 0xffe8d8 : 0xdfe4ee); });
  if (e.rag){ const top = e.g[e.g.length - 1]; e.rag.position.set(top.x + 0.12, top.y - 0.1 + Math.sin(e.age * 3) * 0.03, 0.04); e.rag.rotation.z = 0.2 + Math.sin(e.age * 2.3) * 0.15; }
}
const scatter = e => { if (e.g) for (const s of e.g) s.m.visible = false; if (e.rag) e.rag.visible = false; };
export const enemies = {
  // a cairn: only stones while he looks at it. With his back to it, it comes apart and comes after him, tumbling; it
  // strikes what it reaches. Looked at, it is a cairn again where it stands, and can be knocked down
  cairn: { ai: 'cairn', own: true, hp: 3, w: 0.55, h: 1.5, color: 0x8b9bb4, wake: 9, chase: 4.2, fly: false, word: 'Struck by stones',
    guard(e){ return e.st === 'loose'; }, onKill: scatter },
  // the Turned: the wing's elite. A climber who turned back, standing on the slope facing downhill. He strikes only at
  // what comes up at him: a shove that sends it back down, and his staff brought down, which sends a rush of stones
  // down the slope. Behind him he does nothing. Walk away from him and he lets it go
  turned: { ai: 'turned', hp: 24, w: 0.8, h: 3.4, color: 0x5a6988, wake: 12, reach: 3.0, windup: 0.5, bar: 0.9, dmg: 2, wave: 9, waveLife: 1.5, art: 'px_turned', fly: false, word: 'Sent down',
    onHit(e, dmg, P){ if (P && (P.x - e.x) * e.dirn < 0) e.hp -= 1; } },   // a blow from behind counts for more: he does not turn
  // his own cairn, from before he fell: not a creature. It stands until he knocks it down (main.js says what it is)
  hiscairn: { ai: 'hiscairn', own: true, prop: true, rag: true, hp: 3, w: 0.7, h: 2.1, color: 0x8b9bb4, fly: false,
    onKill: scatter, spawn(e, c){ if (c.RULE.down){ e.alive = false; } } },
};
export const ai = {
  cairn(e, P, dt, c){
    const d = e.d, { dx, dy, go, events } = c, watched = Math.sign(e.x - P.x) === P.face || Math.abs(dx) < 0.25, near = Math.abs(dx) < d.wake && Math.abs(dy) < 3.5;
    if (e.st === 'idle'){ e.warn = false; if (near && !watched && Math.abs(dx) > 1.2){ go('loose'); e.face = Math.sign(dx) || 1; events.push({ type: 'notice', e }); } }
    else if (e.st === 'loose'){ e.face = Math.sign(dx) || e.face; const gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy; const nx = e.x + e.face * d.chase * dt;
      if (Math.abs(dx) > 0.3 && !c.solidAt(nx + e.face * d.w, e.y + 0.3) && c.ground(nx, e.y + 0.3) > e.y - 0.6) e.x = nx;
      if (watched || !near) go('settle');
      else if (Math.abs(dx) < d.w + 0.34 && c.hit(e.x - d.w, e.y, e.x + d.w, e.y + 1.0, d.word, e.x)) go('settle'); }
    else if (e.st === 'settle'){ if (e.tm > 0.4){ go('idle'); e.home.x = e.x; e.home.y = e.y; } }
    else go('idle');
    stones(e, c, 5, dt, e.st === 'loose');
  },
  hiscairn(e, P, dt, c){ e.st = 'idle'; stones(e, c, 7, dt, false); },
  turned(e, P, dt, c){
    const d = e.d, { dx, dy, go, events } = c; e.face = e.dirn; const gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy; e.n = e.n || 0;
    const front = dx * e.face > 0.3, level = Math.abs(dy) < 4.5, coming = front && level && Math.abs(dx) < d.wake && (P.face === -e.face || P.vx * e.face < -0.5);
    // the rush of stones, running down the slope from his staff: jump it
    if (e.wv){ const w = e.wv; w.t += dt; w.x += e.face * d.wave * dt; const wy = c.ground(w.x, w.y + 1.2); if (wy > -Infinity) w.y = wy; c.fx.dust({ x: w.x, y: w.y }, 2, 2.4);
      if (!w.hit && Math.abs(P.x - w.x) < 0.6 && P.y < w.y + 0.7 && P.y > w.y - 0.8 && !c.isRollInv(P)){ w.hit = true; if (c.hurt(P, 1, w.x - e.face, d.word)) P.vx = e.face * 9; }
      if (w.t > d.waveLife || c.solidAt(w.x + e.face * 0.4, w.y + 0.3)) e.wv = null; }
    // he is in the way: what comes up at him on its feet does not get by (a roll goes through him; so does a leap over his head)
    if (front && Math.abs(dx) < d.bar && P.y < e.y + d.h - 0.4 && P.y + P.h > e.y && !c.isRollInv(P)){ P.x = e.x + e.face * d.bar; if (P.vx * e.face < 0) P.vx = 0; }
    const close = Math.abs(dx) < d.reach + Math.max(0, -P.vx * e.face) * 0.3;   // one who runs at him is met sooner
    if (e.st === 'idle'){ e.warn = false; c.anim(e, 'stand', 0); if (coming){ go('bar'); events.push({ type: 'notice', e }); } }
    else if (e.st === 'bar'){ c.anim(e, 'stand', 0);
      if (!front || !level || Math.abs(dx) > d.wake + 3 || (P.face === e.face && P.vx * e.face >= 0 && e.tm > 0.3)) go('idle');   // behind him, gone, or walking away: he lets it go
      else if (close && e.tm > 0.15){ go('wind'); events.push({ type: 'tell', e }); }
      else if (e.tm > 0.45){ if (Math.abs(dx) < d.reach){ go('wind'); events.push({ type: 'tell', e }); } else if (e.n % 2 === 1 || e.tm > 1.5){ go('lift'); events.push({ type: 'tell', e }); } } }
    else if (e.st === 'wind'){ e.warn = true; c.anim(e, 'attack', Math.min(0.45, e.tm / d.windup * 0.45)); if (e.tm >= d.windup){ go('shove'); e.hitDone = false; } }
    else if (e.st === 'shove'){ e.warn = false; c.anim(e, 'attack', Math.min(0.99, 0.45 + e.tm / 0.3 * 0.54));
      if (!e.hitDone && e.tm > 0.05){ e.hitDone = true; const x0 = e.face > 0 ? e.x : e.x - d.reach - 0.4;
        if (P.x + 0.34 > x0 && P.x - 0.34 < x0 + d.reach + 0.4 && P.y + P.h > e.y && P.y < e.y + 3.2 && !c.isRollInv(P)){
          if (P.blocking && P.face === -e.face){ events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); P.vx = e.face * 8; }   // turned on his guard, it still moves him
          else if (c.hurt(P, d.dmg, e.x, d.word)){ P.vx = e.face * 13; P.vy = 6; } } }
      if (e.tm > 0.7){ e.n++; go('bar'); } }
    else if (e.st === 'lift'){ e.warn = true; c.anim(e, 'sweep', Math.min(0.5, e.tm / 0.7 * 0.5)); if (e.tm >= 0.7){ go('slam'); e.wv = { x: e.x + e.face * 1.2, y: e.y, t: 0, hit: false }; events.push({ type: 'crack', e, at: { x: e.x + e.face * 1.2, y: e.y } }); } }
    else if (e.st === 'slam'){ e.warn = false; c.anim(e, 'sweep', Math.min(0.99, 0.5 + e.tm / 0.35 * 0.49)); if (e.tm > 0.8){ e.n++; go('bar'); } }
    else go('idle');
  },
};
