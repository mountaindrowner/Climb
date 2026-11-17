// The Toll: the Cloister's boss. A great bronze bell with a face cut in it, hung by a chain from a beam that runs along
// the chapel's roof. It is a puppet of flat pieces (tools/boss-parts.py: bell, clapper, beam, chain), moved here.
//   swing   the beam stops over him, the chain pays out until the bell hangs just over the stage, and it swings through
//           where he stood, two or three times: be well to one side, or roll under it as it passes
//   slam    it follows him along the roof, holds (a red mark under it), and drops: get out from under. Then it lies on
//           the stage a while: that is when to cut it (a plunge onto it hurts more). From half health the blow sends a
//           ripple along the stage both ways: jump it
//   toll    from half health it rings, and cinders fall from the roof where red marks show
// It wakes when he stands on the stage, and starts over if he dies.
// Its rise (after the entrance's dread, entrance.js): it is heard before it is seen. Small and far up in the dark, it
// tolls, closer each time and quicker, swelling with each stroke, its light flaring and rings of it going out through
// the hall. Then it is hauled up out of sight, a breath of quiet, and it comes down its chain out of the roof, full
// size, and stops dead at its height with a jolt that shakes the hall (its name and its music come with that). Then
// the fire in it comes out round it: an aura that throbs like a heart and throws off rings and embers, and stays with
// it, lower, for the fight (dim while it lies on the stage, fiercer from half health, gone as it dies). Harmless all
// the while. A keeper met before (G.keepers) rises in the short way: one stroke, and down.
import { T, LEVEL } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { tex, glow, additive, ease } from './boss.js';
import { lit as litMat } from './render.js';
import { G } from './state.js';
const THREE = window.THREE;
export const TOLL = {
  name: 'The Toll', hp: 32, phase2: 0.5,
  H: 5.4, R: 2.5,                                   // the bell: crown to rim, and the round of its body for what it hits
  idle: 4.6, low: 0.9, high: 6.5,                   // its rim over the stage: at rest, swinging, and before a slam
  swing: { raise: 1.0, arc: 0.95, half: [1.5, 1.2], passes: [2, 3], settle: 0.9 },
  slam: { aim: [1.0, 0.8], track: 10, hold: [0.38, 0.3], drop: 0.13, rest: [1.7, 1.25], lift: 0.7, reach: 2.9 },
  toll: { rings: 3, every: 0.55, warn: 0.8, fall: 17 },
  ripple: { speed: 11, life: 1.1 },
  cd: [1.3, 0.75],
  // its rise, in seconds of it (B.tm): the strokes; hauled up out of sight; down its chain; the jolt (when its name
  // comes: entrance.js STYLES.cloister.reveal, and a repeat's 0.6); the fight. far: how it hangs while it is heard, from
  // the first stroke to the last (its scale, and its crown over the stage)
  rise: {
    full:  { tolls: [0.2, 1.15, 1.85, 2.4, 2.8], hoist: [2.95, 3.3], drop: 3.4, slam: 3.6, end: 5.4 },
    short: { tolls: [0.02], hoist: [0.1, 0.3], drop: 0.4, slam: 0.6, end: 1.9 },
    far: { sc: [0.3, 0.74], crown: [10.8, 9.4] }, up: 16, jolt: 1.5,
  },
  aura: { rise: 1, fight: [0.38, 0.55], weak: 0.12, beat: [0.95, 1.15, 0.8] },   // how strong (rise, fight by phase, lying on the stage); a heartbeat's length (rise, fight by phase)
};
const W = TOLL;
// the aura's own pictures: rings of light, and the fire round it (a few, flickered through), in the palette
function ringTex(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.72, 'rgba(255,255,255,0)'); gr.addColorStop(0.86, 'rgba(255,255,255,1)'); gr.addColorStop(0.92, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
function flameTex(seed){
  // tongues of fire all round, ragged, hottest at the root: 128 pixels over its width, drawn as pixels
  const N = 128, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), h = N / 2;
  let s = seed * 9301 + 49297; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const cols = ['#feae34', '#f77622', '#e43b44', '#a22633'];
  for (let k = 0; k < 70; k++){
    const a = (k / 70) * Math.PI * 2 + rnd() * 0.08, len = 0.5 + rnd() * 0.5 * (0.6 + 0.4 * Math.abs(Math.sin(a * 3 + seed))), w = rnd() < 0.3 ? 2 : 1;
    for (let r = 0.3; r < len; r += 1 / h){ const f = (r - 0.3) / (len - 0.3), x = h + Math.cos(a + f * f * 0.25) * r * h, y = h + Math.sin(a + f * f * 0.25) * r * h;
      g.fillStyle = cols[Math.min(3, Math.floor(f * 4))]; g.globalAlpha = 1 - f * 0.7; g.fillRect(Math.round(x), Math.round(y), w, w); }
  }
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}

