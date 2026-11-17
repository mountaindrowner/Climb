// What the keepers throw (phase 7, docs/phase7-sheet.md): one attack each from its own place, with a warning, a way
// out, and a harder form from half health. Each keeper's own file is its body and its blows; this lays the thrown
// things over it without touching that: withThrows(B, scene, R) wraps the keeper's step, strike, slam and reset.
//   the Warden       a block of the wall is shoved out and bowls along the stage: jump it, or break it with the spade
//   the Toll         hymn-books flutter down from the lofts: stand between them, or cut one; from half health every
//                    slam throws bell shards out low in a fan: be where no mark is
//   the Rime Wyrm    it spits shards of ice in a spread: stand between two, block, or roll
//   the Thunderhead  ball lightning comes down a rod and rolls after him: outrun it, jump it, or cut it
//   Mother Thorn     a seed that roots: cut it where it lies, or a patch of thorns stands there a while
//   the Fallen       the dark lamp's embers go out from it in a ring with gaps: go through a gap (no block turns them)
// Every one is warned the same way: a red mark or line where it will be, for at least WARN seconds, and the keeper's
// own sound as the warning starts (the caller's 'bossTell').
import { hurt, isRollInv } from './motor.js';
const THREE = window.THREE;
export const WARN = 0.5;
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const texOf = c => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
// the pictures, drawn once: [width, height in pixels, how to draw it]
const DRAW = {
  block: [24, 24, g => { px(g, '#181425', 0, 0, 24, 24); px(g, '#5a6988', 1, 1, 22, 22); px(g, '#8b9bb4', 1, 1, 22, 2); px(g, '#3a4466', 1, 20, 22, 3); for (const [x, y, w] of [[1, 8, 22], [1, 15, 22]]) px(g, '#3a4466', x, y, w, 1); for (const [x, y] of [[8, 1], [16, 8], [6, 15], [14, 15]]) px(g, '#3a4466', x, y, 1, 7); px(g, '#2ce8f5', 10, 10, 4, 4); px(g, '#ffffff', 11, 11, 1, 1); }],
  book: [10, 8, g => { px(g, '#181425', 0, 1, 10, 7); px(g, '#733e39', 1, 2, 8, 5); px(g, '#ead4aa', 2, 1, 6, 1); px(g, '#ead4aa', 2, 3, 6, 3); px(g, '#181425', 5, 1, 1, 6); px(g, '#c0cbdc', 3, 4, 1, 1); px(g, '#c0cbdc', 7, 4, 1, 1); }],
  bell: [7, 7, g => { px(g, '#181425', 1, 0, 5, 7); px(g, '#181425', 0, 2, 7, 3); px(g, '#f77622', 1, 2, 5, 3); px(g, '#feae34', 2, 1, 3, 5); px(g, '#fee761', 2, 2, 2, 1); }],
  ice: [12, 5, g => { px(g, '#181425', 0, 1, 10, 3); px(g, '#181425', 9, 2, 3, 1); px(g, '#2ce8f5', 1, 2, 9, 1); px(g, '#ffffff', 2, 1, 6, 1); px(g, '#0099db', 2, 3, 6, 1); px(g, '#ffffff', 10, 2, 1, 1); }],
  ball: [12, 12, g => { for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++){ const d = Math.hypot(x - 5.5, y - 5.5); if (d < 6) px(g, d < 2.2 ? '#ffffff' : d < 4 ? '#cfe6ff' : d < 5 ? '#2ce8f5' : '#124e89', x, y); } }],
  seed: [8, 8, g => { px(g, '#181425', 1, 1, 6, 6); px(g, '#181425', 2, 0, 4, 8); px(g, '#63c74d', 2, 2, 4, 4); px(g, '#b8f060', 3, 2, 2, 2); px(g, '#3e8948', 2, 5, 4, 1); }],
  thorns: [32, 14, g => { for (let k = 0; k < 6; k++){ const x = 2 + k * 5, h = 8 + (k * 7) % 6; for (let y = 0; y < h; y++){ const w = Math.max(1, Math.round((1 - y / h) * 4)); px(g, '#181425', x - 1 + Math.floor((4 - w) / 2), 13 - y, w + 2, 1); px(g, y > h - 3 ? '#f6757a' : '#3e8948', x + Math.floor((4 - w) / 2), 13 - y, w, 1); } } px(g, '#265c42', 0, 13, 32, 1); }],
  ember: [6, 6, g => { px(g, '#181425', 1, 0, 4, 6); px(g, '#181425', 0, 1, 6, 4); px(g, '#124e89', 1, 1, 4, 4); px(g, '#2ce8f5', 2, 2, 2, 2); px(g, '#ffffff', 2, 2, 1, 1); }],
};
const TEX = {};
const pic = k => { if (!TEX[k]){ const [w, h, f] = DRAW[k], c = cnv(w, h); f(c.getContext('2d')); TEX[k] = { t: texOf(c), w: w / 16, h: h / 16 }; } return TEX[k]; };

