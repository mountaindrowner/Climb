// The Thunderhead: the Tempest's keeper. The storm with a face: a bank of black cloud over the whole stage, a pale mask in
// it that follows him, and inside, its heart, a ball of lightning. Three lightning rods of the old works stand on the
// stage. A puppet of flat pieces (tools/thunderhead-parts.py), moved here. It cannot be reached in the cloud:
//   bolts    marks on the stage round him, one after another; each is struck: step off them
//   walk     a line of bolts walks the stage from one end (from both, when it rages): roll through it
//   gust     the wind shoves him along the stage while bolts fall where it carries him (it turns round, when it rages)
//   charge   every other thing it does, it gathers lightning over one rod (two, when it rages): the rod hums and climbs
//            bright, the mask leans over it, then the strike lands (not a place to stand) and the rod burns a while.
//            Cut a burning rod and the charge goes back up into the cloud: the Thunderhead comes down stunned, its
//            heart bared beside him. That is when it is hurt. A rod left to burn out, when it rages, throws arcs along
//            the floor: jump them
// It wakes when he walks out onto the stage, and starts over if he dies.
import { T, LEVEL, solidAt } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { tex, glow, additive } from './boss.js';
import { lit as litMat } from './render.js';
const THREE = window.THREE;
export const THUNDERHEAD = {
  name: 'The Thunderhead', hp: 30, phase2: 0.5,
  rods: [-10, 0, 10], rodTip: 4.5,                    // where the rods stand from the stage's middle; how high their tips are
  cloudY: 8.3, maskY: 7.7, follow: 3.4,              // over the stage; how fast the mask comes after him
  bolt: { warn: [0.78, 0.6], life: 0.14, half: 0.55 },
  bolts: { n: [4, 6], gap: [0.32, 0.22], spread: 5.5 },
  walk: { step: 2.2, lag: [0.2, 0.15] },
  gust: { tell: 0.8, time: [2.6, 3.6], push: [3.2, 4.0], every: [0.6, 0.45] },
  charge: { time: [2.4, 1.7], live: [3.2, 2.6], near: 1.0, second: 0.55 },
  stun: { sink: 0.6, time: [4.2, 3.4], rise: 0.9, coreY: 1.5, maskY: 3.4 },
  arc: { speed: 9, reach: 7 },
  cd: [1.3, 0.85],
};
const TH = THUNDERHEAD;
const BASE = 'assets/side/thunderhead/';
// a strip of forked lightning, to stretch between two points
function zapTex(seed){
  const c = document.createElement('canvas'); c.width = 16; c.height = 64; const g = c.getContext('2d'); let x = 8, s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < 64; y++){ if (y % 4 === 0) x += Math.round((rnd() - 0.5) * 6); x = Math.max(3, Math.min(12, x)); if (y < 3 || y > 60) x += Math.sign(8 - x);
    g.fillStyle = '#8fc0ff'; g.fillRect(x - 1, y, 3, 1); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); if (rnd() < 0.08){ g.fillStyle = '#fee761'; g.fillRect(x + 1, y, 3, 1); g.fillRect(x + 3, y + 1, 2, 1); } }
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}

