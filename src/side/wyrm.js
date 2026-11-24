// The Rime Wyrm: the Spires' boss, and the last thing between him and the top. A serpent of ice that keeps the summit:
// a head with a jaw, a body of rings that follow where the head has been, a tail. A puppet of flat pieces
// (tools/boss-parts.py), moved here: the head steers after a point, the rings trail along its path.
// Its hall is the broken pass (build 97, docs/wyrm-sheet.md): three levels (the pass, a shelf at each horn and each side
// of the middle, a slab high over the middle), and in the middle of the pass the gap he came up by, which is cloud while
// it fights: a fall into it costs a heart and puts him back on the pass. Each of its attacks takes one level from him:
//   frost    it hangs at one end and draws breath (snow streams into its jaws), then breathes frost along the whole pass:
//            ice stands on it three seconds. Be on a shelf or the slab. Its head is low and still: strike it from a shelf
//   pass     it leaves the hall; a line of driven snow shows which level; it comes back through the hall along that
//            level, the whole width. Be on another
//   shards   it rears, three motes in its jaws, and spits three shards of ice at him, one after another. Each cracks
//            where it lands, and leaves a spike there a second. A shard cut (or guarded) goes back at its head
//   plunge   it climbs over him, follows (a red mark), and drives its head into the first thing under it: get out from
//            under. Its head is caught in the ice a while: that is when to cut it. From half health the blow, on the
//            pass, throws spikes of ice up out of it, away to both sides
//   up       (from half health) it dives into the cloud; the cloud boils; it comes straight up out of the gap, and
//            arcs away to one side. Stay off the gap's edges
// From half health the wind blows along the pass between its attacks, toward the gap; and a breath is followed at once
// by a pass. // It wakes when he stands on the summit, and starts over if he dies. Only its head can hurt him or be hurt.
// Its coming (the rise, after entrance.js has frozen the way out and the wind has dropped), harmless all through:
//   far      0 - 1.4 s    small, far off in the haze over the peaks, circling; it banks, cries, and turns on him,
//                         growing, up out of the top of the view
//   pass     1.3 - 2.6    in again huge and fast from the right, low over the summit past him, snow torn up under it
//   circle   2.6 - 3.85   up round the left, over the top of the view, and down the right onto the summit: a blow
//   coil     3.85 - 4.55  along the summit, and up: it rears over it, its body lying back along the ground
//   roar     4.55 - 5.5   it throws its head back, then down at him, jaws wide: a blast of frost (its name and its
//                         music come here: B.revealAt, for entrance.js), ice up out of the ground short
//                         of his feet, frost rolling over him
//   then     5.5 - 5.8    its jaws shut, the ice breaks, and it comes up to fight
import { T, LEVEL, ROCK, LEDGE, EMPTY } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { tex, glow, additive } from './boss.js';
import { lit as litMat } from './render.js';
import { sfx } from '../audio/sfx.js';
const THREE = window.THREE;
// the rise's moments (seconds of B.tm); the ways it goes, as [time, x, y(, size)]: the near one from the summit's middle
// and floor, the far one from the middle of the view
export const RISE = { far: 1.42, cry: 0.62, near: 1.3, past: 1.95, down: 3.85, rear: 4.55, roar: 4.75, done: 5.5, end: 5.8 };
const NEAR = [[1.3, 15, 14], [1.7, 5, 6.8], [2.0, -5.5, 3.7], [2.3, -12, 5.2], [2.6, -13, 8.4], [2.95, -6.5, 9.3], [3.3, 3, 8.9], [3.6, 7.8, 6.4],
  [3.85, 7.0, 1.7], [4.08, 4.6, 1.4], [4.22, 2.8, 2.4], [4.4, 2.5, 6.0], [4.55, 1.4, 8.0]];
const FAR = [[0, -4.0, 3.0, 0.14], [0.3, -0.5, 4.2, 0.15], [0.55, 3.0, 4.0, 0.16], [0.75, 5.2, 2.6, 0.18], [0.95, 3.6, 1.4, 0.22], [1.12, 0.8, 2.4, 0.33], [1.27, -0.6, 4.6, 0.55], [1.42, -1.2, 8.6, 1.0]];
// a smooth way through keys [t, ...values] at their times: a cubic through each pair, its slope from its neighbours;
// before the first, on along its first heading; after the last, held there
function track(K, t){
  const n = K.length, tan = i => { const a = K[Math.max(0, i - 1)], b = K[Math.min(n - 1, i + 1)], d = b[0] - a[0]; return a.map((v, k) => (b[k] - v) / d); };
  if (t <= K[0][0]){ const m = tan(0), d = t - K[0][0]; return K[0].map((v, k) => v + m[k] * d); }
  if (t >= K[n - 1][0]) return K[n - 1].slice();
  let i = 0; while (K[i + 1][0] < t) i++;
  const a = K[i], b = K[i + 1], h = b[0] - a[0], u = (t - a[0]) / h, ma = tan(i), mb = tan(i + 1), u2 = u * u, u3 = u2 * u;
  return a.map((v, k) => (2 * u3 - 3 * u2 + 1) * v + (u3 - 2 * u2 + u) * h * ma[k] + (3 * u2 - 2 * u3) * b[k] + (u3 - u2) * h * mb[k]);
}
export const WYRM = {
  name: 'The Rime Wyrm', hp: 38, phase2: 0.5,
  rings: ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'm', 'm', 'm', 'm', 'm', 's', 's', 's', 's'], gap: { l: 1.1, m: 0.9, s: 0.7 },   // close enough to overlap: one body, not beads
  headR: 1.15,
  cruise: 9, turn: 5,                                  // how fast it flies, how sharply it comes round
  levels: [0, 3.5, 6.5],                               // the pass, the shelves, the slab: their tops over the pass
  fall: 1,                                             // what a fall into the cloud costs
  frost: { tell: 0.8, time: 3, spread: 0.55, hang: [13, 5.5], step: 0.62 },
  pass: { tell: [1.0, 0.8], speed: [20, 24], over: 1.1, his: 0.7 },   // his: how often it takes the level he is on
  shards: { tell: 0.5, n: 3, every: 0.35, speed: 16, stand: 1.0, back: 2, high: 9 },
  plunge: { aim: [1.0, 0.8], high: 9.5, dive: 34, stuck: [1.9, 1.35], pull: 0.7, reach: 1.7 },
  spikes: { n: 5, step: 2.3, lag: 0.13, warn: 0.4, up: 0.45 },
  up: { tell: 0.8, speed: 26, from: 7, to: 12, edge: 1.3 },
  wind: { on: 1.3, off: 1.7, push: 2.6 },
  cd: [1.4, 0.8],
};
const W = WYRM;

