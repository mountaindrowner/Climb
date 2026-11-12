// The Warden: the side view's boss. A stone titan as tall as the cavern stands in the dark at the back of the arena,
// only its head and chest above the stage; its arms reach out of the background down onto the stage to crush him.
// The fists are where it can be hurt: when one rests on the stage after a blow, cut it (a plunge onto it hurts more).
//   slam    a fist rises over him and follows him, holds (a red mark glows on the stage under it), and comes down;
//           from half health the blow sends a ripple along the stage both ways: jump it
//   sweep   a fist lowers at its end of the stage and drags across it: double-jump it, roll through it, or get up on a
//           ledge
//   rocks   from half health the roof sheds stones where red marks fall on the stage
// It wakes when he stands on the stage, and starts over if he dies.
// It is a puppet of flat pieces, put together and moved here, the way its arms always were: the arms are PixelLab's
// (stacked stone, moss, glowing seams), and the rest is made to that look (tools/warden-parts.py): a chest with the
// crystal core in it, a neck, two blocks of waist going down into the dark, a helmed head whose jaw drops when it
// roars, a boulder on each shoulder and crystals grown out of its back. The body stands far back (a slow parallax
// layer); each arm is two pieces between its shoulder and the fist, bent at the elbow, so it reaches from the depth
// onto the stage. It breathes, its head follows him, a shoulder rises with its arm, it reels when a fist is cut, and
// when it dies it comes apart piece by piece.
import { T, LEVEL } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { lit } from './render.js';
const THREE = window.THREE;
export const WARDEN = {
  name: 'The Warden', hp: 24, phase2: 0.5,
  bodyF: 0.5, bodyY: 3.6, sunk: -14,                      // its body: parallax (how far back), its chest's middle over the stage, how far below the stage it waits
  fistR: 1.4, armW: 2,
  slam: { raise: [0.75, 0.6], hold: [0.42, 0.32], drop: 0.11, rest: [1.5, 1.1], lift: 0.55, reach: 1.8, high: 7.5 },
  sweep: { lower: [0.85, 0.7], speed: [12, 15], rest: [1.2, 0.9], low: 1.0, clear: 1.3 },
  ripple: { speed: 10, life: 1.1 },
  rocks: { every: 2.2, warn: 0.9, fall: 18 },
  cd: [1.6, 0.9],                                         // between blows, by phase
};
const W = WARDEN;
// the pieces: picture, size in pixels, where its middle is from the chest's (units), how far back, and how much of
// the body's breathing, and of its look toward him, it takes. Eyes, brow and core are where the glows sit.
const PIECES = {
  crystalL: { img: 'crystals', w: 64, h: 40, x: -2.9, y: 3.2, z: -8.4, rot: 0.38, br: 0.5, look: 0.05 },
  crystalR: { img: 'crystals', w: 64, h: 40, x: 2.9, y: 3.2, z: -8.4, rot: -0.38, flip: true, br: 0.5, look: 0.05 },
  belly2: { img: 'belly2', w: 56, h: 24, x: 0, y: -4.3, z: -8.3, br: 0.1, look: -0.12 },
  belly1: { img: 'belly1', w: 74, h: 26, x: 0, y: -2.95, z: -8.2, br: 0.3, look: -0.06 },
  chest: { img: 'chest', w: 116, h: 78, x: 0, y: 0, z: -8, br: 1, look: 0 },
  neck: { img: 'neck', w: 30, h: 18, x: 0, y: 2.7, z: -7.95, br: 1.2, look: 0.12 },
  jaw: { img: 'jaw', w: 64, h: 64, x: 0, y: 4.45, z: -7.92, br: 1.5, look: 0.35 },
  head: { img: 'head', w: 64, h: 64, x: 0, y: 4.45, z: -7.9, br: 1.5, look: 0.35 },
  shoulderL: { img: 'shoulder', w: 48, h: 48, x: -4.25, y: 1.45, z: -4.6, br: 0.8, look: 0 },
  shoulderR: { img: 'shoulder', w: 48, h: 48, x: 4.25, y: 1.45, z: -4.6, flip: true, br: 0.8, look: 0 },
};
const FACE = { eyes: [[-0.41, 0.02], [0.53, 0.02]], brow: [0.06, 0.85], core: [0, 0.2] };   // eyes and brow from the head's middle, the core from the chest's
// when it dies: when each piece lets go, and how it goes
const FALL = { shoulderL: [0.5, -1.6, 0.9], shoulderR: [0.8, 1.6, -0.9], crystalL: [0.3, -2.4, 1.6], crystalR: [0.6, 2.4, -1.6], head: [1.9, 0.5, -0.5], jaw: [1.7, -0.3, 0.7], neck: [2.2, 0, 0.2], chest: [2.6, 0, 0.06], belly1: [3, 0, 0], belly2: [3.2, 0, 0] };
export const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function tex(url){ const t = new THREE.TextureLoader().load(url, x => { x.needsUpdate = true; }); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
export function glow(color){
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.3, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
export const additive = (map, color, opacity = 1) => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });

