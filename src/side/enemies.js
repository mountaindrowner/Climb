// The side view's creatures, from the level's markers: the climb's threats remade for a 2D world.
//   crawler   chases along the floor, rears up (the tell), lunges. Block, roll through, or strike it while it rears.
//   flitter   a bat: it circles you, then dives where you were. One cut kills it.
//   spitter   clings to the rock; swells and spits a glob that leads you. Block, or raise the block as it lands to parry
//             it back and burst the sac.
//   burrower  a mound runs at you under the floor and bursts up snapping: jump it, then cut it before it sinks.
// Those are the Roots'. Higher up the mountain has its own, each built on one of those ways of fighting (`ai`) or a new one:
//   the Cloister   acolyte   a hooded monk with a mace: slow, tough, a long overhead blow (ai crawler)
//                  gargoyle  stone on a perch until you come near, then it dives, heavier than a bat (ai flitter)
//                  wisp      a burning lantern adrift: two bolts of fire, one after the other (ai spitter)
//   the Spires     yeti      keeps its distance and lobs ice in an arc; swats if you close (ai thrower)
//                  harpy     a white hawk: fast, and it dives twice before it wheels away (ai flitter)
//                  wraith    drifts at you through anything, rears, and rushes: cut it as it recovers (ai wraith)
// Each is drawn with its PixelLab strips once they exist (tools/pixellab.py), a glowing stand-in before.
import { T, ROCK, LEDGE, LEVEL, tileAt } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { makeSprite } from './render.js';
const THREE = window.THREE;
const ground = (x, y) => {   // the floor under (x, y): the top of the first rock or ledge tile at or below y
  const i = Math.floor(x / T);
  for (let j = Math.floor((y + 0.05) / T); j >= 0; j--){ const t = tileAt(i, j); if (t === ROCK || t === LEDGE) return (j + 1) * T; }
  return -Infinity;
};
const solidAt = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T)) === ROCK;
// ai: which way of fighting; an: its drawings' names for that way's moves; orb: what it throws
const DEF = {
  crawler:  { ai: 'crawler', hp: 3, w: 0.55, h: 0.8, color: 0xc060ff, wake: 7, reach: 1.9, chase: 2.6, windup: 0.5, lunge: 0.26, lungeDist: 2.2, recover: 0.6, stun: 0.6, art: 'crawler', fly: false },
  flitter:  { ai: 'flitter', hp: 1, w: 0.4, h: 0.5, color: 0xffb040, glow: 0x3a2a4a, wake: 7, circle: 1.2, dive: 0.55, commit: 0.3, leave: 0.8, art: 'flitter', fly: true },
  spitter:  { ai: 'spitter', hp: 2, w: 0.5, h: 0.6, color: 0x70ff70, range: 8, charge: 0.7, speed: 8, cooldown: 2.0, art: 'spitter', fly: true },
  burrower: { ai: 'burrower', hp: 2, w: 0.6, h: 1.1, color: 0xd0a070, wake: 6, plough: 6, rise: 0.3, up: 1.4, art: 'burrower', fly: false },
  acolyte:  { ai: 'crawler', hp: 5, w: 0.6, h: 1.9, color: 0xa22633, wake: 8, reach: 2.1, chase: 2.0, windup: 0.62, lunge: 0.2, lungeDist: 1.5, recover: 0.8, stun: 0.5, hitR: 1.2, art: 'px_acolyte', fly: false, word: 'Struck' },
  gargoyle: { ai: 'flitter', hp: 3, w: 0.55, h: 0.9, color: 0x8b9bb4, wake: 6, circle: 1.5, dive: 0.6, commit: 0.34, leave: 1.0, perch: true, art: 'px_gargoyle', fly: true, word: 'Clawed' },
  wisp:     { ai: 'spitter', hp: 2, w: 0.45, h: 0.8, color: 0xf77622, range: 9, charge: 0.8, speed: 9, cooldown: 2.4, burst: 2, hover: true, orb: 0xfeae34, an: { charge: 'cast', idle: 'float' }, art: 'px_wisp', fly: true, word: 'Burned' },
  yeti:     { ai: 'thrower', hp: 6, w: 0.7, h: 1.8, color: 0xc0cbdc, wake: 10, range: 9, keep: 4.5, chase: 1.7, windup: 0.7, recover: 0.7, cooldown: 1.9, stun: 0.45, orb: 0x2ce8f5, an: { attack: 'throw' }, art: 'px_yeti', fly: false, word: 'Struck by ice' },
  harpy:    { ai: 'flitter', hp: 1, w: 0.5, h: 0.7, color: 0xffffff, wake: 9, circle: 0.8, dive: 0.45, commit: 0.24, leave: 0.6, dives: 2, art: 'px_harpy', fly: true, word: 'Raked' },
  wraith:   { ai: 'wraith', hp: 3, w: 0.5, h: 1.2, color: 0x2ce8f5, glow: 0x103040, wake: 8, chase: 2.3, windup: 0.5, rush: 0.28, rushSpeed: 10, recover: 1.0, an: { fly: 'float', dive: 'slash' }, art: 'px_wraith', fly: true, word: 'Frozen' },
};
const ART = { crawler: ['px_crawler', 'crawler3', 'crawler'], flitter: ['px_flitter', 'flitter2', 'flitter'], spitter: ['px_spitter', 'spitter2', 'spitter'], burrower: ['px_burrower', 'burrower2', 'burrower'] };
export function spawnEnemies(scene){
  const list = [];
  for (const m of LEVEL.marks){
    const d = DEF[m.type]; if (!d) continue;
    const x = (m.x + 0.5) * T, y = d.fly ? m.y * T + 1.6 : m.y * T;
    const e = { type: m.type, d, x, y, home: { x, y }, vx: 0, vy: 0, face: -1, hp: d.hp, st: 'idle', tm: 0, age: Math.random() * 6, flash: 0, dead: 0, alive: true, orb: null };
    // a stand-in until the art loads: a glowing shape
    e.stand = new THREE.Mesh(new THREE.PlaneGeometry(d.w * 2, d.h), new THREE.MeshBasicMaterial({ color: d.color }));
    scene.add(e.stand);
    // the newest drawing that is there (drawn flat, at the game's pixel scale), else the first
    const tryArt = names => { if (!names.length) return; const n = names[0];
      fetch(`assets/side/${n}/sprite.json`).then(r => r.ok ? r.json() : null).then(meta => { if (meta && Object.keys(meta.anims).length > 1){ e.sprite = makeSprite(scene, `assets/side/${n}`, meta); e.meta = meta; e.stand.visible = false; } else tryArt(names.slice(1)); }).catch(() => tryArt(names.slice(1))); };
    tryArt(ART[m.type] || [d.art]);
    list.push(e);
  }
  const orbMats = {}, orbMat = c => orbMats[c] || (orbMats[c] = new THREE.MeshBasicMaterial({ color: c }));
  return { list, orbGeo: new THREE.SphereGeometry(0.18, 8, 6), orbMat, scene };
}
const anim = (e, name0, frac, dy = 0, z = 0.03) => { if (!e.sprite) return; const A = e.meta.anims, name = (e.d.an && e.d.an[name0]) || name0; const n = A[name] ? name : Object.keys(A).find(k => k !== 'stand') || 'stand'; e.sprite.show(n, frac, e.x, (e.d.fly ? e.y - e.d.h * 0.7 : e.y) + dy, e.face, z); };

