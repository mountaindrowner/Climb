// The Fallen: the Firmament's keeper, and the last. Not a giant: him. What stayed at the top when he fell, drawn with
// his own strips gone dark, a cold light where its eyes are, and a long pale scarf that is its life as the red one is
// his. It fights with his moves, so the fight asks for all of his:
//   the combo   it closes and cuts three times, each cut drawn back first (its wind-up is the tell); the third turns
//               all the way round and hits wide. Block them; raise the block as one lands to turn it, and it staggers,
//               wide open. After the third it is slow to recover: that is when to cut it
//   the roll    if he stands behind his block it rolls through him and cuts from his back
//   the dash    from far off it leans (a red line along the floor), then crosses the stage in one cut: roll through, or jump
//   the plunge  it leaps, hangs over him (a red mark), and drives down; a ring runs out along the floor both ways:
//               jump it or roll through it. It is slow to get up from that too
//   the turn    cut at it carelessly, again and again, and it turns a cut aside and answers. Three cuts and it rolls away
// From half its scarf it calls on the sky (phase two): it steps out of the world and back in behind or above him,
// star-shards fall in a marked line that walks the stage, the star-glass keeps a quicker beat, and its cuts come faster.
// It wakes when he walks out onto the summit, and starts over if he dies. When it falls the dark runs off it, and its
// scarf goes to him.
import { T, LEVEL, PHASE, solidAt } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { makeSprite } from './render.js';
import { glow, additive } from './boss.js';
import { makeScarf, SCARF } from './scarf.js';
import { sfx } from '../audio/sfx.js';
const THREE = window.THREE;
// [phase one, phase two] where there are two
export const FALLEN = {
  name: 'The Fallen', hp: 44, phase2: 0.5, art: 'assets/side/mask_tall_c',
  run: 6.4, pace: 3.0, keep: 3.0,
  cut: [ { anim: 'atk_slam_v3', hit: 7 / 11, wind: [0.46, 0.36], active: 0.1, rec: [0.34, 0.27], reach: 2.0, lunge: 0.8 },
    { anim: 'atk_slam_px', hit: 9 / 13, wind: [0.4, 0.31], active: 0.1, rec: [0.36, 0.28], reach: 2.0, lunge: 0.9 },
    { anim: 'atk_spin_px', hit: 2 / 13, hitEnd: 10 / 13, wind: [0.5, 0.4], active: 0.28, rec: [0.85, 0.68], reach: 2.3, back: 1.4, lunge: 1.1, heavy: true } ],
  quick: { anim: 'atk_rise_px', hit: 9 / 13, wind: [0.34, 0.28], active: 0.1, rec: [0.55, 0.45], reach: 2.0, lunge: 0.5 },   // its answer: after a turned cut, out of a roll, out of the dark
  roll: { time: 0.42, speed: 10.5 },
  dash: { tell: [0.62, 0.5], time: 0.3, speed: 23, rec: [0.75, 0.6], min: 5, anim: 'atk_dash_px', hit: 7 / 13 },
  leap: { tell: 0.34, up: 15.5, grav: 30, hang: [0.42, 0.3], dive: 27, reach: 1.15, wave: 9.5, waveLen: 6.5, rec: [1.05, 0.85], min: 3 },
  parry: { per: 0.3, max: 0.72, fade: 0.8, hold: 0.2 },   // each cut that lands while it is free makes it likelier to turn the next
  stagger: 1.7, flinch: 0.28, escape: 3,                  // a parry of its cut costs it this long; three cuts taken and it rolls away
  blink: { out: 0.22, gone: 0.5, tell: 0.34, back: 2.3, high: 5.2 },
  shards: { raise: 0.5, n: 8, every: 0.17, step: 1.6, warn: 0.75, fall: 21, hold: 1.5, from: 11.5 },
  cd: [0.6, 0.32], beat: [2.4, 1.3],                      // between its moves; the star-glass's beat
};
const D = FALLEN, SINK = 2 / 16, COLD = 0x7fe8ff, STAR = 0xfee761;
// its rise, in seconds of it (entrance.js puts its name up as the blade strikes: B.revealAt, RISE.strike)
//   0      it stands with its back to him in the dark, still; the star that fell to it burns where it landed
//   gather the star's light is drawn into its hand, and more out of the dark around it
//   kindle the light runs up the blade, cold
//   look   it turns its head: an eye opens over its shoulder
//   turn   it turns, slowly, all the way round
//   raise  the blade goes up over its head, and is held there; the light gathers at its point
//   strike it drives the blade point-down into the stage: a ring of cold light, the stage cracks, the world shakes
//   up     it gets up off its knee, drawing the blade out; at end, the fight
const RISE = { gather: 0.35, kindle: 1.95, look: 2.55, turn: 3.2, turnLen: 0.65, raise: 4.05, raised: 4.75, strike: 5.0, up: 5.7, end: 6.3 };
// where the blade lies in the frames the rise uses: hilt x, y, point x, y, in the strip's pixels
const BLADE = { 'idle:0': [42, 38, 52, 42], 'block:3': [34, 34, 46, 33], 'atk_slam_px:3': [37, 29, 46, 26], 'atk_slam_px:4': [37, 19, 36, 9], 'atk_slam_px:5': [30, 11, 21, 5],
  'atk_slam_px:6': [23, 10, 10, 9], 'atk_slam_px:7': [23, 10, 9, 10], 'atk_slam_px:8': [23, 10, 10, 9], 'plunge_land:3': [42, 31, 42, 41], 'plunge_land:4': [43, 42, 44, 50],
  'plunge_land:5': [45, 41, 45, 47], 'plunge_land:6': [45, 41, 45, 47], 'plunge_land:7': [45, 41, 45, 47], 'plunge_land:8': [44, 42, 45, 49], 'plunge_land:9': [43, 42, 44, 51],
  'plunge_land:10': [43, 42, 44, 51], 'plunge_land:11': [42, 40, 46, 47] };
// and where its eye is in them (the front of its skull); in the others, where it is in the fight
const EYE = { 'idle:0': [38, 16], 'block:3': [35, 17], 'atk_slam_px:3': [31, 13], 'atk_slam_px:4': [30, 14], 'plunge_land:3': [35, 15], 'plunge_land:4': [37, 21],
  'plunge_land:5': [39, 25], 'plunge_land:6': [39, 25], 'plunge_land:7': [39, 25], 'plunge_land:8': [39, 25], 'plunge_land:9': [38, 24], 'plunge_land:10': [37, 21], 'plunge_land:11': [35, 18] };
