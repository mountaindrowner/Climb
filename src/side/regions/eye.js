// The Eye of the Storm: the Tempest's wing, east of the masthead and above it (docs/world.md, docs/phase12-sheet.md).
// The middle of the storm, where it is still. The Thunderhead sat here before it came down to fight. Seven screens, set
// into the Tempest by level.js (WINGS): three columns added to the east.
//   wall     two screens, one over the other: the storm's wall. In at its foot from the masthead; up it only on the
//            wind (the Wyrm's wind: a glide in rising air); down it by the rungs in its face. The seat's way out
//            comes down into its top
//   stilla   the still, two screens: a door of cloud across it
//   stillb   the still, two screens more, over the first: two doors of cloud
//   seat     the Thunderhead's seat, empty. A relic, behind a door of cloud. A floor of cloud: the way out, for one
//            who stands still on it
// Its rule (rooms.js CALM; level.js RULE.hush, RULE.open). It is quiet here, and nothing moves while he moves. The Hush
// move only while he stands still. A door of cloud opens only to one who has stood still before it, long enough; then
// it is open a little while. So he must wait, and what is in the room comes for him while he does.
import { room, rect, door, ledge, mark, cave, EMPTY, ROCK, CALM } from '../rooms.js';

const TITLE = 'THE EYE OF THE STORM';
const named = (fn, gate = 'glide') => { const f = () => { const r = fn(); r.title = TITLE; r.gate = gate; r.look = 'eye'; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
// a door of cloud in a wall across the room: the wall from floor to roof at x..x+3, the door at its foot
const cloudDoor = (r, x) => { rect(r, x, 2, x + 3, r.h - 3); rect(r, x, 2, x + 3, 7, CALM); for (const dx of [-3, -2, -1, 4, 5, 6]) for (const y of [3, 5]) keep(r, x + dx, y); };

function wall(){
  const r = cave(1, 2); door(r, 'left', 2, 7); door(r, 'right', 35, 40); door(r, 'top', 30, 35);
  rect(r, 28, 2, 37, 34);                                          // the storm's wall: sheer, to the landing at its top
  mark(r, 'updraft', 6, 2, { w: 18, h: 34, gate: 'glide' });       // the wind in it: it dies just over the landing (any higher and it would throw him up through the seat's floor, past both stills)
  ledge(r, 24, 27, 13); ledge(r, 24, 27, 24);                     // rungs in its face, out of the wind: too far apart to climb (eleven tiles: a double jump is seven), near enough to come down by
  mark(r, 'torch', 4, 10); mark(r, 'torch', 4, 28); mark(r, 'crystal', 20, 2); mark(r, 'urn', 24, 2);
  for (const x of [30, 33, 36]) for (const y of [36, 39]) keep(r, x, y);
  return r;
}
function stilla(){
  const r = cave(2, 1); door(r, 'left', 12, 17); door(r, 'top', 70, 75); for (const y of [5, 9, 13, 17, 21]) ledge(r, 70, 75, y);
  rect(r, 2, 2, 12, 11); rect(r, 13, 2, 16, 7); rect(r, 17, 2, 19, 4);   // in from the wall's top, and down to the still's floor
  cloudDoor(r, 40);
  mark(r, 'hush', 26, 3); mark(r, 'hush', 56, 3); mark(r, 'hush', 66, 7);   // the first hangs by the way to the door: he walks past it, and it lets him
  for (const [k, x, y] of [['cloudbank', 30, 2], ['cloudbank', 58, 2]]) deco(r, k, x, y);
  mark(r, 'crystal', 24, 2); mark(r, 'crystal', 50, 2); mark(r, 'urn', 62, 2);
  return r;
}
function stillb(){
  const r = cave(2, 1); door(r, 'bottom', 70, 75); ledge(r, 70, 75, 1); door(r, 'left', 2, 7);
  cloudDoor(r, 50); cloudDoor(r, 26);
  mark(r, 'hush', 62, 3); mark(r, 'hush', 40, 6); mark(r, 'hush', 36, 3); mark(r, 'hush', 14, 3);
  mark(r, 'chest', 60, 2, { holds: 'shards' });
  for (const [k, x, y] of [['cloudbank', 38, 2], ['cloudbank', 14, 2]]) deco(r, k, x, y);
  mark(r, 'crystal', 66, 2); mark(r, 'crystal', 44, 2); mark(r, 'urn', 20, 2);
  return r;
}
function seat(){
  const r = cave(); door(r, 'right', 2, 7); rect(r, 30, 0, 35, 1, CALM);   // in from the still. The way out: a floor of cloud, over the wall's top. It bears one who walks; it lets go of one who stands still on it. From below it is rock (a hole there could be jumped up into from the wall's landing, past both stills)
  rect(r, 9, 2, 10, 20); rect(r, 9, 2, 10, 7, CALM); for (const dx of [2, 3, 4]) for (const y of [3, 5]) keep(r, 10 + dx, y);   // what is kept here, behind a door of cloud
  mark(r, 'chest', 5, 2, { holds: 'relic:stillair' });
  deco(r, 'seat', 20, 2); mark(r, 'hush', 24, 8); mark(r, 'hush', 16, 6);
  mark(r, 'crystal', 13, 2); mark(r, 'crystal', 26, 2);
  for (const x of [31, 34]) for (const y of [3, 6]) keep(r, x, y);
  return r;
}

// set into the Tempest: three columns to the east of it (as the region counts cells: the masthead is column 2), from
// the masthead's height to the top of the storm
export const wing = { right: 3, build(X){
  const ma = X.roomOf('masthead'); if (!ma) return; const col = Math.round((ma.tx0 - X.X0) / 40), row = Math.round((ma.ty0 - X.Y0) / 23);
  for (let y = X.Y0; y < X.H; y++) for (let x = ma.tx1; x < X.W; x++) X.set(x, y, ROCK);   // east of the Tempest it is the storm's own body: nothing to stand on that is not a room
  X.addRoom(col + 1, row, named(wall, ''), { wing: true });        // anyone may come to the wall's foot and look up it
  X.addRoom(col + 2, row + 1, named(stilla), { wing: true });
  X.addRoom(col + 2, row + 2, named(stillb), { wing: true });
  X.addRoom(col + 1, row + 2, named(seat), { wing: true });
  for (let y = 2; y <= 7; y++) for (let x = ma.tx1 - 1; x >= ma.tx1 - 6; x--){ if (x < ma.tx1 - 2 && X.at(x, ma.ty0 + y) !== ROCK) break; X.set(x, ma.ty0 + y, EMPTY); }   // the door, in the masthead's east wall
} };
export const QUIET = [];

// ---- its look: clear, pale, too bright
export const looks = {
  eye: {
    stone: { edge: 'mid', topEdge: 'white', lip: 'white', lip2: 'pale', lipD: 4, lip2D: 5, a: 'white', aSeam: 'pale', b: 'pale', bSeam: 'light', c: 'light', core: 'mid', seam: 'strata', band: [10, 14, 18] },
    moss: { c: ['white', 'white', 'pale'], p: 0.3 }, plank: ['pale', 'white', 'light', 'pale'], spike: ['cyan', 'white'],
    ceilLow: [['icicle', 1]], ceil: [['icicle', 1]], floorWall: ['drift'], floorOpen: ['drift'], gem: 'crystal',
    back: { cols: ['pale', 'light', 'white'], dim: [1, 1, 1], hole: -9, holeOpen: -9, stand: [['pillar', 1]], hang: [['icicle', 1]], pStand: 0, pHang: 0 },
    far: { img: 'spires', raw: true }, hemi: [0xffffff, 0xe8f0ff, 1.12], shaft: null, bloom: [0.9, 0.4],
    amb: [1.05, 1.05, 1.08], mist: { col: 'white', col2: 'pale', a: 0.18, drift: 0.04 }, fore: 'spires',
    air: { n: 16, cols: [0xffffff], warm: 0.5, vx: 0, vy: [-0.05, 0.05], steady: true },
  },
};
// ---- what stands in it, painted
export const decoDef = (px, PAL) => ({
  // a bank of cloud on the floor
  cloudbank(g, x, y, r){ for (let k = 0; k < 7; k++){ const a = Math.floor(r() * 25) - 12, w = 6 + Math.floor(r() * 8), h = 2 + Math.floor(r() * 4); px(g, PAL.pale, x + a - 1, y - h - 1, w + 2, h + 1); px(g, PAL.white, x + a, y - h, w, h); } },
  // the Thunderhead's seat: a high-backed seat of cloud, empty
  seat(g, x, y){ px(g, PAL.light, x - 9, y - 30, 19, 30); px(g, PAL.white, x - 8, y - 29, 17, 28); px(g, PAL.pale, x - 6, y - 26, 13, 14); px(g, PAL.light, x - 12, y - 12, 25, 12); px(g, PAL.white, x - 11, y - 11, 23, 10); px(g, PAL.pale, x - 8, y - 9, 17, 2); for (const a of [-13, 12]){ px(g, PAL.light, x + a, y - 18, 3, 18); px(g, PAL.white, x + a + 1, y - 17, 1, 16); } },
});
// ---- who is in it
export const CALMS = { wait: 2.5, open: 4, near: 4.5, grace: 0.2, ease: 0.5 };   // wait: seconds he must stand still by a door of cloud; open: seconds it is open then; near: how near (world units); grace: how long he must be still before the Hush stir; ease: how fast his waiting is lost while he moves (of 1)
export const enemies = {
  // the Hush: a piece of the storm with nothing left in it. It does not move while he moves. While he stands still it
  // comes for him, without a sound; it strikes, and draws off a while. A guard turned to it stops it. It can be cut at
  // any time: frozen, it is only cloud
  hush: { ai: 'hush', hp: 2, w: 0.5, h: 0.9, color: 0xf4f8ff, speed: 3.4, back: 3.2, rest: 1.5, sense: 12, art: 'px_hush', fly: true, glow: 0x8fa8c8, word: 'Hushed' },
};
export const ai = {
  hush(e, P, dt, c){
    const d = e.d; e.fr = e.fr || 0; if (!e.rm) e.rm = (c.rooms || []).find(r => e.home.x >= r.x0 && e.home.x < r.x1 && e.home.y >= r.y0 && e.home.y < r.y1) || { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 };
    const here = P.x > e.rm.x0 && P.x < e.rm.x1 && P.y > e.rm.y0 - 0.5 && P.y < e.rm.y1, still = here && (c.RULE.hush || 0) > CALMS.grace;   // it stirs only for one who stands still in its own room
    if (e.st === 'back'){ if (e.tm < 0.8){ const a = Math.atan2(e.y - (P.y + 1.2), e.x - P.x); e.x += Math.cos(a) * d.back * dt; e.y += Math.sin(a) * d.back * dt; } if (e.tm > d.rest) c.go('idle'); }
    else if (still && c.dist < d.sense){ if (e.st !== 'come'){ c.go('come'); if (!e.told){ e.told = true; c.events.push({ type: 'notice', e }); } }
      const tx = P.x, ty = P.y + 1.2, L = Math.hypot(tx - e.x, ty - e.y) || 1, s = Math.min(L, d.speed * dt); e.x += (tx - e.x) / L * s; e.y += (ty - e.y) / L * s; e.face = Math.sign(tx - e.x) || e.face; e.fr = (e.fr + dt * 1.2) % 1;
      if (L < 0.7 && !c.isRollInv(P)){ if (P.blocking && P.face === (Math.sign(e.x - P.x) || P.face)){ e.flash = 0.08; c.events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); c.go('back'); } else if (c.hurt(P, 1, e.x, d.word)) c.go('back'); } }   // it breaks on a raised guard, and draws off
    else if (e.st !== 'idle') c.go('idle');
    c.anim(e, 'float', e.fr);
  },
};
