// Mother Thorn: the Gardens' keeper. A vast flower rooted in the middle of the bower: a thorned stalk, a bud of green
// armour over great rose petals, two heavy vine arms, and a heart of gold light inside. A puppet of flat pieces
// (tools/mother-parts.py), moved here: the stalk is stacked along a curve from her root to her head, the arms are chains
// from their roots to their ends, the petals turn about their feet.
// Shut, she cannot be hurt. She works through her attacks, then tires and opens:
//   thorns   spikes come up out of the stage under where he stands, one after another (a mound and a red mark first)
//   sweep    an arm is laid down at the far end of the stage (a red line along the ground) and runs its length, low: jump it
//   slam     an arm rises over him, follows (a red mark), and comes down: step out from under
//   pods     she throws seeds; each lies a moment, then hatches a spore pod that drifts at him, swells and bursts:
//            cut the seed, or the pod before it swells (never more than three at once)
//   OPEN     the bud unfolds and her heart is bared, high up: take a bloom at either side of the stage and plunge into
//            the open flower (it throws him off again, and his air jump is given back). Before she shuts she bows low,
//            and the heart can be cut
// From half health: rows of thorns cross the whole stage, every other place first and then the places between; both
// arms sweep, one after the other, and both slam; three seeds; and she opens for a shorter while.
// She wakes when he walks out onto the stage, and starts over if he dies.
import { T, LEVEL } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { tex, glow, additive } from './boss.js';
import { lit as litMat, makeSprite } from './render.js';
const THREE = window.THREE;
export const MOTHER = {
  name: 'Mother Thorn', hp: 44, phase2: 0.5,
  tall: 4.8, low: 0.5,                                 // her head over the stage: grown, and asleep
  thorns: { n: 3, gap: 0.55, warn: 0.6, up: 0.5, half: 0.6, tall: 2.0 },
  rows: { step: 2.3, lag: 1.0, wave: 0.045 },
  sweep: { tell: [0.95, 0.7], speed: [14, 18], reach: 1.0, high: 1.0 },
  slam: { aim: [1.05, 0.75], drop: 42, rest: 0.55, reach: 1.45, high: 6.0 },
  pods: { n: [2, 3], cap: 3, tell: 0.6, every: 0.28, hatch: 0.8, g: 18 },
  spore: { drift: 1.5, near: 1.5, swell: 0.9, radius: 1.7 },
  open: { unfold: 0.6, high: [2.6, 1.8], bow: [1.4, 1.1], shut: 0.6, y: 3.9 },
  plunge: 4, cd: [1.0, 0.65],
  // her rise (B.tm): the stage breaks and thorns come up through it, out from her root both ways; the stalk climbs, the
  // bud beating as if something in it wants out; it bursts (her name and her music come with it: entrance.js reveal);
  // her arms come up out of the stage and lash down; then the fight
  rise: { roots: 0.35, climb: [1.2, 3.5], beats: [1.95, 2.17, 2.65, 2.85, 3.12, 3.28, 3.42], burst: 3.6, shut: [4.5, 5.2],
    erupt: [3.95, 4.1], lash: [4.7, 4.92], sink: 5.05, end: 5.7 },
  seq: [['thorns', 'sweep', 'thorns', 'slam', 'pods', 'tired'], ['rows', 'sweep', 'slam', 'pods', 'rows', 'tired']],
};
const W = MOTHER, ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t), DEG = Math.PI / 180;
// the bud: each leaf's angle from straight up, shut and open (its mirror is on the other side)
const PETALS = [[10, 88], [5, 54], [2, 21]], SEPALS = [[15, 118], [7, 101]];

