// The Gardens: the fifth region. Above the storm he comes out into the sun for the first time: hanging gardens gone wild
// over white marble terraces and broken colonnades, built by whoever lit the beacon long ago, a sea of cloud under them.
// The brightest, kindest-looking place on the mountain; what lives in it is not kind. Its rock is what each room draws
// (terraces hang in the open air; a fall lands on whatever is below); three halls are roofed.
//   The way through it is its BLOOMS: great flowers that throw him seven units up and give him his air jump back.
//   stormdoor   out of the storm: a quiet hall, the scribe
//   terraces    the first bloom, up to a terrace no jump reaches; a thread on a ledge the bloom can also reach
//   arbor       up through its floor; a lasher on the walk, a chest over it
//   brambles    a wide bed of thorns, crossed bloom to bloom
//   wellspring  a marble well two screens tall, climbed by two blooms with ledges to catch; a sealed niche at its top
//   orangery    the first shrine and the lamplighter; a vault walled up in its roof
//   cascade     a bloom guarded by a lasher: thrown high, the scarf carries him over the thorns to the high terrace
//               (or bloom to bloom, the plain way); then a bloom up to the walk above
//   canopy      thorns, a lasher beside the bloom, and a garden wall only the bloom clears
//   sundial     the last shrine, a thornback loose in the hall, and the way up through the roof
//   bower       the stage, a bloom at either side of it: Mother Thorn (mother.js)
// How the blooms are laid out is held to what the tests can play: a bloom is walked onto from sound ground beside it, and
// throws him either to a ledge straight over it (he comes up through the ledge and lands on it) or a long way on.
// Its creatures (their numbers in `enemies`, how they fight in `ai`):
//   thornback   a tusked boar of bark and thorn: trots at him, paws the ground, then charges along the floor until a
//               wall or an edge stops it; a wall stuns it. Roll through it or jump it
//   lasher      a rooted flower with thorn whips: it turns to him, rears, and lashes a long low whip: jump it, roll
//               through it, or block it
//   puff        a sleepy spore pod adrift: near him it swells red and bursts in a cloud; cut it first
import { room, rect, walls, door, ledge, mark, open, cave, EMPTY, SPIKES, CRACKED } from '../rooms.js';

const slab = (r, x0 = 0, x1 = r.w - 1) => rect(r, x0, 0, x1, 1);              // a terrace: two courses of marble
const thorns = (r, x0, x1) => { rect(r, x0, 0, x1, 0); rect(r, x0, 1, x1, 1, SPIKES); };   // brambles grown through its top course
const isle = (r, x0, x1) => rect(r, x0, 0, x1, 1);                            // sound stone in a bed of thorns

