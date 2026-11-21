// The Auger: the Deep's keeper (phase 17, docs/phase17-sheet.md). The guild's engine: a great drill on four iron legs,
// still boring for a vein that ran out two hundred years ago. Its order was: deeper. It is drawn here, in pieces: a
// hull with a boiler's glow, a collar where the bit goes through it, the bit, and its legs.
// Its hall, the bore (regions/hollow.js), is a pit of three floors. The upper two are the bore's own tiles (TIER_A,
// TIER_B: rock until RULE.bore passes them), drawn here, because it bores each away in turn.
//   tear    it marks where he stands, raises the bit and drives it down: a blow there
//   bite    after a few tears it drives the bit in deep and it sticks, the hull low: the opening. He gets up on its
//           back (a deck he can stand on: a mover of its own, level.js kind 'free') and strikes the collar. Then it
//           wrenches free and throws him off
//   spoil   from its second floor: rock flung from the bit, each piece onto a mark
//   bore    at two thirds of its strength and at one third: it bores straight down, the floor goes, and he and it
//           fall to the next. It lands hard: free blows
// The collar turns every blow except while the bit is stuck or it lies stunned. It wakes when he stands on its first
// floor, and starts over (the floors back) if he falls.
import { T, LEVEL, RULE } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { G } from './state.js';
const THREE = window.THREE;
export const AUGER = {
  name: 'The Auger', hp: 30, at: [2 / 3, 1 / 3],
  hullW: 5, hullH: 2.25, lift: 3.0, low: 0.3, reach: 16,
  speed: [2.2, 2.8, 3.4], tell: [0.95, 0.8, 0.68], half: 1.3, tears: [3, 2, 2],
  biteTell: 1.15, stuck: [3.6, 3.2, 2.9], take: 9, wrench: 0.55, throwV: [7, 9.5],
  spoil: { n: 3, fly: 0.95, gap: 0.22, half: 0.9 },
  bore: 1.9, fall: 0.55, stun: 2.4,
  // its coming, in seconds: the grinding and the spoil; the bit up through the floor; the hull out after it; it rears;
  // the bit driven down (its name, entrance.js); held; the fight
  rise: { full: { spoil: 0.2, bit: 1.6, hull: 3.0, rear: 4.2, slam: 4.6, end: 5.6 }, short: { spoil: 0.05, bit: 0.4, hull: 0.9, rear: 1.5, slam: 1.8, end: 2.4 } },
};
const A = AUGER;
const pix = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.clearRect(0, 0, w, h); paint((col, x, y, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), ww, hh); }); const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const flat = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, depthWrite: false, ...o });
const glowMat = (color, opacity = 0, map = null) => new THREE.MeshBasicMaterial({ color, map, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
// a round glow, dithered out to nothing at its edge
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
let HALO = null; const halo = () => HALO || (HALO = pix(32, 32, f => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++){ const d = Math.hypot(x - 15.5, y - 15.5) / 16; if (d < 1 && B4[(y & 3) * 4 + (x & 3)] / 16 < (1 - d) * (1 - d) * 1.5) f('#ffffff', x, y); } }));