export function makeThunderhead(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'gale'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 2.6, xMax = room.x0 + 34.4;
  const B = { name: TH.name, hint: 'it strikes the rods: cut one while it burns', rage: 'the whole sky comes down', fell: 'the storm breaks',
    st: 'dormant', tm: 0, hp: TH.hp, phase: 1, flash: 0, cd: 1.2, room, stageY, cx, mode: 'idle', mt: 0, acts: 0,
    mx: cx, my: stageY + 13, tilt: 0, kx: cx, ky: stageY + 13, out: 0, hz: [], arcs: [], zaps: [], wind: 0, windA: 0, look: 0, gone: 0 };
  const piece = (file, w, h, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w / 16, h / 16), litMat({ map: tex(BASE + file + '.png'), normalMap: tex(BASE + file + '_n.png'), transparent: true, alphaTest: 0.5 })); m.position.z = z; scene.add(m); return m; };
  const SIZE = { puff_a: [120, 64], puff_b: [88, 52], puff_c: [60, 40] };
  // ---- the cloud: a back row of great lumps, a front row of smaller ones the mask looks out between
  const puffs = [];
  { let k = 0;
    for (let x = room.x0 - 2; x < room.x1 + 3; x += 4.7){ const m = piece('puff_a', 120, 64, -1.3 - (k % 3) * 0.02); m.material.color.setHex(0x8088a8); puffs.push({ m, x, y: stageY + TH.cloudY + 1.7 + (k % 2) * 0.5, ph: k * 1.7, amp: 0.25, back: true, k: 1.15 }); k++; }
    for (let x = room.x0 - 1; x < room.x1 + 2; x += 3.1){ const f = k % 3 === 0 ? 'puff_c' : 'puff_b', m = piece(f, SIZE[f][0], SIZE[f][1], -0.32 - (k % 4) * 0.02); puffs.push({ m, x, y: stageY + TH.cloudY + 1.15 + ((k * 7) % 5) * 0.14, ph: k * 2.3, amp: 0.18, back: false, k: 1 }); k++; } }
  // three small ones that come down with the mask when it falls, so it is still of the cloud
  const tether = [0, 1, 2].map(k => { const m = piece('puff_c', 60, 40, -0.7 + k * 0.01); m.visible = false; return m; });
  const mask = piece('mask', 92, 84, -0.6); mask.visible = false; mask.scale.setScalar(0.9);
  const glowTex = glow('rgba(255,255,255,1)'), warnTex = glow('rgba(255,60,50,1)');
  const eyes = [-1, 1].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), additive(glowTex, 0xbfe8ff, 0)); scene.add(m); return m; });
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), additive(glowTex, 0xfee761, 0)); scene.add(mouth);
  const core = new THREE.Mesh(new THREE.PlaneGeometry(44 / 16, 44 / 16), new THREE.MeshBasicMaterial({ map: tex(BASE + 'core.png'), transparent: true, alphaTest: 0.5 })); core.position.z = -0.5; core.visible = false; scene.add(core);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), additive(glowTex, 0xffd27a, 0)); scene.add(halo);
  const light = new THREE.PointLight(0xbfd8ff, 0, 18, 1.4); scene.add(light);
  // ---- the rods
  const rods = TH.rods.map((off, i) => { const x = cx + off, m = piece('rod', 28, 88, -0.12); m.scale.setScalar(0.85); m.position.set(x, stageY + 88 / 32 * 0.85 - 0.05, -0.12);
    const g = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6.2), additive(glowTex, 0xfee761, 0)); g.position.set(x, stageY + 2.5, -0.1); scene.add(g);
    const blip = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), additive(glowTex, 0xffffff, 0)); blip.position.set(x, stageY + 1, -0.08); scene.add(blip);
    const warn = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), additive(warnTex, 0xff5040, 0)); warn.position.set(x, stageY + 0.22, 0.4); scene.add(warn);
    return { i, x, m, g, blip, warn, st: 'off', t: 0, dur: 1, lag: 0, ring: 0 }; });
  const markGeo = new THREE.PlaneGeometry(1.5, 0.6), zapGeo = new THREE.PlaneGeometry(1, 1), zapTexs = [zapTex(7), zapTex(91), zapTex(333)];
  // the wind, drawn: thin streaks across the picture
  const streaks = []; for (let k = 0; k < 26; k++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + (k % 4) * 0.5, 1 / 16), additive(null, 0xcfe0ff, 0)); m.position.z = 1.5; m.visible = false; scene.add(m); streaks.push({ m, ox: (k * 7.3) % 22 - 11, oy: (k * 3.7) % 10 - 4.5, v: 24 + (k % 5) * 3 }); }

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = (x, pad = 0) => Math.max(xMin + pad, Math.min(xMax - pad, x));
  const go = m => { B.mode = m; B.mt = 0; };
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: TH.name, frac: Math.max(0, B.hp / TH.hp), phase: B.phase } : null;
  // lightning from one point to another, for a moment
  function zap(x0, y0, x1, y1, life = 0.16, wide = 1, col = 0xffffff){
    const m = new THREE.Mesh(zapGeo, new THREE.MeshBasicMaterial({ map: zapTexs[Math.floor(Math.random() * 3)], color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1; m.scale.set((Math.random() < 0.5 ? -1 : 1) * wide, L, 1); m.rotation.z = Math.atan2(dy, dx) - Math.PI / 2; m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.6); scene.add(m); B.zaps.push({ m, t: 0, life });
  }
  const cloudAt = x => stageY + TH.cloudY - 0.4 + Math.sin(x * 0.7) * 0.3;   // the cloud's underside, there
  // a bolt on the stage: a mark that warns, then the strike
  const colGeo = new THREE.PlaneGeometry(0.9, 7.5);
  const strikeAt = (x, lag = 0) => { const mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0)); mark.position.set(x, stageY + 0.2, 0.4); scene.add(mark);
    const col = new THREE.Mesh(colGeo, additive(warnTex, 0xff4030, 0)); col.position.set(x, stageY + 3.6, 0.38); scene.add(col); B.hz.push({ x, t: -lag, mark, col, hit: false, struck: false }); };
  const clear = () => { for (const h of B.hz){ scene.remove(h.mark); scene.remove(h.col); } B.hz.length = 0; for (const a of B.arcs) scene.remove(a.m); B.arcs.length = 0; for (const r of rods){ r.st = 'off'; r.t = 0; } B.wind = 0; B.blown = false; };
  B.reset = () => {
    clear(); for (const z of B.zaps) scene.remove(z.m); B.zaps.length = 0;
    Object.assign(B, { st: 'dormant', tm: 0, hp: TH.hp, phase: 1, cd: 1.2, mode: 'idle', mt: 0, acts: 0, mx: cx, my: stageY + 13, tilt: 0, out: 0, gone: 0, down: false, burst: false, swell: 1, shown: false, fallV: 0 });
    for (const p of puffs){ p.m.visible = true; p.dead = false; p.keep = false; }
  };

  // what it does next: every other thing is a charge; between them the three kinds of weather in turn
  function next(P, events){
    const i = B.acts++; events.push({ type: 'bossTell' });
    if (i % 2 === 1) return startCharge(P);
    const act = ['bolts', 'walk', 'gust'][Math.floor(i / 2) % 3];
    if (act === 'bolts'){ const n = ph(TH.bolts.n); for (let k = 0; k < n; k++) strikeAt(clampX(k === 0 ? P.x : P.x + (Math.random() - 0.5) * 2 * TH.bolts.spread), k * ph(TH.bolts.gap)); go('bolts'); }
    else if (act === 'walk'){
      const from = P.x > cx ? 1 : -1, sides = B.phase === 2 ? [from, -from] : [from];   // from the far end, toward him
      for (const d of sides){ let k = 0; for (let x = d > 0 ? xMin + 0.4 : xMax - 0.4; d > 0 ? x <= xMax : x >= xMin; x += d * TH.walk.step){ if (sides.length === 2 && (x - cx) * d > 1.2) break; strikeAt(x, 0.3 + k * ph(TH.walk.lag)); k++; } }
      go('walk');
    }
    else { B.windDir = Math.sign(P.x - cx) || 1; B.gustN = 0; B.turned = false; B.blown = false; go('gust'); }
  }
  function startCharge(P){
    const near = [0, 1, 2].sort((a, b) => Math.abs(rods[a].x - P.x) - Math.abs(rods[b].x - P.x));   // never, at first, the one farthest from him
    const order = [0, 1, 2].sort(() => Math.random() - 0.5), picks = B.phase === 2 ? order.slice(0, 2) : [near[Math.random() < 0.5 ? 0 : 1]];
    picks.forEach((k, n) => { const r = rods[k]; r.st = 'charge'; r.t = 0; r.lag = n * TH.charge.second; r.dur = ph(TH.charge.time); r.ring = 0; });
    go('charge');
  }
  // he has cut a burning rod: the charge goes back up, and the Thunderhead comes down
  function reflect(P, rod, events){
    for (const r of rods){ r.st = 'off'; r.t = 0; } for (const h of B.hz){ scene.remove(h.mark); scene.remove(h.col); } B.hz.length = 0; B.wind = 0;
    zap(rod.x, stageY + TH.rodTip, B.mx, B.my - 0.6, 0.34, 2.2, 0xfff6c0); zap(rod.x, stageY + TH.rodTip, B.mx + 0.6, B.my, 0.26, 1.4);
    B.flash = 0.3; events.push({ type: 'hit', at: { x: rod.x, y: stageY + 2 }, heavy: true }); events.push({ type: 'bossSlam', at: { x: rod.x, y: stageY } });
    let sx = rod.x + (P.face || 1) * 2.6; if (sx < xMin + 2.5 || sx > xMax - 2.5) sx = rod.x - (P.face || 1) * 2.6;
    B.sx = clampX(sx, 2.5); B.fromX = B.mx; B.fromY = B.my; go('fall');
  }

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt);
    const inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 - 1 && P.y < room.y1, floatY = stageY + TH.maskY + Math.sin(B.tm * 1.3) * 0.25;
    let eyeA = 0, eyeCol = B.phase === 2 ? 0xff7060 : 0xbfe8ff, weak = 0, mouthA = 0, wantX = clampX(P.x, 3), wantWind = 0;
    if (B.st === 'dormant'){
      if (inRoom && P.grounded && P.y >= stageY - 0.05 && P.y < stageY + 0.5 && P.hp > 0 && P.x < xMax - 1.5 && P.x > xMin){ B.st = 'rise'; B.tm = 0; B.mx = clampX(P.x - 4, 3); B.my = stageY + 13; B.rodN = 0; events.push({ type: 'bossWake', boss: B }); B.flash = 0.4; }
    }
    else if (B.st === 'rise'){
      // the cloud draws down; the mask comes out of it; each rod in turn takes a small strike (so he sees them)
      const u = Math.min(1, Math.max(0, (B.tm - 0.5) / 1.6)), e = u * u * (3 - 2 * u); B.my = stageY + 13 + (floatY - stageY - 13) * e; B.mx += (wantX - B.mx) * Math.min(1, dt * 1.5); eyeA = Math.max(0, (B.tm - 1.6) / 0.8);
      const n = Math.floor((B.tm - 1.3) / 0.45);
      while (B.rodN <= n && B.rodN < rods.length && n >= 0){ const r = rods[B.rodN++]; zap(r.x + (Math.random() - 0.5), cloudAt(r.x), r.x, stageY + TH.rodTip, 0.2, 1); r.ring = 0.5; fx.burst({ x: r.x, y: stageY + TH.rodTip }, 10, 0xfee761); events.push({ type: 'rockLand', at: { x: r.x, y: stageY + TH.rodTip - 0.5 } }); B.flash = 0.15; }
      if (B.tm > 3.1){ B.st = 'fight'; B.tm = 0; go('idle'); B.cd = 0.9; }
    }
    else if (B.st === 'die'){
      // the cloud tears, lightning everywhere; the mask drops and breaks; its heart goes out
      eyeA = Math.max(0, 1 - B.tm / 2) * (Math.floor(B.tm * 14) % 2 ? 1 : 0.3); weak = 1;
      if (Math.random() < dt * 14){ const x = xMin + Math.random() * (xMax - xMin); zap(x + (Math.random() - 0.5) * 3, cloudAt(x), x, stageY + Math.random() * 3, 0.14, 1); B.flash = Math.max(B.flash, 0.08); if (Math.random() < 0.3) events.push({ type: 'rockLand', at: { x, y: stageY } }); }
      const n = Math.floor(B.tm / 0.13);
      while (B.gone < n){ const live = puffs.filter(p => !p.dead && !p.keep); if (!live.length) break; const p = live.reduce((a, b) => Math.abs(a.x - B.mx) > Math.abs(b.x - B.mx) ? a : b); p.dead = true; p.m.visible = false; fx.burst({ x: p.m.position.x, y: p.m.position.y }, 10, 0x5a6988); B.gone++; }
      if (B.tm <= 1.7){ B.my += dt * (2.6 - B.tm); B.mx += Math.sin(B.tm * 70) * dt * 3; B.tilt = Math.sin(B.tm * 31) * 0.12; B.out = 1; B.swell = 1 + B.tm * 0.5; }   // it drags itself up, its heart swelling
      else {
        if (!B.burst){ B.burst = true; B.out = 0; B.flash = 0.6; fx.ring({ x: B.kx, y: B.ky }, 0xffffff); fx.burst({ x: B.kx, y: B.ky }, 50, 0xfee761); fx.burst({ x: B.kx, y: B.ky }, 30, 0xffffff); events.push({ type: 'bossSlam', at: { x: B.kx, y: B.ky - 1 }, soft: true }); }   // the heart goes out
        B.fallV = (B.fallV || 0) - 24 * dt; B.my += B.fallV * dt; if (!B.down) B.tilt += dt * 0.9 * (B.mx > cx ? -1 : 1);
        const floor = stageY + 1.9; if (B.my < floor){ B.my = floor; B.fallV = 0; if (!B.down){ B.down = true; events.push({ type: 'bossSlam', at: { x: B.mx, y: stageY } }); fx.burst({ x: B.mx, y: stageY + 0.5 }, 30, 0xc0cbdc); B.flash = 0.3; B.tilt = (B.mx > cx ? -1 : 1) * Math.max(0.35, Math.min(Math.abs(B.tilt), 0.6)); } } }
      if (B.tm > 4.2){ B.st = 'dead'; events.push({ type: 'bossDead', boss: B }); }
    }
    else if (B.st === 'fight'){
      const M = B.mode;
      if (M === 'idle'){ B.cd -= dt; if (B.cd <= 0) next(P, events); }
      else if (M === 'bolts' || M === 'walk'){ if (!B.hz.length){ go('idle'); B.cd = ph(TH.cd); } }
      else if (M === 'gust'){
        const G = TH.gust, total = ph(G.time), t = B.mt - G.tell;
        if (t < 0) wantWind = 0.35 * B.windDir;
        else {
          if (!B.blown){ B.blown = true; events.push({ type: 'bossSweep', at: { x: P.x, y: stageY } }); }
          let dir = B.windDir;
          if (B.phase === 2){ const half = total / 2; if (Math.abs(t - half) < 0.2) dir = 0; else if (t > half){ dir = -dir; if (!B.turned){ B.turned = true; events.push({ type: 'bossSweep', at: { x: P.x, y: stageY } }); } } }
          wantWind = dir;
          if (dir && P.hp > 0 && inRoom && !solidAt(P.x + dir * 0.45, P.y + 0.5) && !solidAt(P.x + dir * 0.45, P.y + 1.8)) P.x += dir * ph(G.push) * dt * (P.grounded ? 1 : 0.8);
          const k = Math.floor(t / ph(G.every)); while (B.gustN <= k){ B.gustN++; if (dir) strikeAt(clampX(P.x + dir * (0.8 + Math.random() * 3.2))); }   // where it is carrying him
          if (t >= total){ B.blown = false; go('idle'); B.cd = ph(TH.cd); }
        }
      }
      else if (M === 'charge'){
        const live = rods.filter(r => r.st !== 'off'); if (live.length) wantX = clampX(live.reduce((a, r) => a + r.x, 0) / live.length, 3);
        if (!live.length){ go('idle'); B.cd = ph(TH.cd); }
        eyeCol = 0xfee761; mouthA = 0.5;
      }
      else if (M === 'fall'){
        const u = Math.min(1, B.mt / TH.stun.sink), e = u * u; B.mx = B.fromX + (B.sx - B.fromX) * e; B.my = B.fromY + (stageY + TH.stun.maskY - B.fromY) * e; B.tilt = 0.32 * e * (B.sx > B.fromX ? -1 : 1); B.out = e; weak = e;
        if (u >= 1){ go('down'); events.push({ type: 'bossSlam', at: { x: B.sx, y: stageY }, soft: true }); }
      }
      else if (M === 'down'){
        weak = 1; B.out = 1; B.my = stageY + TH.stun.maskY + Math.sin(B.mt * 2.2) * 0.12; const left = ph(TH.stun.time) - B.mt;
        if (Math.random() < dt * 10) fx.burst({ x: B.kx + (Math.random() - 0.5), y: B.ky + (Math.random() - 0.5) }, 1, 0xfee761);
        if (left < 0.9) B.out = 1 - 0.25 * (Math.floor(B.mt * 12) % 2);   // it gathers itself: the heart flickers
        if (left <= 0) go('up');
      }
      else if (M === 'up'){
        const u = Math.min(1, B.mt / TH.stun.rise), e = u * u * (3 - 2 * u); B.my = stageY + TH.stun.maskY + (floatY - stageY - TH.stun.maskY) * e; B.tilt *= Math.max(0, 1 - dt * 5); B.out = 1 - e; weak = 1 - e;
        if (u >= 1){ B.tilt = 0; go('idle'); B.cd = ph(TH.cd) * 0.7; }
      }
      // the mask: after him, over the rods it is charging; its eyes on him
      if (M !== 'fall' && M !== 'down' && M !== 'up'){ B.mx += Math.max(-TH.follow * dt, Math.min(TH.follow * dt, wantX - B.mx)); B.my += (floatY - B.my) * Math.min(1, dt * 3); eyeA = 1; }
      else eyeA = (1 - weak) + weak * (Math.sin(B.tm * 23) > 0.8 ? 0.5 : 0.08);
    }
    B.look += (Math.max(-1, Math.min(1, (P.x - B.mx) / 6)) - B.look) * Math.min(1, dt * 4);
    // ---- the rods: gathering, the strike, burning
    for (const r of rods){
      r.ring = Math.max(0, r.ring - dt); let ga = r.ring * 0.8, gc = 0xfee761, ba = 0, wa = 0, em = r.ring;
      if (r.st === 'charge' && B.st === 'fight'){
        r.t += dt; const u = Math.max(0, (r.t - r.lag) / r.dur);
        if (u > 0){
          ga = 0.12 + 0.5 * u; ba = 0.5 + 0.5 * u; r.blip.position.y = stageY + 0.6 + ((B.tm * (1.2 + u * 3)) % 1) * (TH.rodTip - 0.8);   // a light climbing it, faster and faster
          if (Math.random() < dt * (4 + u * 26)) zap(r.x + (Math.random() - 0.5) * 2.5, cloudAt(r.x), r.x, stageY + TH.rodTip, 0.07, 0.6, 0xbfd8ff);                       // feelers between the cloud and its tip
          if (Math.random() < dt * (5 + u * 12)) zap(B.mx, B.my - 1.2, r.x, stageY + TH.rodTip, 0.08, 0.7, 0xfee761);                                                // and from its mouth: which rod it means
          em = 0.15 + 0.5 * u;
          if (u > 0.72) wa = 0.4 + 0.5 * Math.sin(r.t * 30);
          if (u >= 1){
            r.st = 'live'; r.t = 0; r.live = ph(TH.charge.live); r.ring = 0.6; B.flash = 0.25;
            zap(r.x + (Math.random() - 0.5) * 1.5, cloudAt(r.x) + 0.6, r.x, stageY + TH.rodTip, 0.26, 1.9, 0xfff6c0); zap(r.x - 0.5, cloudAt(r.x), r.x, stageY + TH.rodTip - 0.5, 0.18, 1.1);
            fx.burst({ x: r.x, y: stageY + TH.rodTip }, 24, 0xfff6c0); fx.ring({ x: r.x, y: stageY + 0.4 }, 0xfee761); events.push({ type: 'bossToll', at: { x: r.x, y: stageY } });
            if (Math.abs(P.x - r.x) < TH.charge.near && P.y < stageY + 3 && P.y > stageY - 1 && !isRollInv(P)) hurt(P, 1, r.x, 'Struck by lightning');
          }
        }
      }
      else if (r.st === 'live' && B.st === 'fight'){
        r.t += dt; const left = r.live - r.t; ga = 0.85 + 0.15 * Math.sin(r.t * 18); gc = 0xfff2b0; em = 1;
        if (Math.random() < dt * 22){ const a = Math.random() * TH.rodTip, sx = (Math.random() - 0.5) * 0.9; zap(r.x + sx, stageY + a, r.x - sx, stageY + Math.min(TH.rodTip, a + 0.8 + Math.random() * 1.2), 0.06, 0.5, 0xfee761); }   // it crawls with light if (left < 0.7 && Math.floor(r.t * 14) % 2) ga *= 0.45;   // it gutters before it goes out
        ba = 1; r.blip.position.y = stageY + TH.rodTip - 0.2;
        if (Math.random() < dt * 16) fx.burst({ x: r.x + (Math.random() - 0.5) * 0.8, y: stageY + 0.5 + Math.random() * TH.rodTip }, 1, 0xfee761);
        if (Math.floor(r.t / 0.5) !== Math.floor((r.t - dt) / 0.5)) fx.ring({ x: r.x, y: stageY + 2.3 }, 0xfee761);
        R.glint(r.x, stageY + 2.6, 0xfff0a0, 0.9, 6.5);
        if (left <= 0){ r.st = 'off';
          if (B.phase === 2){ for (const d of [-1, 1]){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), additive(glowTex, 0xfee761, 0.9)); m.position.set(r.x, stageY + 0.4, 0.45); scene.add(m); B.arcs.push({ x: r.x, x0: r.x, d, m, hit: false }); } events.push({ type: 'rockLand', at: { x: r.x, y: stageY } }); } }
      }
      r.g.material.opacity = ga; r.g.material.color.setHex(gc); r.blip.material.opacity = ba; r.warn.material.opacity = wa;
      { const k = Math.min(1, em); r.m.material.emissive.setRGB(k * 0.85, k * 0.7, k * 0.25); }
    }
    // ---- bolts on the stage
    for (let i = B.hz.length - 1; i >= 0; i--){
      const h = B.hz[i]; h.t += dt; if (h.t < 0) continue;
      const warn = ph(TH.bolt.warn);
      if (h.t < warn){ h.mark.material.opacity = 0.35 + 0.5 * (h.t / warn) + 0.15 * Math.sin(h.t * 34); h.col.material.opacity = 0.07 + 0.2 * (h.t / warn); if (Math.random() < dt * 12) fx.burst({ x: h.x + (Math.random() - 0.5) * 0.5, y: stageY + Math.random() * 6 }, 1, 0xbfd8ff); }
      else {
        if (!h.struck){ h.struck = true; h.mark.material.opacity = 0; h.col.material.opacity = 0; zap(h.x + (Math.random() - 0.5) * 2, cloudAt(h.x) + 0.5, h.x, stageY, 0.2, 2.4); zap(h.x + (Math.random() - 0.5), cloudAt(h.x) + 0.5, h.x, stageY, 0.12, 1.2, 0xfff6c0); fx.burst({ x: h.x, y: stageY + 0.2 }, 12, 0xfff6c0); R.glint(h.x, stageY + 1.5, 0xdff0ff, 1.2, 7, 0.22); B.flash = Math.max(B.flash, 0.1); events.push({ type: 'rockLand', at: { x: h.x, y: stageY } }); }
        if (!h.hit && Math.abs(P.x - h.x) < TH.bolt.half && P.y < stageY + 7 && P.y > stageY - 1 && !isRollInv(P)){ if (hurt(P, 1, h.x, 'Struck by lightning')) h.hit = true; }
        if (h.t >= warn + TH.bolt.life){ scene.remove(h.mark); scene.remove(h.col); B.hz.splice(i, 1); }
      }
    }
    // arcs along the floor, from a rod left to burn out
    for (let i = B.arcs.length - 1; i >= 0; i--){
      const a = B.arcs[i]; a.x += a.d * TH.arc.speed * dt; a.m.position.x = a.x; a.m.material.opacity = 0.6 + 0.3 * Math.sin(B.tm * 40); if (Math.random() < dt * 30) fx.burst({ x: a.x, y: stageY + 0.2 }, 1, 0xfee761);
      if (!a.hit && Math.abs(P.x - a.x) < 0.5 && P.y < stageY + 0.7 && P.y > stageY - 0.5 && !isRollInv(P)){ if (hurt(P, 1, a.x - a.d, 'Shocked')) a.hit = true; }
      if (Math.abs(a.x - a.x0) > TH.arc.reach || a.x < xMin - 1 || a.x > xMax + 1){ scene.remove(a.m); B.arcs.splice(i, 1); }
    }
    for (let i = B.zaps.length - 1; i >= 0; i--){ const z = B.zaps[i]; z.t += dt; z.m.material.opacity = z.t > z.life * 0.45 && Math.floor(z.t * 60) % 2 ? 0.3 : 1; if (z.t >= z.life){ scene.remove(z.m); z.m.material.dispose(); B.zaps.splice(i, 1); } }
    // ---- the wind's streaks
    B.windA += ((wantWind ? Math.min(1, Math.abs(wantWind)) : 0) - B.windA) * Math.min(1, dt * 5); if (wantWind) B.wind = Math.sign(wantWind);
    { const cam = R.camera.position; for (const s of streaks){ s.ox += (B.wind || 1) * s.v * dt; if (s.ox > 12) s.ox -= 24; else if (s.ox < -12) s.ox += 24; s.m.position.x = cam.x + s.ox; s.m.position.y = cam.y + s.oy; s.m.material.opacity = B.windA * 0.5; s.m.visible = B.windA > 0.02; } }
    // ---- draw it
    const awake = B.st === 'rise' || B.st === 'fight' || B.st === 'die', dead = B.st === 'dead', calm = B.st === 'dormant' ? 1 : B.st === 'rise' ? Math.max(0, 1 - B.tm / 1.2) : 0;
    for (const p of puffs){
      if (p.dead) continue;
      const lean = B.windA * (B.wind || 0) * (p.back ? 0.25 : 0.5);
      p.m.position.x = Math.round((p.x + Math.sin(B.tm * 0.5 + p.ph) * 0.35 + lean) * 16) / 16; p.m.position.y = Math.round((p.y + calm * 1.3 + (dead ? 1.5 : 0) + Math.sin(B.tm * 0.9 + p.ph) * p.amp) * 16) / 16;
      const s = p.k * (1 + Math.sin(B.tm * 0.7 + p.ph * 2) * 0.03); p.m.scale.set(s, s, 1);
    }
    mask.visible = awake || (dead && B.down); mask.position.set(Math.round(B.mx * 16) / 16, Math.round(B.my * 16) / 16, dead ? -0.2 : -0.6); mask.rotation.z = B.tilt; mask.material.emissive.setHex(B.flash > 0.02 && B.st !== 'die' ? 0x404860 : 0x000000);
    const ct = Math.cos(B.tilt), stt = Math.sin(B.tilt), on = (lx, ly) => [B.mx + lx * ct - ly * stt, B.my + lx * stt + ly * ct];
    eyes.forEach((m, k) => { const [ex, ey] = on((k ? 1.01 : -1.01) + B.look * 0.13, -0.07); m.position.set(ex, ey, -0.55); m.rotation.z = B.tilt + (k ? 0.38 : -0.38); m.material.opacity = mask.visible && !dead ? eyeA * (0.85 + 0.15 * Math.sin(B.tm * 9)) : 0; m.material.color.setHex(eyeCol); });
    { const [qx, qy] = on(0, -1.4); mouth.position.set(qx, qy, -0.55); mouth.rotation.z = B.tilt; mouth.material.opacity = mask.visible && !dead ? mouthA * (0.6 + 0.4 * Math.sin(B.tm * 12)) : 0; }
    // its heart: inside the mask until it falls, then out under it, at his height
    { const [hx, hy] = on(0, -0.6), ty = stageY + TH.stun.coreY + Math.sin(B.tm * 5) * 0.08;
      B.kx = hx + (B.mx - hx) * B.out; B.ky = hy + (ty - hy) * B.out; const vis = B.out > 0.05 && B.st !== 'dead' && !(B.st === 'die' && B.burst);
      core.visible = vis; core.position.set(Math.round(B.kx * 16) / 16, Math.round(B.ky * 16) / 16, -0.5); core.rotation.z = B.tm * 1.5; core.scale.setScalar((0.6 + 0.4 * B.out + (B.flash > 0 ? 0.15 : 0)) * (B.st === 'die' ? (B.swell || 1) : 1));
      halo.position.set(B.kx, B.ky, -0.52); halo.material.opacity = vis ? B.out * (0.4 + 0.15 * Math.sin(B.tm * 9)) + B.flash * 2 : 0; halo.visible = vis;
      if (vis) R.glint(B.kx, B.ky, 0xffd27a, 0.7 * B.out + B.flash * 2, 6);
      // the cloud it trails as it comes down
      tether.forEach((m, k) => { const f = (k + 1) / 4, show = (B.mode === 'fall' || B.mode === 'down' || B.mode === 'up') && B.st === 'fight' && B.my < stageY + TH.maskY - 1; m.visible = show; if (show){ m.position.x = B.mx + Math.sin(B.tm * 1.1 + k) * 0.3 + (B.fromX - B.mx) * f * 0.5; m.position.y = B.my + 1.6 + (stageY + TH.cloudY - B.my - 1.6) * f; m.scale.setScalar(0.8 + f * 0.5); } }); }
    const lit = awake ? (B.st === 'rise' ? Math.min(1, B.tm / 2) : B.st === 'die' ? Math.max(0, 1 - B.tm / 3) : 1) : 0;
    light.position.set(B.mx, B.my - 0.4, 2.2); light.intensity = lit * (0.55 + 0.1 * Math.sin(B.tm * 7)) + B.flash * 7; light.color.setHex(B.phase === 2 && B.st === 'fight' ? 0xffb0a0 : 0xbfd8ff);
    if (awake) R.glint(B.mx, B.my, B.phase === 2 ? 0xff9080 : 0xbfd8ff, lit * 0.4 * (1 - weak * 0.6) + B.flash * 4, 8);
    if (dead && inRoom) R.glint(cx, stageY + 7, 0xcfe0ff, 0.55, 26);   // the sky, a little clearer
  };

  // his cut: a burning rod sends the charge back; its heart, when it is down, is hurt. Anything else rings off
  function struck(P, dmg, events, nearCore, nearRod){
    if (B.st !== 'fight') return false;
    if (nearCore && (B.mode === 'down' || (B.mode === 'fall' && B.mt > 0.3) || (B.mode === 'up' && B.mt < 0.15))){
      B.hp -= dmg; B.flash = 0.12; events.push({ type: 'hit', at: { x: B.kx - P.face * 0.5, y: B.ky }, heavy: dmg >= 2 });
      if (B.phase === 1 && B.hp <= TH.hp * TH.phase2){ B.phase = 2; events.push({ type: 'bossPhase', boss: B }); }
      if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.gone = 0; B.down = false; B.burst = false; B.swell = 1; B.fallV = 0; clear(); for (const p of puffs) p.keep = p.back && Math.abs(p.x - cx) > 9 && Math.random() < 0.6; events.push({ type: 'bossDie' }); }
      return true;
    }
    if (nearRod){
      if (nearRod.st === 'live'){ reflect(P, nearRod, events); return true; }
      events.push({ type: 'block', at: { x: nearRod.x, y: P.y + 1.4 } }); if (nearRod.st === 'charge') nearRod.ring = 0.25;   // too soon, or nothing in it: it only rings
      return true;
    }
    return false;
  }
  B.strike = (P, reach, dmg, events) => {
    const ahead = x => (x - P.x) * P.face, core = ahead(B.kx) > -0.9 && ahead(B.kx) < reach + 0.9 && Math.abs(B.ky - (P.y + 1.2)) < 2.2 && B.out > 0.5;
    const rod = rods.find(r => ahead(r.x) > -0.4 && ahead(r.x) < reach + 0.3 && P.y < stageY + TH.rodTip && P.y > stageY - 1.5);
    return struck(P, dmg, events, core, rod);
  };
  B.slam = (P, radius, dmg, events) => {
    const core = Math.abs(B.kx - P.x) < radius + 0.9 && P.y < B.ky + 2.6 && P.y > B.ky - 2.5 && B.out > 0.5, rod = rods.find(r => Math.abs(r.x - P.x) < radius + 0.3 && P.y < stageY + 1.5 && P.y > stageY - 1);
    return struck(P, dmg + (core ? 1 : 0), events, core, rod);
  };
  B.rods = rods;
  return B;
}