// the things in flight, for one keeper. A thing: { kind (its picture), x, y, vx, vy, g (its fall), r (how near hurts),
// warn (seconds before it moves), mark: { x, y, w, h, rot } (the red mark shown through the warning), life, dmg, word,
// block (his guard turns it), cut (a cut destroys it), dig (the spade breaks it), noRoll (a roll does not pass it),
// spin, floor (it stops there), stay (seconds it stands where it lands, hurting), then(o) (called when it lands) }
export function makeThrown(scene, stageY){
  const L = [], T = { list: L, fx: null };
  const markMat = () => new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.5, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  T.add = o => { const p = pic(o.kind); o.t = 0; o.age = 0; o.r = o.r || Math.max(p.w, p.h) * 0.45; o.m = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshBasicMaterial({ map: p.t, transparent: true, depthWrite: false })); o.m.position.set(o.x, o.y, 0.08); o.m.renderOrder = 40; if (o.scale) o.m.scale.setScalar(o.scale); scene.add(o.m);
    if (o.mark){ o.wm = new THREE.Mesh(new THREE.PlaneGeometry(o.mark.w, o.mark.h || 0.12), markMat()); o.wm.position.set(o.mark.x, o.mark.y, 0.085); o.wm.rotation.z = o.mark.rot || 0; scene.add(o.wm); }
    o.warn = o.markOnly ? 0 : Math.max(o.warn || 0, o.mark ? WARN : 0); L.push(o); return o; };   // markOnly: its mark shows while it flies (its flight is the warning)
  const drop = (o, burst = true) => { scene.remove(o.m); o.m.material.dispose(); o.m.geometry.dispose(); if (o.wm){ scene.remove(o.wm); o.wm.material.dispose(); o.wm.geometry.dispose(); } o.dead = true; if (burst && T.fx) T.fx.burst({ x: o.x, y: o.y }, 10, o.col || 0xc0cbdc); };
  T.clear = () => { for (const o of L) drop(o, false); L.length = 0; };
  T.step = (dt, P, fx, events) => {
    T.fx = fx;
    for (const o of L){
      if (o.dead) continue;
      if (o.t < o.warn){ o.t += dt; const u = o.t / o.warn; if (o.wm){ o.wm.material.opacity = (u > 0.8 ? 0.95 : 0.35 + 0.3 * u) * (0.7 + 0.3 * Math.sin(o.t * 30)); } o.m.visible = !!o.show; if (o.show){ o.m.position.x = o.x + (Math.random() - 0.5) * 0.06; }
        if (o.t >= o.warn){ if (o.wm){ scene.remove(o.wm); o.wm.material.dispose(); o.wm.geometry.dispose(); o.wm = null; } o.m.visible = true; if (o.go) o.go(o); } continue; }
      o.age += dt;
      if (o.stood){ o.stood += dt; o.m.material.opacity = Math.min(1, (o.stay - o.stood) * 2); if (o.stood >= o.stay){ drop(o, false); continue; } }
      else {
        if (o.home){ const d = Math.sign(o.home.x - o.x); o.vx += (d * o.speed - o.vx) * Math.min(1, dt * 1.6); }   // it follows him along the floor, slowly turning
        if (o.sway){ o.x = o.x0 + Math.sin(o.age * o.sway[0] + o.sway[2]) * o.sway[1]; o.y -= o.fall * dt; } else { o.vy = (o.vy || 0) - (o.g || 0) * dt; o.x += (o.vx || 0) * dt; o.y += o.vy * dt; }
        if (o.spin) o.m.rotation.z -= o.spin * dt * Math.sign(o.vx || 1); else if (o.aim) o.m.rotation.z = Math.atan2(o.vy, o.vx);
        if (o.floor != null && o.y <= o.floor){ o.y = o.floor; if (o.stay){ o.stood = 0.001; o.vx = o.vy = 0; o.g = 0; if (o.then) o.then(o); } else { drop(o); continue; } }
        if (o.age > (o.life || 6) || (o.x0b != null && (o.x < o.x0b || o.x > o.x1b))){ drop(o); continue; }
      }
      o.m.position.set(o.x, o.y, 0.08);
      if (o.harmless || P.hp <= 0) continue;
      // does it touch him: its middle within r of his body's box
      const nx = Math.max(P.x - 0.34, Math.min(P.x + 0.34, o.x)), ny = Math.max(P.y, Math.min(P.y + P.h, o.y));
      if (Math.hypot(o.x - nx, o.y - ny) > o.r) continue;
      if (o.block && P.blocking && (P.face === Math.sign(o.x - P.x) || P.face === -Math.sign(o.vx || 0) || Math.abs(o.vx || 0) < Math.abs(o.vy || 0))){ events.push({ type: 'block', at: { x: o.x, y: o.y }, mine: true, shot: true }); drop(o); continue; }
      if (!o.noRoll && isRollInv(P)) continue;
      if (hurt(P, o.dmg || 1, o.x - Math.sign(o.vx || 0), o.word || 'Struck')){ if (!o.stay && !o.through) drop(o); }
    }
    for (let i = L.length - 1; i >= 0; i--) if (L[i].dead) L.splice(i, 1);
  };
  // his blow: what it can destroy within reach in front of him (a book, a ball, a seed; the spade, a block)
  T.strike = (P, reach, digs) => { let any = false; for (const o of L){ if (o.dead || o.t < o.warn && !o.show) continue; if (!(o.cut || (o.dig && digs))) continue; const ahead = (o.x - P.x) * P.face; if (ahead > -0.6 && ahead < reach + o.r && o.y > P.y - 0.5 && o.y < P.y + 3.2){ drop(o); any = true; } } return any; };
  T.slam = (P, radius, digs) => { let any = false; for (const o of L){ if (o.dead || !(o.cut || (o.dig && digs))) continue; if (Math.abs(o.x - P.x) < radius + o.r && Math.abs(o.y - P.y) < 2){ drop(o); any = true; } } return any; };
  return T;
}