function stormdoor(){
  const r = cave(); door(r, 'right', 2, 7);
  rect(r, 2, 2, 4, 4); rect(r, 2, 5, 3, 6); ledge(r, 22, 28, 6);
  mark(r, 'spawn', 8, 2); mark(r, 'npc', 15, 2, { who: 'scribe' });
  mark(r, 'torch', 6, 9); mark(r, 'torch', 20, 10); mark(r, 'torch', 34, 9); mark(r, 'crystal', 25, 7); mark(r, 'crystal', 31, 2); mark(r, 'urn', 28, 2);
  return r;
}
function terraces(){
  const r = open(2, 1);
  slab(r); rect(r, 0, 8, 3, 22);                                   // the ground; the cliff over the storm door
  thorns(r, 20, 26);                                               // the first thorns: a jump
  mark(r, 'bloom', 40, 2);                                         // the first bloom
  rect(r, 46, 12, 62, 13);                                         // the terrace it throws him to
  ledge(r, 66, 72, 17); ledge(r, 66, 72, 21);                      // on up, into the arbor's floor
  rect(r, 76, 0, 79, 22);                                          // the far cliff
  ledge(r, 28, 32, 16); mark(r, 'thread', 30, 17);                 // in plain sight: back from the bloom, not on
  mark(r, 'thornback', 13, 2); mark(r, 'thornback', 33, 2); mark(r, 'lasher', 56, 14); mark(r, 'puff', 60, 19); mark(r, 'lasher', 66, 2);
  mark(r, 'chest', 72, 2, { holds: 'shards' });                    // under the terrace, past a lasher
  mark(r, 'crystal', 8, 2); mark(r, 'crystal', 36, 2); mark(r, 'crystal', 49, 14); mark(r, 'crystal', 74, 2); mark(r, 'torch', 6, 6); mark(r, 'urn', 16, 2); mark(r, 'urn', 60, 14);
  return r;
}
function arbor(){
  const r = open();
  slab(r); rect(r, 26, 0, 32, 1, EMPTY); ledge(r, 26, 32, 1);     // the walk, the way up through it
  rect(r, 36, 0, 39, 22);                                          // the cliff
  ledge(r, 31, 35, 8); mark(r, 'chest', 33, 9, { holds: 'shards' });
  mark(r, 'lasher', 15, 2); mark(r, 'gargoyle', 22, 12);
  mark(r, 'crystal', 34, 2); mark(r, 'crystal', 7, 2); mark(r, 'urn', 11, 2); mark(r, 'torch', 35, 5);
  return r;
}
function brambles(){
  const r = open();
  rect(r, 29, 0, 39, 1); rect(r, 0, 0, 10, 1); thorns(r, 11, 28);   // sound ground at either end, the bed between
  mark(r, 'bloom', 31, 2);                                         // at the bed's edge: it throws him the whole way over
  isle(r, 18, 21); mark(r, 'bloom', 19, 2);                        // and one in the middle of it, for a second throw
  mark(r, 'puff', 22, 10); mark(r, 'puff', 12, 12); mark(r, 'harpy', 26, 16);
  mark(r, 'crystal', 37, 2); mark(r, 'crystal', 2, 2);
  return r;
}
function wellspring(){
  const r = room(1, 2); walls(r); door(r, 'right', 2, 7); door(r, 'right', 25, 30);
  mark(r, 'bloom', 20, 2);                                         // the first throw
  ledge(r, 26, 32, 14); ledge(r, 14, 20, 17);                      // caught; across
  rect(r, 2, 16, 9, 17); mark(r, 'bloom', 3, 18);                  // a shelf, the second throw
  ledge(r, 2, 8, 26); ledge(r, 14, 20, 26); rect(r, 28, 23, 37, 24);   // caught again, over it; across; the sill of the way out
  ledge(r, 8, 13, 30); ledge(r, 19, 25, 34);                       // and on up, to nothing, it seems
  rect(r, 26, 33, 37, 43); rect(r, 29, 35, 37, 40, EMPTY); rect(r, 26, 35, 28, 40, CRACKED);   // a niche walled up at the top
  mark(r, 'thread', 33, 35);
  mark(r, 'puff', 30, 9); mark(r, 'puff', 11, 22); mark(r, 'gargoyle', 30, 16);
  mark(r, 'torch', 4, 8); mark(r, 'torch', 35, 10); mark(r, 'torch', 22, 38); mark(r, 'torch', 6, 40);
  mark(r, 'crystal', 3, 2); mark(r, 'crystal', 36, 2); mark(r, 'crystal', 35, 25); mark(r, 'urn', 30, 25);
  return r;
}
function orangery(){
  const r = cave(); door(r, 'left', 2, 7); door(r, 'right', 2, 7);
  rect(r, 14, 2, 26, 2); rect(r, 16, 3, 24, 3);                    // the shrine's step
  mark(r, 'shrine', 20, 4); mark(r, 'npc', 10, 2, { who: 'lamplighter' });
  ledge(r, 4, 9, 8); ledge(r, 15, 25, 13);                         // up to the roof, where a wall is cracked
  rect(r, 26, 12, 37, 20); rect(r, 28, 14, 35, 19, EMPTY); rect(r, 26, 14, 27, 19, CRACKED);   // the vault
  mark(r, 'chest', 32, 14, { holds: 'relic:seedheart' });
  mark(r, 'torch', 4, 12); mark(r, 'torch', 12, 9); mark(r, 'torch', 28, 8); mark(r, 'torch', 36, 8);
  mark(r, 'crystal', 3, 2); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 36, 2); mark(r, 'urn', 33, 2); mark(r, 'urn', 7, 9);
  return r;
}
function cascade(){
  const r = open(1, 2);
  slab(r); thorns(r, 16, 29); isle(r, 21, 23);                    // the walk, its thorns, a stone in them
  mark(r, 'bloom', 11, 2); mark(r, 'bloom', 22, 2);               // thrown from the first, the scarf reaches the terrace; the second is the plain way
  rect(r, 28, 12, 39, 13); rect(r, 37, 2, 39, 11); rect(r, 37, 14, 39, 45);   // the high terrace, on the cliff
  mark(r, 'npc', 29, 14, { who: 'wren' }); mark(r, 'bloom', 35, 14);
  ledge(r, 30, 36, 21); ledge(r, 19, 25, 23); rect(r, 0, 23, 14, 24);   // caught, over it; across; the walk above, toward the canopy
  ledge(r, 30, 35, 30); mark(r, 'chest', 33, 31, { holds: 'shards' });   // straight up off the high bloom
  mark(r, 'lasher', 14, 2); mark(r, 'thornback', 33, 2); mark(r, 'harpy', 20, 30); mark(r, 'harpy', 8, 36); mark(r, 'puff', 22, 27);
  mark(r, 'crystal', 2, 2); mark(r, 'crystal', 32, 14); mark(r, 'crystal', 4, 25); mark(r, 'crystal', 12, 25); mark(r, 'urn', 8, 25);
  return r;
}
function canopy(){
  const r = open();
  slab(r); thorns(r, 30, 35);
  rect(r, 14, 2, 17, 15);                                          // the garden wall: only the bloom clears it
  mark(r, 'bloom', 23, 2);
  ledge(r, 32, 37, 12); mark(r, 'chest', 35, 13, { holds: 'shards' });
  mark(r, 'lasher', 19, 2); mark(r, 'thornback', 6, 2); mark(r, 'puff', 25, 11); mark(r, 'puff', 9, 9); mark(r, 'harpy', 30, 17);
  mark(r, 'crystal', 38, 2); mark(r, 'crystal', 27, 2); mark(r, 'crystal', 2, 2); mark(r, 'crystal', 15, 16); mark(r, 'urn', 10, 2);
  return r;
}
function sundial(){
  const r = cave(); door(r, 'right', 2, 7); door(r, 'top', 8, 14);
  rect(r, 22, 2, 32, 2); rect(r, 24, 3, 30, 3);                    // the shrine's step
  [[10, 16, 5], [16, 22, 9], [10, 16, 13], [8, 14, 17], [8, 14, 21]].forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'shrine', 27, 4); mark(r, 'thornback', 15, 2);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 34, 10); mark(r, 'torch', 20, 16); mark(r, 'crystal', 36, 2); mark(r, 'crystal', 3, 2); mark(r, 'urn', 34, 2);
  return r;
}
// the top of the Gardens: a wide terrace under the open sky, where Mother Thorn is rooted. A bloom at either side
function bower(){
  const r = open(2, 2);
  slab(r); rect(r, 8, 0, 14, 1, EMPTY); ledge(r, 8, 14, 1);       // the stage, the way up through it
  rect(r, 0, 2, 3, 30); rect(r, 76, 2, 79, 30);                    // a pier of marble at either end
  mark(r, 'boss', 40, 2); mark(r, 'exit', 70, 2);
  mark(r, 'bloom', 28, 2); mark(r, 'bloom', 52, 2);
  mark(r, 'crystal', 18, 2); mark(r, 'crystal', 62, 2); mark(r, 'torch', 5, 8); mark(r, 'torch', 74, 8);
  return r;
}