// the cracks its blade leaves in the stage: drawn once, 16 pixels a unit. The fissures run out both ways along the
// stage's top from the middle of the bottom edge (FOOT pixels up from it is the stage's top); the cold light comes up
// out of them
const CRACK = { w: 12, h: 2.25, foot: 4 };
function crackTex(){
  const W = CRACK.w * 16, H = CRACK.h * 16, top = H - CRACK.foot, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const dot = (x, y, col, a) => { g.globalAlpha = Math.max(0, Math.min(1, a)); g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const run = (x, y, dir, len, a0) => {
    for (let s = 0; s < len; s++){
      const k = s / len, a = a0 * (1 - k * 0.8);
      dot(x, y, k < 0.3 && a0 > 0.8 ? '#ffffff' : '#2ce8f5', a);
      if (Math.random() < 0.09 * (1 - k)){ const h = 4 + Math.random() * (top - 6) * (1 - k); for (let j = 1; j < h; j++) dot(x, y - j, j < 3 ? '#ffffff' : '#2ce8f5', a * 0.8 * (1 - j / h)); }   // light up out of it
      x += dir * (Math.random() < 0.85 ? 1 : 0); if (Math.random() < 0.3) y = Math.max(top - 1, Math.min(H - 1, y + (Math.random() < 0.55 ? 1 : -1)));
      if (s > 5 && len - s > 8 && Math.random() < 0.06) run(x, y, dir, (len - s) * (0.3 + Math.random() * 0.3), a * 0.8);
    }
  };
  for (const dir of [-1, 1]){ run(W / 2, top, dir, W * 0.47, 1); run(W / 2, top + 1, dir, W * 0.28, 0.9); }
  for (let j = 0; j < top; j++) dot(W / 2, top - j, j < 6 ? '#ffffff' : '#2ce8f5', 0.9 * (1 - j / top));   // where the blade went in
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}

export function makeFallen(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'zenith'), mk = LEVEL.marks.find(m => m.type === 'boss'), ex = LEVEL.marks.find(m => m.type === 'exit');
  if (!room || !mk) return null;
  PHASE.period = D.beat[0];
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 2.8, xMax = room.x1 - 2.8, home0 = Math.min(xMax - 1, ex ? (ex.x + 0.5) * T - 3.2 : cx + 9);
  // it stands a little short of the torch there, facing it (not in it: the flame is drawn in front of everything)
  const torch = LEVEL.marks.find(m => m.type === 'torch' && Math.abs((m.x + 0.5) * T - home0) < 1.6 && Math.abs(m.y * T - stageY) < 3), homeX = torch ? Math.max(xMin + 4, (torch.x + 0.5) * T - 1.9) : home0;
  const START = { st: 'dormant', tm: 0, hp: D.hp, phase: 1, flash: 0, cd: 0.6, mode: 'stalk', mt: 0, acts: 0, x: homeX, y: stageY, vx: 0, vy: 0, face: 1, dist: 0, mash: 0, took: 0, tookT: 0, cut: null, alpha: 1,
    fly: null, given: false, gone: false, drawn: false, rang: false, dest: null, beat: 0, crackT: -1, crackX: 0 };
  const B = { name: D.name, hint: 'Block its sword. Attack when it is tired.', rage: 'It calls down the sky.', fell: 'What you left here is yours again.',
    room, stageY, cx, waves: [], shards: [], ghosts: [], drops: [], seen: false, revealAt: RISE.strike, ...START };
  // ---- what it is drawn with: his strips, dark; its eyes; its scarf
  const dark = new THREE.Color(0x343c60), white = new THREE.Color(0xffffff), tint = new THREE.Color();
  let spr = null, ART = null;
  fetch(`${D.art}/sprite.json`).then(r => r.ok ? r.json() : null).then(meta => { if (!meta) return; ART = meta.anims; spr = makeSprite(scene, D.art, meta); spr.warm(['idle', 'block', 'atk_slam_px', 'plunge_land']); spr.mat.color.copy(dark); spr.g.visible = false; }).catch(() => {});
  const scf = makeScarf(scene, { edge: 0x181425, body: 0xc0cbdc, shade: 0x8b9bb4, glow: 0x2ce8f5 });
  const coldTex = glow('rgba(140,235,255,1)'), warnTex = glow('rgba(255,60,50,1)'), whiteTex = glow('rgba(255,255,255,1)');
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), additive(coldTex, COLD, 0)); eye.position.z = 0.06; scene.add(eye);
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), additive(coldTex, 0x3a78c8, 0)); aura.position.z = -0.2; scene.add(aura);
  const light = new THREE.PointLight(0x9fe8ff, 0, 6, 1.6); scene.add(light);
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(warnTex, 0xff5040, 0)); warn.position.z = 0.5; scene.add(warn);     // the dash's line, the plunge's mark
  const spot = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), additive(coldTex, COLD, 0)); spot.position.z = 0.5; scene.add(spot);    // where it will step back in
  const waveGeo = new THREE.PlaneGeometry(0.9, 1.3), markGeo = new THREE.PlaneGeometry(1.3, 0.55), lineGeo = new THREE.PlaneGeometry(1 / 16, 1);
  const shardGeo = new THREE.BufferGeometry(); shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.85, 0, 0.2, 0, 0, 0, -0.85, 0, -0.2, 0, 0], 3)); shardGeo.setIndex([0, 1, 3, 1, 2, 3]);
  const shardMat = new THREE.MeshBasicMaterial({ color: 0xdff8ff, side: THREE.DoubleSide }), dropGeo = new THREE.PlaneGeometry(2 / 16, 2 / 16), dropMat = new THREE.MeshBasicMaterial({ color: 0x181425 });
  // ---- its rise: the fallen star's light drawn into its hand, the blade kindling, the look back, the turn, the blade
  // raised and driven into the stage (rising(), below)
  const motes = [];
  for (let i = 0; i < 18; i++){ const m = new THREE.Mesh(dropGeo, additive(null, STAR, 0)); m.position.z = 0.3; m.visible = false; scene.add(m); motes.push({ m, a: Math.random() * Math.PI * 2, r: 1.1 + Math.random() * 1.7, ph: i / 18, spin: Math.random() < 0.5 ? -1 : 1 }); }
  const orb = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(whiteTex, STAR, 0)); orb.position.z = 0.3; orb.visible = false; scene.add(orb);   // the star, then the light in its hand
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(coldTex, COLD, 0)); edge.position.z = 0.065; edge.visible = false; scene.add(edge);   // the blade's light: soft
  const core = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / 16), additive(null, 0xffffff, 0)); core.position.z = 0.066; core.visible = false; scene.add(core);   // and its edge
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(CRACK.w, CRACK.h), additive(crackTex(), 0xffffff, 0)); crack.position.z = 0.3; crack.visible = false; scene.add(crack);
  const rush = [-1, 1].map(() => { const m = new THREE.Mesh(waveGeo, additive(coldTex, COLD, 0)); m.position.z = 0.4; m.visible = false; scene.add(m); return m; });   // the light running out along the stage

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = x => Math.max(xMin, Math.min(xMax, x)), sgn = v => v < 0 ? -1 : 1;
  const go = m => { B.mode = m; B.mt = 0; B.hit = false; };
  const kill = list => { for (const o of list) for (const k of ['m', 'mark', 'line']) if (o[k]){ scene.remove(o[k]); if (o[k].material !== shardMat && o[k].material !== dropMat) o[k].material.dispose(); } list.length = 0; };
  const clear = () => { kill(B.waves); kill(B.shards); kill(B.drops); for (const G of B.ghosts){ scene.remove(G.m); G.m.material.map.dispose(); G.m.material.dispose(); } B.ghosts.length = 0; };
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: D.name, frac: Math.max(0, B.hp / D.hp), phase: B.phase } : null;
  B.reset = () => { clear(); Object.assign(B, START); PHASE.period = D.beat[0]; if (spr) spr.mat.color.copy(dark); };
  const tell = events => events.push({ type: 'bossTell' });
  const ghost = () => { if (!spr) return; const m = spr.ghost(0x58c8ff); if (m) B.ghosts.push({ m, life: 0.26 }); };

  // ---- its blade against him: he can roll through it, block it, or turn it (a block raised just as it lands)
  function touch(P, events, word, heavy, noBlock, two){
    if (P.hp <= 0 || isRollInv(P)) return 'miss';
    const toward = sgn(B.x - P.x);
    if (!noBlock && P.blocking && P.face === toward){
      const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18;
      events.push({ type: parry ? 'parry' : 'block', at: { x: P.x + P.face * 0.55, y: P.y + 1.35 }, mine: true });
      if (parry){ B.cut = null; B.vx = -B.face * 3.5; B.mash = 0; go('stagger'); return 'parry'; }
      P.vx = -toward * (heavy ? 7 : 4); return 'block';
    }
    return hurt(P, two ? 2 : 1, B.x, word) ? 'hurt' : 'miss';   // two: its plunge and its dash, his heaviest blows turned on him
  }
  const startCut = (P, i, def) => { B.cut = { i, def: def || D.cut[i], ph: 'wind' }; B.face = sgn(P.x - B.x); B.vx = 0; go('cut'); };
  const startRoll = (P, away) => { B.rollDir = sgn(P.x - B.x) * (away && Math.abs(P.x - B.x) > 1.5 ? -1 : 1); if ((B.rollDir > 0 && B.x > xMax - 3) || (B.rollDir < 0 && B.x < xMin + 3)) B.rollDir = sgn(P.x - B.x); B.face = B.rollDir; B.cut = null; go('roll'); sfx.roll(); };
  const startBlink = (kind, events) => { B.blinkKind = kind; B.cut = null; B.vx = 0; B.dest = null; go('blinkOut'); tell(events); };
  function decide(P, events){
    B.acts++; const ad = Math.abs(P.x - B.x), r = Math.random(), two = B.phase === 2;
    if (two && B.acts % 4 === 0){ B.dir = sgn(P.x - B.x); B.n = 0; B.face = B.dir; go('shards'); tell(events); return; }
    if (ad > D.dash.min){
      if (r < 0.46){ B.face = sgn(P.x - B.x); go('dashTell'); tell(events); }
      else if (two && r < 0.76) startBlink(r < 0.6 ? 'above' : 'behind', events);
      else { go('leapTell'); tell(events); }
      return;
    }
    if (ad > 2.6){ if (two && r < 0.3) startBlink('behind', events); else if (r < 0.28 && ad > D.leap.min){ go('leapTell'); tell(events); } else go('run'); return; }
    if (P.blocking && P.face === sgn(B.x - P.x) && r < 0.7){ if (two && r < 0.3) startBlink('behind', events); else startRoll(P); return; }   // he waits behind his block: go round it
    startCut(P, 0);
  }

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt); B.mash = Math.max(0, B.mash - dt * D.parry.fade); if ((B.tookT -= dt) <= 0) B.took = 0;
    const inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 - 1 && P.y < room.y1, x0 = B.x;
    let pose = ['idle', B.tm / 1.4], vis = true, low = 1.92, lit = 0.6, warnA = 0, warnX = 0, warnW = 1, warnH = 0.5, warnY = stageY + 0.25, spotA = 0, cold = 0, scarfOn = true, rv = null;
    const d = P.x - B.x, ad = Math.abs(d);

    if (B.st === 'dormant'){
      // it stands by the dark beacon with its back to the stage, and does not turn
      B.x = homeX; B.y = stageY; B.face = 1; lit = 0.35; pose = ['idle', 0.1];   // still: not even breathing
      if (inRoom && P.grounded && Math.abs(P.y - stageY) < 0.3 && P.x > room.x0 + 8.5 && P.hp > 0){ B.st = 'rise'; B.tm = 0; events.push({ type: 'bossWake', boss: B }); }
    }
    else if (B.st === 'rise'){
      rv = rising(P, dt, fx, events); pose = rv.pose; lit = rv.lit; cold = rv.cold; low = rv.low;
      if (rv.done){ B.st = 'fight'; B.tm = 0; B.drawn = false; B.seen = true; go('stalk'); B.cd = 0.5; }
    }
    else if (B.st === 'die') pose = dying(P, dt, fx, events);
    else if (B.st === 'fight'){
      const M = B.mode; lit = 0.85;
      if (P.hp <= 0 && (M === 'stalk' || M === 'run')){ B.vx = 0; }   // he is down: it waits
      else if (M === 'stalk'){
        // it keeps its distance and paces: in when he hangs back, away when he presses
        B.face = sgn(d);
        const want = ad > D.keep + 0.7 ? 1 : ad < D.keep - 1.1 ? -1 : 0; B.vx = B.face * want * (want > 0 ? D.pace : D.pace * 0.8);
        if (want) pose = ['run', (B.dist / 2.6) * want];
        if ((B.cd -= dt) <= 0) decide(P, events);
      }
      else if (M === 'run'){
        B.face = sgn(d); B.vx = B.face * D.run * (B.phase === 2 ? 1.12 : 1); pose = ['run', B.dist / 2.6];
        if (ad < 1.75) startCut(P, 0); else if (B.mt > 1.5){ go('dashTell'); tell(events); }
      }
      else if (M === 'cut'){
        const C = B.cut, df = C.def, wind = ph(df.wind), rec = ph(df.rec), end = df.hitEnd || df.hit + 0.09;
        if (C.ph === 'wind'){
          if (B.mt < wind * 0.55) B.face = sgn(d);                 // it follows him as it draws back, then commits
          pose = [df.anim, df.hit * Math.min(1, B.mt / wind)]; cold = B.mt / wind;
          if (B.mt >= wind){ C.ph = 'active'; B.mt = 0; B.hit = false; B.vx = B.face * df.lunge / df.active; sfx.swing(!!df.heavy);
            fx.crescent({ x: B.x + B.face * 1.15, y: B.y + 1.25 }, B.face, !!df.heavy, df.anim === 'atk_rise_px' ? 1 : df.heavy ? 0.1 : -0.7); R.glint(B.x + B.face * 1.3, B.y + 1.3, COLD, 0.7, 4.5, 0.2); }
        }
        else if (C.ph === 'active'){
          pose = [df.anim, df.hit + (end - df.hit) * Math.min(1, B.mt / df.active)];
          const a = (P.x - B.x) * B.face;
          if (!B.hit && a > -(df.back || 0.35) && a < df.reach && P.y < B.y + 2.4 && P.y + P.h > B.y - 0.2){ B.hit = true; if (touch(P, events, 'Cut down by your own hand', df.heavy) === 'parry') pose = ['hurt', 0]; }
          if (B.mode === 'cut' && B.mt >= df.active){ C.ph = 'rec'; B.mt = 0; B.vx = 0; }
        }
        else {
          pose = [df.anim, end + (1 - end) * Math.min(1, B.mt / rec)];
          if (C.i < 2 && B.mt >= rec * 0.45 && P.hp > 0){ if (C.chain == null) C.chain = ad < 3.4 && Math.random() < (B.phase === 2 ? 0.92 : 0.8); if (C.chain){ startCut(P, C.i + 1); pose = [B.cut.def.anim, 0]; } }
          if (B.mode === 'cut' && B.cut === C && B.mt >= rec){ go('stalk'); B.cd = ph(D.cd) + (C.i === 2 ? 0.25 : 0); B.cut = null; }
        }
      }
      else if (M === 'parry'){ pose = ['atk_slam_px', 0.16]; cold = 1; B.vx = 0; if (B.mt >= D.parry.hold) startCut(P, 9, D.quick); }
      else if (M === 'roll'){
        B.vx = B.rollDir * D.roll.speed; pose = ['roll2_px', Math.min(0.999, B.mt / D.roll.time)]; low = 0.8;
        if (B.mt < 0.05) fx.kick({ x: B.x, y: B.y }, -B.rollDir, 8, 2.6);
        if (B.mt >= D.roll.time){ B.vx = 0; if (Math.abs(P.x - B.x) < 3.2 && P.hp > 0) startCut(P, 9, D.quick); else { go('stalk'); B.cd = 0.2; } }
      }
      else if (M === 'dashTell'){
        const tl = ph(D.dash.tell), u = Math.min(1, B.mt / tl); B.vx = 0; pose = [D.dash.anim, D.dash.hit * 0.8 * u * u]; cold = u; low = 1.92 - 0.5 * u;
        const len = Math.min(D.dash.speed * D.dash.time, B.face > 0 ? xMax - B.x : B.x - xMin); warnA = 0.35 + 0.55 * u; warnW = len; warnX = B.x + B.face * len / 2; warnH = 0.45; warnY = stageY + 1.1;
        if (B.mt >= tl){ go('dash'); B.gT = 0; sfx.dash(); }
      }
      else if (M === 'dash'){
        B.vx = B.face * D.dash.speed; pose = [D.dash.anim, D.dash.hit + (1 - D.dash.hit) * 0.35 * Math.min(1, B.mt / D.dash.time)]; low = 1.5; cold = 1;
        if ((B.gT -= dt) <= 0){ B.gT = 0.03; ghost(); } fx.streak({ x: B.x, y: B.y }, B.face); fx.kick({ x: B.x, y: B.y }, -B.face, 2, 3);
        if (!B.hit && Math.abs(P.x - B.x) < 1.0 && P.y < B.y + 2.2 && P.y + P.h > B.y){ B.hit = true; touch(P, events, 'Run through', true, false, true); }
        if (B.mode === 'dash' && (B.mt >= D.dash.time || B.x <= xMin + 0.01 || B.x >= xMax - 0.01)) go('dashRec');
      }
      else if (M === 'dashRec'){ const rec = ph(D.dash.rec); B.vx *= Math.exp(-dt * 9); pose = [D.dash.anim, D.dash.hit + (1 - D.dash.hit) * (0.35 + 0.65 * Math.min(1, B.mt / rec))]; if (B.mt >= rec){ go('stalk'); B.cd = ph(D.cd); } }
      else if (M === 'leapTell'){ B.vx = 0; B.face = sgn(d); pose = ['plunge_land', 6.5 / 12]; low = 1.15; cold = B.mt / D.leap.tell; if (B.mt >= D.leap.tell){ go('leap'); B.vy = D.leap.up; sfx.jump(); fx.puff({ x: B.x, y: B.y }, 10, 2.4); } }
      else if (M === 'leap'){
        B.vy -= D.leap.grav * dt; B.y += B.vy * dt; B.vx = 0; B.x += (clampX(P.x) - B.x) * Math.min(1, dt * 3.4); B.face = sgn(d);
        pose = ['jump', Math.min(0.999, B.mt / 0.5)]; warnA = 0.3; warnX = B.x; warnW = 1.6;
        if (B.vy <= 0){ B.vy = 0; go('hang'); }
      }
      else if (M === 'hang'){
        // over him, the blade turned down; it follows a little, then stops
        const hg = ph(D.leap.hang); B.vx = 0; if (B.mt < hg * 0.6) B.x += Math.max(-4.5 * dt, Math.min(4.5 * dt, clampX(P.x) - B.x));
        pose = ['plunge_fall', (Math.min(1, Math.floor(B.mt / hg * 2)) + 0.5) / 8, { foot: 46 }]; low = 1.5; cold = 1;
        warnA = 0.5 + 0.45 * (B.mt / hg); warnX = B.x; warnW = 2.2;
        if (B.mt >= hg){ go('dive'); B.gT = 0; sfx.whoosh(); }
      }
      else if (M === 'dive'){
        B.y -= D.leap.dive * dt; B.vx = 0; pose = ['plunge_fall', (2 + Math.floor(B.mt * 12) % 6 + 0.5) / 8, { foot: 46 }]; low = 1.5; cold = 1; warnA = 1; warnX = B.x; warnW = 2.2;
        if ((B.gT -= dt) <= 0){ B.gT = 0.04; ghost(); }
        if (B.y <= stageY){
          B.y = stageY; events.push({ type: 'bossSlam', at: { x: B.x, y: stageY } }); R.shock(B.x, stageY + 0.3, true);
          if (Math.abs(P.x - B.x) < D.leap.reach && P.y < stageY + 2.5 && P.y > stageY - 1) touch(P, events, 'Run through', true, true, true);
          for (const dir of [-1, 1]){ const m = new THREE.Mesh(waveGeo, additive(coldTex, COLD, 0.9)); m.position.z = 0.4; scene.add(m); B.waves.push({ x: B.x, dir, go: 0, hit: false, m }); }
          go('land');
        }
      }
      else if (M === 'land'){ const rec = ph(D.leap.rec); B.vx = 0; pose = ['plunge_land', (4 + Math.min(7.99, B.mt / rec * 8)) / 12]; low = 1.15 + 0.77 * Math.max(0, B.mt / rec - 0.6) / 0.4; if (B.mt >= rec){ go('stalk'); B.cd = ph(D.cd); } }
      else if (M === 'stagger'){ B.vx *= Math.exp(-dt * 6); pose = ['hurt', Math.min(0.999, 0.25 + B.mt / 0.5 * 0.7)]; low = 1.7; if (B.mt >= D.stagger){ go('stalk'); B.cd = 0.3; } }
      else if (M === 'flinch'){ B.vx *= Math.exp(-dt * 8); pose = ['hurt', Math.min(0.6, B.mt / D.flinch * 0.6)];
        if (B.mt >= D.flinch){ if (B.took >= D.escape && P.hp > 0){ B.took = 0; startRoll(P, true); } else { go('stalk'); B.cd = Math.min(B.cd, 0.28); } } }
      else if (M === 'blinkOut'){ B.vx = 0; B.alpha = Math.max(0, 1 - B.mt / D.blink.out); cold = 1;
        if (B.mt >= D.blink.out){ ghost(); fx.burst({ x: B.x, y: B.y + 1.2 }, 22, COLD); fx.ring({ x: B.x, y: B.y + 1.2 }, 0xbff4ff); sfx.glass(); go('gone'); } }
      else if (M === 'gone'){
        vis = false; scarfOn = false; B.alpha = 0;
        if (B.mt < D.blink.gone - D.blink.tell || !B.dest){   // where it will come back: fixed once the light shows there
          if (B.blinkKind === 'centre') B.dest = { x: cx, y: stageY };
          else if (B.blinkKind === 'above') B.dest = { x: clampX(P.x), y: stageY + D.blink.high };
          else { let bx = P.x - P.face * D.blink.back; if (bx < xMin || bx > xMax) bx = P.x + P.face * D.blink.back; B.dest = { x: clampX(bx), y: stageY }; }
        } else { spotA = 0.4 + 0.5 * Math.abs(Math.sin(B.mt * 40)); R.glint(B.dest.x, B.dest.y + 1.2, COLD, 0.6, 3.5); }
        if (B.mt >= D.blink.gone){ B.x = B.dest.x; B.y = B.dest.y; B.face = sgn(P.x - B.x); scf.reset(B.x, B.y + 1.9); fx.burst({ x: B.x, y: B.y + 1.2 }, 16, COLD); go('blinkIn'); }
      }
      else if (M === 'blinkIn'){ B.alpha = Math.min(1, B.mt / 0.12); cold = 1; if (B.y > stageY + 0.1){ pose = ['plunge_fall', 0.5 / 8, { foot: 46 }]; low = 1.5; }
        if (B.mt >= 0.12){ B.alpha = 1; B.dest = null;
          if (B.blinkKind === 'above'){ B.vy = 0; go('hang'); }
          else if (B.blinkKind === 'centre'){ B.dir = sgn(P.x - B.x); B.n = 0; B.face = B.dir; go('shards'); tell(events); }
          else startCut(P, 9, D.quick); } }
      else if (M === 'shards'){
        // the blade raised, and held there: the sky answers along a line that walks toward him and past
        const S = D.shards, u = Math.min(1, B.mt / S.raise); B.vx = 0; pose = ['atk_rise_px', D.quick.hit * u + (u >= 1 ? 0.06 + Math.sin(B.mt * 18) * 0.012 : 0)]; cold = 1;
        if (u >= 1 && !B.rang){ B.rang = true; events.push({ type: 'bossToll' }); R.glint(B.x, B.y + 3, COLD, 1.3, 8, 0.5); }
        const k = Math.floor((B.mt - S.raise) / S.every);
        while (u >= 1 && B.n < k && B.n < S.n){ B.n++; shard(B.x + B.dir * (1.4 + B.n * S.step)); if (B.n % 3 === 0) shard(clampX(P.x + (Math.random() - 0.5) * 1.2)); }
        if (B.mt >= S.raise + S.hold){ B.rang = false; go('stalk'); B.cd = ph(D.cd); }
      }
    }
    // ---- it moves along the stage (it does not leave it)
    if (B.st === 'fight' || B.st === 'die'){ B.x = clampX(B.x + B.vx * dt); if (B.mode === 'stalk' || B.mode === 'run') B.dist += Math.abs(B.x - x0); }
    // the plunge's ring along the floor, both ways
    for (let i = B.waves.length - 1; i >= 0; i--){
      const w = B.waves[i]; w.go += D.leap.wave * dt; w.x += w.dir * D.leap.wave * dt; const k = 1 - w.go / D.leap.waveLen;
      w.m.position.set(w.x, stageY + 0.55, 0.4); w.m.material.opacity = Math.max(0, k) * 0.9; w.m.scale.set(1, 0.6 + 0.5 * k, 1); if (Math.random() < 0.8) fx.dust({ x: w.x, y: stageY }, 1, 2.2);
      if (!w.hit && Math.abs(P.x - w.x) < 0.55 && P.y < stageY + 0.75 && P.y > stageY - 1 && !isRollInv(P) && P.hp > 0){ if (hurt(P, 1, w.x - w.dir, 'Thrown down')) w.hit = true; }
      if (k <= 0 || w.x < room.x0 + 2 || w.x > room.x1 - 2){ scene.remove(w.m); w.m.material.dispose(); B.waves.splice(i, 1); }
    }
    // star-shards: a mark on the floor and a thread of light down to it, then the shard
    for (let i = B.shards.length - 1; i >= 0; i--){
      const s = B.shards[i], S = D.shards; s.t += dt;
      if (s.t < S.warn){ const a = 0.45 + 0.4 * Math.sin(s.t * 26); s.mark.material.opacity = a; s.line.material.opacity = a * 0.5; }
      else { s.mark.material.opacity = 0.9; s.line.material.opacity = 0; s.m.visible = true; s.y -= S.fall * dt; s.m.position.set(s.x, s.y, 0.3);
        if (!s.hit && Math.abs(P.x - s.x) < 0.55 && s.y - 0.8 < P.y + P.h && s.y + 0.8 > P.y && !isRollInv(P) && P.hp > 0){ s.hit = true; hurt(P, 1, s.x, 'Pierced by a star'); }
        if (s.y <= stageY + 0.6){ events.push({ type: 'rockLand', at: { x: s.x, y: stageY } }); fx.burst({ x: s.x, y: stageY + 0.4 }, 10, 0xbff4ff); R.glint(s.x, stageY + 0.5, COLD, 0.6, 3, 0.2); kill([s]); B.shards.splice(i, 1); } }
    }
    for (let i = B.ghosts.length - 1; i >= 0; i--){ const G = B.ghosts[i]; G.life -= dt; G.m.material.opacity = Math.max(0, G.life / 0.26) * 0.7; if (G.life <= 0){ scene.remove(G.m); G.m.material.map.dispose(); G.m.material.dispose(); B.ghosts.splice(i, 1); } }
    for (let i = B.drops.length - 1; i >= 0; i--){ const o = B.drops[i]; o.vy -= 14 * dt; o.y += o.vy * dt; o.life -= dt; if (o.y < stageY + 0.06){ o.y = stageY + 0.06; o.vy = 0; } o.m.position.set(Math.round(o.x * 16) / 16, Math.round(o.y * 16) / 16, 0.07); if (o.life <= 0){ scene.remove(o.m); B.drops.splice(i, 1); } }

    // ---- draw it
    const shown = vis && B.st !== 'dead' && B.alpha > 0.02 && !(B.st === 'die' && B.gone);
    if (spr){
      spr.g.visible = shown;
      if (shown){
        const [anim, frac, anchor] = pose, loops = anim === 'run' || anim === 'idle';
        spr.show(anim, loops ? frac : Math.max(0, Math.min(0.999, frac)), B.x, B.y - SINK, B.face, 0.04, 0, anchor || null);
        const k = B.st === 'die' ? Math.max(0, Math.min(1, (B.tm - 0.9) / 2.2)) : 0;   // the dark runs off it
        tint.copy(dark).lerp(white, k); spr.mat.color.copy(tint);
        spr.mat.emissive.setHex(B.flash > 0 ? 0xffffff : B.mode === 'parry' && B.st === 'fight' ? 0x6090c0 : B.st === 'fight' && cold > 0.05 && Math.sin(B.mt * 34) > 0 ? 0x123a5c : 0x05070e);
        spr.g.visible = B.alpha > 0.5 || Math.floor(B.tm * 40) % 2 === 0;   // going, it flickers out
        if (rv){ spr.plane.scale.x *= rv.squash; spr.mat.emissive.setHex(rv.em); }   // turning; the cold in it
      }
    }
    const headY = B.y + low + 0.12 - SINK;
    eye.visible = shown; eye.position.x = B.x + B.face * 0.14; eye.position.y = headY;
    eye.material.opacity = shown && B.st !== 'dormant' ? (0.55 + 0.25 * Math.sin(B.tm * 6) + cold * 0.3) * (B.st === 'die' ? Math.max(0, 1 - B.tm / 1.5) : 1) : 0;
    eye.material.color.setHex(B.phase === 2 ? 0xffffff : COLD); eye.scale.setScalar(B.phase === 2 ? 1.25 : 1);
    if (rv){ const Y = rv.eye; eye.position.x = Y.x; eye.position.y = Y.y; eye.material.opacity = shown ? Y.a : 0; eye.scale.set(Y.sx, Y.sy, 1); eye.material.color.setHex(Y.col); }
    else hush();
    scars(dt, fx);
    aura.visible = shown && B.phase === 2 && B.st === 'fight'; aura.position.x = B.x; aura.position.y = B.y + 1.2; aura.material.opacity = 0.22 + 0.08 * Math.sin(B.tm * 5);
    light.position.set(B.x + B.face * 0.4, B.y + 1.6, 1.1); light.intensity = shown ? lit * (0.9 + cold * 0.5) + B.flash * 4 : 0;
    if (shown && B.st !== 'dormant' && !rv) R.glint(B.x, B.y + 1.4, B.phase === 2 ? 0xbfe8ff : 0x6fb8e8, 0.22 + cold * 0.2 + B.flash * 3, 4);
    warn.material.opacity = warnA; warn.scale.set(warnW, warnH, 1); warn.position.x = warnX; warn.position.y = warnY;
    spot.material.opacity = spotA; if (B.dest){ spot.position.x = B.dest.x; spot.position.y = B.dest.y + 1.2; }
    // its scarf: from its neck, as long as it has life left (in its death it leaves, and goes to him)
    const F = B.fly, ax = F ? F.x : B.x - B.face * 0.14, ay = F ? F.y : B.y + low - SINK, frac = Math.max(0, B.hp / D.hp);
    const want = B.st === 'dead' || B.given ? 0 : SCARF.base + (B.st === 'die' ? 16 : frac * 22);
    scf.step(dt, ax, ay, F ? F.face : B.face, want, -2.4, solidAt); scf.draw(scarfOn && B.st !== 'dead' && !(B.given && scf.len < 2.5), B.st === 'die' ? 1 : 0.5 + cold * 0.5);
  };

  // ---- its rise (RISE, at the top): it is held at its first moment while entrance.js's lead-in runs (B.tm stays 0),
  // so nothing of it shows until the star has fallen. The second time and after, it goes at twice the pace
  const cA = new THREE.Color(), cB = new THREE.Color(), clamp01 = v => Math.max(0, Math.min(1, v)), smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const mix = (a, b, k) => cA.setHex(a).lerp(cB.setHex(b), clamp01(k)).getHex(), snap = v => Math.round(v * 16) / 16;
  // a pixel of a strip's frame, where it is in the world (s: how wide it is drawn, turning)
  const px = (anim, x, y, s = 1) => { const A = ART && ART[anim]; return A ? { x: B.x + B.face * s * (x + 0.5 - A.cx) / 16, y: B.y - SINK - 0.02 + (A.foot - y - 0.5) / 16 } : { x: B.x + B.face * 0.5, y: B.y + 1 }; };
  const place = (m, x, y, w, h, rot = 0) => { m.visible = true; m.position.x = x; m.position.y = y; m.scale.set(w, h, 1); m.rotation.z = rot; };
  function hush(){ orb.visible = edge.visible = core.visible = false; for (const o of motes) o.m.visible = false; }
  function rising(P, dt, fx, events){
    const Q = RISE, pace = B.seen ? 2 : 1, t = B.tm * pace, toward = sgn(P.x - B.x), once = bit => (B.beat & bit) ? false : (B.beat |= bit, true);
    if (once(1)){ B.turnTo = toward; B.turnFrom = B.face; B.revealAt = Q.strike / pace; }   // entrance.js: its name as the blade strikes
    const out = { pose: null, lit: 0.06, cold: 0, low: 1.92, squash: 1, em: 0x05070e, eye: { x: B.x, y: B.y + 2, a: 0, sx: 0.6, sy: 0.6, col: COLD }, done: t >= Q.end };
    hush();
    if (B.tm <= 0) { out.pose = ['idle', 0.125]; return out; }   // held: entrance.js's lead-in
    // ---- what it does
    let fr, s = 1;
    if (t < Q.turn) fr = ['idle', 0];
    else if (t < Q.turn + Q.turnLen && B.turnFrom !== B.turnTo){
      // it turns: slowly, its shoulders square to him half-way (a narrower drawing, for the turn)
      const e = smooth((t - Q.turn) / Q.turnLen);
      if (e >= 0.5 && once(2)){ B.face = B.turnTo; sfx.step(); fx.kick({ x: B.x, y: B.y }, -B.face, 4, 1.4); }
      s = 0.45 + 0.55 * Math.abs(Math.cos(e * Math.PI)); fr = Math.abs(e - 0.5) < 0.2 ? ['block', 3] : ['idle', 0];
    }
    else if (t < Q.raise){ fr = ['idle', 0]; B.face = toward; }
    else if (t < Q.raised){ const u = smooth((t - Q.raise) / (Q.raised - Q.raise)); fr = ['atk_slam_px', 3 + Math.min(4, Math.floor(u * 5))]; if (once(4)) sfx.rumble(); }
    else if (t < Q.strike - 0.08) fr = ['atk_slam_px', t > Q.strike - 0.32 && Math.floor(t * 22) % 2 ? 8 : 7];   // held up there; at the last, the arms tremble
    else if (t < Q.strike) fr = ['plunge_land', t < Q.strike - 0.04 ? 3 : 4];                                     // and down
    else if (t < Q.up) fr = ['plunge_land', t < Q.strike + 0.12 ? 5 : 6];                                         // on one knee, the blade in the stage
    else fr = ['plunge_land', 7 + Math.min(4, Math.floor((t - Q.up) / (Q.end - Q.up) * 5))];                     // up, drawing it out
    const [anim, fi] = fr, n = ART && ART[anim] ? ART[anim].frames : 4, bl = BLADE[`${anim}:${fi}`] || BLADE['idle:0'];
    out.pose = [anim, (fi + 0.5) / n]; out.squash = s;
    if (anim === 'plunge_land') out.low = fi >= 4 && fi <= 8 ? 1.5 : 1.75;
    const hand = px(anim, bl[0], bl[1], s), tip = px(anim, bl[2], bl[3], s);
    // ---- the star's light: where it fell (on it), drawn into its hand, more of it out of the dark, then up the blade
    const g = clamp01((t - Q.gather) / (Q.kindle - Q.gather)), lit = t >= Q.kindle;
    if (t < Q.kindle + 0.3){
      const k = smooth((t - 0.15) / 1.2), x = B.x + (hand.x - B.x) * k, y = (stageY + 1.5) + (hand.y - stageY - 1.5) * k;
      const flare = lit ? 1 + 0.45 * (1 - (t - Q.kindle) / 0.3) : 1, sz = (0.8 - 0.35 * k + 0.35 * g * g + 0.08 * Math.sin(t * 7) * g) * flare;
      const col = mix(STAR, lit ? 0xffffff : COLD, lit ? 1 : g * g);
      place(orb, snap(x), snap(y), sz, sz); orb.material.color.setHex(col); orb.material.opacity = lit ? Math.max(0, 1 - (t - Q.kindle) / 0.3) : 0.75 + 0.25 * g;
      R.glint(x, y, col, 0.25 + 0.8 * g, 2 + 4 * g);
      out.lit = 0.06 + 0.5 * g; out.cold = g * 0.5;
      if (!lit) for (let i = 0; i < motes.length; i++){
        const o = motes[i]; if (i / motes.length > g * 1.25) continue;
        const q = ((t - Q.gather) / 0.85 + o.ph) % 1, r = o.r * Math.pow(1 - q, 1.3), a = o.a + o.spin * q * 2.4;
        o.m.visible = true; o.m.position.set(snap(hand.x + Math.cos(a) * r), snap(hand.y + Math.sin(a) * r * 0.8), 0.3);
        o.m.material.opacity = Math.sin(q * Math.PI) * 0.95; o.m.material.color.setHex(mix(STAR, 0xc0cbdc, q));
      }
    }
    if (lit){
      if (once(8)){ sfx.parry(); R.glint(tip.x, tip.y, 0xffffff, 1.5, 6, 0.5); fx.burst(hand, 12, 0xc0cbdc); }
      // the blade's light: from the hilt to the point, then held; it goes out of it as it gets up
      const kb = smooth((t - Q.kindle) / 0.35), out1 = t > Q.up ? clamp01(1 - (t - Q.up) / (Q.end - Q.up)) : 1, fl = 0.85 + 0.15 * Math.sin(t * 31);
      const dx = tip.x - hand.x, dy = tip.y - hand.y, L = Math.hypot(dx, dy), rot = Math.atan2(dy, dx);
      place(core, hand.x + dx * kb / 2, hand.y + dy * kb / 2, Math.max(0.01, L * kb), 1, rot); core.material.opacity = 0.9 * fl * out1;
      place(edge, hand.x + dx / 2, hand.y + dy / 2, L + 0.7, 0.55, rot); edge.material.opacity = 0.6 * kb * fl * out1;
      R.glint(tip.x, tip.y, COLD, (0.35 + 0.3 * kb) * out1, 3.5);
      out.lit = 0.55; out.cold = 1; out.em = 0x0a1828;
    }
    // ---- its eye: first over its shoulder, a slit opening; then, turned, on him
    const Y = out.eye;
    if (t >= Q.look && t < Q.turn){
      const o = smooth((t - Q.look) / 0.35), p = px('idle', 33, 16);
      if (once(16)){ R.glint(p.x, p.y, 0xffffff, 0.8, 3, 0.35); sfx.glass(); }
      Object.assign(Y, { x: p.x, y: p.y, a: 0.95 * o, sx: 0.5, sy: 0.12 + 0.38 * o, col: o < 0.6 ? 0xffffff : COLD });
    }
    else if (t >= Q.turn){
      const ey = EYE[`${anim}:${fi}`], head = ey ? px(anim, ey[0], ey[1], s) : { x: B.x + B.face * 0.14, y: B.y + out.low + 0.12 - SINK };
      const held = t >= Q.raised && t < Q.strike + 0.6;
      Object.assign(Y, { x: head.x, y: head.y, a: held ? 1 : 0.85, sx: (held ? 0.75 : 0.6) * s, sy: held ? 0.5 : 0.6, col: held ? 0xffffff : COLD });
    }
    // ---- the blade up, and the light gathering at its point
    if (t >= Q.raise && t < Q.strike){
      const h = clamp01((t - Q.raise) / (Q.strike - Q.raise)), sz = 0.3 + 0.7 * h * h + 0.06 * Math.sin(t * 40) * h;
      place(orb, snap(tip.x), snap(tip.y), sz, sz); orb.material.color.setHex(mix(COLD, 0xffffff, h)); orb.material.opacity = 0.4 + 0.6 * h;
      R.glint(tip.x, tip.y, 0xffffff, 0.3 + 1.1 * h * h, 3 + 5 * h); out.lit = 0.55 + 0.45 * h;
    }
    // ---- it strikes
    if (t >= Q.strike){
      const ix = px('plunge_land', 45, 53).x, at = { x: ix, y: stageY };
      if (once(32)){
        events.push({ type: 'bossSlam', at }); R.shock(ix, stageY + 0.3, true); sfx.crack();
        R.glint(ix, stageY + 0.6, 0xffffff, 2.6, 13, 0.9); R.glint(ix, stageY + 0.4, COLD, 1.4, 9, 2.4);
        fx.ring(at, COLD); fx.ring({ x: ix, y: stageY + 0.5 }, 0xffffff); fx.burst({ x: ix, y: stageY + 0.3 }, 34, 0xc0cbdc); fx.burst({ x: ix, y: stageY + 0.3 }, 16, 0x2ce8f5);
        fx.kick(at, -1, 12, 4.5); fx.kick(at, 1, 12, 4.5);
        fx.debris(room.x0 + 1, room.x1 - 1, room.y1 - 1.2, stageY, 26, [0xffffff, 0xc0cbdc, 0x2ce8f5], true);   // stars shaken out of the sky
        B.crackT = 0; B.crackX = ix;
      }
      const a = t - Q.strike; out.lit = 0.85 + 1.2 * Math.max(0, 1 - a / 0.8); out.cold = 1; out.em = a < 0.12 ? 0x6090c0 : 0x123a5c;
    }
    return out;
  }
  // the cracks it left, and the light running out along the stage; they fade into the fight
  function scars(dt, fx){
    if (B.crackT < 0){ crack.visible = false; rush[0].visible = rush[1].visible = false; return; }
    const c = B.crackT += dt, k = smooth(c / 0.18), fade = clamp01(1 - (c - 2.8) / 2.6), M = crack.material.map, glowA = (c < 0.3 ? 1 : 0.62 + 0.22 * Math.sin(c * 5)) * fade;
    crack.visible = true; crack.position.set(B.crackX, stageY - CRACK.foot / 16 + CRACK.h / 2, 0.3); crack.scale.x = Math.max(0.01, k); M.repeat.x = Math.max(0.01, k); M.offset.x = (1 - k) / 2;
    crack.material.opacity = glowA;
    rush.forEach((m, i) => { const u = c / 0.85; m.visible = u < 1; if (u >= 1) return; m.position.set(B.crackX + (i ? 1 : -1) * c * 11, stageY + 0.5, 0.4); m.material.opacity = (1 - u) * 0.9; m.scale.set(1, 0.5 + 0.6 * (1 - u), 1); if (Math.random() < 0.8) fx.dust({ x: m.position.x, y: stageY }, 1, 2.2); });
    if (c < 2 && Math.random() < dt * 12){ const x = B.crackX + (Math.random() - 0.5) * CRACK.w * 0.7 * k; fx.burst({ x, y: stageY + 0.1 }, 2, Math.random() < 0.5 ? 0x2ce8f5 : 0xffffff); }
    R.glint(B.crackX, stageY + 0.2, COLD, 0.6 * glowA, 6);
    if (fade <= 0) B.crackT = -1;
  }

  // a shard called down at x: marked first
  function shard(x){
    if (x < xMin - 1.5 || x > xMax + 1.5) return;
    const m = new THREE.Mesh(shardGeo, shardMat), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0.6)), line = new THREE.Mesh(lineGeo, additive(whiteTex, COLD, 0.3));
    m.visible = false; mark.position.set(x, stageY + 0.2, 0.4); line.scale.set(1, D.shards.from, 1); line.position.set(x, stageY + D.shards.from / 2, 0.35); scene.add(m); scene.add(mark); scene.add(line);
    B.shards.push({ x, y: stageY + D.shards.from, t: 0, m, mark, line, hit: false });
  }

  // ---- its death, drawn out: it reels; it goes down on its blade; the dark runs off it; it comes apart in light; its
  // scarf rises, and goes to him
  function dying(P, dt, fx, events){
    const t = B.tm; let pose;
    B.vx *= Math.exp(-dt * 3);
    if (t < 0.9) pose = ['hurt', Math.min(0.999, t / 0.9)];
    else pose = ['plunge_land', (5 + Math.min(1.4, (t - 0.9) / 0.5 * 1.4)) / 12];           // down on one knee, the blade in the ground
    if (t > 0.9 && t < 3.3 && !B.gone && Math.random() < dt * 26){ const m = new THREE.Mesh(dropGeo, dropMat); scene.add(m); B.drops.push({ x: B.x + (Math.random() - 0.5) * 0.9, y: B.y + 0.3 + Math.random() * 1.5, vy: 0, life: 0.9 + Math.random() * 0.6, m }); }
    if (t > 3.3 && !B.gone){ B.gone = true; fx.burst({ x: B.x, y: B.y + 1 }, 40, 0xdff8ff); fx.burst({ x: B.x, y: B.y + 1.4 }, 24, COLD); fx.ring({ x: B.x, y: B.y + 1 }, 0xffffff); R.glint(B.x, B.y + 1.2, 0xdff8ff, 1.6, 9, 0.9); sfx.glass(); sfx.thread();
      B.fly = { x: B.x - B.face * 0.14, y: B.y + 1.2, x0: B.x, y0: B.y + 1.2, face: B.face, t: 0 }; }
    if (B.fly){
      const F = B.fly; F.t += dt;
      const up = Math.min(1, F.t / 0.9), u = Math.max(0, Math.min(1, (F.t - 0.9) / 1.9)), e = u * u * (3 - 2 * u), tx = P.x - P.face * 0.14, ty = P.y + 1.9;
      const sx = F.x0, sy = F.y0 + 2.4 * up * (2 - up), dx = tx - sx, dy = ty - sy, L = Math.hypot(dx, dy) || 1, wv = Math.sin(u * Math.PI * 2) * Math.sin(u * Math.PI) * Math.min(1.4, L * 0.12);
      F.x = sx + dx * e - dy / L * wv; F.y = sy + dy * e + dx / L * wv; F.face = sgn(dx);
      if (Math.random() < 0.6) fx.burst({ x: F.x, y: F.y }, 1, Math.random() < 0.5 ? 0xdff8ff : COLD); R.glint(F.x, F.y, 0xbfe8ff, 0.8, 4.5);
      if (u >= 1 && !B.given){ B.given = true; P.hp = P.maxHp; fx.ring({ x: P.x, y: P.y + 1.4 }, 0xffffff); fx.burst({ x: P.x, y: P.y + 1.6 }, 30, 0xdff8ff); R.glint(P.x, P.y + 1.5, 0xffffff, 1.8, 10, 1.2); R.shock(P.x, P.y + 1.4, true); sfx.shrine(); sfx.relic(); }
    }
    if (B.given && B.fly && B.fly.t > 0.9 + 1.9 + 1.1){ B.st = 'dead'; B.fly = null; clear(); events.push({ type: 'bossDead', boss: B }); }
    return pose;
  }

  // ---- his cut against it
  function struck(P, near, dmg, events, slam){
    if (B.st !== 'fight' || !near) return false;
    const M = B.mode, at = { x: B.x - P.face * 0.3, y: Math.min(B.y + 1.5, P.y + 1.4) };
    if (M === 'roll' || M === 'gone' || M === 'blinkOut' || M === 'blinkIn') return false;       // it is not there to be cut
    if (M === 'parry'){ events.push({ type: 'block', at }); return true; }
    const free = M === 'stalk' || M === 'run';
    if (free && !slam && Math.random() < Math.min(D.parry.max, B.mash * D.parry.per)){   // he only mashes: it turns the cut aside, and answers
      B.mash = 0; B.face = sgn(P.x - B.x); B.vx = 0; go('parry'); events.push({ type: 'parry', at }); R.glint(at.x, at.y, 0xffffff, 1, 5, 0.25); return true; }
    B.mash += 1; B.hp -= dmg; B.flash = 0.14; B.took++; B.tookT = 1.3;
    events.push({ type: 'hit', at, heavy: dmg >= 2 });
    if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.cut = null; B.vx = P.face * 3; B.gone = false; B.given = false; B.fly = null; B.alpha = 1; kill(B.waves); kill(B.shards); PHASE.period = D.beat[0]; events.push({ type: 'bossDie' }); }
    else if (B.phase === 1 && B.hp <= D.hp * D.phase2){ B.phase = 2; PHASE.period = D.beat[1]; events.push({ type: 'bossPhase', boss: B }); B.blinkKind = 'centre'; B.cut = null; B.vx = 0; B.took = 0; B.dest = null; go('blinkOut'); }
    else if (M === 'stagger' || M === 'land' || M === 'dashRec' || M === 'dash' || M === 'dive' || M === 'hang' || M === 'leap'){ /* it takes it, and goes on */ }
    else if (free || M === 'flinch' || (dmg >= 2 && (M === 'dashTell' || M === 'leapTell' || M === 'shards' || (M === 'cut' && B.cut && B.cut.ph === 'wind')))){ B.cut = null; B.rang = false; B.vx = P.face * 2.5; go('flinch'); }
    return true;
  }
  B.strike = (P, reach, dmg, events) => { const ahead = (B.x - P.x) * P.face; return struck(P, ahead > -0.5 && ahead < reach + 0.4 && B.y < P.y + 2.7 && B.y + 2.4 > P.y - 0.2, dmg, events, false); };
  B.slam = (P, radius, dmg, events) => struck(P, Math.abs(B.x - P.x) < radius + 0.4 && Math.abs(B.y - P.y) < 1.6, dmg, events, true);
  return B;
}