// ---- each keeper's: when (every `every` seconds of the fight, by phase, when it is doing nothing else: `free`) and
// what (`cast`: adds the things). `onSlam`: called with a slam's place (the Toll's shards)
const SPEC = {
  'The Warden': { every: [7.5, 5.5], first: 4, free: () => true,
    cast(B, P, T){ const from = P.x > B.cx ? -1 : 1, ends = B.phase === 2 ? [from, -from] : [from];
      ends.forEach((s, k) => { const x = s < 0 ? B.room.x0 + 1.6 : B.room.x1 - 1.6; T.add({ kind: 'block', scale: 0.75, x, y: B.stageY + 0.56, vx: -s * (B.phase === 2 ? 10 : 8.5), spin: 5, show: true, warn: WARN + 0.25 + k * 0.7, mark: { x: B.cx, y: B.stageY + 0.08, w: B.room.x1 - B.room.x0 - 3 }, life: 6, x0b: B.room.x0 + 1, x1b: B.room.x1 - 1, r: 0.5, dig: true, noRoll: true, word: 'Bowled over', col: 0x8b9bb4 }); }); } },
  'The Toll': { every: [8, 6.5], first: 5, free: B => B.mode === 'idle',
    cast(B, P, T){ const n = B.phase === 2 ? 6 : 5, top = B.stageY + 13, gap = 3.9, x0 = P.x - gap * (n - 1) / 2 + (Math.random() - 0.5) * 1.5;
      for (let k = 0; k < n; k++){ const x = Math.max(B.room.x0 + 3, Math.min(B.room.x1 - 3, x0 + k * gap)); T.add({ kind: 'book', x, x0: x, y: top + (k % 2) * 1.5, fall: 3.4, sway: [2.2, 0.6, k * 1.3], warn: WARN + 0.2, mark: { x, y: B.stageY + 0.08, w: 2.0 }, floor: B.stageY + 0.2, life: 8, r: 0.45, cut: true, word: 'Struck by a hymn-book', col: 0xead4aa }); } },
    onSlam(B, at, T){ if (B.phase !== 2) return; for (const dir of [-1, 1]) for (let k = 1; k <= 3; k++){ const t = 0.75 + k * 0.12, d = 2.2 + k * 2.6, g = 20, tx = at.x + dir * d;
        T.add({ kind: 'bell', x: at.x + dir * 0.8, y: B.stageY + 0.6, vx: dir * (d - 0.8) / t, vy: (g * t * t / 2 - 0.4) / t, g, spin: 9, mark: { x: tx, y: B.stageY + 0.08, w: 0.9 }, warn: 0, markOnly: true, floor: B.stageY + 0.15, life: 3, r: 0.4, block: true, word: 'Cut by a shard of the bell', col: 0xfeae34 }); } } },
  'The Rime Wyrm': { every: [7, 5], first: 5, free: B => B.mode === 'circle',
    cast(B, P, T){ const H = B.h, base = Math.atan2(P.y + 1.3 - H.y, P.x - H.x), n = B.phase === 2 ? 5 : 3, spread = 0.3, sp = 13;
      for (const round of (B.phase === 2 ? [0, 1] : [0])) for (let k = 0; k < n - round; k++){ const a = base + (k - (n - 1 - round) / 2) * spread, L = 16;
        T.add({ kind: 'ice', x: H.x, y: H.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, aim: true, warn: WARN + 0.1 + round * 0.55, mark: { x: H.x + Math.cos(a) * L / 2, y: H.y + Math.sin(a) * L / 2, w: L, h: 0.08, rot: a }, life: 2.2, floor: B.stageY + 0.1, r: 0.4, block: true, word: 'Pierced by ice', col: 0x2ce8f5 }); } } },
  'The Thunderhead': { every: [9, 7], first: 6, free: B => B.mode === 'idle',
    cast(B, P, T){ const offs = [-10, 0, 10].map(o => B.cx + o).sort((a, b) => Math.abs(b - P.x) - Math.abs(a - P.x)), n = B.phase === 2 ? 2 : 1;   // down the rods furthest from him
      for (let k = 0; k < n; k++){ const x = offs[k]; T.add({ kind: 'ball', x, y: B.stageY + 4.5, vx: 0, vy: 0, show: true, warn: WARN + 0.3, mark: { x, y: B.stageY + 2.3, w: 0.16, h: 4.4 }, go: o => { o.y = B.stageY + 0.6; }, home: P, speed: 4.6, spin: 6, life: 6.5, r: 0.55, cut: true, noRoll: false, word: 'Burned by ball lightning', col: 0xcfe6ff }); } } },
  'Mother Thorn': { every: [8.5, 6.5], first: 5, free: B => B.mode === 'idle',
    cast(B, P, T){ const n = B.phase === 2 ? 3 : 2, H = B.h, g = 18;
      for (let k = 0; k < n; k++){ const off = k === 0 ? 0 : (k % 2 ? 1 : -1) * 4.2 * (P.face || 1), tx = Math.max(B.room.x0 + 3, Math.min(B.room.x1 - 3, P.x + off)), t = 0.9 + k * 0.15;   // the first where he stands, the next before him, the third behind
        T.add({ kind: 'seed', x: H.x, y: H.y, vx: (tx - H.x) / t, vy: (B.stageY + 0.3 - H.y + g * t * t / 2) / t, g, spin: 7, warn: 0, mark: { x: tx, y: B.stageY + 0.08, w: 2.2 }, markOnly: true, floor: B.stageY + 0.25, stay: 1.3, harmless: true, cut: true, r: 0.5, life: 9, col: 0x63c74d,
          then: o => { o.stay = 1.3; o.rooting = true; } }); } },
    root(B, o, T){ T.add({ kind: 'thorns', x: o.x, y: B.stageY + 14 / 32, vx: 0, vy: 0, floor: B.stageY + 14 / 32, stay: B.phase === 2 ? 6 : 4, warn: 0, r: 0.85, noRoll: true, life: 9, word: 'Torn by thorns', col: 0x3e8948 }); } },
  'The Fallen': { every: [9, 6.5], first: 6, free: B => B.mode === 'stalk',
    cast(B, P, T){ const n = 12, sp = 5.2, rings = B.phase === 2 ? [0, 1] : [0], cx = B.x, cy = B.y + 1.6;
      for (const ring of rings) for (let k = 0; k < n; k++){ if ((k + ring * 2) % 4 === 3) continue;   // the gaps: every fourth, turned in the second ring
        const a = (k + ring * 0.5) / n * Math.PI * 2; T.add({ kind: 'ember', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, show: true, warn: WARN + 0.3 + ring * 0.8, mark: { x: cx + Math.cos(a) * 1.6, y: cy + Math.sin(a) * 1.6, w: 2.2, h: 0.07, rot: a }, life: 3.2, r: 0.38, noRoll: false, through: false, word: 'Burned by the dark lamp', col: 0x2ce8f5 }); } } },
};
export const THROWS = SPEC;
// lay a keeper's thrown attack over it. B.throwNow() casts at once (the check tool); B.thrown is the things in flight
export function withThrows(B, scene){
  const S = B && SPEC[B.name]; if (!S) return B;
  const T = makeThrown(scene, B.stageY), step = B.step, strike = B.strike, slam = B.slam, reset = B.reset; let wait = S.first, P0 = null;
  const marksOnly = () => { for (const o of T.list) if (o.markOnly && o.wm && o.age > 0 && (o.stood || o.y <= o.floor + 0.05)){ scene.remove(o.wm); o.wm.material.dispose(); o.wm.geometry.dispose(); o.wm = null; } };
  B.thrown = T; B.throwNow = () => { if (P0) S.cast(B, P0, T); };
  B.step = (P, dt, fx, events) => {
    P0 = P; const n0 = events.length; step(P, dt, fx, events);
    if (B.st !== 'fight'){ if (T.list.length) T.clear(); wait = S.first; return; }
    if (B.throwHold) wait = 1;   // held off (tools/keeper-check.mjs casts by hand)
    wait -= dt; if (wait <= 0 && S.free(B) && P.hp > 0){ wait = S.every[B.phase === 2 ? 1 : 0]; S.cast(B, P, T); events.push({ type: 'bossTell' }); }
    if (S.onSlam) for (let i = n0; i < events.length; i++) if (events[i].type === 'bossSlam' && !events[i].soft && events[i].at) S.onSlam(B, events[i].at, T);
    // a thing with a mark that shows while it flies (a lobbed shard, a seed): the mark stays until it lands
    for (const o of T.list) if (o.markOnly && o.wm){ o.wm.material.opacity = 0.45 + 0.3 * Math.sin(o.age * 30); }
    T.step(dt, P, fx, events); marksOnly();
    if (S.root) for (const o of T.list) if (o.rooting && o.stood >= o.stay - 0.05 && !o.rooted){ o.rooted = true; S.root(B, o, T); }
  };
  B.strike = (P, reach, dmg, events) => { const a = T.strike(P, reach, P.weapon === 'spade'); return strike(P, reach, dmg, events) || a; };
  B.slam = (P, radius, dmg, events) => { const a = T.slam(P, radius, P.weapon === 'spade'); return slam(P, radius, dmg, events) || a; };
  B.reset = () => { T.clear(); wait = S.first; reset(); };
  return B;
}
