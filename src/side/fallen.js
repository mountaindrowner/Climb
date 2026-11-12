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
  name: 'The Fallen', hp: 30, phase2: 0.5, art: 'assets/side/mask_tall_c',
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
const D = FALLEN, SINK = 2 / 16, COLD = 0x7fe8ff;

export function makeFallen(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'zenith'), mk = LEVEL.marks.find(m => m.type === 'boss'), ex = LEVEL.marks.find(m => m.type === 'exit');
  if (!room || !mk) return null;
  PHASE.period = D.beat[0];
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 2.8, xMax = room.x1 - 2.8, homeX = Math.min(xMax - 1, ex ? (ex.x + 0.5) * T - 3.2 : cx + 9);
  const START = { st: 'dormant', tm: 0, hp: D.hp, phase: 1, flash: 0, cd: 0.6, mode: 'stalk', mt: 0, acts: 0, x: homeX, y: stageY, vx: 0, vy: 0, face: 1, dist: 0, mash: 0, took: 0, tookT: 0, cut: null, alpha: 1,
    fly: null, given: false, gone: false, drawn: false, rang: false, dest: null };
  const B = { name: D.name, hint: 'turn its blade; cut when it is spent', rage: 'it calls on the sky', fell: 'what you left here is yours again',
    room, stageY, cx, waves: [], shards: [], ghosts: [], drops: [], ...START };
  // ---- what it is drawn with: his strips, dark; its eyes; its scarf
  const dark = new THREE.Color(0x343c60), white = new THREE.Color(0xffffff), tint = new THREE.Color();
  let spr = null;
  fetch(`${D.art}/sprite.json`).then(r => r.ok ? r.json() : null).then(meta => { if (!meta) return; spr = makeSprite(scene, D.art, meta); spr.mat.color.copy(dark); spr.g.visible = false; }).catch(() => {});
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
  function touch(P, events, word, heavy, noBlock){
    if (P.hp <= 0 || isRollInv(P)) return 'miss';
    const toward = sgn(B.x - P.x);
    if (!noBlock && P.blocking && P.face === toward){
      const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18;
      events.push({ type: parry ? 'parry' : 'block', at: { x: P.x + P.face * 0.55, y: P.y + 1.35 } });
      if (parry){ B.cut = null; B.vx = -B.face * 3.5; B.mash = 0; go('stagger'); return 'parry'; }
      P.vx = -toward * (heavy ? 7 : 4); return 'block';
    }
    return hurt(P, 1, B.x, word) ? 'hurt' : 'miss';
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
    let pose = ['idle', B.tm / 1.4], vis = true, low = 1.92, lit = 0.6, warnA = 0, warnX = 0, warnW = 1, warnH = 0.5, warnY = stageY + 0.25, spotA = 0, cold = 0, scarfOn = true;
    const d = P.x - B.x, ad = Math.abs(d);

    if (B.st === 'dormant'){
      // it stands by the dark beacon with its back to the stage, and does not turn
      B.x = homeX; B.y = stageY; B.face = 1; lit = 0.35;
      if (inRoom && P.grounded && Math.abs(P.y - stageY) < 0.3 && P.x > room.x0 + 8.5 && P.hp > 0){ B.st = 'rise'; B.tm = 0; events.push({ type: 'bossWake', boss: B }); }
    }
    else if (B.st === 'rise'){
      // a moment more; then it turns, and draws
      if (B.tm > 1.15) B.face = sgn(P.x - B.x);
      if (B.tm > 1.6){ const u = Math.min(1, (B.tm - 1.6) / 0.8); pose = ['atk_rise_px', 0.1 + u * 0.6]; cold = u; if (u >= 1 && !B.drawn){ B.drawn = true; R.glint(B.x + B.face * 0.6, B.y + 2.4, COLD, 1.2, 6, 0.4); sfx.parry(); } }
      lit = 0.35 + Math.min(1, B.tm / 2) * 0.5;
      if (B.tm > 2.9){ B.st = 'fight'; B.tm = 0; B.drawn = false; go('stalk'); B.cd = 0.5; }
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
        if (!B.hit && Math.abs(P.x - B.x) < 1.0 && P.y < B.y + 2.2 && P.y + P.h > B.y){ B.hit = true; touch(P, events, 'Run through', true); }
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
          if (Math.abs(P.x - B.x) < D.leap.reach && P.y < stageY + 2.5 && P.y > stageY - 1) touch(P, events, 'Run through', true, true);
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
      }
    }
    const headY = B.y + low + 0.12 - SINK;
    eye.visible = shown; eye.position.x = B.x + B.face * 0.14; eye.position.y = headY;
    eye.material.opacity = shown && B.st !== 'dormant' ? (0.55 + 0.25 * Math.sin(B.tm * 6) + cold * 0.3) * (B.st === 'die' ? Math.max(0, 1 - B.tm / 1.5) : 1) : 0;
    eye.material.color.setHex(B.phase === 2 ? 0xffffff : COLD); eye.scale.setScalar(B.phase === 2 ? 1.25 : 1);
    aura.visible = shown && B.phase === 2 && B.st === 'fight'; aura.position.x = B.x; aura.position.y = B.y + 1.2; aura.material.opacity = 0.22 + 0.08 * Math.sin(B.tm * 5);
    light.position.set(B.x + B.face * 0.4, B.y + 1.6, 1.1); light.intensity = shown ? lit * (0.9 + cold * 0.5) + B.flash * 4 : 0;
    if (shown && B.st !== 'dormant') R.glint(B.x, B.y + 1.4, B.phase === 2 ? 0xbfe8ff : 0x6fb8e8, 0.22 + cold * 0.2 + B.flash * 3, 4);
    warn.material.opacity = warnA; warn.scale.set(warnW, warnH, 1); warn.position.x = warnX; warn.position.y = warnY;
    spot.material.opacity = spotA; if (B.dest){ spot.position.x = B.dest.x; spot.position.y = B.dest.y + 1.2; }
    // its scarf: from its neck, as long as it has life left (in its death it leaves, and goes to him)
    const F = B.fly, ax = F ? F.x : B.x - B.face * 0.14, ay = F ? F.y : B.y + low - SINK, frac = Math.max(0, B.hp / D.hp);
    const want = B.st === 'dead' || B.given ? 0 : SCARF.base + (B.st === 'die' ? 16 : frac * 22);
    scf.step(dt, ax, ay, F ? F.face : B.face, want, -2.4, solidAt); scf.draw(scarfOn && B.st !== 'dead' && !(B.given && scf.len < 2.5), B.st === 'die' ? 1 : 0.5 + cold * 0.5);
  };

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
