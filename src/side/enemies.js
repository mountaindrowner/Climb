// The side view's creatures, from the level's markers: the climb's threats remade for a 2D world.
//   crawler   chases along the floor, rears up (the tell), lunges. Block, roll through, or strike it while it rears.
//   flitter   a bat: it circles you, then dives where you were. One cut kills it.
//   spitter   clings to the rock; swells and spits a glob that leads you. Block, or raise the block as it lands to parry
//             it back and burst the sac.
//   burrower  a mound runs at you under the floor and bursts up snapping: jump it, then cut it before it sinks.
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
const DEF = {
  crawler:  { hp: 3, w: 0.55, h: 0.8, color: 0xc060ff, wake: 7, reach: 1.9, chase: 2.6, windup: 0.5, lunge: 0.26, lungeDist: 2.2, recover: 0.6, stun: 0.6, art: 'crawler', fly: false },
  flitter:  { hp: 1, w: 0.4, h: 0.5, color: 0xffb040, glow: 0x3a2a4a, wake: 7, circle: 1.2, dive: 0.55, commit: 0.3, leave: 0.8, art: 'flitter', fly: true },
  spitter:  { hp: 2, w: 0.5, h: 0.6, color: 0x70ff70, range: 8, charge: 0.7, speed: 8, cooldown: 2.0, art: 'spitter', fly: true },
  burrower: { hp: 2, w: 0.6, h: 1.1, color: 0xd0a070, wake: 6, plough: 6, rise: 0.3, up: 1.4, art: 'burrower', fly: false },
};
const ART = { crawler: ['px_crawler', 'crawler3', 'crawler'], flitter: ['px_flitter', 'flitter2', 'flitter'], spitter: ['px_spitter', 'spitter2', 'spitter'], burrower: ['px_burrower', 'burrower2', 'burrower'] };
export function spawnEnemies(scene){
  const list = [];
  for (const m of LEVEL.marks){
    const d = DEF[m.type]; if (!d) continue;
    const x = (m.x + 0.5) * T, y = m.type === 'spitter' || m.type === 'flitter' ? m.y * T + 1.6 : m.y * T;
    const e = { type: m.type, d, x, y, home: { x, y }, vx: 0, vy: 0, face: -1, hp: d.hp, st: 'idle', tm: 0, flash: 0, dead: 0, alive: true, orb: null };
    // a stand-in until the art loads: a glowing shape
    e.stand = new THREE.Mesh(new THREE.PlaneGeometry(d.w * 2, d.h), new THREE.MeshBasicMaterial({ color: d.color }));
    scene.add(e.stand);
    // the newest drawing that is there (drawn flat, at the game's pixel scale), else the first
    const tryArt = names => { if (!names.length) return; const n = names[0];
      fetch(`assets/side/${n}/sprite.json`).then(r => r.ok ? r.json() : null).then(meta => { if (meta && Object.keys(meta.anims).length > 1){ e.sprite = makeSprite(scene, `assets/side/${n}`, meta); e.meta = meta; e.stand.visible = false; } else tryArt(names.slice(1)); }).catch(() => tryArt(names.slice(1))); };
    tryArt(ART[m.type] || [d.art]);
    list.push(e);
  }
  const orbMat = new THREE.MeshBasicMaterial({ color: 0x9dff70 });
  return { list, orbGeo: new THREE.SphereGeometry(0.18, 8, 6), orbMat, scene };
}
const anim = (e, name, frac, dy = 0, z = 0.03) => { if (!e.sprite) return; const A = e.meta.anims; const n = A[name] ? name : Object.keys(A).find(k => k !== 'stand') || 'stand'; e.sprite.show(n, frac, e.x, (e.d.fly ? e.y - e.d.h * 0.7 : e.y) + dy, e.face, z); };