// ---- the creatures
const walkable = (c, x, y) => { const t = c.tileAt(Math.floor(x / c.T), Math.floor((y - 0.05) / c.T)); return t === 1 || t === 2; };   // sound footing (not thorns, not air)
const ai = {
  thornback(e, P, dt, c){
    const d = e.d, gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
    const dx = c.dx, dy = c.dy, free = nx => !c.solidAt(nx + e.face * d.w, e.y + 0.3) && walkable(c, nx + e.face * 0.3, e.y);
    e.warn = e.st === 'paw';
    if (e.st === 'idle'){ if (Math.abs(dx) < d.wake && Math.abs(dy) < 2.5) c.go('trot'); }
    else if (e.st === 'trot'){
      e.face = Math.sign(dx) || e.face; e.moving = false;
      if (Math.abs(dx) > 4.5){ const nx = e.x + e.face * d.trot * dt; if (free(nx)){ e.x = nx; e.moving = true; } }
      if (Math.abs(dx) < d.sight && Math.abs(dy) < 1.4 && e.tm > 0.5){ c.go('paw'); c.events.push({ type: 'tell', e }); }
      if (Math.abs(dx) > d.wake * 1.6) c.go('idle');
    }
    else if (e.st === 'paw'){ if (Math.random() < 0.3) c.fx.kick({ x: e.x - e.face * 0.5, y: e.y }, -e.face, 1, 2); if (e.tm >= d.tell){ c.go('charge'); e.hit = false; } }
    else if (e.st === 'charge'){
      const nx = e.x + e.face * d.charge * dt;
      if (c.solidAt(nx + e.face * d.w, e.y + 0.3)){ c.go('stun'); c.events.push({ type: 'rockLand', at: { x: e.x + e.face * d.w, y: e.y + 0.6 } }); }   // into a wall: it sees stars
      else if (!walkable(c, nx + e.face * 0.3, e.y)) c.go('recover');                                                                              // an edge, or thorns: it pulls up
      else {
        e.x = nx; if (Math.random() < 0.6) c.fx.kick({ x: e.x - e.face * 0.6, y: e.y }, -e.face, 1, 3);
        if (!e.hit && Math.abs(P.x - e.x) < 0.95 && P.y < e.y + 1.1 && P.y > e.y - 0.6 && !c.isRollInv(P)){
          e.hit = true;
          if (P.blocking && P.face === -e.face){ c.events.push({ type: 'block', at: { x: P.x, y: P.y + 1 } }); P.vx = e.face * 7; c.go('recover'); }
          else c.hurt(P, 1, e.x - e.face, d.word);
        }
        if (e.tm >= d.run) c.go('recover');
      }
    }
    else if (e.st === 'recover'){ if (e.tm >= d.recover) c.go('trot'); }
    else if (e.st === 'stun'){ if (e.tm >= d.stun) c.go('trot'); }
    // a body: standing, he cannot walk through it (a roll can); not while it charges (that is the blow)
    if (e.st !== 'charge' && P.roll <= 0 && Math.abs(P.x - e.x) < 0.7 && P.y < e.y + 0.9 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; P.x = e.x + side * 0.7; if (Math.sign(P.vx) === -side) P.vx = 0; }
    const st = e.st;
    if (st === 'paw') c.anim(e, 'attack', e.tm / d.tell * 0.5);          // its drawing: the head goes down, a hoof paws
    else if (st === 'charge') c.anim(e, 'walk', e.tm * 3.6);              // then its trot, at a gallop
    else if (st === 'stun') c.anim(e, 'walk', 0, Math.sin(e.tm * 30) * 0.03 * Math.max(0, 1 - e.tm));
    else c.anim(e, 'walk', st === 'trot' && e.moving ? e.tm * 1.5 : 0);
  },
  lasher(e, P, dt, c){
    const d = e.d, T3 = window.THREE; e.x = e.home.x;               // rooted: a cut does not move it
    const gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
    if (!e.whip && T3 && c.E.scene){
      const mk = (col, h, op, add) => { const m = new T3.Mesh(new T3.PlaneGeometry(1, h), new T3.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: add ? T3.AdditiveBlending : T3.NormalBlending })); m.visible = false; c.E.scene.add(m); return m; };
      e.whip = { edge: mk(0x181425, 4 / 16, 1), vine: mk(0x3e8948, 2 / 16, 1), tip: mk(0xf6757a, 3 / 16, 1), warn: mk(0xff4030, 5 / 16, 0.3, true) };
    }
    const dx = c.dx, dy = c.dy, inFront = dx * e.face > 0 && Math.abs(dx) < d.reach && Math.abs(dy) < 1.6;
    e.warn = e.st === 'rear';
    if (e.st === 'idle'){
      if (Math.sign(dx) !== e.face && Math.abs(dx) > 0.4){ e.turn = (e.turn || 0) + dt; if (e.turn > d.turn){ e.face = Math.sign(dx) || e.face; e.turn = 0; } } else e.turn = 0;   // it is slow to turn round
      if (inFront && e.tm > 0.25){ c.go('rear'); c.events.push({ type: 'tell', e }); }
    }
    else if (e.st === 'rear'){ if (e.tm >= d.tell){ c.go('lash'); e.hit = false; } }
    else if (e.st === 'lash'){
      const out = Math.min(1, e.tm / (d.lash * 0.5)) * d.reach;     // how far the whip has run out
      if (!e.hit && c.dx * e.face > 0 && Math.abs(c.dx) < out + 0.3 && P.y < e.y + 0.85 && P.y > e.y - 0.8 && !c.isRollInv(P)){
        e.hit = true;
        if (P.blocking && P.face === -e.face) c.events.push({ type: 'block', at: { x: P.x, y: P.y + 0.6 } }); else c.hurt(P, 1, e.x, d.word);
      }
      if (e.tm >= d.lash) c.go('recover');
    }
    else if (e.st === 'recover'){ if (e.tm >= d.recover) c.go('idle'); }
    // the whip, drawn: a red line along the ground while it rears (where it will reach), the vine as it lashes
    if (e.whip){
      const W = e.whip, y = e.y + 0.42, rearing = e.st === 'rear', lashing = e.st === 'lash', L = lashing ? Math.min(1, e.tm / (d.lash * 0.5)) * d.reach : e.st === 'recover' ? Math.max(0, 1 - e.tm / 0.25) * d.reach : 0;
      W.warn.visible = rearing; if (rearing){ W.warn.scale.x = d.reach; W.warn.position.set(e.x + e.face * d.reach / 2, e.y + 0.2, 0.4); W.warn.material.opacity = 0.2 + 0.3 * e.tm / d.tell; }
      for (const m of [W.edge, W.vine]){ m.visible = L > 0.05; m.scale.x = Math.max(0.01, L); m.position.set(e.x + e.face * L / 2, y + Math.sin(e.tm * 40) * 0.03, m === W.edge ? 0.035 : 0.04); }
      W.tip.visible = L > 0.05; W.tip.scale.x = 0.3; W.tip.position.set(e.x + e.face * L, y, 0.045);
    }
    const st = e.st;
    c.anim(e, st === 'idle' ? 'idle' : 'attack', st === 'idle' ? e.age * 0.7 : st === 'rear' ? e.tm / d.tell * 0.5 : st === 'lash' ? 0.56 + Math.min(1, e.tm / d.lash) * 0.2 : 0.78 + Math.min(1, e.tm / d.recover) * 0.21);
  },
  puff(e, P, dt, c){
    const d = e.d, px = P.x, py = P.y + 1.3, dist = Math.hypot(px - e.x, py - e.y);
    e.warn = e.st === 'swell';
    if (e.st === 'idle'){ e.x = e.home.x + Math.sin(e.age * 0.8) * 0.4; e.y = e.home.y + Math.sin(e.age * 1.5) * 0.25; if (dist < d.wake) c.go('drift'); }
    else if (e.st === 'drift' || e.st === 'swell'){
      const v = e.st === 'swell' ? d.drift * 0.35 : d.drift, L = dist || 1;
      e.x += (px - e.x) / L * v * dt + Math.sin(e.age * 2.1) * 0.25 * dt; e.y += (py - e.y) / L * v * dt + Math.sin(e.age * 1.7) * 0.3 * dt; e.face = Math.sign(px - e.x) || e.face;
      if (e.st === 'drift'){ if (dist < d.near){ c.go('swell'); c.events.push({ type: 'tell', e }); } else if (dist > d.wake * 2) c.go('idle'); }
      else if (e.tm >= d.swell){
        // it bursts: a cloud of spores all round it
        c.go('pop'); c.fx.burst({ x: e.x, y: e.y }, 30, 0xf6757a); c.fx.burst({ x: e.x, y: e.y }, 22, 0xfee761); c.fx.ring({ x: e.x, y: e.y }, 0xfeae34); c.events.push({ type: 'spit', e });
        if (c.E.R) c.E.R.glint(e.x, e.y, 0xff8050, 0.9, 4, 0.3);
        if (Math.hypot(px - e.x, py - e.y) < d.radius && !c.isRollInv(P)) c.hurt(P, 1, e.x, d.word);
      }
    }
    else if (e.st === 'pop'){ if (e.tm >= 0.22){ e.alive = false; e.dead = 0; if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false; return; } }
    const st = e.st;
    c.anim(e, st === 'swell' || st === 'pop' ? 'burst' : 'float', st === 'swell' ? e.tm / d.swell * 0.66 : st === 'pop' ? 0.67 + e.tm / 0.22 * 0.32 : e.age * 0.9);
    if (e.sprite && (st === 'swell' || st === 'pop')) e.sprite.plane.scale.multiplyScalar(st === 'swell' ? 1 + e.tm / d.swell * 0.8 : 1.8 + e.tm * 3);   // it swells
  },
};
const hideWhip = e => { if (e.hp <= 0 && e.whip) for (const k in e.whip) e.whip[k].visible = false; };
const enemies = {
  thornback: { ai: 'thornback', hp: 4, w: 0.8, h: 1.5, color: 0x3e8948, wake: 10, sight: 7.5, trot: 2.2, tell: 0.6, charge: 11.5, run: 1.5, recover: 0.75, stun: 1.5, art: 'px_thornback', fly: false, word: 'Gored' },
  lasher: { ai: 'lasher', hp: 3, w: 0.55, h: 2.0, color: 0xb55088, reach: 3.4, turn: 0.5, tell: 0.55, lash: 0.3, recover: 0.95, art: 'px_lasher', fly: false, word: 'Lashed', onHit: hideWhip },
  puff: { ai: 'puff', hp: 1, w: 0.45, h: 0.8, color: 0xf6757a, glow: 0x301018, wake: 8, drift: 1.35, near: 1.6, swell: 0.9, radius: 1.75, art: 'px_puff', fly: true, word: 'Choked' },
};