const LOB_G = 15;
function shoot(E, e, P, lob){
  const col = e.d.orb || 0x9dff70, x0 = e.x + e.face * e.d.w * 0.6, y0 = e.d.fly ? e.y : e.y + e.d.h * 0.9;
  let vx, vy;
  if (lob){ const t = Math.max(0.6, Math.min(1.25, Math.abs(P.x - x0) / 7)), tx = P.x + P.vx * t * 0.5, ty = P.y + 0.8; vx = (tx - x0) / t; vy = (ty - y0 + 0.5 * LOB_G * t * t) / t; }
  else {   // leads him: where he will be when it gets there
    let tx = P.x, ty = P.y + 1.4; for (let i = 0; i < 3; i++){ const t = Math.hypot(tx - x0, ty - y0) / e.d.speed; tx = P.x + P.vx * t; ty = P.y + 1.4 + (P.grounded ? 0 : P.vy * t * 0.5); }
    const L = Math.hypot(tx - x0, ty - y0) || 1; vx = (tx - x0) / L * e.d.speed; vy = (ty - y0) / L * e.d.speed;
  }
  if (e.orb) E.scene.remove(e.orb.m);
  e.orb = { x: x0, y: y0, vx, vy, g: lob ? LOB_G : 0, col, t: 0, m: new THREE.Mesh(E.orbGeo, E.orbMat(col)) }; if (lob) e.orb.m.scale.setScalar(1.5); E.scene.add(e.orb.m);
}
export function stepEnemies(E, P, dt, fx, events){
  for (const e of E.list){
    e.flash = Math.max(0, e.flash - dt);
    if (!e.alive){ e.dead += dt; e.y -= dt * (e.d.fly ? 6 : 0); if (e.orb){ E.scene.remove(e.orb.m); e.orb = null; } continue; }
    e.tm += dt; e.age += dt;
    const ai = e.d.ai, dx = P.x - e.x, dy = P.y - e.y, dist = Math.hypot(dx, dy);
    const go = st => { e.st = st; e.tm = 0; };
    if (ai === 'crawler'){
      const gy = ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
      if (e.st === 'idle' && Math.abs(dx) < e.d.wake && Math.abs(dy) < 2.5) go('chase');
      if (e.st === 'chase'){
        e.face = Math.sign(dx) || e.face;
        const nx = e.x + e.face * e.d.chase * dt;
        if (Math.abs(dx) > 1.0 && !solidAt(nx + e.face * e.d.w, e.y + 0.3) && ground(nx, e.y + 0.3) > e.y - 0.6) e.x = nx;   // not into walls or off edges
        if (Math.abs(dx) < e.d.reach && Math.abs(dy) < 1.2){ go('windup'); events.push({ type: 'tell', e }); }
        if (Math.abs(dx) > e.d.wake * 1.6) go('idle');
      }
      else if (e.st === 'windup'){ if (e.tm >= e.d.windup){ go('lunge'); e.hit = false; } }
      else if (e.st === 'lunge'){
        const nx = e.x + e.face * e.d.lungeDist / e.d.lunge * dt; if (!solidAt(nx + e.face * e.d.w, e.y + 0.3)) e.x = nx;
        if (!e.hit && Math.abs(P.x - e.x) < (e.d.hitR || 0.75) && P.y < e.y + 1.2 && P.y > e.y - 0.6){
          e.hit = true;
          if (P.blocking && P.face === -e.face){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; go('stunned'); e.stun = parry ? 1.4 : 0.7; e.x -= e.face * 0.5; events.push({ type: parry ? 'parry' : 'block', at: { x: P.x, y: P.y + 1 } }); }
          else hurt(P, 1, e.x, e.d.word || 'Bitten');
        }
        if (e.tm >= e.d.lunge && e.st === 'lunge') go('recover');
      }
      else if (e.st === 'recover'){ if (e.tm >= e.d.recover) go('chase'); }
      else if (e.st === 'stunned'){ if (e.tm >= (e.stun || e.d.stun)) go('chase'); }
      // a body: standing, he cannot walk through it (a roll can)
      if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.55 && P.y < e.y + 0.7 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; P.x = e.x + side * 0.55; if (Math.sign(P.vx) === -side) P.vx = 0; }
      anim(e, e.st === 'windup' || e.st === 'lunge' ? 'attack' : 'walk', e.st === 'windup' ? e.tm / e.d.windup * 0.5 : e.st === 'lunge' ? 0.5 + e.tm / e.d.lunge * 0.5 : e.st === 'chase' ? e.tm * 1.6 : 0);
    }
    else if (ai === 'flitter'){
      if (e.st === 'idle'){ if (!e.d.perch){ e.x = e.home.x + Math.sin(e.tm * 1.3) * 0.6; e.y = e.home.y + Math.sin(e.tm * 2.1) * 0.3; } if (dist < e.d.wake){ go('circle'); e.left = e.d.dives || 1; } }   // a gargoyle sits like stone until then
      else if (e.st === 'circle'){
        const a = e.tm * 3.2, cx = P.x, cy = P.y + 2.4;
        e.x += (cx + Math.cos(a) * 1.6 - e.x) * Math.min(1, dt * 3); e.y += (cy + Math.sin(a) * 0.5 - e.y) * Math.min(1, dt * 3);
        e.face = Math.sign(P.x - e.x) || e.face;
        if (e.tm > e.d.circle + Math.random() * 0.6){ go('dive'); e.tx = P.x; e.ty = P.y + 1.3; events.push({ type: 'tell', e }); }
      }
      else if (e.st === 'dive'){
        if (e.tm < e.d.dive - e.d.commit){ e.tx = P.x; e.ty = P.y + 1.3; }   // it tracks you, then commits
        const k = Math.min(1, dt * 7); e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k;
        if (!e.hit && Math.abs(P.x - e.x) < 0.5 && Math.abs(P.y + 1.3 - e.y) < 1.0){ e.hit = true; if (!(P.blocking && P.face === Math.sign(e.x - P.x))) hurt(P, 1, e.x, e.d.word || 'Bitten'); }
        if (e.tm >= e.d.dive + 0.15){ e.hit = false; if (--e.left > 0){ go('leave'); e.again = true; } else { go('leave'); e.again = false; } }
      }
      else if (e.st === 'leave'){ e.y += dt * 3; e.x -= e.face * dt * 2; if (e.tm > (e.again ? 0.3 : e.d.leave)){ if (e.again){ go('dive'); e.tx = P.x; e.ty = P.y + 1.3; e.again = false; events.push({ type: 'tell', e }); } else { go('circle'); e.left = e.d.dives || 1; } } }
      anim(e, e.st === 'dive' ? 'dive' : 'fly', e.st === 'dive' ? e.tm / e.d.dive : e.st === 'idle' && e.d.perch ? 0 : e.tm * 2.5);
    }
    else if (ai === 'spitter'){
      e.face = Math.sign(dx) || e.face; e.cd = Math.max(0, (e.cd || 0) - dt);
      if (e.d.hover){ e.x = e.home.x + Math.sin(e.age * 1.1) * 0.5; e.y = e.home.y + Math.sin(e.age * 2) * 0.25; }
      if (e.st === 'idle' && dist < e.d.range && e.cd <= 0){ go('charge'); e.shots = 0; events.push({ type: 'tell', e }); }
      if (e.st === 'charge' && e.tm >= e.d.charge){
        shoot(E, e, P, false); events.push({ type: 'spit', e });
        if (++e.shots < (e.d.burst || 1)){ e.tm = e.d.charge - 0.3; } else { go('idle'); e.cd = e.d.cooldown; }
      }
      anim(e, e.st === 'charge' ? 'charge' : 'idle', e.st === 'charge' ? e.tm / e.d.charge * 0.75 : e.d.hover ? e.age * 1.2 : 0);
    }
    else if (ai === 'thrower'){
      // keeps its distance and lobs; swats him if he closes; a cut staggers it out of either
      const gy = ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
      e.cd = Math.max(0, (e.cd || 0) - dt);
      if (e.st === 'idle'){ if (Math.abs(dx) < e.d.wake && Math.abs(dy) < 5) go('stalk'); }
      else if (e.st === 'stalk'){
        e.face = Math.sign(dx) || e.face;
        const want = Math.abs(dx) > e.d.keep + 1 ? 1 : Math.abs(dx) < e.d.keep - 1.5 && Math.abs(dx) > 1.7 ? -1 : 0, nx = e.x + e.face * want * e.d.chase * dt;
        e.moving = false;
        if (want && !solidAt(nx + e.face * want * e.d.w, e.y + 0.3) && ground(nx, e.y + 0.3) > e.y - 0.6){ e.x = nx; e.moving = true; }
        if (Math.abs(dx) < 1.7 && Math.abs(dy) < 1.4){ go('swat'); events.push({ type: 'tell', e }); }
        else if (Math.abs(dx) < e.d.range && Math.abs(dy) < 6 && e.cd <= 0){ go('windup'); events.push({ type: 'tell', e }); }
        if (Math.abs(dx) > e.d.wake * 1.6) go('idle');
      }
      else if (e.st === 'windup'){ e.face = Math.sign(dx) || e.face; if (e.tm >= e.d.windup){ shoot(E, e, P, true); events.push({ type: 'spit', e }); go('recover'); e.cd = e.d.cooldown; } }
      else if (e.st === 'swat'){
        if (e.tm >= 0.42 && !e.hit){ e.hit = true; if (Math.abs(P.x - e.x) < 1.7 && (P.x - e.x) * e.face > -0.3 && P.y < e.y + 1.6 && P.y > e.y - 0.8 && !isRollInv(P)){
          if (P.blocking && P.face === -e.face) events.push({ type: 'block', at: { x: P.x, y: P.y + 1 } }); else hurt(P, 1, e.x, 'Swatted'); } }
        if (e.tm >= 0.6){ go('recover'); e.hit = false; }
      }
      else if (e.st === 'recover'){ if (e.tm >= e.d.recover) go('stalk'); }
      else if (e.st === 'stunned'){ if (e.tm >= (e.stun || e.d.stun)) go('stalk'); }
      if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.6 && P.y < e.y + 1.2 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; P.x = e.x + side * 0.6; if (Math.sign(P.vx) === -side) P.vx = 0; }
      anim(e, e.st === 'windup' || e.st === 'swat' ? 'attack' : 'walk', e.st === 'windup' ? e.tm / e.d.windup * 0.7 : e.st === 'swat' ? 0.3 + e.tm / 0.6 * 0.69 : e.st === 'recover' ? 0.99 : e.moving ? e.age * 1.3 : 0, 0, 0.03);
      if (e.st === 'recover' && e.sprite) anim(e, 'attack', 0.99);
    }
    else if (ai === 'wraith'){
      // it comes on through anything, slowly; rears; rushes where he was; and hangs there spent
      if (e.st === 'idle'){ e.x = e.home.x + Math.sin(e.age * 0.9) * 0.4; e.y = e.home.y + Math.sin(e.age * 1.7) * 0.3; if (dist < e.d.wake) go('drift'); }
      else if (e.st === 'drift'){
        e.face = Math.sign(dx) || e.face;
        const tx = P.x - e.face * 2.0, ty = P.y + 1.5 + Math.sin(e.age * 2.2) * 0.3, L = Math.hypot(tx - e.x, ty - e.y) || 1, v = Math.min(e.d.chase, L / Math.max(dt, 1e-3));
        e.x += (tx - e.x) / L * v * dt; e.y += (ty - e.y) / L * v * dt;
        if (L < 0.7 && e.tm > 0.5){ go('windup'); events.push({ type: 'tell', e }); }
        if (dist > e.d.wake * 2.2) go('idle');
      }
      else if (e.st === 'windup'){ e.x -= e.face * dt * 0.8; if (e.tm >= e.d.windup){ go('rush'); e.hit = false; const L = Math.hypot(dx, dy + 1.2) || 1; e.rx = dx / L; e.ry = (dy + 1.2) / L; e.face = Math.sign(dx) || e.face; } }
      else if (e.st === 'rush'){
        e.x += e.rx * e.d.rushSpeed * dt; e.y += e.ry * e.d.rushSpeed * dt;
        if (!e.hit && Math.abs(P.x - e.x) < 0.6 && Math.abs(P.y + 1.2 - e.y) < 1.1 && !isRollInv(P)){ e.hit = true; if (P.blocking && P.face === -e.face) events.push({ type: 'block', at: { x: P.x, y: P.y + 1 } }); else hurt(P, 1, e.x, e.d.word); }
        if (e.tm >= e.d.rush) go('spent');
      }
      else if (e.st === 'spent'){ e.y += Math.sin(e.age * 6) * dt * 0.2; if (e.tm >= e.d.recover) go('drift'); }
      anim(e, e.st === 'windup' || e.st === 'rush' ? 'dive' : 'fly', e.st === 'windup' ? e.tm / e.d.windup * 0.45 : e.st === 'rush' ? 0.45 + e.tm / e.d.rush * 0.54 : e.age * 1.4);
    }
    else if (ai === 'burrower'){
      if (e.st === 'idle'){ if (Math.abs(dx) < e.d.wake && Math.abs(dy) < 2){ go('travel'); e.mx = e.x + Math.sign(dx) * 3.5; e.side = Math.sign(dx); } }
      else if (e.st === 'travel'){ e.mx -= e.side * e.d.plough * dt; if ((e.mx - e.x) * e.side <= 0){ e.mx = e.x; go('rise'); events.push({ type: 'tell', e }); } if (Math.random() < 0.5) fx.dust({ x: e.mx, y: e.y }, 1, 1.6); }
      else if (e.st === 'rise'){ if (e.tm >= e.d.rise){ go('up'); e.hit = false; } }
      else if (e.st === 'up'){
        if (!e.hit && P.grounded && Math.abs(P.x - e.x) < 0.55 && Math.abs(P.y - e.y) < 0.4){ e.hit = true; hurt(P, 1, e.x, 'Snapped'); }
        if (e.tm >= e.d.up){ go('idle'); }
      }
      e.face = Math.sign(dx) || e.face;
      const show = e.st === 'rise' || e.st === 'up';
      if (e.sprite) e.sprite.g.visible = show;
      // it comes up out of the floor (drawn just behind the rock's face, so the floor hides what is still under it) and
      // sinks back at the end
      const out = e.st === 'rise' ? Math.min(1, e.tm / e.d.rise) : e.st === 'up' ? Math.min(1, (e.d.up - e.tm) / 0.25) : 0;
      anim(e, 'snap', e.st === 'rise' ? e.tm / e.d.rise * 0.3 : e.st === 'up' ? 0.3 + Math.min(0.69, e.tm / 0.45 * 0.7) : 0, -(1 - out) * 2.2, -0.05);
      e.stand.visible = !e.sprite && show;
    }
    // what it threw, in flight: a glob or a bolt goes straight, a chunk of ice falls in its arc
    if (e.orb){
      const O = e.orb; O.t += dt; O.vy -= O.g * dt; O.x += O.vx * dt; O.y += O.vy * dt; O.m.position.set(O.x, O.y, 0.1);
      if (Math.random() < 0.6) fx.burst({ x: O.x, y: O.y }, 1, O.col);
      const tile = tileAt(Math.floor(O.x / T), Math.floor(O.y / T));
      if (Math.abs(O.x - P.x) < 0.45 && O.y > P.y && O.y < P.y + P.h){
        if (P.blocking && P.face === -Math.sign(O.vx)){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; events.push({ type: parry ? 'parry' : 'block', at: { x: O.x, y: O.y } }); if (parry && !O.g){ killEnemy(e, events); } }
        else if (!isRollInv(P)) hurt(P, 1, O.x, e.d.word || 'Spat on');
        E.scene.remove(O.m); e.orb = null;
      } else if (O.t > (O.g ? 3 : 1.6) || tile === ROCK || (O.g && O.vy < 0 && tile === LEDGE)){ fx.burst({ x: O.x, y: O.y }, O.g ? 12 : 6, O.col); E.scene.remove(O.m); e.orb = null; }
    }
    if (!e.sprite) e.stand.position.set(e.x, e.y + e.d.h / 2, 0.03);
    if (e.sprite) e.sprite.mat.emissive.setHex(e.flash > 0 ? 0xffffff : (e.st === 'windup' || e.st === 'charge' || e.st === 'rise' || e.st === 'swat') && Math.sin(e.tm * 40) > 0 ? 0x601010 : (e.d.glow || 0));
  }
}
function killEnemy(e, events){ e.alive = false; e.dead = 0; events.push({ type: 'kill', e, at: { x: e.x, y: e.y + e.d.h / 2 } }); if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false; }
// a sword cut: everything in front of the blade, within its reach and his height
export function strikeEnemies(E, P, reach, dmg, events){
  let any = false;
  for (const e of E.list){
    if (!e.alive || (e.d.ai === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    const ahead = (e.x - P.x) * P.face, top = e.y + e.d.h, bottom = e.d.fly ? e.y - e.d.h / 2 : e.y;
    if (ahead < -0.4 || ahead > reach + e.d.w || top < P.y - 0.2 || bottom > P.y + 2.7) continue;
    any = true; e.hp -= dmg; e.flash = 0.12;
    if ((e.d.ai === 'crawler' && (e.st === 'windup' || e.st === 'chase')) || (e.d.ai === 'thrower' && e.st !== 'stunned')){ e.st = 'stunned'; e.tm = 0; e.stun = e.d.ai === 'thrower' ? 0.4 : 0.5; }
    if (e.d.ai === 'wraith' && e.st !== 'rush'){ e.st = 'spent'; e.tm = Math.max(0, e.d.recover - 0.5); }
    if (e.d.perch && e.st === 'idle'){ e.st = 'circle'; e.tm = 0; e.left = 1; }
    e.x += P.face * (e.d.fly ? 0.6 : 0.35);
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: dmg >= 2 });
    if (e.hp <= 0) killEnemy(e, events);
  }
  return any;
}
// his plunge landing: everything close around where he lands
export function slamEnemies(E, P, radius, dmg, events){
  for (const e of E.list){
    if (!e.alive || (e.d.ai === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    if (Math.abs(e.x - P.x) > radius + e.d.w || e.y > P.y + 1.2 || e.y + e.d.h < P.y - 0.8) continue;
    e.hp -= dmg; e.flash = 0.12; e.x += Math.sign(e.x - P.x || 1) * 0.5;
    if (e.d.ai === 'crawler' || e.d.ai === 'thrower'){ e.st = 'stunned'; e.tm = 0; e.stun = 0.8; }
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: true });
    if (e.hp <= 0) killEnemy(e, events);
  }
}