export function makeToll(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'chapel'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, railY = room.y1 - 1.7, D = railY - stageY, xMin = room.x0 + 4, xMax = room.x1 - 4;
  const lenFor = rim => D - rim - W.H;               // the chain's length that puts the rim that far over the stage
  const B = { name: W.name, hint: 'cut it when it lies on the stage', rage: 'it tolls, and the roof answers', fell: 'the way up is open',
    st: 'dormant', tm: 0, hp: W.hp, phase: 1, flash: 0, cd: 1.2, room, stageY, cx, mode: 'idle', mt: 0, px: cx, len: lenFor(13), ang: 0, clap: 0, clapV: 0, n: 0, acts: 0, ripples: [], cinders: [], fall: null,
    sc: 1, dim: 1, pulse: 0, aura: 0, beat: 0, rung: 0, slammed: false, seq: W.rise.full, side: 1, lastToll: -9 };
  const mesh = (file, w, h, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w / 16, h / 16), litMat({ map: tex(`assets/side/toll/${file}.png`), normalMap: tex(`assets/side/toll/${file}_n.png`), transparent: true, alphaTest: 0.5, color: 0xd8d0c4 })   /* a little under full, so the bronze does not bloom its face away */); m.position.z = z; m.visible = false; scene.add(m); return m; };
  const bell = mesh('bell', 90, 88, -1), clapper = mesh('clapper', 16, 44, -1.1), beam = mesh('beam', 72, 18, -1.2);
  const chainTex = tex('assets/side/toll/chain.png'); chainTex.wrapT = THREE.RepeatWrapping;
  const chain = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: chainTex, transparent: true, alphaTest: 0.5 })); chain.visible = false; scene.add(chain);
  const under = new THREE.PointLight(0xff9a40, 0, 8, 1.5); scene.add(under);   // the fire in its mouth lights it from below
  const eyeTex = glow('rgba(255,200,120,1)'), warnTex = glow('rgba(255,60,50,1)');
  const eyes = [[-0.81, -0.27], [0.81, -0.27]].map(p => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), additive(eyeTex, 0xffb040, 0)); scene.add(m); return { m, p }; });
  const maw = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), additive(eyeTex, 0xffb040, 0)); scene.add(maw);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), additive(eyeTex, 0xff9a40, 0)); scene.add(halo);
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.1), additive(warnTex, 0xff5040, 0)); scene.add(warn);
  const rippleMat = additive(glow('rgba(255,210,140,1)'), 0xffc070, 0.9), rippleGeo = new THREE.PlaneGeometry(1.4, 1.2);
  const cinderGeo = new THREE.PlaneGeometry(0.5, 0.9), cinderMat = additive(eyeTex, 0xff8030, 1), markGeo = new THREE.PlaneGeometry(1.6, 0.6);
  // the aura: a wide red glow, a hot one inside it, the fire round it (behind the bell, so it never hides it), rings of
  // it going out, embers going up off it
  const auraGlow = glow('rgba(255,255,255,1)');
  const auraWide = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), additive(auraGlow, 0xe43b44, 0)); auraWide.position.z = -1.5; scene.add(auraWide);
  const auraCore = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), additive(auraGlow, 0xf77622, 0)); auraCore.position.z = -1.45; scene.add(auraCore);
  const flames = [0, 1, 2].map(flameTex), corona = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(flames[0], 0xffffff, 0)); corona.position.z = -1.4; scene.add(corona);
  const RING = ringTex(), rings = [], RN = 8;
  for (let i = 0; i < RN; i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(RING, 0xe43b44, 0)); m.visible = false; scene.add(m); rings.push({ m, t: 0, life: 0 }); }
  let rk = 0;
  const ring = (x, y, r0, r1, life, color, op, delay = 0, z = -1.35) => { const r = rings[rk]; rk = (rk + 1) % RN; Object.assign(r, { x, y, r0, r1, life, op, t: -delay, z }); r.m.material.color.setHex(color); r.m.visible = false; };
  const embers = [], EMN = 56, emberGeo = new THREE.PlaneGeometry(1 / 16, 1 / 16), EMC = [0xfeae34, 0xf77622, 0xe43b44, 0xfee761];
  for (let i = 0; i < EMN; i++){ const m = new THREE.Mesh(emberGeo, new THREE.MeshBasicMaterial({ color: 0xf77622, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); embers.push({ m, life: 0 }); }
  let ek = 0, emberAcc = 0;
  const ember = (x, y, vx, vy, life) => { const p = embers[ek]; ek = (ek + 1) % EMN; Object.assign(p, { x, y, vx, vy, life, max: life, ph: Math.random() * 6 }); p.m.material.color.setHex(EMC[Math.floor(Math.random() * EMC.length)]); p.m.scale.setScalar(Math.random() < 0.3 ? 3 : 2); p.m.visible = true; };
  const BRONZE = new THREE.Color(0xd8d0c4);

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = x => Math.max(xMin, Math.min(xMax, x));
  const go = m => { B.mode = m; B.mt = 0; B.hit = false; };
  // where its parts are: the crown (where the chain ends), the middle of its body, the middle of its rim (sc: how big
  // it is drawn: under 1 only while it is heard from far off in its rise)
  const crown = () => ({ x: B.px + Math.sin(B.ang) * B.len, y: railY - Math.cos(B.ang) * B.len });
  const along = d => { const c = crown(); return { x: c.x + Math.sin(B.ang) * d * B.sc, y: c.y - Math.cos(B.ang) * d * B.sc }; };
  const body = () => B.fall ? { x: B.fall.x, y: B.fall.y } : along(W.H * 0.55);
  const lenAt = h => railY - stageY - h;               // the chain's length that puts its crown that far over the stage
  const touches = P => { const c = body(), nx = Math.max(P.x - 0.34, Math.min(P.x + 0.34, c.x)), ny = Math.max(P.y, Math.min(P.y + P.h, c.y)); return Math.hypot(nx - c.x, ny - c.y) < W.R; };

  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: W.name, frac: Math.max(0, B.hp / W.hp), phase: B.phase } : null;
  B.reset = () => {
    Object.assign(B, { st: 'dormant', tm: 0, hp: W.hp, phase: 1, cd: 1.2, mode: 'idle', mt: 0, px: cx, len: lenFor(13), ang: 0, clap: 0, clapV: 0, acts: 0, fall: null,
      flash: 0, sc: 1, dim: 1, pulse: 0, aura: 0, beat: 0, rung: 0, slammed: false, hoisted: false, scW: 0, riseLit: 0, seq: W.rise.full, side: 1, lastToll: -9 });
    for (const r of B.ripples) scene.remove(r.m); B.ripples.length = 0; for (const c of B.cinders){ scene.remove(c.m); scene.remove(c.mark); } B.cinders.length = 0;
    for (const r of rings){ r.life = 0; r.m.visible = false; } for (const p of embers){ p.life = 0; p.m.visible = false; }
    auraWide.material.opacity = auraCore.material.opacity = corona.material.opacity = 0; bell.material.color.copy(BRONZE); clapper.material.color.copy(BRONZE);
  };
  const cinder = x => { const m = new THREE.Mesh(cinderGeo, cinderMat), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0.8)); m.visible = false; mark.position.set(x, stageY + 0.2, 0.4); scene.add(m); scene.add(mark); B.cinders.push({ x, y: room.y1 - 1.5, t: 0, m, mark }); };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt);
    const inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 && P.y < room.y1;
    let warnA = 0, warnX = B.px, warnW = 6.4, weak = 0, toLen = null, lenK = 3;
    let tolled = -1, slammed = false;                  // this step: a stroke rung in its rise (how loud, 0 to 1), the jolt
    if (B.st === 'dormant'){ if (inRoom && P.grounded && P.y >= stageY - 0.05 && P.y < stageY + 0.5 && P.hp > 0){
      // met before (as main.js judges it, before it marks it met): the short rise, its name at 0.6 s as entrance.js has it
      B.st = 'rise'; B.tm = 0; B.seq = G.keepers && G.keepers[LEVEL.theme] ? W.rise.short : W.rise.full; B.revealAt = B.seq.slam;   // entrance.js: its name on the slam, whichever rise B.rung = 0; B.slammed = false; B.hoisted = false; B.scW = 0; B.pulse = 0; B.lastToll = -9;
      events.push({ type: 'bossWake', boss: B }); } }
    else if (B.st === 'rise'){
      const S = B.seq, Q = W.rise, t = B.tm, N = S.tolls.length;
      // the strokes, each closer: it swells, its light flares, it rocks on its chain
      while (B.rung < N && t >= S.tolls[B.rung]){
        B.rung++; tolled = N > 1 ? (B.rung - 1) / (N - 1) : 1; B.pulse = 1; B.side = -B.side; B.lastToll = t; B.clapV += 4 * B.side;
        events.push({ type: 'bossToll', at: { x: B.px, y: stageY } });
      }
      B.pulse *= Math.exp(-dt * 3.2);
      const k = N > 1 ? Math.max(0, B.rung - 1) / (N - 1) : 1, far = Q.far, sinceToll = t - B.lastToll;
      let h, sc, dim, lt;
      if (t < S.hoist[0]){
        // heard: small, high, in the dark; the light in it only on the stroke. It eases toward its next place between strokes
        const kn = B.rung ? k : 0, want = far.sc[0] + (far.sc[1] - far.sc[0]) * kn;
        B.scW = B.rung ? (B.scW || far.sc[0]) + (want - (B.scW || far.sc[0])) * Math.min(1, dt * 7) : far.sc[0];
        sc = B.scW * (1 + 0.07 * B.pulse);
        h = far.crown[0] + (far.crown[1] - far.crown[0]) * kn + (B.rung ? 0 : 0.6) + 0.15 * B.pulse;
        dim = 0.1 + 0.08 * kn + B.pulse * (0.45 + 0.4 * kn); lt = 0.06 + B.pulse * (0.55 + 0.45 * kn);
        B.ang = B.side * 0.12 * Math.sin(sinceToll * 7) * Math.exp(-sinceToll * 2.2);
      } else if (t < S.drop){
        // drawn up into the roof, its light going out; then nothing, for a breath
        const u = Math.min(1, (t - S.hoist[0]) / (S.hoist[1] - S.hoist[0])), e = u * u;
        sc = B.scW || far.sc[1]; h = far.crown[1] + (Q.up - far.crown[1]) * e; dim = (0.18 + 0.4 * B.pulse) * (1 - u); lt = 0.06 * (1 - u); B.ang *= Math.exp(-dt * 6);
        if (!B.hoisted){ B.hoisted = true; events.push({ type: 'bossTell' }); }
      } else if (t < S.slam){
        // down its chain out of the roof, full size, its eyes lit
        const u = (t - S.drop) / (S.slam - S.drop);
        sc = 1; h = Q.up + (W.idle + W.H - Q.up) * u * u; dim = 1; lt = 1; B.ang = 0;
      } else {
        // the jolt: the chain takes it, it bounces and shudders, and swings
        const ts = t - S.slam; sc = 1; dim = 1; lt = 1;
        if (!B.slammed){ B.slammed = true; slammed = true; B.clapV += 6 * B.side; B.flash = 0.15; B.aura = 1.8; events.push({ type: 'bossSlam', at: { x: B.px, y: stageY } }); }
        h = W.idle + W.H - Q.jolt * Math.sin(ts * 16) * Math.exp(-ts * 4.5);
        B.ang = (Math.random() - 0.5) * 0.07 * Math.exp(-ts * 7) + B.side * 0.1 * Math.sin(ts * 5.2) * Math.exp(-ts * 1.3);
        if (t >= S.end){ B.st = 'fight'; B.tm = 0; go('idle'); }
      }
      B.sc = sc; B.dim = dim; B.riseLit = lt; B.len = lenAt(h);
    }
    else if (B.st === 'die'){
      // the chain parts: it falls, strikes the stage, rocks and lies still
      const F = B.fall; F.vy -= 40 * dt; F.y += F.vy * dt; const floor = stageY + W.H * 0.5 - 0.2;
      if (F.y <= floor){ F.y = floor; if (!F.down){ F.down = true; events.push({ type: 'bossSlam', at: { x: F.x, y: stageY } }); } F.vy = 0; }
      F.rot = F.down ? 0.5 * Math.min(1, (B.tm - F.t0) * 2) + Math.sin(B.tm * 9) * 0.06 * Math.max(0, 1 - (B.tm - F.t0) / 1.5) : F.rot + dt * 0.6; if (!F.down) F.t0 = B.tm;
      if (Math.random() < dt * 7) fx.burst({ x: F.x + (Math.random() - 0.5) * 4, y: F.y + (Math.random() - 0.5) * 3 }, 8, 0xffc060);
      if (B.tm > 3.4){ B.st = 'dead'; events.push({ type: 'bossDead', boss: B }); }
    }
    else if (B.st === 'fight'){
      const M = B.mode;
      if (M === 'idle'){
        // it drifts along the roof after him, swaying
        toLen = lenFor(W.idle); B.px += (clampX(P.x) - B.px) * Math.min(1, dt * 0.9); B.ang += (Math.sin(B.tm * 1.6) * 0.07 - B.ang) * Math.min(1, dt * 3);
        B.cd -= dt;
        if (B.cd <= 0){
          B.acts++;
          if (B.phase === 2 && B.acts % 3 === 0){ go('toll'); B.n = 0; }
          else if (Math.random() < 0.42){ go('raise'); B.dir = P.x > B.px ? -1 : 1; B.tx = clampX(P.x); }
          else go('aim');
          events.push({ type: 'bossTell' });
        }
      }
      else if (M === 'raise'){
        // over where he is, the chain out, the bell drawn back to one side
        const t = Math.min(1, B.mt / W.swing.raise); B.px += (B.tx - B.px) * Math.min(1, dt * 4); toLen = lenFor(W.low); lenK = 4;
        B.ang += (B.dir * W.swing.arc * ease(t) - B.ang) * Math.min(1, dt * 8);
        warnA = 0.3 + 0.5 * t; warnX = B.tx; warnW = 15;
        if (t >= 1){ go('swing'); B.n = 0; events.push({ type: 'bossSweep', at: { x: B.px, y: stageY } }); }
      }
      else if (M === 'swing'){
        const half = ph(W.swing.half), u = B.mt / half; B.len = lenFor(W.low);
        B.ang = B.dir * W.swing.arc * Math.cos(Math.PI * u) * (1 - 0.06 * u);
        warnA = 0.5; warnX = B.px; warnW = 15;
        const pass = Math.floor(u + 0.5);                        // each time it comes through the bottom
        if (pass > B.n){ B.n = pass; B.hit = false; events.push({ type: 'bossToll', at: { x: B.px, y: stageY } }); fx.dust({ x: B.px, y: stageY }, 10, 3); }
        if (!B.hit && touches(P) && !isRollInv(P)){ if (hurt(P, 1, body().x - Math.sign(Math.sin(Math.PI * u)) * B.dir, 'Struck by the bell')) B.hit = true; }
        if (u >= ph(W.swing.passes)){ go('settle'); B.a0 = B.ang; }
      }
      else if (M === 'settle'){ const t = Math.min(1, B.mt / W.swing.settle); B.ang = B.a0 * (1 - ease(t)) * Math.cos(B.mt * 5); toLen = lenFor(W.idle); if (t >= 1){ go('idle'); B.cd = ph(W.cd); } }
      else if (M === 'aim'){
        toLen = lenFor(W.high); lenK = 5; B.ang *= Math.exp(-dt * 4);
        B.px += Math.max(-W.slam.track * dt, Math.min(W.slam.track * dt, clampX(P.x) - B.px));
        warnA = 0.3 + 0.4 * B.mt / ph(W.slam.aim); warnX = B.px;
        if (B.mt >= ph(W.slam.aim)) go('hold');
      }
      else if (M === 'hold'){ B.ang = (Math.random() - 0.5) * 0.03; warnA = 0.7 + 0.3 * Math.sin(B.mt * 30); warnX = B.px; if (B.mt >= ph(W.slam.hold)){ go('drop'); B.l0 = B.len; } }
      else if (M === 'drop'){
        const t = Math.min(1, B.mt / W.slam.drop); B.ang = 0; B.len = B.l0 + (lenFor(0) - B.l0) * t * t; warnA = 1; warnX = B.px;
        if (t >= 1){
          events.push({ type: 'bossSlam', at: { x: B.px, y: stageY } });
          if (Math.abs(P.x - B.px) < W.slam.reach && P.y < stageY + 2.6 && P.y > stageY - 1 && !isRollInv(P)) hurt(P, 1, B.px, 'Crushed');
          if (B.phase === 2) for (const dir of [-1, 1]){ const m = new THREE.Mesh(rippleGeo, rippleMat); scene.add(m); B.ripples.push({ x: B.px + dir * 2.8, dir, t: 0, m, hit: false }); }
          go('rest');
        }
      }
      else if (M === 'rest'){ weak = 1; B.len = lenFor(0); B.ang = Math.sin(B.mt * 26) * 0.012 * Math.max(0, 1 - B.mt * 2); if (B.mt >= ph(W.slam.rest)) go('lift'); }
      else if (M === 'lift'){ const t = Math.min(1, B.mt / W.slam.lift); toLen = lenFor(W.idle); lenK = 3; weak = 1 - t; if (t >= 1){ go('idle'); B.cd = ph(W.cd); } }
      else if (M === 'toll'){
        // it rings: each stroke, cinders shake loose from the roof
        toLen = lenFor(W.idle + 1.5); B.ang = Math.sin(B.mt * (Math.PI * 2 / W.toll.every)) * 0.22;
        const k = Math.floor(B.mt / W.toll.every);
        if (k > B.n){ B.n = k; events.push({ type: 'bossToll', at: { x: B.px, y: stageY } }); cinder(clampX(P.x)); for (let j = 0; j < 2; j++) cinder(xMin + Math.random() * (xMax - xMin)); }
        if (B.mt >= W.toll.every * (W.toll.rings + 0.5)){ go('idle'); B.cd = ph(W.cd); }
      }
    }
    if (toLen != null) B.len += (toLen - B.len) * Math.min(1, dt * lenK);
    // the clapper hangs in it, and lags behind its swing
    { const want = -B.ang * 0.6 + (B.mode === 'toll' ? Math.sin(B.mt * (Math.PI * 2 / W.toll.every) + 1.2) * 0.5 : 0); B.clapV += ((want - B.clap) * 60 - B.clapV * 6) * dt; B.clap += B.clapV * dt; }
    // ripples along the stage, cinders from the roof
    for (let i = B.ripples.length - 1; i >= 0; i--){
      const r = B.ripples[i]; r.t += dt; r.x += r.dir * W.ripple.speed * dt; r.m.position.set(r.x, stageY + 0.5, 0.2); r.m.material.opacity = 1 - r.t / W.ripple.life;
      if (Math.random() < 0.5) fx.dust({ x: r.x, y: stageY }, 1, 1.8);
      if (!r.hit && Math.abs(P.x - r.x) < 0.6 && P.y < stageY + 0.6 && P.y > stageY - 1){ if (hurt(P, 1, r.x - r.dir, 'Shaken')) r.hit = true; }
      if (r.t > W.ripple.life || r.x < room.x0 + 1 || r.x > room.x1 - 1){ scene.remove(r.m); B.ripples.splice(i, 1); }
    }
    for (let i = B.cinders.length - 1; i >= 0; i--){
      const c = B.cinders[i]; c.t += dt; c.mark.material.opacity = 0.5 + 0.4 * Math.sin(c.t * 24);
      if (c.t >= W.toll.warn){ c.m.visible = true; c.y -= W.toll.fall * dt; c.m.position.set(c.x, c.y, 0.3); if (Math.random() < 0.6) fx.burst({ x: c.x, y: c.y + 0.4 }, 1, 0xff9040);
        if (Math.abs(P.x - c.x) < 0.6 && c.y < P.y + P.h && c.y > P.y && !isRollInv(P)){ hurt(P, 1, c.x, 'Burned'); c.y = -1e9; }
        if (c.y <= stageY + 0.3){ if (c.y > -1e8){ events.push({ type: 'rockLand', at: { x: c.x, y: stageY } }); fx.burst({ x: c.x, y: stageY + 0.3 }, 10, 0xffa040); } scene.remove(c.m); scene.remove(c.mark); B.cinders.splice(i, 1); } }
    }
    // draw it
    const show = B.st !== 'dormant' && B.st !== 'dead' || B.st === 'dead', snap = v => Math.round(v * 16) / 16;
    const sc = B.sc, c = crown(), F = B.fall, rot = F ? F.rot : B.ang, mid = F ? { x: F.x, y: F.y } : along(W.H * 0.5 + 0.05 / sc);
    beam.visible = chain.visible = B.st !== 'dormant' || true; beam.position.set(snap(B.px), railY + 0.35, -1.2);
    const cl = F ? Math.max(0.5, B.len * 0.35) : B.len, ca = F ? Math.sin(B.tm * 3) * 0.2 * Math.max(0, 1 - B.tm) : B.ang;
    chain.position.set(B.px + Math.sin(ca) * cl / 2, railY - Math.cos(ca) * cl / 2, -1.15); chain.rotation.z = ca; chain.scale.set(0.5 * sc, cl, 1); chainTex.repeat.set(1, cl / sc);
    bell.visible = clapper.visible = true; bell.position.set(snap(mid.x), snap(mid.y), -1); bell.rotation.z = rot; bell.scale.set(sc, sc, 1);
    bell.material.color.copy(BRONZE).multiplyScalar(B.dim); clapper.material.color.copy(BRONZE).multiplyScalar(B.dim);
    const ca2 = rot + (F ? 0 : B.clap); clapper.position.set(mid.x + (Math.sin(ca2) * 1.9 + Math.sin(rot) * 0.2) * sc, mid.y - Math.cos(ca2) * 1.9 * sc, -1.1); clapper.rotation.z = ca2; clapper.scale.set(sc, sc, 1);
    const lit = B.st === 'fight' ? 1 : B.st === 'rise' ? B.riseLit : B.st === 'die' ? Math.max(0, 1 - B.tm / 1.6) : 0;
    const col = weak > 0 ? 0xfff0a0 : B.phase === 2 ? 0xff5030 : 0xffb040, k = lit * (0.75 + 0.2 * Math.sin(B.tm * 6)) + weak * 0.3, cs = Math.cos(rot), sn = Math.sin(rot);
    for (const e of eyes){ e.m.position.set(mid.x + (e.p[0] * cs - e.p[1] * sn) * sc, mid.y + (e.p[0] * sn + e.p[1] * cs) * sc, -0.95); e.m.rotation.z = rot; e.m.scale.set(sc, sc, 1); e.m.material.opacity = k; e.m.material.color.setHex(col); }
    maw.position.set(mid.x + 1.25 * sn * sc, mid.y - 1.25 * cs * sc, -0.95); maw.rotation.z = rot; maw.scale.set(sc, sc, 1); maw.material.opacity = k * 0.8; maw.material.color.setHex(col);
    halo.position.set(mid.x, mid.y, -1.3); halo.scale.set(sc, sc, 1); halo.material.opacity = lit * 0.18 + weak * (0.3 + 0.15 * Math.sin(B.tm * 9)) + B.flash * 3; halo.material.color.setHex(weak > 0 ? 0xffe090 : 0xff9a40);
    warn.material.opacity = warnA; warn.scale.set(warnW / 6.4, 1, 1); warn.position.set(warnX, stageY + 0.25, 0.5);
    under.position.set(mid.x - Math.sin(rot) * 3 * sc, mid.y - Math.cos(rot) * 3 * sc, 1.2); under.intensity = lit * 0.9 + weak * 0.8 + B.flash * 4; under.color.setHex(col);
    R.glint(mid.x, mid.y, col, lit * 0.45 + weak * 0.35 + B.flash * 3, 6.5 * sc);   // the light in it
    // ---- its rise: each stroke goes out through the hall from it; the jolt
    const mouth = { x: mid.x - sn * 2.6 * sc, y: mid.y - cs * 2.6 * sc };
    if (tolled >= 0){
      fx.ring(mouth, 0xfeae34); fx.ring({ x: mouth.x, y: mouth.y + 0.4 }, tolled > 0.5 ? 0xe43b44 : 0xf77622);
      ring(mid.x, mid.y, 2 * sc, 9 + 13 * tolled, 0.9 + 0.4 * tolled, 0xfeae34, 0.35 + 0.45 * tolled);
      if (tolled > 0.3) ring(mid.x, mid.y, 2 * sc, 7 + 10 * tolled, 0.8 + 0.3 * tolled, 0xe43b44, 0.3 + 0.4 * tolled, 0.12);
      R.shock(mid.x, mid.y, tolled > 0.5); R.glint(mid.x, mid.y, 0xfeae34, 0.5 + 1.1 * tolled, 5 + 7 * tolled, 0.5);
      fx.debris(room.x0 + 1, room.x1 - 1, room.y1 - 1.2, stageY, 2 + Math.round(10 * tolled));
    }
    if (slammed){
      R.shock(mid.x, mid.y, true); R.glint(mid.x, mid.y, 0xe43b44, 2.4, 13, 0.9);
      fx.burst(mouth, 30, 0xfeae34); fx.burst(mouth, 18, 0xe43b44); fx.debris(room.x0 + 1, room.x1 - 1, room.y1 - 1.2, stageY, 45);
      ring(mid.x, mid.y, 3, 26, 0.85, 0xfee761, 0.8); ring(mid.x, mid.y, 3, 22, 1.0, 0xf77622, 0.85, 0.1); ring(mid.x, mid.y, 3, 18, 1.1, 0xe43b44, 0.8, 0.22);
      for (let i = 0; i < 26; i++){ const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 6; ember(mid.x + Math.cos(a) * 2, mid.y + Math.sin(a) * 2, Math.cos(a) * s, Math.sin(a) * s + 2, 0.8 + Math.random() * 0.8); }
    }
    // ---- the aura: how strong it wants to be, by what it is doing; it throbs like a heart, and on each beat a ring goes
    // out and embers come off it
    const AU = W.aura, auraWant = B.st === 'rise' ? (B.slammed ? AU.rise : 0) : B.st === 'fight' ? AU.weak + (ph(AU.fight) - AU.weak) * (1 - weak) : B.st === 'die' ? ph(AU.fight) * Math.max(0, 1 - B.tm / 1.8) : 0;
    B.aura += (auraWant - B.aura) * Math.min(1, dt * (B.st === 'die' ? 6 : 2.2));
    const au = B.aura, beatLen = B.st === 'fight' ? ph(AU.beat.slice(1)) : AU.beat[0], b0 = Math.floor(B.beat);
    B.beat += dt / beatLen; const f = B.beat % 1, th = Math.exp(-f * 9) + (f > 0.22 ? 0.6 * Math.exp(-(f - 0.22) * 9) : 0);
    const hot = B.phase === 2 || B.st === 'rise';
    auraWide.position.set(mid.x, mid.y, -1.5); auraWide.scale.setScalar(sc * (1 + 0.06 * th)); auraWide.material.opacity = Math.min(1, au * (0.16 + 0.1 * th)); 
    auraCore.position.set(mid.x, mid.y - 0.3 * sc, -1.45); auraCore.scale.setScalar(sc * (1 + 0.1 * th)); auraCore.material.opacity = Math.min(1, au * (0.22 + 0.2 * th)); auraCore.material.color.setHex(hot ? 0xf77622 : 0xbe4a2f);
    corona.position.set(snap(mid.x), snap(mid.y - 0.2 * sc), -1.4); corona.rotation.z = rot; corona.scale.setScalar(sc * (8.6 + 0.9 * th)); corona.material.opacity = Math.min(1, au * (0.5 + 0.4 * th));
    if (Math.floor(B.tm * 10) !== B.flick){ B.flick = Math.floor(B.tm * 10); corona.material.map = flames[B.flick % flames.length]; }
    if (Math.floor(B.beat) > b0 && au > 0.2){
      ring(mid.x, mid.y, 4.5, 11 + 6 * Math.min(1, au), 1.0, B.phase === 2 || B.st === 'rise' ? 0xe43b44 : 0xf77622, Math.min(0.8, au * 0.55));
      const n = Math.round(au * 6); for (let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2; ember(mid.x + Math.cos(a) * 2.6, mid.y + Math.sin(a) * 2.4, Math.cos(a) * 2, Math.sin(a) * 1.5 + 1.5, 1 + Math.random()); }
    }
    emberAcc += dt * au * 16;
    while (emberAcc >= 1){ emberAcc--; const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 1.2; ember(mid.x + Math.cos(a) * r * 1.1, mid.y + Math.sin(a) * r, (Math.random() - 0.5) * 0.8, 1.2 + Math.random() * 2.2, 0.9 + Math.random() * 1.1); }
    for (const p of embers){
      if (p.life <= 0){ if (p.m.visible) p.m.visible = false; continue; }
      p.life -= dt; p.vx *= Math.exp(-dt * 2); p.vy += (1.6 - p.vy) * Math.min(1, dt * 1.5); p.x += (p.vx + Math.sin(p.ph + p.life * 5) * 0.6) * dt; p.y += p.vy * dt;
      p.m.position.set(snap(p.x), snap(p.y), 0.25); p.m.material.opacity = Math.min(1, p.life / p.max * 1.6) * (Math.sin(p.ph + p.life * 23) > -0.6 ? 1 : 0.3);
    }
    for (const r of rings){
      if (r.life <= 0) continue;
      r.t += dt; if (r.t < 0){ r.m.visible = false; continue; } const u = r.t / r.life;
      if (u >= 1){ r.life = 0; r.m.visible = false; continue; }
      const e = 1 - (1 - u) * (1 - u); r.m.visible = true; r.m.position.set(r.x, r.y, r.z); r.m.scale.setScalar(r.r0 + (r.r1 - r.r0) * e); r.m.material.opacity = r.op * Math.pow(1 - u, 1.4);
    }
  };

  // his cut: it takes it lying on the stage; anywhere else in reach it only rings
  function struck(P, near, dmg, events){
    if (B.st !== 'fight' || !near) return false;
    const c = body();
    if (B.mode === 'rest' || (B.mode === 'lift' && B.mt < 0.25)){
      B.hp -= dmg; B.flash = 0.12; events.push({ type: 'hit', at: { x: c.x - P.face * W.R * 0.8, y: Math.min(c.y, P.y + 1.3) }, heavy: dmg >= 2 });
      if (B.phase === 1 && B.hp <= W.hp * W.phase2){ B.phase = 2; events.push({ type: 'bossPhase', boss: B }); }
      if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.fall = { x: c.x, y: c.y, vy: 0, rot: 0, t0: 0, down: false }; B.mode = 'idle'; events.push({ type: 'bossDie' }); }
    } else events.push({ type: 'block', at: { x: c.x - P.face * W.R * 0.8, y: P.y + 1.3 } });
    return true;
  }
  B.strike = (P, reach, dmg, events) => { const c = body(), ahead = (c.x - P.x) * P.face; return struck(P, ahead > -1 && ahead < reach + W.R && Math.abs(c.y - (P.y + 1.2)) < W.R + 1.2, dmg, events); };
  B.slam = (P, radius, dmg, events) => { const c = body(); return struck(P, Math.abs(c.x - P.x) < radius + W.R && P.y < c.y + W.R + 1 && P.y > c.y - W.R - 2.5, dmg + 1, events); };
  return B;
}