// ---- its look: pale marble under moss, flowers on everything, gold light
const themeDef = {
  stone: { edge: 'ink', topEdge: 'bone', lip: 'white', lip2: 'bone', lipD: 3, lip2D: 4, a: 'pale', aSeam: 'light', b: 'light', bSeam: 'mid', c: 'mid', core: 'dark', seam: 'brick' },
  moss: { c: ['moss1', 'moss2', 'moss0'], p: 0.5 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['moss0', 'rose'],
  ceilLow: [['vine', 6], ['wisteria', 6]], ceil: [['vine', 26], ['wisteria', 40], ['root', 14], ['lantern', 6], ['chain', 4]],
  floorWall: ['fern', 'flowers', 'rosebush', 'drum', 'urn', 'rubble', 'flowers'], floorOpen: ['flowers', 'fern', 'sapling', 'flowers', 'rosebush', 'statue', 'drum'], gem: 'sunbloom',
  back: { cols: ['dark', 'mid', 'light'], dim: [1, 0.96, 0.92], hole: 4.6, holeOpen: 2.0, stand: [['column', 6], ['sapling', 4]], hang: [['wisteria', 60], ['vine', 40]], pStand: 0.012, pHang: 0.03 },
  far: { img: 'gardens', raw: true }, hemi: [0xfff4e0, 0xe8d0b0, 1.02], shaft: 'rgba(255,236,170,0.5)', bloom: [0.92, 0.4],
  amb: [1.04, 0.98, 0.88], ambIn: [0.66, 0.58, 0.5], mist: { col: 'white', col2: 'bone', a: 0.16, drift: 0.3 }, fore: 'roots',
  air: { n: 90, cols: [0xf6757a, 0xfee761], warm: 0.55, vx: 0.5, vy: [-0.55, -0.15], drift: 0.35, steady: true },   // petals and pollen, coming down
};
const deco = (px, PAL) => ({
  // a hanging cluster of blossom
  wisteria(g, x, y, r){ const L = 7 + Math.floor(r() * 12), cols = r() < 0.5 ? [PAL.pink, PAL.rose, PAL.plum] : [PAL.rose, PAL.white, PAL.pink]; let cx = x;
    for (let k = 0; k < L; k++){ if (r() < 0.25) cx += r() < 0.5 ? -1 : 1; const half = k < 3 ? 0 : Math.max(0, Math.round((1 - Math.abs(k - L * 0.55) / (L * 0.5)) * 2));
      if (k < 3){ px(g, PAL.moss0, cx, y + k); continue; }
      px(g, PAL.ink, cx - half - 1, y + k, half * 2 + 3); for (let a = -half; a <= half; a++) px(g, cols[(a + k * 3 + 30) % 3 === 0 ? 1 : (a + k) % 4 === 0 ? 2 : 0], cx + a, y + k); }
    px(g, cols[1], cx, y + L); },
  // a flower that holds the light: the gardens' lamp
  sunbloom(g, x, y, r, glow){ const h = 5 + Math.floor(r() * 4);
    px(g, PAL.ink, x - 1, y - h, 3, h); px(g, PAL.moss1, x, y - h, 1, h); px(g, PAL.moss2, x + 1, y - 2, 2, 1); px(g, PAL.moss2, x - 2, y - 3, 2, 1);
    px(g, PAL.ink, x - 3, y - h - 5, 7, 5); px(g, PAL.fire2, x - 2, y - h - 4, 5, 3); px(g, PAL.fire3, x - 1, y - h - 4, 3, 2); px(g, PAL.white, x, y - h - 3, 1, 1); px(g, PAL.fire1, x - 2, y - h - 1, 1, 1); px(g, PAL.fire1, x + 2, y - h - 1, 1, 1);
    glow && glow(x, y - h - 3, 'lamp'); },
  flowers(g, x, y, r){ const cols = [PAL.rose, PAL.fire3, PAL.white, PAL.pink, PAL.fire2];
    for (let k = -4; k <= 4; k += 1 + Math.floor(r() * 2)){ const h = 1 + Math.floor(r() * 3); px(g, PAL.moss1, x + k, y - h, 1, h); if (r() < 0.75) px(g, cols[Math.floor(r() * cols.length)], x + k, y - h - 1, 1, 1); } },
  fern(g, x, y, r){ for (const dir of [-1, 1]) for (let f = 0; f < 2; f++){ const L = 4 + Math.floor(r() * 4); for (let k = 0; k < L; k++){ const fx = x + dir * (k + f), fy = y - 1 - Math.round(Math.sin(k / L * Math.PI * 0.7) * (3 + f * 2)); px(g, PAL.ink, fx, fy - 1, 1, 3); px(g, k % 2 ? PAL.moss2 : PAL.moss1, fx, fy, 1, 1); } }
    px(g, PAL.moss0, x, y - 3, 1, 3); },
  rosebush(g, x, y, r){ const w = 5 + Math.floor(r() * 4), h = 4 + Math.floor(r() * 3);
    for (let k = 0; k < h; k++){ const half = Math.round(w / 2 * Math.sqrt(Math.max(0, 1 - Math.pow(k / h, 2)))); px(g, PAL.ink, x - half - 1, y - 1 - k, half * 2 + 3); px(g, k > h - 3 ? PAL.moss1 : PAL.moss0, x - half, y - 1 - k, half * 2 + 1); }
    px(g, PAL.moss2, x - 2, y - h, 2, 1);
    for (let k = 0; k < 4; k++){ const a = Math.floor((r() - 0.5) * w), b = 1 + Math.floor(r() * (h - 1)); px(g, r() < 0.5 ? PAL.red1 : PAL.rose, x + a, y - b, 1, 1); } },
  // a column of the old colonnades, standing behind: fluted marble, its head broken off as often as not
  column(g, x, y, r){ const h = 20 + Math.floor(r() * 22), w = 6, whole = r() < 0.45;
    for (let k = 0; k < h; k++){ const rag = !whole && k > h - 3 ? (k + x) % 3 : 0; px(g, PAL.mid, x - 1 + rag, y - k, w + 2 - rag); px(g, PAL.pale, x + rag, y - k, w - rag * 2); px(g, PAL.white, x + rag, y - k, 1, 1); for (let a = 2; a < w - rag * 2; a += 2) px(g, PAL.light, x + rag + a, y - k, 1, 1); }
    px(g, PAL.mid, x - 2, y - 2, w + 4, 3); px(g, PAL.pale, x - 1, y - 2, w + 2, 2);
    if (whole){ px(g, PAL.mid, x - 2, y - h - 2, w + 4, 3); px(g, PAL.white, x - 1, y - h - 2, w + 2, 2); }
    if (r() < 0.6) for (let k = 0; k < 5; k++) px(g, PAL.moss1, x + (k * 3) % w, y - 3 - Math.floor(r() * h * 0.6), 1, 2); },
  // a fallen drum of a column, fluted
  drum(g, x, y, r){ const n = 1 + Math.floor(r() * 2); let yy = y;
    for (let s = 0; s < n; s++){ const w = 8 - s, h = 5, x0 = x - 4 + s + Math.floor(r() * 2); px(g, PAL.ink, x0 - 1, yy - h - 1, w + 2, h + 1); px(g, PAL.pale, x0, yy - h, w, h); px(g, PAL.white, x0, yy - h, w, 1); for (let k = 1; k < w; k += 2) px(g, PAL.light, x0 + k, yy - h + 1, 1, h - 1); px(g, PAL.moss1, x0 + (s ? 1 : w - 3), yy - h, 2, 1); yy -= h; } },
  // a young tree in blossom
  sapling(g, x, y, r){ const h = 9 + Math.floor(r() * 6); let cx = x;
    for (let k = 0; k < h; k++){ if (k > 2 && r() < 0.3) cx += r() < 0.5 ? -1 : 1; px(g, PAL.ink, cx - 1, y - 1 - k, 3, 1); px(g, PAL.wood1, cx, y - 1 - k, 1, 1); }
    const cols = [PAL.pink, PAL.rose, PAL.rose, PAL.white];
    for (let b = -4; b <= 3; b++) for (let a = -6; a <= 6; a++){ if (Math.hypot(a * 0.8, b * 1.2) > 5 + ((a * 7 + b * 13 + 60) % 3) * 0.4) continue; const edge = Math.hypot(a * 0.8, b * 1.2) > 4; px(g, edge ? PAL.ink : cols[(a * 5 + b * 3 + 40) % 4], cx + a, y - h - 3 + b); if (!edge && (a + b * 2 + 20) % 5 === 0) px(g, PAL.plum, cx + a, y - h - 3 + b); } },
});

// ---- its score, where there is no recording: the climb's tune in the major, plucked, over a warm held chord
const _ = null;
const BRIGHT = { prog: [{ b: 38, n: [50, 54, 57] }, { b: 43, n: [50, 55, 59] }, { b: 35, n: [50, 54, 59] }, { b: 45, n: [49, 52, 57] }],   // D, G, Bm, A: each for two bars
  tune: [[0, 0, 74, 4], [0, 4, 76, 4], [0, 8, 78, 4], [0, 12, 81, 14], [2, 0, 74, 4], [2, 4, 78, 4], [2, 8, 79, 4], [2, 12, 83, 14], [4, 0, 78, 4], [4, 4, 81, 4], [4, 8, 83, 4], [4, 12, 86, 14], [6, 0, 81, 6], [6, 6, 79, 6], [6, 12, 78, 4], [7, 0, 76, 12]] };
const songs = {
  gardens: { set: BRIGHT, shift: 0, bpm: 84, pad: { g: 0.3, cut: 1700 }, bass: { g: 0.24, at: [0, 8] }, arp: { inst: 'pluck', g: 0.14, oct: 12, pat: [0, _, 2, _, 1, _, 3, _, 2, _, 4, _, 3, _, 1, _] }, lead: { inst: 'bell', g: 0.17, oct: 0, every: 2 } },
};

export default { name: 'The Gardens', theme: 'gardens', sub: 'above the cloud, in the sun', card: 'Above the storm: sun, and green things growing.', epithet: 'WHAT THE GARDEN GREW', quiet: ['bower'],
  seed: 6660123, fill: EMPTY, sky: true, cols: 3, wear: { sag: 0.7, swell: 0.4, humps: 0.3 },
  layout: [[0, 0, stormdoor], [1, 0, terraces, 2, 1], [0, 1, wellspring, 1, 2], [1, 1, brambles], [2, 1, arbor], [1, 2, orangery], [2, 2, cascade, 1, 2], [0, 3, sundial], [1, 3, canopy], [0, 4, bower, 2, 2]],
  themeDef, deco, enemies, ai, songs };