export function makeWyrm(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'crown'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 4, xMax = room.x1 - 4, lair = { x: room.x1 + 8, y: stageY - 6 };
  // the gap in the pass (the way he came up): the columns open under the floor's top row. While it fights, the cloud: the
  // seal the hall shut with (entrance.js, its mouth's two rows) is cut back to its lower row, so he drops into it
  const tx0 = Math.round(room.x0 / T), j1 = mk.y - 1, j0 = mk.y - 2, tile = (i, j) => LEVEL.tiles[j * LEVEL.W + i], cols = [];
  for (let i = tx0 + 4; i < Math.round(room.x1 / T) - 4; i++) if (tile(i, j0) === EMPTY) cols.push(i);
  const gx0 = cols.length ? cols[0] * T : cx, gx1 = cols.length ? (cols[cols.length - 1] + 1) * T : cx, gx = (gx0 + gx1) / 2;
  const cleft = on => { for (const i of cols){ const k = j1 * LEVEL.W + i;
    if (on){ if (tile(i, j0) === ROCK && LEVEL.tiles[k] !== EMPTY) LEVEL.tiles[k] = EMPTY; }
    else if (LEVEL.tiles[k] === EMPTY) LEVEL.tiles[k] = tile(i, j0) === ROCK ? ROCK : LEDGE; } };
  // the first thing under a point he (or its head) would stand on
  const floorUnder = (x, y) => { const i = Math.floor(x / T); for (let j = Math.floor(y / T); j >= j0; j--){ const t = tile(i, j); if (t === ROCK || t === LEDGE) return (j + 1) * T; } return stageY; };
  // nothing between two points a shard could hit
  const clearTo = (x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25); for (let k = 0; k < n; k++){ const t = tile(Math.floor((x0 + (x1 - x0) * k / n) / T), Math.floor((y0 + (y1 - y0) * k / n) / T)); if (t === ROCK || t === LEDGE) return false; } return true; };
  const levelOf = y => y > stageY + W.levels[2] - 1.5 ? 2 : y > stageY + W.levels[1] - 1.2 ? 1 : 0;
  const B = { name: W.name, hint: 'Strike its head when it is stuck in the ice, or from a shelf while it breathes.', rage: 'Now the mountain falls on you too.', fell: 'The pass is open.',
    view: { x0: room.x0, x1: room.x1, y0: room.y0 - 2.2, y1: room.y1 },   // the camera's box: lower than the hall, so the bar along the foot of the screen is under the pass, not over it
    st: 'dormant', tm: 0, hp: W.hp, phase: 1, flash: 0, cd: 1.5, room, stageY, cx, mode: 'circle', mt: 0, acts: 0,
    h: { x: lair.x, y: lair.y, vx: -1, vy: 0, a: Math.PI }, trail: [], jaw: 0, spikes: [], shards: [], gone: 0, gap: { x0: gx0, x1: gx1, x: gx }, wt: 0, last: '', frost: [], rz: {}, revealAt: RISE.roar };   // its name and its music on the roar (entrance.js)
  const piece = (file, z) => { const t = tex(`assets/side/wyrm/${file}.png`), m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), litMat({ map: t, normalMap: tex(`assets/side/wyrm/${file}_n.png`), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); m.position.z = z; m.visible = false; scene.add(m); return m; };
  const SIZE = { l: [34, 41], m: [28, 35], s: [22, 29], head: [70, 46], jaw: [46, 16], tail: [34, 16] };
  const rings = W.rings.map((k, i) => ({ k, m: piece('ring_' + k, -0.6 - i * 0.004), x: lair.x, y: lair.y }));
  const tail = piece('tail', -0.7), jaw = piece('jaw', -0.52), head = piece('head', -0.5);
  for (const [m, k] of [[head, 'head'], [jaw, 'jaw'], [tail, 'tail'], ...rings.map(r => [r.m, r.k])]) m.scale.set(SIZE[k][0] / 16, SIZE[k][1] / 16, 1);
  let total = 0; for (const r of rings){ total += W.gap[r.k]; r.d = total; } const tailD = total + 0.9;
  const eyeLight = new THREE.PointLight(0x9fefff, 0, 6, 1.5); scene.add(eyeLight);   // its eye lights its own snout and the rings behind
  const eyeTex = glow('rgba(160,250,255,1)'), warnTex = glow('rgba(255,60,50,1)');
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), additive(eyeTex, 0x7ff6ff, 0)); scene.add(eye);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), additive(eyeTex, 0x8ff0ff, 0)); scene.add(halo);
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.1), additive(warnTex, 0xff5040, 0)); scene.add(warn);
  const markGeo = new THREE.PlaneGeometry(1.4, 0.6);
  // a spike of ice out of the ground: a narrow blade, drawn as two flat triangles' worth of plane
  const spikeGeo = new THREE.BufferGeometry(); spikeGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.45, 0, 0, 0.45, 0, 0, 0, 2.1, 0], 3));
  const spikeMat = new THREE.MeshBasicMaterial({ color: 0xbfefff, side: THREE.DoubleSide });
  // for its coming: a second of it, far off in the haze (the same pictures, flat and dimmed, drawn far back, in the haze);
  // puffs of its breath; the flare of it; the ice the breath raises (only to be seen: none of it can hurt him)
  const farMat = m => new THREE.MeshBasicMaterial({ map: m.material.map, color: 0x5a6988, transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide });
  const far = { head: new THREE.Mesh(head.geometry, farMat(head)), jaw: new THREE.Mesh(jaw.geometry, farMat(jaw)), tail: new THREE.Mesh(tail.geometry, farMat(tail)), rings: rings.map(r => new THREE.Mesh(r.m.geometry, farMat(r.m))) };
  const farAll = [far.head, far.jaw, far.tail, ...far.rings], FAR_DIM = new THREE.Color(0x5a6988), FAR_NEAR = new THREE.Color(0xc0cbdc);
  for (const m of farAll){ m.visible = false; scene.add(m); }
  const farEye = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(eyeTex, 0x2ce8f5, 0)); farEye.visible = false; scene.add(farEye);
  const puffGeo = new THREE.PlaneGeometry(1, 1), puffs = [], PUFF_COLS = [0xffffff, 0xc0cbdc, 0xc0cbdc, 0x2ce8f5];
  for (let i = 0; i < 48; i++){ const m = new THREE.Mesh(puffGeo, additive(eyeTex, 0xffffff, 0)); m.visible = false; m.position.z = 0.6; scene.add(m); puffs.push({ m, life: 0 }); }
  const puff = (x, y, vx, vy, size, life) => { const p = puffs.find(q => q.life <= 0) || puffs[Math.floor(Math.random() * puffs.length)]; Object.assign(p, { x, y, vx, vy, s0: size * 0.35, s1: size, life, max: life }); p.m.material.color.setHex(PUFF_COLS[Math.floor(Math.random() * PUFF_COLS.length)]); p.m.visible = true; };
  // the blast itself: a cone of cold light from its jaws to the ground, a few pixels across at the mouth, wide where it lands
  const coneTex = (() => { const c = document.createElement('canvas'); c.width = 48; c.height = 24; const g = c.getContext('2d');
    for (let x = 0; x < 48; x++) for (let y = 0; y < 24; y++){ const u = x / 47, w = 0.12 + 0.88 * Math.sqrt(u), d = Math.abs(y - 11.5) / 12 / w; if (d >= 1) continue;
      const a = (1 - d) * (u < 0.1 ? u / 0.1 : 1) * (1 - 0.35 * u); g.fillStyle = d < 0.35 && a > 0.4 ? '#ffffff' : d < 0.7 ? '#c0cbdc' : '#2ce8f5'; g.globalAlpha = Math.min(1, a * 1.4); g.fillRect(x, y, 1, 1); }
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; })();
  const cone = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(coneTex, 0xffffff, 0)); cone.visible = false; cone.position.z = 0.55; scene.add(cone);
  const flare = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(eyeTex, 0xc0cbdc, 0)); flare.visible = false; flare.position.z = 0.7; scene.add(flare);
  const frostMats = [new THREE.MeshBasicMaterial({ color: 0xc0cbdc, side: THREE.DoubleSide }), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })];
  // the cloud in the gap: a bank of it, pixel-drawn, its top in puffs, and a few puffs over it that drift (and boil, when
  // it comes up through)
  const cloudTex = (() => { const w = Math.max(8, Math.round((gx1 - gx0 + 1.2) * 16)), h = 26, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    for (let x = 0; x < w; x++){ const top = 6 + 3 * Math.sin(x * 0.45) + 2 * Math.sin(x * 0.17 + 1) + (x < 6 || x > w - 7 ? 6 : 0);
      for (let y = Math.max(0, Math.floor(top)); y < h; y++){ const d = y - top; g.fillStyle = d < 1.5 ? '#ffffff' : d < 5 ? ((x + y) % 2 ? '#c0cbdc' : '#ffffff') : d < 12 ? '#c0cbdc' : (x + y) % 2 ? '#8b9bb4' : '#c0cbdc'; g.fillRect(x, y, 1, 1); } }
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; })();
  const cloud = new THREE.Mesh(new THREE.PlaneGeometry(gx1 - gx0 + 1.2, 26 / 16), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, alphaTest: 0.5 }));
  cloud.position.set(gx, stageY - 1.0 + 13 / 16, 0.62); cloud.visible = false; scene.add(cloud);
  const wisps = []; for (let i = 0; i < 9; i++){ const m = new THREE.Mesh(puffGeo, additive(eyeTex, i % 3 ? 0xc0cbdc : 0xffffff, 0)); m.visible = false; scene.add(m); wisps.push({ m, ph: i * 0.7, dx: gx0 + (gx1 - gx0) * (i + 0.5) / 9 }); }
  const shardGeo = new THREE.BufferGeometry(); shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([0.55, 0, 0, -0.45, 0.17, 0, -0.45, -0.17, 0], 3));
  const shardMat = new THREE.MeshBasicMaterial({ color: 0xe8fbff, side: THREE.DoubleSide }), backMat = new THREE.MeshBasicMaterial({ color: 0xfee761, side: THREE.DoubleSide });
  const shatter = fx => { for (const f of B.frost){ if (fx) fx.burst({ x: f.x, y: stageY + 0.5 }, 10, f.m.material === frostMats[1] ? 0xffffff : 0xc0cbdc); scene.remove(f.m); } B.frost.length = 0; };

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = x => Math.max(xMin, Math.min(xMax, x));
  const go = m => { B.mode = m; B.mt = 0; B.hit = false; };
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: W.name, frac: Math.max(0, B.hp / W.hp), phase: B.phase } : null;
  const clear = () => { for (const s of B.spikes){ scene.remove(s.m); scene.remove(s.mark); } B.spikes.length = 0; for (const c of B.shards) scene.remove(c.m); B.shards.length = 0; };
  B.reset = () => { Object.assign(B, { st: 'dormant', tm: 0, hp: W.hp, phase: 1, cd: 1.5, mode: 'circle', mt: 0, acts: 0, jaw: 0, gone: 0, wt: 0, last: '', boil: 0, combo: false }); cleft(false); cloud.visible = false; for (const w of wisps) w.m.visible = false; Object.assign(B.h, { x: lair.x, y: lair.y, vx: -1, vy: 0, a: Math.PI }); B.trail.length = 0; clear();
    B.rz = {}; shatter(null); for (const m of farAll) m.visible = false; farEye.visible = flare.visible = cone.visible = false; for (const p of puffs){ p.life = 0; p.m.visible = false; } };
  // the head steers toward a point: it has a speed and can only turn so fast, so it comes round in arcs
  function steer(tx, ty, speed, turn, dt){
    const H = B.h, want = Math.atan2(ty - H.y, tx - H.x); let d = want - H.a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    H.a += Math.max(-turn * dt, Math.min(turn * dt, d)); H.vx = Math.cos(H.a) * speed; H.vy = Math.sin(H.a) * speed; H.x += H.vx * dt; H.y += H.vy * dt;
  }
  // a spike of ice up out of whatever is under it: the plunge's (warned by a red mark, quick), or a shard's (at once, stands a second)
  const spike = (x, lag, y = stageY, stand = 0) => { const m = new THREE.Mesh(spikeGeo, spikeMat), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0)); m.visible = false; m.position.set(x, y, 0.3); mark.position.set(x, y + 0.2, 0.4); scene.add(m); scene.add(mark);
    B.spikes.push({ x, y, t: stand ? W.spikes.warn : -lag, up: stand || W.spikes.up, m, mark, hit: false, short: !!stand }); };
  const mouth = () => { const H = B.h, ca = Math.cos(H.a), sa = Math.sin(H.a), fl = ca < 0 ? -1 : 1; return { x: H.x + 1.7 * ca + 0.8 * fl * sa, y: H.y + 1.7 * sa - 0.8 * fl * ca }; };
  const shard = (P, events) => { const o = mouth(), tx = P.x, ty = P.y + 1.1, d = Math.hypot(tx - o.x, ty - o.y) || 1, m = new THREE.Mesh(shardGeo, shardMat); m.position.set(o.x, o.y, 0.45); scene.add(m);
    B.shards.push({ x: o.x, y: o.y, vx: (tx - o.x) / d * W.shards.speed, vy: (ty - o.y) / d * W.shards.speed, m, back: false, t: 0 }); sfx.spit(); sfx.snap(); events.push({ type: 'bossTell' }); };
  // a shard sent back: at its head, faster, gold
  const sendBack = (c, events) => { const H = B.h, d = Math.hypot(H.x - c.x, H.y - c.y) || 1, sp = W.shards.speed * 1.5; c.vx = (H.x - c.x) / d * sp; c.vy = (H.y - c.y) / d * sp; c.back = true; c.m.material = backMat; sfx.parry(); events.push({ type: 'block', at: { x: c.x, y: c.y } }); };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt);
    const H = B.h, inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 - 1 && P.y < room.y1;
    let warnA = 0, warnX = 0, warnW = 4, warnY = stageY + 0.25, weak = 0, open = 0, still = false, hid = false, jit = 0, roar = 0;
    const Z = B.rz;
    if (B.st === 'dormant'){ if (inRoom && P.grounded && P.y >= stageY - 0.05 && P.y < stageY + 0.5 && P.hp > 0){ B.st = 'rise'; B.tm = 0; events.push({ type: 'bossWake', boss: B }); } }
    else if (B.st === 'rise'){
      const t = B.tm;
      if (t < RISE.near){
        // far off (drawn below): a gust, and a cry
        hid = true; H.x = lair.x; H.y = lair.y;
        if (t > 0 && !Z.wind){ Z.wind = true; sfx.gust(); }
        if (t >= RISE.cry && !Z.cry){ Z.cry = true; sfx.roar(); }
      }
      else if (t < RISE.rear){
        // in: fast and low past him, round the left, over, down onto the summit at the right, along it and up
        const k = track(NEAR, t), q = track(NEAR, t - 0.02);
        H.x = cx + k[1]; H.y = stageY + k[2]; H.vx = (k[1] - q[1]) / 0.02; H.vy = (k[2] - q[2]) / 0.02; H.a = Math.atan2(H.vy, H.vx);
        if (!Z.in){ Z.in = true; sfx.whoosh(); const u = Math.hypot(H.vx, H.vy) || 1; B.trail.length = 0; for (let j = 0; j < 80; j++) B.trail.push({ x: H.x - H.vx / u * j * 0.25, y: H.y - H.vy / u * j * 0.25 }); }   // its body behind it, out of sight
        if (k[2] < 4.6 && t < RISE.rear - 0.3) fx.dust({ x: H.x, y: stageY }, 3, 3.4);   // low: the snow torn up under it
        if (t >= RISE.past && !Z.past){ Z.past = true; sfx.whoosh(); events.push({ type: 'bossSweep', at: { x: H.x, y: stageY } }); fx.debris(H.x - 7, H.x + 7, stageY + 9, stageY, 26, [0xffffff, 0xc0cbdc], true); }
        if (t >= RISE.down && !Z.down){ Z.down = true; events.push({ type: 'bossSlam', at: { x: H.x, y: stageY } }); fx.burst({ x: H.x, y: stageY + 0.6 }, 30, 0xc0cbdc); fx.debris(H.x - 4, H.x + 4, stageY + 6, stageY, 16, [0xffffff, 0xc0cbdc], true); R.shock(H.x, stageY + 1, true); }
        open = t > 4.3 ? 0.25 : 0;
      }
      else {
        const M = NEAR[NEAR.length - 1], bx = cx + M[1], by = stageY + M[2];
        H.vx = H.vy = 0;
        if (t < RISE.roar){
          // reared over the summit: it draws its head back, high, and its jaws come open
          const u = (t - RISE.rear) / (RISE.roar - RISE.rear); H.x = bx + 0.4 * u; H.y = by + 0.6 * Math.sin(u * Math.PI / 2);
          H.a += (Math.PI / 2 + 0.22 - H.a) * Math.min(1, dt * 12); open = 0.5 * u; roar = 0.4 * u;
        }
        else if (t < RISE.done){
          // down at him, jaws wide: a blast of frost, at the ground short of his feet
          const u = Math.min(1, (t - RISE.roar) / 0.14), e = 1 - (1 - u) * (1 - u); H.x = bx + 0.4 - 1.2 * e; H.y = by + 0.6 - 0.8 * e;
          H.a += (Math.PI + 0.8 - H.a) * Math.min(1, dt * 18); open = 1; jit = 0.07; roar = 1;
          const ca = Math.cos(H.a), sa = Math.sin(H.a), fl = ca < 0 ? -1 : 1, mx = H.x + 1.7 * ca + 0.8 * fl * sa, my = H.y + 1.7 * sa - 0.8 * fl * ca, ba = H.a - fl * 0.35;
          const ix = Math.sin(ba) < -0.2 ? mx + Math.cos(ba) * (my - stageY) / -Math.sin(ba) : mx; Z.mx = mx; Z.my = my;
          if (!Z.roar){ Z.roar = true; Z.flare = 0.55; Z.acc = 0; Z.n = 0; B.flash = 0.15; sfx.gust(); sfx.crack(); events.push({ type: 'bossSweep', at: { x: mx, y: stageY } }); R.shock(mx, my, true);
            fx.debris(room.x0 + 1, room.x1 - 1, stageY + 11, stageY, 40, [0xffffff, 0xc0cbdc, 0x2ce8f5], true); }
          if (u >= 0.5){
            Z.acc += dt * 70; while (Z.acc >= 1){ Z.acc--; const a = ba + (Math.random() - 0.5) * 0.34, sp = 14 + Math.random() * 9; puff(mx, my, Math.cos(a) * sp, Math.sin(a) * sp, 1.1 + Math.random() * 1.5, 0.55 + Math.random() * 0.4); }
            fx.burst({ x: mx, y: my }, 2, 0xffffff); fx.dust({ x: ix, y: stageY }, 3, 5); R.glint(mx, my, 0x2ce8f5, 1.5, 8); R.glint(ix, stageY + 0.8, 0xc0cbdc, 1.1, 6);
            if (!Z.hitG){ Z.hitG = true; R.shock(ix, stageY + 0.5, true); }
            const len = Math.hypot(ix - mx, stageY + 0.3 - my), k = Math.min(1, (t - RISE.roar - 0.07) / 0.08, (RISE.done - t) / 0.15);
            cone.visible = true; cone.position.set((mx + ix) / 2, (my + stageY + 0.3) / 2, 0.55); cone.rotation.z = Math.atan2(stageY + 0.3 - my, ix - mx);
            cone.scale.set(len, 3.4 + Math.random() * 0.6, 1); cone.material.opacity = Math.max(0, k) * (0.6 + Math.random() * 0.3);
            // the ground freezes where it lands, and the ice runs toward him, and stops short
            const dir = P.x < ix ? -1 : 1;
            while (Z.n < 6 && t >= RISE.roar + 0.1 + Z.n * 0.07){ const x = ix - dir * 1.0 + dir * Z.n * 0.62 + (Math.random() - 0.5) * 0.2; Z.n++;
              if (Math.abs(x - P.x) < 1.3 || x < xMin - 2 || x > xMax + 2) continue;
              const m = new THREE.Mesh(spikeGeo, frostMats[Z.n % 2]); m.position.set(x, stageY - 0.05, 0.35); m.rotation.z = (Math.random() - 0.5) * 0.5; m.scale.set(0.5 + Math.random() * 0.4, 0.01, 1); scene.add(m);
              B.frost.push({ m, x, t: 0, h: 0.7 + Math.random() * 0.45 }); fx.burst({ x, y: stageY + 0.4 }, 8, 0xc0cbdc); if (Z.n % 2) events.push({ type: 'rockLand', at: { x, y: stageY } }); }
          }
        }
        else {
          // its jaws shut; the ice breaks; it comes up off the summit to fight
          cone.visible = false;
          const u = Math.min(1, (t - RISE.done) / (RISE.end - RISE.done)); H.x -= dt * 1.5; H.y += dt * 2.5; H.a += (Math.PI + 0.25 - H.a) * Math.min(1, dt * 5); open = 1 - u; roar = 1 - u;
          if (t >= RISE.end){ if (B.frost.length) events.push({ type: 'rockLand', at: { x: B.frost[0].x, y: stageY } }); shatter(fx); H.vx = Math.cos(H.a) * W.cruise; H.vy = Math.sin(H.a) * W.cruise; B.st = 'fight'; B.tm = 0; go('circle'); }
        }
      }
    }
    else if (B.st === 'die'){
      // it drops; its rings burst, tail first; the head lies on the summit
      H.vy -= 30 * dt; H.x += H.vx * dt; H.y += H.vy * dt; H.vx *= Math.exp(-dt * 2);
      const floor = stageY + 1.0; if (H.y < floor){ H.y = floor; H.vy = 0; if (!B.down){ B.down = true; events.push({ type: 'bossSlam', at: { x: H.x, y: stageY } }); } }
      H.a += ((H.vx < 0 ? Math.PI : 0) - H.a) * Math.min(1, dt * 3); open = 1;
      const n = Math.floor(B.tm / 0.16);
      while (B.gone < n && B.gone < rings.length + 1){ const r = B.gone === 0 ? tail : rings[rings.length - B.gone].m; fx.burst({ x: r.position.x, y: r.position.y }, 18, 0xc8f4ff); fx.ring({ x: r.position.x, y: r.position.y }, 0x9ff0ff); events.push({ type: 'rockLand', at: { x: r.position.x, y: r.position.y } }); B.gone++; }
      if (B.tm > 3.6){ B.st = 'dead'; events.push({ type: 'bossDead', boss: B }); }
    }
    else if (B.st === 'fight'){
      const M = B.mode, lv = levelOf(P.y), side = () => (H.x > cx ? 1 : -1);
      cleft(true);
      // a fall into the cloud: a heart, and back on the pass beside the gap
      if (P.x > gx0 && P.x < gx1 && P.y < stageY - 0.2 && P.hp > 0){
        hurt(P, W.fall, gx, 'Fell'); P.x = P.x < gx ? gx0 - 0.7 : gx1 + 0.7; P.y = stageY + 0.02; P.vx = 0; P.vy = 0; P.grounded = true;
        fx.burst({ x: gx, y: stageY }, 20, 0xc0cbdc); fx.dust({ x: P.x, y: stageY }, 8, 2.5); sfx.whoosh(); events.push({ type: 'fell', at: { x: P.x, y: stageY } });
      }
      if (M === 'circle'){
        // a long figure of eight high over the hall, out of his reach
        const t = B.tm * 0.55; steer(cx + Math.sin(t) * 14, stageY + 10.6 + Math.sin(t * 2) * 1.4, W.cruise, W.turn, dt);
        // from half health, the wind: gusts along the pass, toward the gap
        if (B.phase === 2){
          const per = W.wind.on + W.wind.off, was = B.wt % per; B.wt += dt; const now = B.wt % per;
          if (now < was) { sfx.gust(); events.push({ type: 'gust' }); }
          if (now < W.wind.on){
            const dir = Math.sign(gx - P.x);
            if (P.y < stageY + 0.8 && (P.x < gx0 - 0.1 || P.x > gx1 + 0.1)) P.x += dir * W.wind.push * dt * Math.min(1, now / 0.25);
            if (Math.random() < 0.6){ const from = dir > 0 ? xMin - 3 : xMax + 3; puff(from + Math.random() * 6 * dir, stageY + 0.3 + Math.random() * 2.2, dir * (16 + Math.random() * 6), 0, 0.5 + Math.random() * 0.5, 1.1); }
          }
        }
        B.cd -= dt;
        if (B.cd <= 0){
          // which: never the same twice running
          const pool = [['plunge', 3], ['frost', 2.5], ['pass', 2.3], ['shards', 2]]; if (B.phase === 2) pool.push(['up', 2.2]);
          const can = pool.filter(([k]) => k !== B.last), sum = can.reduce((n, [, w]) => n + w, 0); let r = Math.random() * sum, pick = can[0][0];
          for (const [k, w] of can){ if ((r -= w) <= 0){ pick = k; break; } }
          B.last = pick; B.acts++; events.push({ type: 'bossTell' });
          if (pick === 'plunge') go('aim');
          else if (pick === 'frost'){ go('frostGo'); B.side = P.x > cx ? 1 : -1; }
          else if (pick === 'pass'){ go('passGo'); B.side = side(); }
          else if (pick === 'shards'){ go('shardGo'); B.side = P.x > cx ? -1 : 1; }
          else go('upGo');
        }
      }
      // ---- the frost breath
      else if (M === 'frostGo'){
        const tx = cx + B.side * W.frost.hang[0], ty = stageY + W.frost.hang[1]; steer(tx, ty, 13, 7, dt);
        if (Math.hypot(H.x - tx, H.y - ty) < 1.4 || B.mt > 2.6){ go('frostTell'); sfx.gust(); }
      }
      else if (M === 'frostTell' || M === 'frost'){
        // it hangs at its end of the hall, head turned down along the pass; draws breath, then breathes
        still = true; H.vx = H.vy = 0; H.a += ((B.side > 0 ? Math.PI * 1.13 : -Math.PI * 0.13) - H.a) * Math.min(1, dt * 7); H.y += Math.sin(B.mt * 5) * dt * 0.3;
        const o = mouth();
        if (M === 'frostTell'){
          const k = B.mt / W.frost.tell; open = 0.3 + 0.7 * k;
          if (Math.random() < 0.8){ const a = Math.random() * Math.PI * 2, r0 = 3 + Math.random() * 2.5; puff(o.x + Math.cos(a) * r0, o.y + Math.sin(a) * r0, -Math.cos(a) * r0 * 2.6, -Math.sin(a) * r0 * 2.6, 0.5 + Math.random() * 0.4, 0.38); }
          R.glint(o.x, o.y, 0x2ce8f5, 0.4 + k, 3 + k * 3);
          if (B.mt >= W.frost.tell){ go('frost'); B.n = 0; B.flash = 0.1; sfx.gust(); sfx.crack(); events.push({ type: 'bossSweep', at: { x: o.x, y: stageY } }); }
        }
        else {
          open = 1; jit = 0.05; weak = 0.6;
          const dir = -B.side, from = B.side > 0 ? xMax + 2 : xMin - 2, far = (xMax - xMin + 4) * Math.min(1, B.mt / W.frost.spread), edge = from + dir * far;
          // the ice along the pass, out to where the breath has reached (none in the gap)
          while (B.n * W.frost.step < far){ const x = from + dir * (B.n * W.frost.step + 0.3) + (Math.random() - 0.5) * 0.2; B.n++; if (x > gx0 - 0.2 && x < gx1 + 0.2) continue;
            const m = new THREE.Mesh(spikeGeo, frostMats[B.n % 2]); m.position.set(x, stageY - 0.05, 0.35); m.rotation.z = (Math.random() - 0.5) * 0.5; m.scale.set(0.5 + Math.random() * 0.4, 0.01, 1); scene.add(m);
            B.frost.push({ m, x, t: 0, h: 0.7 + Math.random() * 0.45 }); if (B.n % 3 === 0){ fx.burst({ x, y: stageY + 0.4 }, 6, 0xc0cbdc); events.push({ type: 'rockLand', at: { x, y: stageY } }); } }
          // the blast: from its jaws to the ground where the ice is coming up
          const ix = Math.max(xMin - 2, Math.min(xMax + 2, edge)), len = Math.hypot(ix - o.x, stageY + 0.3 - o.y), k = Math.min(1, B.mt / 0.1, (W.frost.time - B.mt) / 0.2);
          cone.visible = true; cone.position.set((o.x + ix) / 2, (o.y + stageY + 0.3) / 2, 0.55); cone.rotation.z = Math.atan2(stageY + 0.3 - o.y, ix - o.x); cone.scale.set(len, 3.2 + Math.random() * 0.6, 1); cone.material.opacity = Math.max(0, k) * (0.55 + Math.random() * 0.3);
          if (Math.random() < 0.9){ const x = from + dir * Math.random() * far; puff(x, stageY + 0.6, (Math.random() - 0.5) * 8, 1 + Math.random() * 2, 1.0 + Math.random() * 1.2, 0.6); }
          R.glint(o.x, o.y, 0x2ce8f5, 1.3, 7);
          // on the pass where it lies, he is hurt
          if (P.y < stageY + 0.9 && (P.x - from) * dir >= 0 && (P.x - from) * dir <= far && !(P.x > gx0 && P.x < gx1)) hurt(P, 1, o.x, 'Frozen');
          if (B.mt >= W.frost.time){
            cone.visible = false; shatter(fx); events.push({ type: 'rockLand', at: { x: cx, y: stageY } }); sfx.crack();
            if (B.phase === 2 && !B.combo){ B.combo = true; go('passGo'); B.side = side(); events.push({ type: 'bossTell' }); }
            else { B.combo = false; go('circle'); B.cd = ph(W.cd); }
          }
        }
      }
      // ---- the pass through the hall
      else if (M === 'passGo'){
        // away out of the hall, high, off its own side
        const tx = B.side > 0 ? room.x1 + 12 : room.x0 - 12, ty = stageY + 15; steer(tx, ty, 17, 6, dt);
        if ((B.side > 0 ? H.x > room.x1 + 6 : H.x < room.x0 - 6) || B.mt > 3.2){
          go('passTell'); const pick = Math.random() < W.pass.his ? lv : [0, 1, 2].filter(n => n !== lv)[Math.floor(Math.random() * 2)];
          B.lv = pick; B.ly = stageY + W.levels[pick] + W.pass.over;
          H.x = B.side > 0 ? room.x1 + 9 : room.x0 - 9; H.y = B.ly; H.a = B.side > 0 ? Math.PI : 0; B.trail.length = 0; for (let j = 0; j < 80; j++) B.trail.push({ x: H.x + B.side * j * 0.25, y: H.y });
        }
      }
      else if (M === 'passTell'){
        // out of sight: the snow it drives before it shows which level
        hid = true; H.vx = H.vy = 0; const k = Math.min(1, B.mt / ph(W.pass.tell));
        warnA = 0.25 + 0.45 * k; warnX = cx; warnW = xMax - xMin + 6; warnY = B.ly - 0.4;
        for (let n = 0; n < 2; n++) if (Math.random() < 0.5 + k * 0.4){ const x = B.side > 0 ? xMax + 3 - Math.random() * 4 : xMin - 3 + Math.random() * 4; puff(x, B.ly - 0.8 + Math.random() * 1.8, -B.side * (20 + Math.random() * 10), 0, 0.5 + Math.random() * 0.6, 1.2); }
        if (B.mt >= ph(W.pass.tell)){ go('pass'); sfx.whoosh(); sfx.roar(); events.push({ type: 'bossSweep', at: { x: cx, y: B.ly } }); }
      }
      else if (M === 'pass'){
        const sp = ph(W.pass.speed); H.a = B.side > 0 ? Math.PI : 0; H.vx = -B.side * sp; H.vy = 0; H.x += H.vx * dt; H.y = B.ly + Math.sin(B.mt * 7) * 0.15; open = 0.6;
        warnA = Math.max(0, 0.7 - B.mt * 2); warnX = cx; warnW = xMax - xMin + 6; warnY = B.ly - 0.4;
        if (Math.random() < 0.8){ fx.dust({ x: H.x + B.side * 1.5, y: floorUnder(H.x, B.ly) }, 2, 2.6); }
        if (B.side > 0 ? H.x < room.x0 - 6 : H.x > room.x1 + 6){ H.a = B.side > 0 ? Math.PI * 0.8 : Math.PI * 0.2; go('circle'); B.cd = ph(W.cd); B.combo = false; }
      }
      // ---- the shards from its mouth
      else if (M === 'shardGo'){
        // over him to one side, where nothing stands between its jaws and him (not over the slab when he is under it)
        const ty0 = stageY + W.levels[lv] + W.shards.high; let tx = clampX(P.x + B.side * 8), ty = ty0;
        for (const [dx, dy] of [[8, 0], [-8, 0], [10, 1], [-10, 1], [6, 2], [-6, 2], [12, 0], [-12, 0]]){ const x = clampX(P.x + B.side * dx), y = Math.min(stageY + 21, ty0 + dy); if (clearTo(x, y, P.x, P.y + 1.1) && clearTo(x, y - 1.2, P.x, P.y + 1.1)){ tx = x; ty = y; break; } }
        steer(tx, ty, 14, 7, dt);
        if (Math.hypot(H.x - tx, H.y - ty) < 1.8 || B.mt > 2.4) go('shardTell');
      }
      else if (M === 'shardTell' || M === 'shard'){
        // its head on him: it rears, and three motes of light come in its jaws; then it spits them, one after another
        still = true; H.vx = H.vy = 0; const want = Math.atan2(P.y + 1.1 - H.y, P.x - H.x) + (M === 'shardTell' ? (P.x > H.x ? 0.5 : -0.5) * Math.min(1, B.mt / W.shards.tell) : 0);
        let d = want - H.a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; H.a += d * Math.min(1, dt * 10);
        const o = mouth();
        if (M === 'shardTell'){
          open = 0.5; const k = B.mt / W.shards.tell;
          for (let n = 0; n < W.shards.n; n++) R.glint(o.x + Math.cos(n * 2.1 + B.mt * 9) * 0.35, o.y + Math.sin(n * 2.1 + B.mt * 9) * 0.35, 0xe8fbff, 0.5 + k * 0.6, 1.4);
          if (B.mt >= W.shards.tell){ go('shard'); B.n = 0; }
        }
        else {
          open = 0.4 + 0.6 * Math.max(0, 1 - ((B.mt % W.shards.every) / 0.15));
          for (let n = B.n; n < W.shards.n; n++) R.glint(o.x, o.y, 0xe8fbff, 0.6, 1.2);
          while (B.n < W.shards.n && B.mt >= B.n * W.shards.every){ B.n++; shard(P, events); fx.burst(o, 5, 0xe8fbff); }
          if (B.mt >= W.shards.n * W.shards.every + 0.35){ go('circle'); B.cd = ph(W.cd); }
        }
      }
      // ---- the plunge, onto whatever is under him
      else if (M === 'aim'){
        // over him, following (never over the gap: it keeps to its edges)
        let tx = clampX(P.x); if (tx > gx0 - 0.6 && tx < gx1 + 0.6) tx = tx < gx ? gx0 - 0.6 : gx1 + 0.6;
        const ty = Math.min(stageY + 21, floorUnder(tx, P.y + 0.3) + W.plunge.high); steer(tx, ty, 13, 6, dt);
        warnA = 0.3 + 0.4 * Math.min(1, B.mt / ph(W.plunge.aim)); warnX = tx; warnY = floorUnder(tx, P.y + 0.3) + 0.25;
        if (B.mt >= ph(W.plunge.aim) && Math.abs(H.x - tx) < 2.5 && H.y > ty - 3.5){ go('dive'); B.tx = H.x + (tx - H.x) * 0.6; B.fy = floorUnder(B.tx, H.y); }
        else if (B.mt > 3.5){ go('dive'); B.tx = H.x; B.fy = floorUnder(B.tx, H.y); }
      }
      else if (M === 'dive'){
        H.a = -Math.PI / 2 + (B.tx - H.x) * 0.05; H.x += (B.tx - H.x) * Math.min(1, dt * 6); H.vx = 0; H.vy = -W.plunge.dive; H.y += H.vy * dt; open = 1; warnA = 1; warnX = B.tx; warnY = B.fy + 0.25;
        if (H.y <= B.fy + 1.0){
          const fy = B.fy; H.y = fy + 1.0; events.push({ type: 'bossSlam', at: { x: H.x, y: fy } }); fx.burst({ x: H.x, y: fy + 0.5 }, 30, 0xc8f4ff);
          if (Math.abs(P.x - H.x) < W.plunge.reach && P.y < fy + 2.6 && P.y > fy - 1 && !isRollInv(P)) hurt(P, 2, H.x, 'Run through');
          if (B.phase === 2 && Math.abs(fy - stageY) < 0.1) for (const dir of [-1, 1]) for (let k = 1; k <= W.spikes.n; k++){ const x = H.x + dir * (0.8 + k * W.spikes.step); if (x > xMin - 2 && x < xMax + 2 && !(x > gx0 - 0.3 && x < gx1 + 0.3)) spike(x, k * W.spikes.lag); }
          go('stuck');
        }
      }
      else if (M === 'stuck'){ still = true; weak = 1; H.a = -Math.PI / 2 + Math.sin(B.mt * 22) * 0.05 * Math.max(0, 1 - B.mt); H.vx = H.vy = 0; if (B.mt >= ph(W.plunge.stuck)) go('pull'); }
      else if (M === 'pull'){ const t = Math.min(1, B.mt / W.plunge.pull); weak = 1 - t; H.a = Math.PI / 2; H.vx = 0; H.vy = 9 * t; H.y += H.vy * dt; if (t >= 1){ go('circle'); B.cd = ph(W.cd); } }
      // ---- up through the gap
      else if (M === 'upGo'){
        // down into the cloud
        steer(gx, stageY - 4, 18, 8, dt);
        if (H.y < stageY - 1.5 || B.mt > 3){ go('upTell'); H.x = gx; H.y = stageY - W.up.from; H.a = Math.PI / 2; B.trail.length = 0; for (let j = 0; j < 80; j++) B.trail.push({ x: gx, y: H.y - j * 0.25 }); sfx.rumble(); B.boil = 0; }
      }
      else if (M === 'upTell'){
        // the cloud boils
        hid = true; H.vx = H.vy = 0; B.boil = Math.min(1, B.mt / W.up.tell);
        if (Math.random() < 0.7) puff(gx0 + Math.random() * (gx1 - gx0), stageY + 0.2, (Math.random() - 0.5) * 3, 3 + Math.random() * 4 * B.boil, 0.7 + Math.random() * 0.8, 0.6);
        if (B.mt >= W.up.tell){ go('up'); sfx.whoosh(); sfx.roar(); fx.burst({ x: gx, y: stageY + 0.3 }, 30, 0xffffff); events.push({ type: 'bossSweep', at: { x: gx, y: stageY } }); }
      }
      else if (M === 'up'){
        B.boil = Math.max(0, B.boil - dt * 2); H.a = Math.PI / 2; H.vx = 0; H.vy = W.up.speed; H.y += H.vy * dt; open = 1;
        // the blast of it, up the gap and over its edges
        if (H.y < stageY + 5 && Math.abs(P.x - gx) < (gx1 - gx0) / 2 + W.up.edge && P.y < H.y + 1.5 && P.y + P.h > H.y - 4) hurt(P, 1, gx, 'Thrown');
        if (H.y >= stageY + W.up.to){ const s2 = P.x > gx ? -1 : 1; H.a = Math.PI / 2 - s2 * 0.7; go('circle'); B.cd = ph(W.cd); }
      }
      // its head against him
      if ((M === 'pass' || M === 'dive' || M === 'upGo' || M === 'up') && !B.hit && !isRollInv(P)){
        const nx = Math.max(P.x - 0.34, Math.min(P.x + 0.34, H.x)), ny = Math.max(P.y, Math.min(P.y + P.h, H.y));
        if (Math.hypot(nx - H.x, ny - H.y) < W.headR){ if (hurt(P, 1, H.x - Math.sign(H.vx || 1), 'Bitten')) B.hit = true; }
      }
    }
    // where the head has been: a point every quarter unit; the rings sit along it
    const tr = B.trail;
    if (B.st === 'rise' && tr.length){   // in its coming it goes fast: the way filled in a quarter unit at a time, so the rings keep their spacing
      for (let n = 0; n < 240; n++){ const p = tr[0], d = Math.hypot(H.x - p.x, H.y - p.y); if (d <= 0.25) break; tr.unshift({ x: p.x + (H.x - p.x) / d * 0.25, y: p.y + (H.y - p.y) / d * 0.25 }); }
      if (tr.length > 120) tr.length = 120;
    }
    else if (!tr.length || Math.hypot(H.x - tr[0].x, H.y - tr[0].y) > 0.25){ tr.unshift({ x: H.x, y: H.y }); if (tr.length > 120) tr.pop(); }
    const at = d => { const k = d / 0.25, i = Math.min(tr.length - 1, Math.floor(k)), j = Math.min(tr.length - 1, i + 1), f = k - Math.floor(k), a = tr[i] || H, b = tr[j] || a; return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; };
    // spikes out of the ground; shards through the air
    for (let i = B.spikes.length - 1; i >= 0; i--){
      const s = B.spikes[i]; s.t += dt;
      if (s.t < 0) continue;
      if (s.t < W.spikes.warn){ s.mark.material.opacity = 0.5 + 0.4 * Math.sin(s.t * 30); }
      else { const u = (s.t - W.spikes.warn) / s.up, e = s.short ? 0.12 / s.up : 0.25, k = u < e ? u / e : u > 1 - e ? Math.max(0, (1 - u) / e) : 1; s.mark.material.opacity = 0; s.m.visible = true; s.m.scale.y = k * (s.short ? 0.6 : 1);
        if (!s.up0){ s.up0 = true; events.push({ type: 'rockLand', at: { x: s.x, y: s.y } }); fx.burst({ x: s.x, y: s.y + 0.6 }, 8, 0xc8f4ff); }
        if (!s.hit && k > 0.6 && Math.abs(P.x - s.x) < 0.7 && P.y < s.y + (s.short ? 1.1 : 1.6) && P.y > s.y - 1 && !isRollInv(P)){ if (hurt(P, 1, s.x, 'Spiked')) s.hit = true; }
        if (u >= 1){ scene.remove(s.m); scene.remove(s.mark); B.spikes.splice(i, 1); } }
    }
    for (let i = B.shards.length - 1; i >= 0; i--){
      const c = B.shards[i]; c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.m.position.set(c.x, c.y, 0.45); c.m.rotation.z = Math.atan2(c.vy, c.vx);
      if (Math.random() < 0.5) fx.burst({ x: c.x, y: c.y }, 1, c.back ? 0xfee761 : 0xe8fbff);
      let gone = c.t > 3 || c.x < room.x0 - 4 || c.x > room.x1 + 4 || c.y > room.y1 + 4;
      if (!gone && c.back){
        // back at its head: it takes it whatever it is doing
        if (B.st === 'fight' && Math.hypot(c.x - H.x, c.y - H.y) < W.headR + 0.4){ wound(W.shards.back, { x: c.x, y: c.y }, events, W.shards.back); fx.burst({ x: c.x, y: c.y }, 16, 0xfee761); sfx.crack(); gone = true; }
      }
      else if (!gone && Math.abs(P.x - c.x) < 0.45 && c.y > P.y && c.y < P.y + P.h && P.hp > 0){
        // his guard, facing it, sends it back; otherwise it goes in
        if (P.blocking && Math.sign(c.x - P.x) === P.face) sendBack(c, events);
        else if (!isRollInv(P)){ hurt(P, 1, c.x, 'Pierced'); fx.burst({ x: c.x, y: c.y }, 10, 0xe8fbff); gone = true; }
      }
      if (!gone){
        // it cracks on what it hits, and leaves a spike standing there a second if it lands on a floor (not in the cloud)
        const i2 = Math.floor(c.x / T), j2 = Math.floor(c.y / T), t2 = LEVEL.tiles[j2 * LEVEL.W + i2];
        if (t2 === ROCK || (t2 === LEDGE && c.vy < 0 && c.y < (j2 + 1) * T && c.y > (j2 + 1) * T - 0.3) || c.y < stageY - 0.4){
          gone = true; sfx.crack(); fx.burst({ x: c.x, y: c.y }, 12, 0xe8fbff); events.push({ type: 'rockLand', at: { x: c.x, y: c.y } });
          if (!c.back && c.vy < 0 && !(c.x > gx0 && c.x < gx1)){ const top = floorUnder(c.x, c.y + 0.3); if (c.y - top < 0.8) spike(c.x, 0, top, W.shards.stand); }
        }
      }
      if (gone){ scene.remove(c.m); B.shards.splice(i, 1); }
    }
    // the cloud in the gap, while it fights
    { const on = B.st === 'fight' || B.st === 'die'; cloud.visible = on;
      for (const w of wisps){ w.m.visible = on; if (!on) continue; const b = B.boil || 0, t = B.tm * (1 + b * 3) + w.ph;
        w.m.position.set(w.dx + Math.sin(t * 0.9) * 0.3, stageY + 0.15 + Math.abs(Math.sin(t * 1.3)) * (0.25 + b * 0.9), 0.63); w.m.scale.setScalar(0.9 + 0.3 * Math.sin(t) + b * 0.8); w.m.material.opacity = 0.35 + b * 0.35; }
      if (on && B.boil) cloud.position.x = gx + (Math.random() - 0.5) * 0.12 * B.boil; else cloud.position.x = gx; }
    // draw it: each piece turned along the way it goes, its back kept up
    const show = (B.st !== 'dormant' && B.st !== 'dead' || (B.st === 'dead')) && !hid;
    const place = (m, x, y, a, hide) => { m.visible = show && !hide && !(y < stageY - 0.9 && B.st === 'fight'); m.position.x = x; m.position.y = y; m.rotation.z = a; m.scale.y = Math.abs(m.scale.y) * (Math.cos(a) < 0 ? -1 : 1); };
    let prev = { x: H.x, y: H.y };
    rings.forEach((r, i) => { const p = at(r.d); const a = Math.atan2(prev.y - p.y, prev.x - p.x) + Math.sin(B.tm * 4 - i * 0.7) * 0.05; r.x = p.x; r.y = p.y; place(r.m, p.x, p.y + Math.sin(B.tm * 3 - i * 0.6) * 0.08, a, B.st === 'dead' || (B.st === 'die' && rings.length - i <= B.gone - 1)); prev = p; });
    { const p = at(tailD), a = Math.atan2(prev.y - p.y, prev.x - p.x); place(tail, p.x, p.y, a, B.st === 'dead' || (B.st === 'die' && B.gone > 0)); }
    B.jaw += (open - B.jaw) * Math.min(1, dt * 12);
    const flip = Math.cos(H.a) < 0 ? -1 : 1, ca = Math.cos(H.a), sa = Math.sin(H.a), on = (lx, ly) => [H.x + lx * ca - ly * flip * sa, H.y + lx * sa + ly * flip * ca];
    const jx0 = (Math.random() - 0.5) * jit, jy0 = (Math.random() - 0.5) * jit;   // the roar shakes its head
    place(head, H.x + jx0, H.y + jy0, H.a, false);
    { const ja = H.a - flip * B.jaw * 0.5, [jx, jy] = on(0.55 - B.jaw * 0.2, -0.95 - B.jaw * 0.25); place(jaw, jx + jx0, jy + jy0, ja, false); }
    const lit = B.st === 'fight' ? 1 : B.st === 'rise' ? Math.min(1, B.tm) : B.st === 'die' ? Math.max(0, 1 - B.tm / 2) : 0;
    { const [ex, ey] = on(0.06, 0.19); eye.position.set(ex, ey, -0.45); eye.material.opacity = lit * (0.8 + 0.2 * Math.sin(B.tm * 7)); eye.material.color.setHex(weak > 0 ? 0xffffff : B.phase === 2 ? 0xff5a50 : 0x7ff6ff); eye.scale.setScalar(1 + weak * 0.6 + roar * 0.7); eye.visible = show; }
    halo.position.set(H.x, H.y, -0.8); halo.material.opacity = weak * (0.35 + 0.15 * Math.sin(B.tm * 9)) + B.flash * 3; halo.visible = show;
    eyeLight.position.set(H.x, H.y + 0.3, 1.0); eyeLight.intensity = show ? lit * 0.9 + weak * 1.2 + B.flash * 4 : 0; eyeLight.color.setHex(B.phase === 2 ? 0xff7060 : 0x9fefff);
    if (show) R.glint(H.x, H.y, B.phase === 2 ? 0xff7060 : 0x9fefff, lit * 0.35 + weak * 0.45 + B.flash * 3, 5.5);
    // its coming: the far one, the breath, its flare, the ice it raised
    if (B.st === 'rise' && B.tm > 0 && B.tm < RISE.far){
      const t = B.tm, c = R.parallax(0, 0, 0), fat = tt => { const k = track(FAR, tt); return { x: c.x + k[1], y: c.y + k[2], s: Math.max(0.05, k[3]) }; };
      const h = fat(t), h2 = fat(t - 0.02), a = Math.atan2(h.y - h2.y, h.x - h2.x), s = h.s, z = s > 0.3 ? -5 : -45, dim = Math.min(1, Math.max(0, (s - 0.15) / 0.6));
      const pose = (m, x, y, ang, k, sc, zz) => { m.visible = true; m.position.set(x, y, zz); m.rotation.z = ang; m.scale.set(SIZE[k][0] / 16 * sc, SIZE[k][1] / 16 * sc * (Math.cos(ang) < 0 ? -1 : 1), 1); m.material.color.copy(FAR_DIM).lerp(FAR_NEAR, dim); };
      Z.fjaw = (Z.fjaw || 0) + ((t > RISE.cry - 0.05 && t < RISE.cry + 0.4 ? 1 : 0) - (Z.fjaw || 0)) * Math.min(1, dt * 12);
      const fl = Math.cos(a) < 0 ? -1 : 1, ca = Math.cos(a), sa = Math.sin(a), fon = (lx, ly) => [h.x + (lx * ca - ly * fl * sa) * s, h.y + (lx * sa + ly * fl * ca) * s];
      pose(far.head, h.x, h.y, a, 'head', s, z + 0.02);
      { const ja = a - fl * Z.fjaw * 0.5, [jx, jy] = fon(0.55 - Z.fjaw * 0.2, -0.95 - Z.fjaw * 0.25); pose(far.jaw, jx, jy, ja, 'jaw', s, z + 0.015); }
      { const [ex, ey] = fon(0.06, 0.19); farEye.visible = true; farEye.position.set(ex, ey, z + 0.03); farEye.scale.setScalar(1.6 * s * (1 + Z.fjaw)); farEye.material.opacity = 0.9; R.glint(ex, ey, 0x2ce8f5, 0.2 + Z.fjaw * 0.6, 1 + s * 5); }
      // its body back along the way it came, a ring a gap (the gaps by its size where it was then)
      let tt = t, acc = 0, prev = h, last = h, ri = 0;
      while (ri <= rings.length && tt > t - 3){ tt -= 0.004; const p = fat(tt); acc += Math.hypot(p.x - prev.x, p.y - prev.y) / p.s; prev = p;
        if (acc >= (ri < rings.length ? rings[ri].d : tailD)){ const ang = Math.atan2(last.y - p.y, last.x - p.x); if (ri < rings.length) pose(far.rings[ri], p.x, p.y, ang, rings[ri].k, p.s, z - 0.01 - ri * 0.001); else pose(far.tail, p.x, p.y, ang, 'tail', p.s, z - 0.03); last = p; ri++; } }
    } else if (far.head.visible){ for (const m of farAll) m.visible = false; farEye.visible = false; }
    for (const p of puffs){
      if (p.life <= 0){ if (p.m.visible) p.m.visible = false; continue; }
      p.life -= dt; const u = 1 - p.life / p.max, drag = Math.exp(-dt * 2.2); p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= drag; p.vy *= drag;
      if (p.y < stageY + 0.5){ p.y = stageY + 0.5; p.vx += (p.vx < 0 ? -1 : 1) * Math.abs(p.vy) * 0.6; p.vy = Math.abs(p.vy) * 0.08; }   // on the ground it rolls out along it
      const sc = p.s0 + (p.s1 - p.s0) * Math.sqrt(u); p.m.scale.set(sc, sc, 1); p.m.position.set(p.x, p.y, 0.6); p.m.material.opacity = 0.5 * (1 - u) * Math.min(1, u * 8);
    }
    if (Z.flare > 0){ Z.flare -= dt; const k = Math.max(0, Z.flare / 0.55); flare.visible = k > 0; flare.position.set(Z.mx, Z.my, 0.7); flare.scale.setScalar(11 - 6 * k); flare.material.opacity = 0.85 * k; }
    for (const f of B.frost){ f.t += dt; f.m.scale.y = f.h * Math.min(1, f.t / 0.12); }
    warn.material.opacity = warnA; warn.scale.set(warnW / 4, 1, 1); warn.position.set(warnX, warnY, 0.5);
  };

  // a wound to its head (his cut, or its own shard sent back)
  function wound(dmg, at, events, heavy){
    const H = B.h; B.hp -= dmg; B.flash = 0.12; events.push({ type: 'hit', at, heavy: (heavy || dmg) >= 2 });
    if (B.phase === 1 && B.hp <= W.hp * W.phase2){ B.phase = 2; B.wt = 0; events.push({ type: 'bossPhase', boss: B }); }
    if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.gone = 0; B.down = false; H.vx = (H.x > cx ? -1 : 1) * 4; H.vy = 9; clear(); shatter(null); cone.visible = false; cleft(false); events.push({ type: 'bossDie' }); }
  }
  // his cut: its head takes it while it is caught in the ice, or while it breathes; at any other time it only rings off
  // the scales
  function struck(P, near, dmg, events){
    if (B.st !== 'fight' || !near) return false;
    const H = B.h;
    if (B.mode === 'stuck' || (B.mode === 'pull' && B.mt < 0.2) || B.mode === 'frost') wound(dmg, { x: H.x - P.face * 0.8, y: Math.min(H.y + 0.6, P.y + 1.3) }, events);
    else events.push({ type: 'block', at: { x: H.x - P.face * 0.8, y: P.y + 1.3 } });
    return true;
  }
  // a shard in front of his cut goes back at its head
  const turnShards = (P, reach, events) => { let n = 0; for (const c of B.shards){ if (c.back) continue; const ahead = (c.x - P.x) * P.face; if (ahead > -0.6 && ahead < reach + 0.6 && Math.abs(c.y - (P.y + 1.2)) < 1.6){ sendBack(c, events); n++; } } return n > 0; };
  B.strike = (P, reach, dmg, events) => { const H = B.h, ahead = (H.x - P.x) * P.face; if (B.st === 'fight' && turnShards(P, reach, events)) return true; return struck(P, ahead > -0.9 && ahead < reach + W.headR && Math.abs(H.y - (P.y + 1.2)) < W.headR + 1.4, dmg, events); };
  B.slam = (P, radius, dmg, events) => { const H = B.h; return struck(P, Math.abs(H.x - P.x) < radius + W.headR && P.y < H.y + 2.6 && P.y > H.y - 2.5, dmg + 1, events); };
  return B;
}