export function makeMother(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'bower'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 3.4, xMax = room.x1 - 3.4, root = { x: cx, y: stageY - 0.3 };
  const B = { name: W.name, hint: 'When she opens, ride a bloom up and slam down on her heart.', rage: 'The whole garden rises with her.', fell: 'The garden is quiet.',
    st: 'dormant', tm: 0, hp: W.hp, phase: 1, flash: 0, cd: 1.2, room, stageY, cx, mode: 'idle', mt: 0, si: 0, side: 1,
    h: { x: cx, y: stageY + W.low, lean: 0 }, open: 0, heart: { x: cx, y: stageY }, spikes: [], pods: [], spores: [], loose: [], hitCd: 0, dim: 0 };
  const base = 'assets/side/mother/';
  const mat = file => litMat({ map: tex(base + file + '.png'), normalMap: tex(base + file + '_n.png'), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x000000 });
  // a piece w x h pixels; `foot`: it turns about the middle of its bottom edge
  const piece = (file, w, h, z, foot, parent = scene) => { const g = new THREE.PlaneGeometry(1, 1); if (foot) g.translate(0, 0.5, 0); const m = new THREE.Mesh(g, mat(file)); m.scale.set(w / 16, h / 16, 1); m.position.z = z; m.userData = { w: w / 16, h: h / 16 }; parent.add(m); return m; };
  // ---- the stalk, the rosette at its foot
  const stalk = []; for (let i = 0; i < 9; i++) stalk.push(piece('stalk', 26, 20, -0.7 + i * 0.002));
  const leaves = piece('leaves', 156, 40, -0.46, true); leaves.position.set(cx, stageY - 0.25, -0.46);
  // ---- the head: a group at the top of the stalk; its leaves are its children
  const head = new THREE.Group(); head.position.z = -0.6; scene.add(head);
  const fan = [];   // every leaf of the bud: { m, shut, open (its angle each way), s (which side), x, y, z (its foot, in the head), kind }
  PETALS.forEach(([a, b], k) => { for (const s of [-1, 1]){ const z = 0.01 + k * 0.004, m = piece('petal', 32, 74, z, true, head); fan.push({ m, shut: a * s * DEG, open: b * s * DEG, s, x: s * (0.15 + (2 - k) * 0.22), y: 0.1, z, kind: 'petal' }); } });
  const heart = piece('heart', 40, 40, 0.03, false, head); heart.position.set(0, 1.2, 0.03);
  const heartGlow = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), additive(glow('rgba(255,210,120,1)'), 0xffc860, 0)); heartGlow.position.set(0, 1.2, 0.025); head.add(heartGlow);
  SEPALS.forEach(([a, b], k) => { for (const s of [-1, 1]){ const z = 0.04 + k * 0.004, m = piece('sepal', 30, 56, z, true, head); fan.push({ m, shut: a * s * DEG, open: b * s * DEG, s, x: s * (0.75 - k * 0.4), y: -0.05, z, kind: 'sepal' }); } });
  const calyx = piece('calyx', 60, 28, 0.06, false, head); calyx.position.set(0, -0.35, 0.06);
  // ---- the arms: a chain each, a thorned knot at its end
  const arms = [-1, 1].map(s => ({ s, root: { x: cx + s * 2.7, y: stageY - 0.2 }, tip: { x: cx + s * 2.7, y: stageY - 0.5 }, seg: Array.from({ length: 14 }, (_, i) => piece('vine', 20, 14, -0.52 + i * 0.001)), club: piece('club', 42, 42, -0.5), spin: 0 }));
  const light = new THREE.PointLight(0xffc860, 0, 9, 1.5); scene.add(light);
  const warnTex = glow('rgba(255,60,50,1)');
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.1), additive(warnTex, 0xff5040, 0)); scene.add(warn);
  const markGeo = new THREE.PlaneGeometry(1.5, 0.6);
  // the spores her seeds hatch: the garden's puff, drawn with its strips when they are there
  let puffMeta = null; fetch('assets/side/px_puff/sprite.json').then(r => r.ok ? r.json() : null).then(m => { puffMeta = m; }).catch(() => {});
  const sporeGlow = glow('rgba(255,150,160,1)');
  // ---- what only her rise has: thorns that break the stage round her (a row in front of her, a taller one behind), the
  // light breaking out of the cracks they come from, the light leaking from the bud, the glow behind her when it bursts, the petals it throws
  const RZ = W.rise, footGeo = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), rootMat = mat('thorn'), backMat = mat('thorn'); backMat.color.setHex(0x8b9bb4);
  const seamTex = glow('rgba(99,199,77,1)'), seamGeo = new THREE.PlaneGeometry(1.8, 1.2);
  const hash = k => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const roots = [];
  [[1.5, 2.9, 4.4, 5.8, 7.3, 8.9, 10.4], [0.9, 2.2, 3.6, 5.1, 6.6, 8.2, 9.8]].forEach((offs, back) => offs.forEach((o, j) => { for (const s of [-1, 1]){
    const k = roots.length, x = Math.max(xMin - 2, Math.min(xMax + 2, cx + s * o)), m = new THREE.Mesh(footGeo, back ? backMat : rootMat), crack = new THREE.Mesh(seamGeo, additive(seamTex, back ? 0x63c74d : 0xfee761, 0));
    m.visible = false; m.position.set(x, stageY - 0.05, back ? -0.9 : -0.3); scene.add(m); crack.position.set(x, stageY + 0.3, back ? -0.85 : 0.35); scene.add(crack);
    roots.push({ m, crack, x, s, back: !!back, at: RZ.roots + o * 0.085 + (back ? -0.06 : 0.03) + hash(k) * 0.08, tall: back ? 2.3 + hash(k + 9) * 1.2 : 1.2 + hash(k + 9) * 1.0, w: (back ? 1.7 : 1.25) * (hash(k + 3) < 0.5 ? -1 : 1), tilt: -s * (0.06 + hash(k + 5) * 0.22), sink: RZ.sink + j * 0.04 + hash(k + 7) * 0.1 });
  } }));
  const seep = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), additive(glow('rgba(254,231,97,1)'), 0xfee761, 0)); seep.position.set(0, 0.9, 0.08); head.add(seep);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), additive(glow('rgba(246,117,122,1)'), 0xf6757a, 0)); halo.position.z = -0.95; scene.add(halo);
  const petalMat = mat('petal'), flung = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), petalMat); m.visible = false; m.position.z = 0.25; scene.add(m); return { m }; });
  let RS = null;   // the rise as it goes: which roots came up, the arms, the thrown petals
  const riseFresh = () => { RS = { roots: roots.map(() => ({ on: false })), arms: [{}, {}], burst: false }; };
  // how hard the bud beats at t (0 to 1): a quick swell at each beat, and a slower settling; harder as they come faster
  const beat = t => RZ.beats.reduce((p, b, i) => { const d = t - b, k = d < -0.15 ? 0 : d < 0 ? Math.exp(d / 0.035) : Math.exp(-d / 0.14); return Math.max(p, k * (0.6 + 0.4 * i / (RZ.beats.length - 1))); }, 0);
  const riseHide = () => { for (const r of roots){ r.m.visible = false; r.crack.material.opacity = 0; } for (const f of flung) f.m.visible = false; seep.material.opacity = 0; halo.material.opacity = 0; head.scale.setScalar(1); };

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = x => Math.max(xMin, Math.min(xMax, x));
  const go = m => { B.mode = m; B.mt = 0; B.hit = false; B.n = 0; };
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: W.name, frac: Math.max(0, B.hp / W.hp), phase: B.phase } : null;
  const drop = (list, i) => { const o = list[i]; if (o.m) scene.remove(o.m); if (o.mark) scene.remove(o.mark); if (o.sprite) scene.remove(o.sprite.g); list.splice(i, 1); };
  const clear = () => { for (const L of [B.spikes, B.pods, B.spores]) while (L.length) drop(L, 0); };
  B.reset = () => {
    Object.assign(B, { st: 'dormant', tm: 0, hp: W.hp, phase: 1, cd: 1.2, mode: 'idle', mt: 0, si: 0, open: 0, flash: 0, hitCd: 0, dim: 0, again: false, side: 1 });
    Object.assign(B.h, { x: cx, y: stageY + W.low, lean: 0 }); clear();
    for (const L of B.loose) head.add(L.f.m); B.loose.length = 0; for (const f of fan) f.gone = false;   // her leaves are hers again
    for (const a of arms){ a.tip.x = a.root.x; a.tip.y = stageY - 0.5; }
    RS = null; riseHide();
  };
  // ---- what she throws up and out
  const spike = (x, lag) => { const m = piece('thorn', 20, 46, 0.3, true), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0)); m.visible = false; m.position.set(x, stageY - 0.05, 0.3); mark.position.set(x, stageY + 0.2, 0.4); scene.add(mark); B.spikes.push({ x, t: -lag, m, mark, hit: false, flip: Math.random() < 0.5 ? -1 : 1 }); };
  const pod = (x0, y0, tx) => { const m = piece('pod', 16, 16, 0.3), t = 1.05 + Math.random() * 0.25; B.pods.push({ x: x0, y: y0, vx: (tx - x0) / t, vy: (stageY + 0.3 - y0 + 0.5 * W.pods.g * t * t) / t, t: 0, m, down: -1 }); };
  const spore = (x, y) => {
    const s = { x, y, st: 'drift', tm: 0, age: Math.random() * 6, face: 1, sprite: puffMeta ? makeSprite(scene, 'assets/side/px_puff', puffMeta) : null, m: null };
    if (!s.sprite){ s.m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), additive(sporeGlow, 0xff90a0, 0.9)); s.m.position.z = 0.1; scene.add(s.m); }
    B.spores.push(s);
  };
  const burstSpore = (s, fx, quiet) => { fx.burst({ x: s.x, y: s.y }, quiet ? 14 : 30, 0xf6757a); fx.burst({ x: s.x, y: s.y }, quiet ? 6 : 20, 0xfee761); if (!quiet){ fx.ring({ x: s.x, y: s.y }, 0xfeae34); R.glint(s.x, s.y, 0xff8050, 0.9, 4, 0.3); } };
  // an arm's end goes toward a place
  const reach = (a, x, y, rate, dt) => { const k = Math.min(1, dt * rate); a.tip.x += (x - a.tip.x) * k; a.tip.y += (y - a.tip.y) * k; };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt); B.hitCd = Math.max(0, B.hitCd - dt); B.fx = fx;
    const H = B.h, inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 - 1 && P.y < room.y1, M = B.mode;
    let warnA = 0, warnX = cx, warnW = 4, warnY = stageY + 0.25;
    // where her head wants to be, how far the bud is open, where each arm's end wants to be
    const sway = Math.sin(B.tm * 0.8);
    let hx = cx + sway * 0.45, hy = stageY + W.tall + Math.sin(B.tm * 1.3) * 0.12, lean = sway * 0.07, open = 0, rate = 4;
    const armTo = arms.map((a, i) => ({ x: a.root.x + a.s * (3.0 + Math.sin(B.tm * 0.9 + i * 2) * 0.5), y: stageY + 4.2 + Math.cos(B.tm * 1.1 + i * 2) * 0.5, rate: 3 }));
    if (B.st === 'dormant'){
      hx = cx; hy = stageY + W.low + Math.sin(B.tm * 1.1) * 0.03; lean = 0; for (let i = 0; i < 2; i++){ armTo[i].x = arms[i].root.x; armTo[i].y = stageY - 0.6; }
      if (inRoom && P.grounded && P.y >= stageY - 0.05 && P.y < stageY + 0.5 && P.x > room.x0 + 9 && P.hp > 0){ B.st = 'rise'; B.tm = 0; riseFresh(); events.push({ type: 'bossWake', boss: B }); }
    }
    else if (B.st === 'rise'){
      // she comes up (W.rise). Nothing in it can hurt him
      if (!RS) riseFresh();
      const t = B.tm, cue = c => dt > 0 && t >= c && t - dt < c, toward = Math.sign(P.x - cx) || -1, roof = room.y1 - 1.2, tr = (Math.random() - 0.5);
      // 1. the stage cracks and heaves; thorns break up through it, out from her root, both ways (only cracks under him)
      if (cue(0.02)) events.push({ type: 'bossSweep' });
      if (cue(0.22) || cue(0.7)){ events.push({ type: 'rockLand', at: { x: cx, y: stageY } }); fx.debris(cx - 9, cx + 9, roof, stageY, 10); fx.puff({ x: cx, y: stageY }, 12, 3); }
      roots.forEach((r, k) => { if (cue(Math.max(0.01, r.at - 0.4))) RS.roots[k].on = Math.abs(r.x - P.x) > (r.back ? 1.0 : 1.4); if (!cue(r.at) || !RS.roots[k].on) return;
        fx.burst({ x: r.x, y: stageY + 0.4 }, r.back ? 5 : 8, 0x63c74d); fx.dust({ x: r.x, y: stageY }, 5, 2.5); if (!r.back) fx.puff({ x: r.x, y: stageY }, 6, 2.6);
        if (k % 3 === 0) events.push({ type: 'rockLand', at: { x: r.x, y: stageY } }); });
      // 2. the stalk climbs, slowly and in heaves, the bud swaying and trembling; it beats, faster and faster, and every
      // beat squeezes it and the light leaks out between its leaves
      const [c0, c1] = RZ.climb, u = Math.max(0, Math.min(1, (t - c0) / (c1 - c0))), g = ease(Math.max(0, Math.min(1, u + 0.055 * Math.sin(u * Math.PI * 6)))), pu = B.pulse = beat(t);
      const shake = (t < c0 ? 0.04 : 0.02 + 0.05 * u) + (t > RZ.beats[0] ? 0.05 : 0);
      hx = cx + Math.sin(t * 1.9) * 0.4 * g + tr * shake; hy = stageY + W.low + (W.tall - W.low) * g + (t < c0 ? 0.12 * Math.abs(Math.sin(t * 9)) * ease(t / 0.5) : 0) - 0.22 * pu;
      lean = Math.sin(t * 1.9 + 0.7) * 0.13 * g + tr * shake * 0.8; open = 0.16 * pu + (t > 3.3 ? 0.1 * (t - 3.3) / 0.3 : 0); rate = 7;
      if (cue(c0 + 0.05) || cue(2.35) || cue(3.0)) events.push({ type: 'bossTell' });
      RZ.beats.forEach((b, i) => { if (cue(b)) { events.push({ type: i % 2 ? 'step' : 'bossSweep' }); fx.burst({ x: H.x, y: H.y + 1.2 }, 4 + i, 0xfee761); } });
      if (t > c0 && t < RZ.burst && Math.random() < 0.3) fx.dust({ x: cx + (Math.random() - 0.5) * 2.4, y: stageY }, 1, 2);
      // 3. it bursts: a scream, the petals, the light from inside; she rears up over him and leans down at him
      if (cue(RZ.burst)){ RS.burst = true; const at = { x: H.x, y: H.y + 1.2 }; B.flash = 0.35; B.open = 0.8;
        fx.burst(at, 46, 0xf6757a); fx.burst(at, 26, 0xfee761); fx.burst(at, 16, 0x63c74d); fx.ring(at, 0xf6757a); R.shock(at.x, at.y, true); R.glint(at.x, at.y, 0xfee761, 2.4, 13, 0.9);
        fx.debris(cx - 12, cx + 12, roof, stageY, 40, [0xf6757a, 0xfee761, 0xe43b44], true); events.push({ type: 'spit' }, { type: 'bossSlam', at: { x: cx, y: stageY }, soft: true });
        flung.forEach((f, i) => { const a = Math.PI * (0.05 + 0.9 * (i + Math.random() * 0.8) / flung.length), c = Math.cos(a); Object.assign(f, { x: at.x + c * 1.6, y: at.y + 0.4 + Math.sin(a) * 1.2, vx: c * (8 + Math.random() * 6), vy: Math.sin(a) * (6 + Math.random() * 5), vr: (Math.random() - 0.5) * 16, r: Math.random() * 6, age: 0, sz: 0.16 + Math.random() * 0.12 }); f.m.visible = true; }); }
      if (t >= RZ.burst){ const k = t - RZ.burst, back = 1 - ease((k - 0.35) / 1.2), scream = Math.max(0, 1 - k / 0.9);
        hx = cx + toward * 0.6 * back + tr * 0.16 * scream; hy = stageY + W.tall + 0.9 * back - 0.25 * ease(k / 0.12) * scream; lean = toward * 0.26 * back + tr * 0.1 * scream; rate = k < 0.25 ? 14 : 5;
        open = t < RZ.shut[0] ? 1 : 1 - ease((t - RZ.shut[0]) / (RZ.shut[1] - RZ.shut[0])); }
      // 4. her arms come up out of the stage (the one away from him first), rear over it writhing, and lash down hard, in
      // front of him; they rest a moment where they struck, and go up to where they fight from
      arms.forEach((a, i) => { const A = RS.arms[i], first = a.s === -toward ? 0 : 1, up = RZ.erupt[first], down = RZ.lash[first];
        if (t < up){ armTo[i] = { x: a.root.x, y: stageY - 0.6, rate: 6 }; if (t > up - 0.6 && Math.random() < 0.35) fx.dust({ x: a.root.x + (Math.random() - 0.5), y: stageY }, 2, 2.4); return; }
        if (cue(up)){ a.tip.x = a.root.x; a.tip.y = stageY + 0.4; fx.burst({ x: a.root.x, y: stageY + 0.5 }, 18, 0x63c74d); fx.puff({ x: a.root.x, y: stageY }, 14, 3.4); fx.dust({ x: a.root.x, y: stageY }, 12, 3.5); R.shock(a.root.x, stageY + 0.5, false); events.push({ type: 'rockLand', at: { x: a.root.x, y: stageY } }); }
        if (t < down){ armTo[i] = { x: a.root.x + a.s * (1.2 + Math.sin(t * 6 + i * 2) * 0.5), y: stageY + 6.8 + Math.cos(t * 5 + i) * 0.5, rate: 8 }; return; }
        if (A.tx == null){ let tx = a.root.x + a.s * 3.6; if (Math.sign(P.x - cx) === a.s && Math.abs(tx - P.x) < 2.4){ tx = P.x - a.s * 1.7; if ((tx - a.root.x) * a.s < 0.4) tx = P.x + a.s * 2; } A.tx = clampX(tx); }   // just short of him
        if (A.hit == null){ a.tip.x += (A.tx - a.tip.x) * Math.min(1, dt * 14); a.tip.y -= W.slam.drop * dt; armTo[i] = { x: a.tip.x, y: a.tip.y, rate: 0 };
          if (a.tip.y <= stageY + 0.75){ a.tip.y = stageY + 0.75; A.hit = t; events.push({ type: 'bossSlam', at: { x: a.tip.x, y: stageY } }); R.shock(a.tip.x, stageY + 0.5, true); fx.burst({ x: a.tip.x, y: stageY + 0.5 }, 14, 0x63c74d); fx.puff({ x: a.tip.x, y: stageY }, 18, 4); fx.debris(a.tip.x - 5, a.tip.x + 5, roof, stageY, 14); } return; }
        if (t < A.hit + 0.45) armTo[i] = { x: a.tip.x, y: stageY + 0.75, rate: 0 }; else armTo[i].rate = 2.5; });
      roots.forEach((r, k) => { if (RS.roots[k].on && cue(r.sink) && k % 4 === 0) fx.dust({ x: r.x, y: stageY }, 4, 2); });
      if (t > RZ.end){ B.st = 'fight'; B.tm = 0; go('idle'); B.cd = 0.8; B.pulse = 0; riseHide(); }
    }
    else if (B.st === 'die'){
      // her leaves fall one by one; the stalk sags; the heart goes dark; the arms drop
      const k = Math.floor(B.tm / 0.26), left = fan.filter(f => !f.gone);
      if (left.length && k > fan.length - left.length){ const f = left[left.length - 1]; f.gone = true; scene.attach(f.m); B.loose.push({ f, vx: f.s * (1 + Math.random() * 2.5), vy: 2 + Math.random() * 2, vr: f.s * (1 + Math.random() * 2) }); fx.burst({ x: H.x, y: H.y + 1 }, 8, f.kind === 'petal' ? 0xf6757a : 0x63c74d); events.push({ type: 'rockLand', at: { x: H.x + f.s, y: H.y } }); }
      const sag = ease((B.tm - 0.8) / 2.4); open = 1; hx = cx + B.side * 3.2 * sag; hy = stageY + W.open.y - (W.open.y - 1.0) * sag; lean = B.side * 1.5 * sag; B.dim = ease((B.tm - 1.4) / 1.8);
      for (let i = 0; i < 2; i++){ armTo[i].x = arms[i].root.x + arms[i].s * 5.5; armTo[i].y = stageY + 0.6; armTo[i].rate = 1.6; }
      if (B.tm > 3.9){ B.st = 'dead'; events.push({ type: 'bossDead', boss: B }); }
    }
    else if (B.st === 'dead'){ open = 1; hx = cx + B.side * 3.2; hy = stageY + 1.0; lean = B.side * 1.5; for (let i = 0; i < 2; i++){ armTo[i].x = arms[i].root.x + arms[i].s * 5.5; armTo[i].y = stageY + 0.6; } }
    else if (B.st === 'fight'){
      if (M === 'idle'){
        B.cd -= dt;
        if (B.cd <= 0){ const seq = W.seq[B.phase - 1], m = seq[B.si % seq.length]; B.si++; go(m); B.again = false; if (m !== 'tired') events.push({ type: 'bossTell' });
          if (m === 'sweep'){ B.side = P.x > cx ? -1 : 1; B.arm = B.side < 0 ? 0 : 1; }          // from the end far from him
          if (m === 'slam') B.arm = P.x > cx ? 1 : 0;
          if (m === 'tired') B.side = Math.sign(P.x - cx) || 1; }
      }
      else if (M === 'thorns'){
        // under him, one after another
        lean = Math.sin(B.mt * 9) * 0.05; const k = Math.floor(B.mt / W.thorns.gap);
        while (B.n <= k && B.n < W.thorns.n){ spike(clampX(P.x + P.vx * 0.12), 0); B.n++; }
        if (B.mt > W.thorns.n * W.thorns.gap + 1.0){ go('idle'); B.cd = ph(W.cd); }
      }
      else if (M === 'rows'){
        // across the whole stage: every other place, then the places between
        lean = Math.sin(B.mt * 9) * 0.06; hy -= 0.3;
        const first = B.si % 2, sets = [0, W.rows.lag];
        while (B.n < 2 && B.mt >= sets[B.n]){ let j = 0; for (let x = xMin + 0.4, i = 0; x < xMax; x += W.rows.step, i++) if (i % 2 === (B.n + first) % 2) spike(x, (j++) * W.rows.wave); B.n++; if (B.n === 2) events.push({ type: 'bossTell' }); }
        if (B.mt > W.rows.lag + 1.5){ go('idle'); B.cd = ph(W.cd); }
      }
      else if (M === 'sweep'){
        // the arm is laid down at one end; then it runs the length of the stage
        const a = arms[B.arm], from = B.side < 0 ? xMin - 0.5 : xMax + 0.5, to = B.side < 0 ? xMax + 1 : xMin - 1, dir = Math.sign(to - from), tell = ph(W.sweep.tell);
        if (B.mt < tell){ armTo[B.arm] = { x: from, y: stageY + 0.6, rate: 5 }; warnA = 0.35 + 0.5 * B.mt / tell; warnW = xMax - xMin + 4; warnY = stageY + 0.45; B.sx = from; }
        else {
          if (B.n === 0){ B.n = 1; events.push({ type: 'bossSweep', at: { x: from, y: stageY } }); }
          B.sx += dir * ph(W.sweep.speed) * dt; a.tip.x = B.sx; a.tip.y = stageY + 0.55 + Math.sin(B.mt * 11) * 0.08; armTo[B.arm] = { x: B.sx, y: a.tip.y, rate: 0 };
          if (Math.random() < 0.8) fx.dust({ x: B.sx, y: stageY }, 2, 2.6);
          if (!B.hit && Math.abs(P.x - B.sx) < W.sweep.reach && P.y < stageY + W.sweep.high && P.y > stageY - 1 && !isRollInv(P)){ if (hurt(P, 1, B.sx - dir, 'Swept')) B.hit = true; }
          if ((to - B.sx) * dir <= 0){
            if (B.phase === 2 && !B.again){ go('sweep'); B.again = true; B.side = -B.side; B.arm = 1 - B.arm; events.push({ type: 'bossTell' }); }   // and the other arm, back
            else { go('idle'); B.cd = ph(W.cd); }
          }
        }
      }
      else if (M === 'slam'){
        // over him, following; then down
        const a = arms[B.arm], aim = ph(W.slam.aim) * (B.again ? 0.6 : 1);
        if (B.n === 0 && B.mt < aim){ B.tx = clampX(P.x); armTo[B.arm] = { x: B.tx, y: stageY + W.slam.high, rate: 7 }; warnA = 0.3 + 0.5 * B.mt / aim; warnX = B.tx; warnW = W.slam.reach * 2.2; }
        else if (B.n === 0){
          a.tip.x += (B.tx - a.tip.x) * Math.min(1, dt * 12); a.tip.y -= W.slam.drop * dt; armTo[B.arm] = { x: a.tip.x, y: a.tip.y, rate: 0 }; warnA = 1; warnX = B.tx; warnW = W.slam.reach * 2.2;
          if (a.tip.y <= stageY + 0.75){ a.tip.y = stageY + 0.75; B.n = 1; B.mt = 0; events.push({ type: 'bossSlam', at: { x: a.tip.x, y: stageY } });
            if (Math.abs(P.x - a.tip.x) < W.slam.reach && P.y < stageY + 2.4 && P.y > stageY - 1 && !isRollInv(P)) hurt(P, 2, a.tip.x, 'Crushed'); }
        }
        else { armTo[B.arm] = { x: a.tip.x, y: stageY + 0.75, rate: 0 };
          if (B.mt > W.slam.rest){ if (B.phase === 2 && !B.again){ go('slam'); B.again = true; B.arm = 1 - B.arm; events.push({ type: 'bossTell' }); } else { go('idle'); B.cd = ph(W.cd); } } }
      }
      else if (M === 'pods'){
        // she leans back, the bud parts, and the seeds go up
        lean = -Math.sign(P.x - cx || 1) * 0.3 * Math.min(1, B.mt / 0.4); open = 0.3; hy -= 0.35;
        const n = ph(W.pods.n), k = Math.floor((B.mt - W.pods.tell) / W.pods.every);
        while (B.mt >= W.pods.tell && B.n <= k && B.n < n){ const tx = clampX(P.x + (B.n - (n - 1) / 2) * 3.4 + (Math.random() - 0.5)); pod(H.x, H.y + 2.6, Math.abs(tx - cx) < 2.2 ? cx + Math.sign(tx - cx || 1) * 2.2 : tx); events.push({ type: 'spit' }); fx.burst({ x: H.x, y: H.y + 2.8 }, 8, 0xfee761); B.n++; }
        if (B.mt > W.pods.tell + n * W.pods.every + 0.7){ go('idle'); B.cd = ph(W.cd); }
      }
      else if (M === 'tired'){
        // she opens: up high first, heart bared to the sky; then she bows, and it can be cut; then shuts
        const u = W.open.unfold, hi = ph(W.open.high), bw = ph(W.open.bow), t = B.mt;
        if (t < u + hi){ open = ease(t / u); hx = cx; hy = stageY + W.tall - (W.tall - W.open.y) * ease(t / u); lean = Math.sin(B.tm * 2.2) * 0.05; for (let i = 0; i < 2; i++){ armTo[i].y = stageY + 1.6; armTo[i].x = arms[i].root.x + arms[i].s * 4.6; armTo[i].rate = 2; } }
        else if (t < u + hi + bw){ const b = ease((t - u - hi) / 0.5); open = 1; hx = cx + B.side * 3.3 * b; hy = stageY + W.open.y - (W.open.y - 1.55) * b; lean = B.side * 1.62 * b; for (let i = 0; i < 2; i++){ armTo[i].y = stageY + 1.0; armTo[i].x = arms[i].root.x + arms[i].s * 5; armTo[i].rate = 2; } }
        else { const c = ease((t - u - hi - bw) / W.open.shut); open = 1 - c; hx = cx + B.side * 3.3 * (1 - c); hy = stageY + 1.55 + (W.tall - 1.55) * c; lean = B.side * 1.62 * (1 - c); if (c >= 1){ go('idle'); B.cd = ph(W.cd); } }
        rate = 7;
      }
    }
    // ---- her head comes to where it wants to be
    { const k = Math.min(1, dt * rate); H.x += (hx - H.x) * k; H.y += (hy - H.y) * k; H.lean += (lean - H.lean) * k; B.open += (open - B.open) * Math.min(1, dt * 9); }
    arms.forEach((a, i) => { if (armTo[i].rate) reach(a, armTo[i].x, armTo[i].y, armTo[i].rate, dt); });
    const ca = Math.cos(-H.lean), sa = Math.sin(-H.lean); B.heart.x = H.x - 1.2 * sa; B.heart.y = H.y + 1.2 * ca;
    const bared = B.st === 'fight' && B.mode === 'tired' && B.open > 0.6;
    // his plunge into the open flower: it takes it, and throws him off
    if (bared && P.dive && B.hitCd <= 0 && Math.abs(P.x - B.heart.x) < 1.9 && P.y < B.heart.y + 1.1 && P.y > B.heart.y - 1.4){
      B.hitCd = 0.5; P.dive = null; P.vy = 13; P.airJumps = 1; P.airTop = P.y; P.inv = Math.max(P.inv, 0.5); P.plant = 0;
      events.push({ type: 'bossSlam', at: { x: B.heart.x, y: B.heart.y }, soft: true }); wound(W.plunge, { x: B.heart.x, y: B.heart.y + 0.4 }, true, events);
      fx.burst({ x: B.heart.x, y: B.heart.y }, 34, 0xfee761); fx.ring({ x: B.heart.x, y: B.heart.y }, 0xffd27a); R.shock(B.heart.x, B.heart.y, true);
    }
    // ---- thorns out of the stage
    for (let i = B.spikes.length - 1; i >= 0; i--){
      const s = B.spikes[i]; s.t += dt; if (s.t < 0) continue;
      if (s.t < W.thorns.warn){ s.mark.material.opacity = 0.45 + 0.4 * Math.sin(s.t * 30); if (Math.random() < 0.25) fx.dust({ x: s.x, y: stageY }, 1, 1.4); }
      else { const u = (s.t - W.thorns.warn) / W.thorns.up, k = u < 0.2 ? u / 0.2 : u > 0.7 ? Math.max(0, (1 - u) / 0.3) : 1; s.mark.material.opacity = 0; s.m.visible = true; s.m.scale.set(s.m.userData.w * s.flip, Math.max(0.01, W.thorns.tall * k), 1);
        if (!s.up){ s.up = true; events.push({ type: 'rockLand', at: { x: s.x, y: stageY } }); fx.burst({ x: s.x, y: stageY + 0.5 }, 6, 0xb86f50); }
        if (!s.hit && k > 0.6 && Math.abs(P.x - s.x) < W.thorns.half && P.y < stageY + W.thorns.tall * 0.8 && P.y > stageY - 1 && !isRollInv(P)){ if (hurt(P, 1, s.x, 'Spiked')) s.hit = true; }
        if (u >= 1) drop(B.spikes, i); }
    }
    // ---- seeds in the air, on the stage; what hatches
    for (let i = B.pods.length - 1; i >= 0; i--){
      const p = B.pods[i]; p.t += dt;
      if (p.down < 0){ p.vy -= W.pods.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.m.rotation.z += dt * 9; if (p.vy < 0 && p.y <= stageY + 0.4){ p.y = stageY + 0.4; p.down = 0; fx.dust({ x: p.x, y: stageY }, 6, 2); events.push({ type: 'step' }); } }
      else { p.down += dt; p.m.rotation.z = Math.sin(p.down * 26) * 0.25 * p.down; p.m.scale.setScalar(1 + p.down * 0.5);
        if (p.down >= W.pods.hatch){ fx.burst({ x: p.x, y: p.y }, 12, 0xfee761); if (B.spores.length < W.pods.cap && B.st === 'fight') spore(p.x, p.y + 0.5); drop(B.pods, i); continue; } }
      p.m.position.set(p.x, p.y, 0.3);
    }
    for (let i = B.spores.length - 1; i >= 0; i--){
      const s = B.spores[i]; s.tm += dt; s.age += dt; const px = P.x, py = P.y + 1.3, d = Math.hypot(px - s.x, py - s.y) || 1, v = (s.st === 'swell' ? 0.35 : 1) * W.spore.drift;
      if (s.st !== 'pop'){ s.x += (px - s.x) / d * v * dt + Math.sin(s.age * 2.1) * 0.25 * dt; s.y += (py - s.y) / d * v * dt + Math.sin(s.age * 1.7) * 0.3 * dt; s.y = Math.max(stageY + 0.6, s.y); s.face = Math.sign(px - s.x) || s.face; }
      if (s.st === 'drift' && d < W.spore.near && s.tm > 0.6){ s.st = 'swell'; s.tm = 0; }
      else if (s.st === 'swell' && s.tm >= W.spore.swell){ s.st = 'pop'; s.tm = 0; burstSpore(s, fx); events.push({ type: 'spit' }); if (Math.hypot(px - s.x, py - s.y) < W.spore.radius && !isRollInv(P)) hurt(P, 1, s.x, 'Choked'); }
      else if (s.st === 'pop' && s.tm >= 0.22){ drop(B.spores, i); continue; }
      if (s.sprite){ s.sprite.show(s.st === 'drift' ? 'float' : 'burst', s.st === 'swell' ? s.tm / W.spore.swell * 0.66 : s.st === 'pop' ? 0.67 + s.tm / 0.22 * 0.32 : s.age * 0.9, s.x, s.y - 0.56, s.face, 0.03); if (s.st !== 'drift') s.sprite.plane.scale.multiplyScalar(s.st === 'swell' ? 1 + s.tm / W.spore.swell * 0.8 : 1.8 + s.tm * 3); s.sprite.mat.emissive.setHex(s.st === 'swell' && Math.sin(s.tm * 40) > 0 ? 0x601010 : 0x301018); }
      else { s.m.position.set(s.x, s.y, 0.1); s.m.scale.setScalar(s.st === 'swell' ? 1 + s.tm / W.spore.swell : 1); s.m.material.color.setHex(s.st === 'swell' ? 0xff4040 : 0xff90a0); }
    }
    // ---- leaves she has dropped
    for (const L of B.loose){ L.vy -= 9 * dt; const m = L.f.m; m.position.x += L.vx * dt; m.position.y += L.vy * dt; m.rotation.z += L.vr * dt; if (m.position.y < stageY + 0.15){ m.position.y = stageY + 0.15; L.vx *= Math.exp(-dt * 6); L.vr *= Math.exp(-dt * 8); L.vy = 0; } else L.vx += Math.sin(B.tm * 5 + L.vr) * dt * 2; }

    // ---- draw her
    const grown = B.st !== 'dormant';
    // the stalk: along a curve from the root to the head
    { const c = { x: root.x + (H.x - root.x) * 0.15 + Math.sin(B.tm * 0.8 + 1) * 0.3, y: root.y + (H.y - root.y) * 0.62 + 0.4 }, n = stalk.length;
      stalk.forEach((m, i) => { const t = (i + 0.5) / n, u = 1 - t, x = u * u * root.x + 2 * u * t * c.x + t * t * H.x, y = u * u * root.y + 2 * u * t * c.y + t * t * H.y, dx = 2 * u * (c.x - root.x) + 2 * t * (H.x - c.x), dy = 2 * u * (c.y - root.y) + 2 * t * (H.y - c.y);
        m.position.x = x; m.position.y = y; m.rotation.z = Math.atan2(dy, dx) - Math.PI / 2; m.scale.x = m.userData.w * (i % 2 ? -1 : 1); }); }
    leaves.scale.y = leaves.userData.h * (1 + Math.sin(B.tm * 1.2) * 0.03);
    head.position.x = H.x; head.position.y = H.y; head.rotation.z = -H.lean;
    for (const f of fan){ if (f.gone) continue; const a = f.shut + (f.open - f.shut) * B.open + f.s * Math.sin(B.tm * 1.7 + f.open) * 0.02 * (1 + B.open * 2); f.m.position.set(f.x * (1 + B.open * 0.5), f.y, f.z); f.m.rotation.z = -a; f.m.scale.set(f.m.userData.w * (f.s < 0 ? -1 : 1), f.m.userData.h, 1); }
    const glowK = (1 - B.dim) * (B.open * (0.75 + 0.2 * Math.sin(B.tm * 6)) + B.flash * 4);
    heart.visible = B.open > 0.12 && (B.st !== 'fight' || B.mode === 'tired');   // only when it is truly bared (a seed's throw parts the bud, no more)
    heart.scale.setScalar(2.5 * Math.min(1, B.open * 1.6) * (1 + Math.sin(B.tm * 5) * 0.03)); heart.material.color.setScalar(1 - B.dim * 0.8); heart.material.emissive.setHex(B.flash > 0 ? 0xffffff : 0x000000);
    heartGlow.material.opacity = heart.visible ? Math.min(1, glowK * 0.55) : 0; heartGlow.material.color.setHex(B.phase === 2 ? 0xff7050 : 0xffc860);
    for (const f of fan) f.m.material.emissive.setHex(B.flash > 0 && bared ? 0x803020 : 0x000000);
    light.position.set(B.heart.x, B.heart.y, 1.2); light.intensity = grown ? (1 - B.dim) * (0.35 + B.open * 1.3 + B.flash * 4) : 0.25; light.color.setHex(B.phase === 2 ? 0xff8060 : 0xffc860);
    if (grown && B.st !== 'dead') R.glint(B.heart.x, B.heart.y, B.phase === 2 ? 0xff8060 : 0xffc860, (1 - B.dim) * (0.15 + B.open * 0.5 + B.flash * 3), 6);
    // the arms: a curve from the root up and over to the end
    for (const a of arms){
      const d = Math.hypot(a.tip.x - a.root.x, a.tip.y - a.root.y), c = { x: (a.root.x + a.tip.x) / 2 + a.s * 0.6, y: Math.max(a.root.y, a.tip.y) + 1.2 + d * 0.22 }, n = a.seg.length, segL = (d * 1.25 + 1.5) / n;
      a.seg.forEach((m, i) => { const t = (i + 0.5) / n, u = 1 - t, x = u * u * a.root.x + 2 * u * t * c.x + t * t * a.tip.x, y = u * u * a.root.y + 2 * u * t * c.y + t * t * a.tip.y, dx = 2 * u * (c.x - a.root.x) + 2 * t * (a.tip.x - c.x), dy = 2 * u * (c.y - a.root.y) + 2 * t * (a.tip.y - c.y);
        m.position.x = x; m.position.y = y; m.rotation.z = Math.atan2(dy, dx); m.scale.x = Math.max(1.25, segL * 1.5); m.visible = d > 0.6; });
      a.spin += dt * (B.mode === 'sweep' && B.st === 'fight' ? 9 : 0.6) * a.s; a.club.position.x = a.tip.x; a.club.position.y = a.tip.y; a.club.rotation.z = a.spin; a.club.visible = d > 0.6;
    }
    warn.material.opacity = warnA; warn.scale.set(warnW / 4, 1, 1); warn.position.set(warnX, warnY, 0.5);
    if (B.st === 'rise' && RS) drawRise(B.tm, dt);
  };
  // the rise's own pieces, at t into it
  function drawRise(t, dt){
    const pu = B.pulse || 0, k = t - RZ.burst;
    roots.forEach((r, i) => {
      // its crack glows first, then it comes up (too far, and back), stands shivering, and goes down again at the end
      const on = RS.roots[i].on, a = t - r.at, c = r.crack.material;
      c.opacity = !on || a < -0.4 ? 0 : a < 0 ? (a + 0.4) / 0.4 * (0.7 + 0.3 * Math.sin(t * 40 + i)) : Math.max(0.25, 1 - a / 1.2) * (1 - ease((t - r.sink) / 0.4)) * (1 + pu * 0.6);
      const h = !RS.roots[i].on || a < 0 ? 0 : (a < 0.1 ? 1.2 * a / 0.1 : 1.2 - 0.2 * ease((a - 0.1) / 0.25)) * (1 - ease((t - r.sink) / 0.35));
      r.m.visible = h > 0.01; if (!r.m.visible) return;
      r.m.scale.set(r.w, r.tall * h * (1 + Math.sin(t * 13 + i) * 0.02), 1); r.m.rotation.z = r.tilt + Math.sin(t * 17 + i * 3) * 0.02 * (a < 0.6 ? 1 : 0.4);
    });
    // the light leaking from the bud as it beats, and swelling before it bursts; then the glow behind her as it does
    seep.material.opacity = RS.burst ? 0 : Math.min(1, pu * 0.95 + (t > 3.2 ? (t - 3.2) / 0.4 * 0.6 : 0));
    head.scale.setScalar(1 + 0.08 * pu + (k > 0 ? 0.14 * Math.exp(-k / 0.12) : t > 3.25 ? 0.05 * (t - 3.25) / 0.35 : 0));
    halo.material.opacity = k > 0 ? 0.85 * Math.exp(-k / 0.9) : 0; halo.scale.setScalar(0.7 + Math.min(1, k * 1.4) * 0.6); halo.position.set(B.heart.x, B.heart.y, -0.95);
    if (pu > 0.05 || k > 0) R.glint(B.heart.x, B.heart.y, 0xfee761, pu * 0.9 + (k > 0 ? 1.4 * Math.exp(-k / 0.7) : 0), 7);
    light.intensity += pu * 1.2 + (k > 0 ? 2 * Math.exp(-k / 0.8) : 0);
    leaves.scale.y = leaves.userData.h * (1 + (t < RZ.climb[0] ? 0.08 * Math.abs(Math.sin(t * 9)) : 0) + pu * 0.06);
    // the petals she threw: tumbling down, slowing, swaying; they wither as they come down
    for (const f of flung){ if (!f.m.visible) continue;
      f.age += dt; f.vy -= 7 * dt; const drag = Math.exp(-dt * 1.6); f.vx *= drag; f.vy = Math.max(-2.2, f.vy * drag); f.x += (f.vx + Math.sin(f.age * 5 + f.r) * 1.2) * dt; f.y += f.vy * dt; f.r += f.vr * dt;
      const s = f.sz * (1 - ease((f.age - 1.3) / 0.7)); f.m.position.set(f.x, Math.max(stageY + 0.2, f.y), 0.25); f.m.rotation.z = f.r; f.m.scale.set(2 * s, 4.6 * s, 1); if (s <= 0.01) f.m.visible = false; }
  }

  // a wound: her health, her second wind, her end
  function wound(dmg, at, heavy, events){
    B.hp -= dmg; B.flash = 0.14; events.push({ type: 'hit', at, heavy });
    if (B.phase === 1 && B.hp <= W.hp * W.phase2){ B.phase = 2; B.si = 0; events.push({ type: 'bossPhase', boss: B }); }
    if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.dim = 0; clear(); events.push({ type: 'bossDie' }); }
  }
  // his cut: the heart takes it when it is bared and within his reach (she has bowed); shut, the bud turns it. A seed on
  // the stage or a spore in reach is cut too
  function cutSmall(near, events){
    let any = false;
    for (let i = B.pods.length - 1; i >= 0; i--){ const p = B.pods[i]; if (p.down >= 0 && near(p.x, p.y, 0.5)){ events.push({ type: 'hit', at: { x: p.x, y: p.y } }); drop(B.pods, i); any = true; } }
    for (const s of B.spores) if (s.st !== 'pop' && near(s.x, s.y, 0.6)){ s.st = 'pop'; s.tm = 0; if (B.fx) burstSpore(s, B.fx, true); events.push({ type: 'hit', at: { x: s.x, y: s.y } }); any = true; }
    return any;
  }
  B.strike = (P, reach, dmg, events) => {
    if (B.st !== 'fight') return false;
    const near = (x, y, r) => { const ahead = (x - P.x) * P.face; return ahead > -0.6 - r && ahead < reach + r && Math.abs(y - (P.y + 1.2)) < 1.6 + r; };
    let any = cutSmall(near, events);
    if (B.mode === 'tired' && B.open > 0.6 && near(B.heart.x, B.heart.y, 1.3)){ wound(dmg, { x: B.heart.x - P.face * 0.7, y: Math.min(B.heart.y + 0.4, P.y + 1.5) }, dmg >= 2, events); any = true; }
    else if (near(B.h.x, B.h.y + 0.8, 1.6) || (Math.abs(cx - P.x) < reach + 0.5 && P.y < stageY + 2)){ events.push({ type: 'block', at: { x: P.x + P.face * 1.2, y: P.y + 1.3 } }); any = true; }
    return any;
  };
  B.slam = (P, radius, dmg, events) => {
    if (B.st !== 'fight') return false;
    const near = (x, y, r) => Math.abs(x - P.x) < radius + r && y < P.y + 2.6 && y > P.y - 1;
    let any = cutSmall(near, events);
    if (B.mode === 'tired' && B.open > 0.6 && near(B.heart.x, B.heart.y, 1.3)){ wound(dmg + 1, { x: B.heart.x, y: B.heart.y }, true, events); any = true; }
    return any;
  };
  return B;
}