export function makeWarden(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'arena'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 1 + W.fistR, xMax = room.x1 - 1 - W.fistR, roofY = room.y1 - 1;
  const B = { name: W.name, hint: 'strike its fists when they rest', rage: 'the roof is coming down', fell: 'the way up is open', st: 'dormant', tm: 0, hp: W.hp, phase: 1, flash: 0, cd: 1.2, rockT: 0, lift: W.sunk, room, stageY, cx, xMin, xMax, arms: [], rocks: [], ripples: [], next: 0 };
  const stone = 0xa9b4a2, far = 0x97a294;   // the arms are grey; brought toward the moss. The body, further back, a little darker
  Object.assign(B, { look: 0, reel: 0, roar: 0, jaw: 0 });
  // ---- the body's pieces, with a cold glow behind it so it stands out of the dark
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), additive(glow('rgba(60,200,220,1)'), 0x2a8a9a, 0.5)); scene.add(halo);
  const parts = {};
  for (const [name, d] of Object.entries(PIECES)){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(d.w / 16, d.h / 16), lit({ map: tex(`assets/side/warden/${d.img}16.png`), normalMap: tex(`assets/side/warden/${d.img}16_n.png`), transparent: true, alphaTest: 0.5, color: name.startsWith('shoulder') ? stone : far, side: THREE.DoubleSide }));
    if (d.flip) m.scale.x = -1;
    m.visible = false; scene.add(m); parts[name] = { m, d, lift: 0 };
  }
  const coreLight = new THREE.PointLight(0x5fe8d8, 0, 9, 1.2); scene.add(coreLight);
  const eyeTex = glow('rgba(140,255,255,1)');
  const eyes = FACE.eyes.map(p => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), additive(eyeTex, 0x7ff6ff, 0)); scene.add(m); return { m, p }; });
  const brow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), additive(eyeTex, 0x5fe8d8, 0)); scene.add(brow);
  const maw = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), additive(eyeTex, 0x7ff6ff, 0)); scene.add(maw);   // the light in its open mouth
  const core = { m: new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), additive(eyeTex, 0x5fe8d8, 0)) }; scene.add(core.m);
  const backGlow = [-1, 1].map(sd => { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), additive(eyeTex, 0x4fd8ff, 0)); scene.add(m); return { m, sd }; });
  // ---- the arms
  const upTex = tex('assets/side/colossus/upperarm16.png'), foreTex = tex('assets/side/colossus/forearm16.png'), fistTex = tex('assets/side/colossus/fist16.png');
  const segMat = (map, n) => lit({ map, normalMap: tex(n), transparent: true, alphaTest: 0.5, color: stone, side: THREE.DoubleSide });   // shaded by their shape: the core's light catches their edges
  const warnTex = glow('rgba(255,60,50,1)');
  for (const s of [-1, 1]){
    const up = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), segMat(upTex, 'assets/side/colossus/upperarm16_n.png')), fore = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), segMat(foreTex, 'assets/side/colossus/forearm16_n.png'));
    const fistMat = lit({ map: fistTex, normalMap: tex('assets/side/colossus/fist16_n.png'), transparent: true, alphaTest: 0.5, color: stone, side: THREE.DoubleSide, emissive: 0x000000 });
    const fist = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), fistMat);   // 48 pixels
    const weak = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), additive(eyeTex, 0x6ff0ff, 0));   // the glow that says: now
    const warn = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), additive(warnTex, 0xff5040, 0));  // the mark under a blow
    for (const m of [up, fore, fist, weak, warn]){ m.visible = false; scene.add(m); }
    B.arms.push({ s, st: 'idle', tm: 0, up, fore, fist, fistMat, weak, warn, p: new THREE.Vector3(cx + s * 9, stageY - 6, -8), from: new THREE.Vector3(), tx: 0, hit: false });
  }
  const sweepWarn = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.9), additive(warnTex, 0xff5040, 0)); scene.add(sweepWarn);
  const rockGeo = new THREE.DodecahedronGeometry(0.42), rockMat = new THREE.MeshLambertMaterial({ color: 0x7d8a8c });
  const rippleMat = additive(glow('rgba(255,210,140,1)'), 0xffc070, 0.9), rippleGeo = new THREE.PlaneGeometry(1.4, 1.2);

  // where the torso is drawn now (it is far back, so it slides as the camera moves)
  const bodyAt = () => R.parallax(W.bodyF, cx, stageY + W.bodyY + B.lift);
  const breath = () => Math.sin(B.tm * 1.5) * 0.07;
  // where a shoulder is now: on the chest, up with its arm, down with its blow
  const shoulder = (i, out) => { const q = parts[i ? 'shoulderR' : 'shoulderL'], b = bodyAt(); return out.set(b.x + q.d.x, b.y + q.d.y + breath() * q.d.br + q.lift - 0.2, -6); };
  // a fist at rest hangs below its shoulder, out to the side
  const rest = (a, t) => { const S = shoulder(a.s < 0 ? 0 : 1, new THREE.Vector3()); return a.p.set(S.x + a.s * 3.5 + Math.sin(t * 0.9 + a.s) * 0.5, S.y - 1.5 + Math.sin(t * 1.3 + a.s * 2) * 0.4, -7); };
  // a flat piece from a to b, its picture's top at b
  function span(mesh, a, b, width, z){
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 0.01;
    mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, z); mesh.rotation.set(0, 0, Math.atan2(-dx, dy)); mesh.scale.set(width, len, 1);
  }
  // the elbow: the two segments are each a little over half the reach, bent outward and up
  const elbow = new THREE.Vector3();
  function bend(S, F, side){
    const dx = F.x - S.x, dy = F.y - S.y, d = Math.max(0.01, Math.hypot(dx, dy));
    const a = Math.max(d / 2 * 1.12, 4), h = Math.sqrt(Math.max(0, a * a - d * d / 4));
    let px = -dy / d, py = dx / d; if (px * side < 0 || (Math.abs(px) < 0.2 && py < 0)){ px = -px; py = -py; }   // out to its side
    return elbow.set(S.x + dx / 2 + px * h, S.y + dy / 2 + py * h, 0);
  }

  function go(a, st){ a.st = st; a.tm = 0; a.from.copy(a.p); a.hit = false; }
  const ph = arr => Array.isArray(arr) ? arr[B.phase - 1] : arr;
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: W.name, frac: Math.max(0, B.hp / W.hp), phase: B.phase } : null;
  B.reset = () => {
    B.st = 'dormant'; B.tm = 0; B.hp = W.hp; B.phase = 1; B.lift = W.sunk; B.cd = 1.2; B.reel = B.roar = B.jaw = 0;
    for (const a of B.arms){ a.st = 'idle'; a.tm = 0; }
    for (const r of B.rocks) scene.remove(r.m); B.rocks.length = 0;
    for (const r of B.ripples) scene.remove(r.m); B.ripples.length = 0;
  };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.flash = Math.max(0, B.flash - dt); B.roar = Math.max(0, B.roar - dt); B.reel *= Math.exp(-dt * 5);
    const inArena = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 && P.y < room.y1;
    if (B.st === 'dormant'){ if (inArena && P.grounded && P.y >= stageY - 0.05 && P.hp > 0){ B.st = 'rise'; B.tm = 0; events.push({ type: 'bossWake' }); } }
    else if (B.st === 'rise'){ B.lift = W.sunk * (1 - ease(Math.min(1, B.tm / 3))); if (B.tm > 2.1 && B.tm - dt <= 2.1) B.roar = 1.1; if (B.tm > 3.2){ B.st = 'fight'; B.tm = 0; B.lift = 0; } }
    else if (B.st === 'die'){ B.lift = W.sunk * ease(Math.max(0, Math.min(1, (B.tm - 2.4) / 2.2))); if (Math.random() < dt * 8){ const a = B.arms[Math.random() < 0.5 ? 0 : 1]; fx.burst({ x: a.p.x + (Math.random() - 0.5) * 3, y: a.p.y + Math.random() * 2 }, 10, 0xc9e8d0); }
      if (B.tm > 4.8){ B.st = 'dead'; events.push({ type: 'bossDead' }); } }
    // the conductor: one blow at a time, two at once from half health
    if (B.st === 'fight'){
      B.cd -= dt;
      const busy = B.arms.filter(a => a.st !== 'idle').length;
      if (B.cd <= 0 && busy < B.phase){
        const near = P.x < bodyAt().x ? 0 : 1; if (B.arms[near].st === 'idle') B.next = near;   // the arm on his side, so it does not cross the face
        const a = B.arms[B.next], other = B.arms[1 - B.next];
        if (a.st === 'idle' && (busy === 0 || other.st === 'rest' || other.st === 'lift')){
          B.next = 1 - B.next; B.cd = ph(W.cd);
          if (Math.random() < 0.32 && other.st === 'idle') go(a, 'lower'); else { go(a, 'raise'); a.tx = P.x; }
          events.push({ type: 'bossTell' });
        }
      }
      if (B.phase === 2){ B.rockT -= dt; if (B.rockT <= 0){ B.rockT = W.rocks.every; for (let k = 0; k < 2; k++){ const x = Math.max(xMin, Math.min(xMax, P.x + (k ? (Math.random() - 0.5) * 12 : 0))); const m = new THREE.Mesh(rockGeo, rockMat); m.visible = false; scene.add(m); B.rocks.push({ x, y: roofY, t: 0, st: 'warn', m }); } } }
    }
    // the arms
    for (const a of B.arms){
      a.tm += dt;
      const vis = B.st !== 'dormant' && B.st !== 'dead';
      for (const m of [a.up, a.fore, a.fist]) m.visible = vis;
      let warn = 0, weak = 0;
      if (B.st !== 'fight' && a.st !== 'idle' && B.st !== 'die') a.st = 'idle';
      if (B.st === 'die'){ a.p.y += (stageY + W.fistR * 0.6 - a.p.y) * Math.min(1, dt * 3); a.p.z += (0.2 - a.p.z) * Math.min(1, dt * 3); }
      else if (a.st === 'idle'){ const k = Math.min(1, dt * 3); const r = rest({ s: a.s, p: new THREE.Vector3() }, B.tm); a.p.lerp(r, B.st === 'rise' ? Math.min(1, dt * 1.5) : k); }
      else if (a.st === 'raise'){
        const d = ph(W.slam.raise), t = Math.min(1, a.tm / d); a.tx += (Math.max(xMin, Math.min(xMax, P.x)) - a.tx) * Math.min(1, dt * 5);
        a.p.set(a.from.x + (a.tx - a.from.x) * ease(t), a.from.y + (stageY + W.slam.high - a.from.y) * ease(t), a.from.z + (0.2 - a.from.z) * ease(t)); warn = 0.3 + 0.4 * t;
        if (t >= 1) go(a, 'hold');
      }
      else if (a.st === 'hold'){
        const d = ph(W.slam.hold); if (a.tm < d * 0.5) a.tx += (Math.max(xMin, Math.min(xMax, P.x)) - a.tx) * Math.min(1, dt * 4);
        a.p.x = a.tx + (Math.random() - 0.5) * 0.12; a.p.y = stageY + W.slam.high + Math.sin(a.tm * 40) * 0.05; warn = 0.7 + 0.3 * Math.sin(a.tm * 30);
        if (a.tm >= d) go(a, 'drop');
      }
      else if (a.st === 'drop'){
        const t = Math.min(1, a.tm / W.slam.drop); a.p.y = a.from.y + (stageY + W.fistR - a.from.y) * t * t; warn = 1;
        if (t >= 1){
          events.push({ type: 'bossSlam', at: { x: a.p.x, y: stageY } });
          if (Math.abs(P.x - a.p.x) < W.slam.reach && P.y < stageY + 2.2 && P.y > stageY - 1) hurt(P, 1, a.p.x, 'Crushed');
          if (B.phase === 2) for (const dir of [-1, 1]){ const m = new THREE.Mesh(rippleGeo, rippleMat); scene.add(m); B.ripples.push({ x: a.p.x + dir * 1.4, dir, t: 0, m, hit: false }); }
          go(a, 'rest');
        }
      }
      else if (a.st === 'rest'){ weak = 1; a.p.x += (Math.random() - 0.5) * 0.02; if (a.tm >= ph(a.swept ? W.sweep.rest : W.slam.rest)){ a.swept = false; go(a, 'lift'); } }
      else if (a.st === 'lift'){ const t = Math.min(1, a.tm / W.slam.lift), r = rest({ s: a.s, p: new THREE.Vector3() }, B.tm); a.p.lerpVectors(a.from, r, ease(t)); weak = 1 - t; if (t >= 1) a.st = 'idle'; }
      else if (a.st === 'lower'){
        const d = ph(W.sweep.lower), t = Math.min(1, a.tm / d), ex = a.s < 0 ? xMin : xMax;
        a.p.set(a.from.x + (ex - a.from.x) * ease(t), a.from.y + (stageY + W.sweep.low - a.from.y) * ease(t), a.from.z + (0.2 - a.from.z) * ease(t));
        sweepWarn.material.opacity = t * (0.5 + 0.4 * Math.sin(a.tm * 24)); sweepWarn.scale.set(xMax - xMin + 3, 1, 1); sweepWarn.position.set((xMin + xMax) / 2, stageY + 0.3, 0.15);
        if (t >= 1){ go(a, 'sweep'); events.push({ type: 'bossSweep', at: { x: a.p.x, y: stageY } }); }
      }
      else if (a.st === 'sweep'){
        sweepWarn.material.opacity *= 0.9;
        a.p.x -= a.s * ph(W.sweep.speed) * dt; a.p.y = stageY + W.sweep.low + Math.abs(Math.sin(a.tm * 14)) * 0.15;
        if (Math.random() < 0.7) fx.dust({ x: a.p.x, y: stageY }, 2, 2.4);
        if (!a.hit && Math.abs(P.x - a.p.x) < W.fistR && P.y < stageY + W.sweep.clear && P.y > stageY - 1){ if (hurt(P, 1, a.p.x - a.s, 'Swept')) a.hit = true; }
        if ((a.s < 0 && a.p.x >= xMax) || (a.s > 0 && a.p.x <= xMin)){ a.swept = true; go(a, 'rest'); events.push({ type: 'bossSlam', at: { x: a.p.x, y: stageY }, soft: true }); }
      }
      if (a.st !== 'lower' && a.st !== 'sweep' && !B.arms.some(o => o.st === 'lower' || o.st === 'sweep')) sweepWarn.material.opacity = 0;
      { const q = parts[a.s < 0 ? 'shoulderL' : 'shoulderR'], want = a.st === 'raise' || a.st === 'hold' ? 0.75 : a.st === 'drop' || a.st === 'rest' ? -0.35 : a.st === 'lower' || a.st === 'sweep' ? -0.25 : 0;
        q.lift += (want - q.lift) * Math.min(1, dt * (a.st === 'drop' ? 30 : 5)); }
      // draw it
      if (vis){
        const S = shoulder(a.s < 0 ? 0 : 1, new THREE.Vector3()), E = bend(S, a.p, a.s).clone();
        if (B.st === 'die'){ const f = FALL[a.s < 0 ? 'shoulderL' : 'shoulderR'], u = Math.max(0, B.tm - f[0]); S.x += f[1] * u; S.y -= 7 * u * u; }   // the arm goes with its shoulder
        span(a.up, S, E, W.armW, -5); span(a.fore, a.p, E, W.armW * 0.9, -4.9);
        a.fist.position.set(a.p.x, a.p.y, -1); a.fist.scale.x = a.s < 0 ? 1 : -1;
        a.fist.rotation.z = Math.atan2(E.x - a.p.x, E.y - a.p.y) * 0.25;
        a.fistMat.emissive.setHex(B.flash > 0 && a.st === 'rest' ? 0x9a9a9a : 0x000000);
      }
      a.warn.visible = warn > 0; a.warn.material.opacity = warn; a.warn.position.set(a.tx, stageY + 0.25, 0.5);
      a.weak.visible = weak > 0 && vis; a.weak.material.opacity = weak * (0.35 + 0.2 * Math.sin(B.tm * 9)); a.weak.position.set(a.p.x, a.p.y, -1.1);
    }
    // the stage's ripples and the roof's stones
    for (let i = B.ripples.length - 1; i >= 0; i--){
      const r = B.ripples[i]; r.t += dt; r.x += r.dir * W.ripple.speed * dt; r.m.position.set(r.x, stageY + 0.5, 0.2); r.m.material.opacity = 1 - r.t / W.ripple.life;
      if (Math.random() < 0.5) fx.dust({ x: r.x, y: stageY }, 1, 1.8);
      if (!r.hit && Math.abs(P.x - r.x) < 0.6 && P.y < stageY + 0.6 && P.y > stageY - 1){ if (hurt(P, 1, r.x - r.dir, 'Shaken')) r.hit = true; }
      if (r.t > W.ripple.life || r.x < room.x0 + 1 || r.x > room.x1 - 1){ scene.remove(r.m); B.ripples.splice(i, 1); }
    }
    for (let i = B.rocks.length - 1; i >= 0; i--){
      const r = B.rocks[i]; r.t += dt;
      if (r.st === 'warn'){ if (Math.random() < 0.4) fx.dust({ x: r.x + (Math.random() - 0.5) * 0.4, y: roofY - 0.2 }, 1, 0.6); if (r.t >= W.rocks.warn){ r.st = 'fall'; r.m.visible = true; } }
      else { r.y -= W.rocks.fall * dt; r.m.position.set(r.x, r.y, 0.1); r.m.rotation.x += dt * 5; r.m.rotation.y += dt * 3;
        if (Math.abs(P.x - r.x) < 0.65 && r.y < P.y + 1.8 && r.y > P.y) { hurt(P, 1, r.x, 'Stoned'); r.y = -1e9; }
        if (r.y <= stageY + 0.4){ if (r.y > -1e8) events.push({ type: 'rockLand', at: { x: r.x, y: stageY } }); scene.remove(r.m); B.rocks.splice(i, 1); }
      }
    }
    // the body: each piece from the chest's middle, breathing, leaning the way it looks, reeling from a cut
    const ba = bodyAt(), bx = ba.x, show = (B.st !== 'dormant' || B.lift > W.sunk + 0.01) && B.st !== 'dead', br = breath();
    const lookTo = B.st === 'fight' ? Math.max(-1, Math.min(1, (P.x - bx) / 11)) : 0; B.look += (lookTo - B.look) * Math.min(1, dt * 2.2);
    const rising = B.st === 'rise' ? 1 - ease(Math.min(1, B.tm / 2.6)) : 0;                       // head bowed as it comes up
    const open = B.roar > 0 ? Math.min(1, B.roar * 4, (1.1 - B.roar) * 6 + 0.2) : B.st === 'die' ? 1 : 0; B.jaw += (open - B.jaw) * Math.min(1, dt * 14);
    const snapU = v => Math.round(v * 16) / 16, place = {};
    for (const [name, q] of Object.entries(parts)){
      const d = q.d; let x = bx + d.x + B.look * d.look, y = ba.y + d.y + br * d.br + q.lift, rot = (d.rot || 0) + B.reel * (0.4 + d.br * 0.5) - B.look * d.look * 0.18;
      if (name === 'head' || name === 'jaw'){ y -= rising * 0.5; rot += rising * 0.1 * (B.look < 0 ? -1 : 1) + Math.sin(B.tm * 0.7) * 0.012; if (B.roar > 0){ y += 0.18 * B.jaw; x += (Math.random() - 0.5) * 0.06; } }
      if (name === 'jaw') y -= B.jaw * 0.34;
      if (name.startsWith('crystal')) y += parts[name.endsWith('L') ? 'shoulderL' : 'shoulderR'].lift * 0.5;
      if (B.st === 'die'){ const f = FALL[name], u = Math.max(0, B.tm - f[0]); x += f[1] * u; y -= 7 * u * u; rot += f[2] * u; if (u <= 0) x += (Math.random() - 0.5) * 0.05 * Math.min(1, B.tm); }
      q.m.visible = show; q.m.position.set(snapU(x), snapU(y), d.z); q.m.rotation.z = rot; place[name] = { x, y, rot };
    }
    halo.visible = show; halo.position.set(bx, ba.y + 2, -9);
    const lit = B.st === 'fight' ? 1 : B.st === 'rise' ? Math.max(0, Math.min(1, (B.tm - 1.6) / 0.8)) : B.st === 'die' ? Math.max(0, 1 - B.tm / 2) : 0;
    const angry = B.phase === 2 ? 0xff8a50 : 0x7ff6ff, hd = place.head, c = Math.cos(hd.rot), sn = Math.sin(hd.rot), on = (lx, ly) => [hd.x + lx * c - ly * sn, hd.y + lx * sn + ly * c];
    for (const e of eyes){ const [ex, ey] = on(e.p[0], e.p[1]); e.m.position.set(ex, ey, -7.8); e.m.material.opacity = lit * (0.8 + 0.2 * Math.sin(B.tm * 6)); e.m.material.color.setHex(angry); e.m.visible = show; }
    { const [x, y] = on(FACE.brow[0], FACE.brow[1]); brow.position.set(x, y, -7.8); brow.material.opacity = lit * (0.45 + 0.25 * Math.sin(B.tm * 2.2)); brow.material.color.setHex(B.phase === 2 ? 0xff8a50 : 0x5fe8d8); brow.visible = show; }
    { const [x, y] = on(0.02, -1.05 - B.jaw * 0.15); maw.position.set(x, y, -7.91); maw.material.opacity = lit * B.jaw * 0.9; maw.material.color.setHex(angry); maw.visible = show && B.jaw > 0.02; }
    core.m.position.set(place.chest.x + FACE.core[0], place.chest.y + FACE.core[1], -7.8); core.m.material.opacity = lit * (0.5 + 0.3 * Math.sin(B.tm * 2.2)) + B.flash * 3; core.m.visible = show;
    for (const g of backGlow){ const k = place[g.sd < 0 ? 'crystalL' : 'crystalR']; g.m.position.set(k.x, k.y + 0.3, -8.35); g.m.material.opacity = lit * (B.phase === 2 ? 0.55 + 0.25 * Math.sin(B.tm * 5 + g.sd) : 0.22); g.m.material.color.setHex(B.phase === 2 ? 0xff9a60 : 0x4fd8ff); g.m.visible = show; }
    halo.material.opacity = 0.2 + lit * 0.18;
    coreLight.position.set(place.chest.x + FACE.core[0], place.chest.y + FACE.core[1], -6.7); coreLight.intensity = show ? lit * (B.phase === 2 ? 2.4 : 2.0) + B.flash * 4 : 0; coreLight.color.setHex(B.phase === 2 ? 0xff9a60 : 0x5fe8d8);
    if (show){ R.glint(place.chest.x, place.chest.y + 0.2, 0x5fe8d8, lit * 0.55 + B.flash * 3, 7); R.glint(hd.x, hd.y, angry, lit * 0.4, 4.5); }   // its core and its eyes light what is round them
  };

  // his cut: a fist resting on the stage takes it; a fist anywhere else in reach turns it (a clang)
  function hitFist(P, test, dmg, events){
    if (B.st !== 'fight') return false;
    let any = false;
    for (const a of B.arms){
      if (a.p.z < -1.5 || !test(a)) continue;
      any = true;
      if (a.st === 'rest' || (a.st === 'lift' && a.tm < 0.2)){
        B.hp -= dmg; B.flash = 0.12; B.reel = -a.s * 0.07 * (dmg >= 2 ? 1.5 : 1); events.push({ type: 'hit', at: { x: a.p.x - P.face * W.fistR * 0.6, y: Math.min(a.p.y, P.y + 1.1) }, heavy: dmg >= 2 });
        if (B.phase === 1 && B.hp <= W.hp * W.phase2){ B.phase = 2; B.rockT = 1.2; B.roar = 1.1; events.push({ type: 'bossPhase' }); }
        if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.roar = 1.1; events.push({ type: 'bossDie' }); break; }
      } else events.push({ type: 'block', at: { x: a.p.x - P.face * W.fistR * 0.6, y: P.y + 1.1 } });
    }
    return any;
  }
  B.strike = (P, reach, dmg, events) => hitFist(P, a => { const ahead = (a.p.x - P.x) * P.face; return ahead > -0.8 && ahead < reach + W.fistR && Math.abs(a.p.y - (P.y + 1.2)) < W.fistR + 1.3; }, dmg, events);
  B.slam = (P, radius, dmg, events) => hitFist(P, a => Math.abs(a.p.x - P.x) < radius + W.fistR && a.p.y - W.fistR < P.y + 0.6 && a.p.y > P.y - 2.5, dmg + 1, events);
  return B;
}