export function makeAuger(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'bore'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  // the floors, from the first down: where he stands on each. The upper two are found from the bore's tiles
  const tiers = [], W = LEVEL.W; for (const v of [21, 22]){ let top = -1, x0 = 1e9, x1 = -1; for (let j = room.ty0; j < room.ty1; j++) for (let i = room.tx0; i < room.tx1; i++) if (LEVEL.tiles[j * W + i] === v){ top = Math.max(top, j); x0 = Math.min(x0, i); x1 = Math.max(x1, i); } tiers.push({ y: (top + 1) * T, x0: x0 * T, x1: (x1 + 1) * T }); }
  tiers.push({ y: (room.ty0 + 2) * T, x0: room.x0 + 1, x1: room.x1 - 1 });
  const cx = (mk.x + 0.5) * T, xMin = room.x0 + 4.2, xMax = room.x1 - 4.2;
  // ---- its pieces
  const TX = {
    hull: pix(80, 36, f => { f('#181425', 0, 4, 80, 32); f('#3a4466', 2, 6, 76, 28); f('#5a6988', 2, 6, 76, 3); f('#262b44', 2, 26, 76, 8); for (let x = 6; x < 78; x += 9){ f('#8b9bb4', x, 10, 2, 2); f('#8b9bb4', x, 28, 2, 2); }
      f('#181425', 8, 13, 20, 12); f('#3e2731', 10, 15, 16, 8); f('#f77622', 12, 17, 12, 4); f('#fee761', 14, 18, 8, 2); f('#181425', 52, 13, 20, 12); f('#3e2731', 54, 15, 16, 8); f('#f77622', 56, 17, 12, 4); f('#fee761', 58, 18, 8, 2);
      f('#181425', 62, 0, 8, 6); f('#5a6988', 63, 1, 6, 5); f('#181425', 0, 0, 80, 5); f('#b86f50', 1, 1, 78, 3); f('#feae34', 1, 1, 78, 1); }),
    collar: pix(24, 12, f => { f('#181425', 0, 0, 24, 12); f('#b86f50', 1, 1, 22, 10); f('#feae34', 1, 1, 22, 2); f('#743f39', 1, 8, 22, 3); f('#181425', 8, 0, 8, 12); f('#fee761', 9, 2, 6, 8); f('#ffffff', 11, 3, 2, 6); }),
    bit: pix(16, 32, f => { f('#181425', 2, 0, 12, 32); f('#8b9bb4', 3, 0, 10, 32); f('#c0cbdc', 4, 0, 3, 32); f('#5a6988', 10, 0, 3, 32); for (let k = 0; k < 4; k++) for (let x = 0; x < 12; x++) f('#181425', 2 + x, (k * 8 + Math.floor(x * 0.6)) % 32, 1, 2); }),
    tip: pix(16, 14, f => { for (let y = 0; y < 14; y++){ const half = Math.max(1, 7 - Math.floor(y / 2)); f('#181425', 8 - half - 1, y, half * 2 + 2, 1); f('#c0cbdc', 8 - half, y, half * 2, 1); f('#5a6988', 8, y, half, 1); } }),
    leg: pix(8, 32, f => { f('#181425', 0, 0, 8, 32); f('#5a6988', 1, 0, 6, 32); f('#8b9bb4', 1, 0, 2, 32); f('#262b44', 5, 0, 2, 32); for (let y = 4; y < 32; y += 9) f('#181425', 1, y, 6, 1); }),
    foot: pix(18, 7, f => { f('#181425', 0, 0, 18, 7); f('#8b9bb4', 1, 1, 16, 3); f('#262b44', 1, 4, 16, 2); }),
    slab: pix(64, 16, f => { f('#181425', 0, 0, 64, 16); f('#3a4466', 0, 1, 64, 14); f('#5a6988', 0, 1, 64, 2); f('#262b44', 0, 11, 64, 4); for (const x of [15, 31, 47, 63]) f('#181425', x, 1, 1, 14); for (const [x, y, w] of [[4, 6, 5], [20, 8, 6], [36, 5, 4], [50, 9, 7]]) f('#181425', x, y, w, 1); }),
    rock: pix(12, 12, f => { f('#181425', 2, 0, 8, 12); f('#181425', 0, 2, 12, 8); f('#5a6988', 2, 1, 8, 10); f('#5a6988', 1, 2, 10, 8); f('#8b9bb4', 3, 2, 5, 3); f('#262b44', 4, 8, 6, 2); }),
  };
  TX.bit.wrapT = THREE.RepeatWrapping; TX.slab.wrapS = THREE.RepeatWrapping;
  const add = (m, z) => { m.position.z = z; scene.add(m); return m; };
  const hull = add(new THREE.Mesh(new THREE.PlaneGeometry(A.hullW, A.hullH), flat(TX.hull)), 0.036), collar = add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), flat(TX.collar)), 0.037);
  const bit = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flat(TX.bit)), 0.034), tip = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 14 / 16), flat(TX.tip)), 0.034);
  const boil = add(new THREE.Mesh(new THREE.PlaneGeometry(6, 4), glowMat(0xff7a30, 0, halo())), 0.035), open = add(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), glowMat(0xfff0a0, 0, halo())), 0.038);
  const warn = add(new THREE.Mesh(new THREE.PlaneGeometry(A.half * 2, 0.16), glowMat(0xff4050, 0)), 0.04);
  const legs = [-2.0, -1.0, 1.0, 2.0].map((hx, k) => ({ hx, tx: [-3.1, -1.7, 1.7, 3.1][k], x: 0, y: 0, t: 1, from: 0, up: add(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), flat(TX.leg)), 0.031), dn: add(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), flat(TX.leg)), 0.032), ft: add(new THREE.Mesh(new THREE.PlaneGeometry(18 / 16, 7 / 16), flat(TX.foot)), 0.033) }));
  const slabs = tiers.slice(0, 2).map(tr => { const w = tr.x1 - tr.x0, map = TX.slab.clone(); map.needsUpdate = true; map.repeat.set(w * 16 / 64, 1); const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, 1), flat(map)), 0.02); m.position.set(tr.x0 + w / 2, tr.y - 0.5, 0.02); const red = add(new THREE.Mesh(new THREE.PlaneGeometry(w, 1), glowMat(0xff3040, 0)), 0.021); red.position.set(tr.x0 + w / 2, tr.y - 0.5, 0.021); return { m, red }; });
  const rocks = [];
  // the deck on its back: something he can stand on (level.js movers, kind 'free': it is where the Auger says)
  LEVEL.movers = (LEVEL.movers || []).filter(m => m.kind !== 'free'); LEVEL.moverGhosts = null;
  const deck = { kind: 'free', fx: cx, fy: -99, cx: 0, cy: 0, r: 0, ax: 0, ay: 0, period: 1, ph: 0, dir: 1, w: A.hullW - 0.4, x: cx, y: -99, px: cx, py: -99, at: -1 }; LEVEL.movers.push(deck);

  const B = { name: A.name, cx, room, ripples: [], get stageY(){ return tiers[B.tier || 0].y; },
    rage: 'The floor is about to break.', fell: 'It stops, for the first time in two hundred years.', hint: 'When its drill sticks in the floor, climb on its back and hit the collar.' };
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: A.name, frac: Math.max(0, B.hp / A.hp), phase: (B.tier || 0) + 1 } : null;
  B.reset = () => {
    Object.assign(B, { st: 'dormant', tm: 0, mt: 0, hp: A.hp, tier: 0, x: Math.min(xMax, cx + 9), lift: -4, mode: 'walk', count: 0, aim: null, taken: 0, flash: 0, spin: 0, bitDown: 0, shown: false, fallY: 0, dead: 0, shake: 0 });
    RULE.bore = 0; for (const s of slabs){ s.m.visible = true; s.red.material.opacity = 0; } for (const r of rocks){ scene.remove(r.m); scene.remove(r.mark); } rocks.length = 0;
    for (const L of legs){ L.x = B.x + L.tx; L.t = 1; } deck.fy = -99; warn.material.opacity = 0;
  };
  const go = m => { B.mode = m; B.mt = 0; };
  const openNow = () => B.st === 'fight' && (B.mode === 'stuck' || B.mode === 'stunned');
  const hullY = () => B.stageY + B.fallY + B.lift;          // the hull's underside
  const deckY = () => hullY() + A.hullH;
  // his blow: the collar takes it while it is open; else it rings off
  function struck(P, near, dmg, events){
    if (B.st !== 'fight' || !near) return false;
    const at = { x: B.x - P.face * 0.6, y: deckY() + 0.3 };
    if (!openNow()){ events.push({ type: 'block', at }); return true; }
    const floor = B.tier < 2 ? A.hp * A.at[B.tier] : 0; B.hp = Math.max(floor > 0 ? floor : -1, B.hp - dmg); B.taken += dmg; B.flash = 0.12; events.push({ type: 'hit', at, heavy: dmg >= 2 });
    if (B.hp <= 0){ B.st = 'die'; B.tm = 0; go('idle'); B.aim = null; events.push({ type: 'bossDie' }); }
    return true;
  }
  B.strike = (P, reach, dmg, events) => { const ahead = (B.x - P.x) * P.face, cy = deckY() + 0.4; return struck(P, ahead > -0.8 && ahead < reach + 0.8 && cy > P.y - 0.4 && cy < P.y + 3.4, dmg, events); };
  B.slam = (P, radius, dmg, events) => struck(P, Math.abs(B.x - P.x) < radius + 0.8 && P.y > deckY() - 2.6 && P.y < deckY() + 3, dmg + 1, events);
  const debris = (fx, x, y, n) => { fx.dust({ x, y }, n, 4); fx.burst({ x, y: y + 0.3 }, Math.round(n * 0.7), 0x8b9bb4); };
  const blow = (P, x, half, events, fx, word) => { if (P.x + 0.34 > x - half && P.x - 0.34 < x + half && P.y < B.stageY + 2.4 && P.y > B.stageY - 0.6 && !isRollInv(P)) hurt(P, 1, x, word); events.push({ type: 'bossSlam', at: { x, y: B.stageY } }); debris(fx, x, B.stageY, 22); };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt); B.shake = Math.max(0, B.shake - dt);
    const inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 && P.y < room.y1, floorY = B.stageY;
    let wantLift = A.lift, bitTo = 0.25, spin = 4, warnA = 0, warnX = B.x, redA = 0;
    if (B.st === 'dormant'){ wantLift = -4; B.lift = -4;
      if (inRoom && P.grounded && Math.abs(P.y - tiers[0].y) < 0.5 && P.hp > 0){ B.st = 'rise'; B.tm = 0; B.seq = G.keepers && G.keepers[LEVEL.theme] ? A.rise.short : A.rise.full; B.revealAt = B.seq.slam; B.x = Math.max(xMin, Math.min(xMax, P.x + (P.x < cx ? 9 : -9))); for (const L of legs){ L.x = B.x + L.tx; L.t = 1; } B.told = false; B.slammed = false; events.push({ type: 'bossWake', boss: B }); } }
    else if (B.st === 'rise'){ const S = B.seq, t = B.tm; spin = 14;
      if (!B.told && t >= S.spoil){ B.told = true; events.push({ type: 'bossTell' }); }
      if (t < S.hull){ if (Math.random() < dt * 14) debris(fx, B.x + (Math.random() - 0.5) * 2, floorY, 5); B.shake = 0.1; }
      // the bit first, up through the floor; then the hull after it; then it rears, and drives the bit down
      const u1 = Math.max(0, Math.min(1, (t - S.bit) / (S.hull - S.bit))), u2 = Math.max(0, Math.min(1, (t - S.hull) / (S.rear - S.hull)));
      wantLift = t < S.hull ? -4 + u1 * 1.2 : t < S.rear ? -2.8 + (A.lift + 2.8) * (u2 * u2 * (3 - 2 * u2)) : t < S.slam ? A.lift + 0.7 : A.lift; B.lift += (wantLift - B.lift) * Math.min(1, dt * 14); bitTo = t < S.rear ? 0.9 : t < S.slam ? -0.6 : 1.5;
      if (!B.slammed && t >= S.slam){ B.slammed = true; events.push({ type: 'bossSlam', at: { x: B.x, y: floorY } }); debris(fx, B.x, floorY, 40); }
      if (t >= S.end){ B.st = 'fight'; go('walk'); B.count = 0; } }
    else if (B.st === 'fight'){
      const tr = B.tier, floor = tr < 2 ? A.hp * A.at[tr] : -1;
      // the floor goes: at its mark it stops what it is doing and bores straight down
      if (tr < 2 && B.hp <= floor + 1e-6 && B.mode !== 'bore' && B.mode !== 'drop'){ go('bore'); B.aim = null; if (P.ride === deck){ P.ride = null; P.grounded = false; P.vy = A.throwV[1]; P.vx = (P.x < B.x ? -1 : 1) * A.throwV[0]; } events.push({ type: 'bossTell' }); }
      if (B.mode === 'walk'){ const dx = P.x - B.x, s = Math.sign(dx); if (Math.abs(dx) > 0.7) B.x = Math.max(xMin, Math.min(xMax, B.x + s * Math.min(Math.abs(dx), A.speed[tr] * dt)));
        if (B.mt > 0.5 && (Math.abs(dx) < 1.2 || B.mt > 2.6)){ const bite = B.count >= A.tears[tr]; B.aim = { x: Math.max(xMin, Math.min(xMax, P.x)), bite, t: 0, len: bite ? A.biteTell : A.tell[tr] }; go('aim'); events.push({ type: 'bossTell' }); } }
      else if (B.mode === 'aim'){ const Q = B.aim; Q.t += dt; B.x += (Q.x - B.x) * Math.min(1, dt * 7); wantLift = A.lift + 0.5; bitTo = -0.5; spin = Q.bite ? 22 : 10; warnA = 0.45 + 0.4 * Math.sin(Q.t * 28); warnX = Q.x; if (Q.bite) B.shake = 0.08;
        if (Q.t >= Q.len){ B.x = Q.x; blow(P, Q.x, A.half, events, fx, 'Bored through'); if (Q.bite){ go('stuck'); B.taken = 0; B.count = 0; } else { B.count++; go('lift');
            if (tr >= 1 && B.count === 1) for (let k = 0; k < A.spoil.n; k++){ const x = Math.max(room.x0 + 2, Math.min(room.x1 - 2, P.x + (k - 1) * 2.6 + (Math.random() - 0.5))); const m = add(new THREE.Mesh(new THREE.PlaneGeometry(12 / 16, 12 / 16), flat(TX.rock)), 0.045), mark = add(new THREE.Mesh(new THREE.PlaneGeometry(A.spoil.half * 2, 0.14), glowMat(0xff4050, 0.6)), 0.04); rocks.push({ x, x0: B.x, t: -k * A.spoil.gap, m, mark, y: floorY }); } } } }
      else if (B.mode === 'lift'){ bitTo = 1.2 - B.mt * 2; if (B.mt > 0.55) go('walk'); }
      else if (B.mode === 'stuck'){ wantLift = A.low; bitTo = 2.2; spin = 1; if (B.mt > A.stuck[tr] || B.taken >= A.take) go('wrench'); }
      else if (B.mode === 'wrench'){ wantLift = A.low; bitTo = 2.2; spin = 26; B.shake = 0.12; if (B.mt > A.wrench){ if (P.ride === deck || (Math.abs(P.x - B.x) < A.hullW / 2 && Math.abs(P.y - deckY()) < 0.4)){ P.ride = null; P.grounded = false; P.vy = A.throwV[1]; P.vx = (P.x < B.x ? -1 : 1) * A.throwV[0]; } go('walk'); debris(fx, B.x, floorY, 14); } }
      else if (B.mode === 'bore'){ wantLift = 1.2; bitTo = 2.4; spin = 30; redA = 0.25 + 0.5 * (B.mt / A.bore) * (0.6 + 0.4 * Math.sin(B.mt * 30)); B.shake = 0.1 + 0.3 * B.mt / A.bore; if (Math.random() < dt * 20) debris(fx, room.x0 + 2 + Math.random() * (room.x1 - room.x0 - 4), floorY, 4);
        if (B.mt >= A.bore){ slabs[tr].m.visible = false; slabs[tr].red.material.opacity = 0; for (let x = tiers[tr].x0 + 1; x < tiers[tr].x1; x += 2.5) debris(fx, x, floorY - 0.4, 10); B.fallY = tiers[tr].y - tiers[tr + 1].y; B.tier = tr + 1; RULE.bore = tr + 1; go('drop'); events.push({ type: 'bossPhase', boss: B }); } }
      else if (B.mode === 'drop'){ wantLift = 1.2; bitTo = 1; B.fallY = Math.max(0, B.fallY - (4 + B.mt * 30) * dt); if (B.fallY <= 0){ events.push({ type: 'bossSlam', at: { x: B.x, y: B.stageY } }); debris(fx, B.x, B.stageY, 40); for (const L of legs) L.x = B.x + L.tx; go('stunned'); B.count = 0; } }
      else if (B.mode === 'stunned'){ wantLift = A.low; bitTo = 0.2; spin = 0.5; if (B.mt > A.stun) go('walk'); }
      // its bit, while it bores the floor away: not to be stood by
      if (B.mode === 'bore' && Math.abs(P.x - B.x) < 0.75 && P.y < hullY() && P.y > B.stageY - 0.5 && !isRollInv(P)) hurt(P, 1, B.x, 'Caught by the bit');
    }
    else if (B.st === 'die'){ wantLift = A.low * 0.5; bitTo = 0.1; spin = Math.max(0, 6 - B.tm * 3); B.shake = B.tm < 1.2 ? 0.2 : 0; if (Math.random() < dt * (B.tm < 1.6 ? 16 : 2)) debris(fx, B.x + (Math.random() - 0.5) * 4, hullY() + 1, 5);
      if (B.tm > 3.2){ B.st = 'dead'; deck.fy = -99; events.push({ type: 'bossDead', boss: B }); } }
    if (B.st === 'fight' || B.st === 'die') B.lift += (wantLift - B.lift) * Math.min(1, dt * (wantLift < B.lift ? 10 : 4));
    B.bitDown += (bitTo - B.bitDown) * Math.min(1, dt * (bitTo > B.bitDown ? 26 : 5)); B.spin += spin * dt;
    // spoil in the air: each piece to its mark
    for (let k = rocks.length - 1; k >= 0; k--){ const r = rocks[k]; r.t += dt; const u = r.t / A.spoil.fly; r.mark.position.set(r.x, r.y + 0.08, 0.04); r.mark.material.opacity = 0.35 + 0.3 * Math.sin(B.tm * 26);
      if (u < 0){ r.m.visible = false; continue; } r.m.visible = true; r.m.position.set(r.x0 + (r.x - r.x0) * u, r.y + 3 + Math.sin(u * Math.PI) * 6 - 3 * u, 0.045); r.m.rotation.z += dt * 9;
      if (u >= 1){ if (P.x + 0.34 > r.x - A.spoil.half && P.x - 0.34 < r.x + A.spoil.half && P.y < r.y + 2.4 && P.y > r.y - 0.6 && !isRollInv(P)) hurt(P, 1, r.x, 'Struck by spoil'); debris(fx, r.x, r.y, 12); scene.remove(r.m); scene.remove(r.mark); rocks.splice(k, 1); } }

    // ---- drawn
    const sx = B.shake > 0 ? (Math.random() - 0.5) * B.shake : 0, hy = hullY(), top = hy + A.hullH, col = B.flash > 0 ? 0xffffff : B.st === 'die' ? 0x9090a0 : 0xdddddd;
    const shown = B.st !== 'dormant';
    hull.visible = collar.visible = shown; hull.position.set(B.x + sx, hy + A.hullH / 2, 0.036); collar.position.set(B.x + sx, top + 0.3, 0.037); hull.material.color.setHex(col); collar.material.color.setHex(openNow() ? 0xffffff : col);
    // the bit: from the hull's underside down; its tip at the floor, or in it
    const tipY = Math.min(hy - 0.2, floorY + B.fallY - B.bitDown + 0.9), len = Math.max(0.05, hy - tipY); bit.visible = tip.visible = shown && hy > floorY + B.fallY - 3.2;
    bit.scale.y = len; bit.position.set(B.x + sx, hy - len / 2, 0.034); TX.bit.repeat.y = len * 16 / 32; TX.bit.offset.y = -(B.spin * 0.35) % 1; tip.position.set(B.x + sx, tipY - 7 / 16, 0.034);
    boil.visible = shown; boil.position.set(B.x, hy + 1.1, 0.035); boil.material.opacity = B.st === 'die' ? Math.max(0, 0.3 - B.tm * 0.1) : 0.16 + 0.05 * Math.sin(B.tm * 5);
    open.visible = shown; open.position.set(B.x, top + 0.3, 0.038); open.material.opacity = openNow() ? 0.35 + 0.2 * Math.sin(B.tm * 12) : 0;
    warn.position.set(warnX, floorY + 0.09, 0.04); warn.material.opacity = warnA;
    if (B.tier < 2) slabs[B.tier].red.material.opacity = redA;
    // its legs: each foot stays where it is until the hull has gone too far from it; then it steps
    const stepping = legs.some(L => L.t < 1), ground = floorY + B.fallY;
    legs.forEach((L, k) => { const want = B.x + L.tx; if (L.t >= 1 && !stepping && Math.abs(want - L.x) > 0.9 && shown){ L.from = L.x; L.to = want + Math.sign(want - L.x) * 0.5; L.t = 0; }
      if (L.t < 1){ L.t = Math.min(1, L.t + dt / 0.2); L.x = L.from + (L.to - L.from) * L.t; L.y = Math.sin(L.t * Math.PI) * 0.7; if (L.t >= 1){ L.y = 0; fx.dust({ x: L.x, y: ground }, 4, 1.5); if (B.st === 'fight' && Math.abs(P.x - L.x) < 0.55 && P.y < ground + 0.6 && P.y > ground - 0.5 && !isRollInv(P)) hurt(P, 1, L.x, 'Trodden on'); } }
      if (B.mode === 'drop' || B.st === 'dormant') L.x = want;
      const hip = { x: B.x + L.hx + sx, y: hy + 0.6 }, foot = { x: L.x, y: ground + L.y + 0.2 }, knee = { x: (hip.x + foot.x) / 2 + Math.sign(L.hx) * 0.7, y: Math.max(hip.y, foot.y) + 0.9 + Math.max(0, (A.lift - B.lift) * 0.25) };
      for (const [m, a, b] of [[L.up, hip, knee], [L.dn, knee, foot]]){ const dx = b.x - a.x, dy = b.y - a.y, len2 = Math.hypot(dx, dy); m.visible = shown && B.lift > -2.2; m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, m.position.z); m.rotation.z = Math.atan2(dy, dx) - Math.PI / 2; m.scale.y = len2; }
      L.ft.visible = shown && B.lift > -2.2; L.ft.position.set(foot.x, foot.y - 0.02, 0.033); });
    // its back, to stand on
    deck.fx = B.x; deck.fy = shown && B.st !== 'rise' && B.st !== 'dead' ? top : -99;
    // its own light, in the dark: the boiler; the collar when it is open; where the bit will come down
    if (shown && R && R.glint){ R.glint(B.x, hy + 1.1, 0xff8a40, B.st === 'die' ? Math.max(0, 0.9 - B.tm * 0.3) : 0.95, 8.5, 0); if (openNow()) R.glint(B.x, top + 0.4, 0xfff0a0, 1.1, 5, 0); if (warnA > 0) R.glint(warnX, floorY + 0.4, 0xff4050, 0.7, 3.5, 0); }
  };
  B.reset();
  return B;
}