export function stepEnemies(E, P, dt, fx, events){
  for (const e of E.list){
    e.flash = Math.max(0, e.flash - dt);
    if (!e.alive){ e.dead += dt; e.y -= dt * (e.d.fly ? 6 : 0); continue; }
    e.tm += dt;
    const dx = P.x - e.x, dy = P.y - e.y, dist = Math.hypot(dx, dy);
    const go = st => { e.st = st; e.tm = 0; };
    if (e.type === 'crawler'){
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
        if (!e.hit && Math.abs(P.x - e.x) < 0.7 && P.y < e.y + 1.2 && P.y > e.y - 0.6){
          e.hit = true;
          if (P.blocking && P.face === -e.face){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; go('stunned'); e.stun = parry ? 1.4 : 0.7; e.x -= e.face * 0.5; events.push({ type: parry ? 'parry' : 'block', at: { x: P.x, y: P.y + 1 } }); }
          else hurt(P, 1, e.x, 'Bitten');
        }
        if (e.tm >= e.d.lunge && e.st === 'lunge') go('recover');
      }
      else if (e.st === 'recover'){ if (e.tm >= e.d.recover) go('chase'); }
      else if (e.st === 'stunned'){ if (e.tm >= (e.stun || e.d.stun)) go('chase'); }
      // a body: standing, he cannot walk through it (a roll can)
      if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.55 && P.y < e.y + 0.7 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; P.x = e.x + side * 0.55; if (Math.sign(P.vx) === -side) P.vx = 0; }
      anim(e, e.st === 'windup' || e.st === 'lunge' ? 'attack' : 'walk', e.st === 'windup' ? e.tm / e.d.windup * 0.5 : e.st === 'lunge' ? 0.5 + e.tm / e.d.lunge * 0.5 : e.st === 'chase' ? e.tm * 1.6 : 0);
    }
    else if (e.type === 'flitter'){
      if (e.st === 'idle'){ e.x = e.home.x + Math.sin(e.tm * 1.3) * 0.6; e.y = e.home.y + Math.sin(e.tm * 2.1) * 0.3; if (dist < e.d.wake) go('circle'); }
      else if (e.st === 'circle'){
        const a = e.tm * 3.2, cx = P.x, cy = P.y + 2.4;
        e.x += (cx + Math.cos(a) * 1.6 - e.x) * Math.min(1, dt * 3); e.y += (cy + Math.sin(a) * 0.5 - e.y) * Math.min(1, dt * 3);
        e.face = Math.sign(P.x - e.x) || e.face;
        if (e.tm > e.d.circle + Math.random() * 0.6){ go('dive'); e.tx = P.x; e.ty = P.y + 0.9; events.push({ type: 'tell', e }); }
      }
      else if (e.st === 'dive'){
        if (e.tm < e.d.dive - e.d.commit){ e.tx = P.x; e.ty = P.y + 0.9; }   // it tracks you, then commits
        const k = Math.min(1, dt * 7); e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k;
        if (!e.hit && Math.abs(P.x - e.x) < 0.5 && Math.abs(P.y + 0.9 - e.y) < 0.8){ e.hit = true; if (!(P.blocking && P.face === Math.sign(e.x - P.x))) hurt(P, 1, e.x, 'Bitten'); }
        if (e.tm >= e.d.dive + 0.15){ go('leave'); e.hit = false; }
      }
      else if (e.st === 'leave'){ e.y += dt * 3; e.x -= e.face * dt * 2; if (e.tm > e.d.leave) go('circle'); }
      anim(e, e.st === 'dive' ? 'dive' : 'fly', e.st === 'dive' ? e.tm / e.d.dive : e.tm * 2.5);
    }
    else if (e.type === 'spitter'){
      e.face = Math.sign(dx) || e.face; e.cd = Math.max(0, (e.cd || 0) - dt);
      if (e.st === 'idle' && dist < e.d.range && e.cd <= 0){ go('charge'); events.push({ type: 'tell', e }); }
      if (e.st === 'charge' && e.tm >= e.d.charge){
        // leads him: where he will be when the glob gets there
        let tx = P.x, ty = P.y + 1.1; for (let i = 0; i < 3; i++){ const t = Math.hypot(tx - e.x, ty - e.y) / e.d.speed; tx = P.x + P.vx * t; ty = P.y + 1.1 + (P.grounded ? 0 : P.vy * t * 0.5); }
        const L = Math.hypot(tx - e.x, ty - e.y) || 1;
        e.orb = { x: e.x, y: e.y, vx: (tx - e.x) / L * e.d.speed, vy: (ty - e.y) / L * e.d.speed, t: 0, m: new THREE.Mesh(E.orbGeo, E.orbMat) }; E.scene.add(e.orb.m);
        go('idle'); e.cd = e.d.cooldown; events.push({ type: 'spit', e });
      }
      anim(e, 'charge', e.st === 'charge' ? e.tm / e.d.charge * 0.75 : 0);
    }
    else if (e.type === 'burrower'){
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
    // the glob in flight
    if (e.orb){
      const O = e.orb; O.t += dt; O.x += O.vx * dt; O.y += O.vy * dt; O.m.position.set(O.x, O.y, 0.1);
      if (Math.random() < 0.6) fx.burst({ x: O.x, y: O.y }, 1, 0x9dff70);
      if (Math.abs(O.x - P.x) < 0.45 && O.y > P.y && O.y < P.y + P.h){
        if (P.blocking && P.face === -Math.sign(O.vx)){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; events.push({ type: parry ? 'parry' : 'block', at: { x: O.x, y: O.y } }); if (parry){ killEnemy(e, events); } }
        else if (!isRollInv(P)) hurt(P, 1, O.x, 'Spat on');
        E.scene.remove(O.m); e.orb = null;
      } else if (O.t > 1.6 || tileAt(Math.floor(O.x / T), Math.floor(O.y / T)) === ROCK){ fx.burst({ x: O.x, y: O.y }, 6, 0x9dff70); E.scene.remove(O.m); e.orb = null; }
    }
    if (!e.sprite) e.stand.position.set(e.x, e.y + e.d.h / 2, 0.03);
    if (e.sprite) e.sprite.mat.emissive.setHex(e.flash > 0 ? 0xffffff : (e.st === 'windup' || e.st === 'charge' || e.st === 'rise') && Math.sin(e.tm * 40) > 0 ? 0x601010 : (e.d.glow || 0));
  }
}
function killEnemy(e, events){ e.alive = false; e.dead = 0; events.push({ type: 'kill', e, at: { x: e.x, y: e.y + e.d.h / 2 } }); if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false; }
// a sword cut: everything in front of the blade, within its reach and his height
export function strikeEnemies(E, P, reach, dmg, events){
  let any = false;
  for (const e of E.list){
    if (!e.alive || (e.type === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    const ahead = (e.x - P.x) * P.face, top = e.y + e.d.h, bottom = e.d.fly ? e.y - e.d.h / 2 : e.y;
    if (ahead < -0.4 || ahead > reach + e.d.w || top < P.y - 0.2 || bottom > P.y + 2.1) continue;
    any = true; e.hp -= dmg; e.flash = 0.12;
    if (e.type === 'crawler' && (e.st === 'windup' || e.st === 'chase')){ e.st = 'stunned'; e.tm = 0; e.stun = 0.5; }
    e.x += P.face * (e.d.fly ? 0.6 : 0.35);
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: dmg >= 2 });
    if (e.hp <= 0) killEnemy(e, events);
  }
  return any;
}
// his plunge landing: everything close around where he lands
export function slamEnemies(E, P, radius, dmg, events){
  for (const e of E.list){
    if (!e.alive || (e.type === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    if (Math.abs(e.x - P.x) > radius + e.d.w || e.y > P.y + 1.2 || e.y + e.d.h < P.y - 0.8) continue;
    e.hp -= dmg; e.flash = 0.12; e.x += Math.sign(e.x - P.x || 1) * 0.5;
    if (e.type === 'crawler'){ e.st = 'stunned'; e.tm = 0; e.stun = 0.8; }
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: true });
    if (e.hp <= 0) killEnemy(e, events);
  }
}
