// The hidden halls, drawn and played. A cracked patch in the wall behind a landing, lamplight in the cracks and grit
// trickling out of them; three blows and it gives, the wall along the hall falling away in a wave from the mouth; the
// hall behind (a flat, a stair in the rock, a chamber with a chest and a carving, a ledge out over the stair); and what
// happens in it: the chest pays out and fills the flask, the carving is read by standing at it.
//   path.js holds the geometry (HALLS, hallA, hallLine); shaft.js opens the wall; motor.js moves him in and out.
import { RW } from '../config/constants.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../config/zones.js';
import { HALLS, HALL, hallA, hallLine, hallOf, hallAt, posOf, landingS } from './path.js';
import { ST } from '../core/state.js';
import { S, save } from '../save/store.js';
import { scene } from '../render/renderer.js';
import { stoneTex, wallTex } from '../render/textures.js';
import { bgeo, mbox, vArc, lam } from '../render/primitives.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { hash, rng, yawFor } from '../core/math.js';
import { burst } from '../render/particles.js';
import { sfx } from '../audio/sfx.js';
import { impact } from '../fx/impact.js';
import { shake, setToast, float } from '../fx/feedback.js';
import { openHallWall } from './shaft.js';
import { updatePips } from '../ui/overlay.js';
import { addGold, findBlueprint, giveRune } from '../run/run.js';
import { WELL } from '../config/run.js';
import { runSeed } from './generate.js';
const THREE = window.THREE;

// What is carved in each region's halls: things found, from lore.md. One of two, by the run.
export const HALL_LORE = [
  [['Scratched letters', 'Cut deep beside a crack: U, R, R, then a smooth patch where the stone has been rubbed by something that came back to touch it, again and again.'],
   ['Flask of the Welling', 'Teal water that closes wounds and asks nothing in return. Be wary of anything that asks nothing.']],
  [['Tallow stub', 'The Wickfolk burned one for each of their dead. Then the dead came back, and there were not enough candles. Then there were too many dead.'],
   ['Votive figure', 'Clay, its face rubbed smooth by thumbs. Pressed into the back, hard: Stay down, love. Stay down.']],
  [['Iron cradle', 'Wrought with great care and never used. The Hald stopped making children in the third century of the Dominion. No one could remember why they had wanted them.'],
   ['Whetstone', 'Haldmarrow wellstone, cut for edges. A blade kissed by it bites deeper for a while. Only for a while. Even the Hald could not make that last.']],
  [['Lullaby bone', 'Scratches in rows, which turn out to be a song: Sleep, sleep, the warm is ours. The cold is long. The warm is ours.'],
   ['Troll blanket', 'Woven from dragon scale and hair. Too small for a troll. Just the right size for an egg.']],
  [['War pick', 'A Hald pick with a head of wellstone and a haft worn to the shape of one grip. It does not dull. The hand that held it did not tire. That was the trouble.'],
   ['Lift plate', 'Cast into the cage: BUILT BY THE HALD TO RISE. Scratched beneath it in another hand: and to bring them down.']],
  [['Lanternbearer\'s oath', 'I go down with the light. I do not come back with it. What I find, I end. What ends, I name.'],
   ['Hand-bell of the Watch', 'Bronze, the clapper bound in cloth. The Watch rang these softly beside those who could not die. It did not help. It was not meant to. It meant: we noticed.']],
  [['The herald\'s letter', 'The wax gone white. To the keepers of the high places: the snow has lain nine hundred years. The children have not grown. We ask for nothing. We only ask why.'],
   ['Seed pouch', 'Seed corn, carried up to plant at the top, where spring was said to be kept. The seeds are whole. They have been waiting too.']],
];
export const loreOf = h => HALL_LORE[Math.min(HALL_LORE.length - 1, h.z)][(runSeed + h.j) % 2];

function canvasTex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t; }
// The walled-up arch, in three stages of breaking: a patch of rubble stones set in the wall where a doorway was filled
// in, cracks across it (more with each blow), and a glow layer drawn apart: lamplight from inside leaking through the
// cracks and, by the last stage, through gaps where stones have fallen out.
const CW = 128, CH = 200, archPath = g => { g.beginPath(); g.moveTo(10, CH - 4); g.lineTo(10, 66); g.quadraticCurveTo(12, 8, CW / 2, 6); g.quadraticCurveTo(CW - 12, 8, CW - 10, 66); g.lineTo(CW - 10, CH - 4); g.closePath(); };
const CRACKS = (() => { const r = rng(11), out = [];
  for (let k = 0; k < 16; k++){
    let x = CW * (0.3 + r() * 0.4), y = CH * (0.25 + r() * 0.55), a = r() * Math.PI * 2; const pts = [[x, y]];
    for (let s = 0; s < 6; s++){ a += (r() - 0.5) * 1.2; const l = (12 + r() * 16) * (1 - s / 8); x += Math.cos(a) * l; y += Math.sin(a) * l * 1.4; pts.push([x, y]); }
    out.push(pts);
  }
  return out; })();
const HOLES = [[52, 92, 14, 10], [74, 128, 12, 9], [44, 150, 10, 8]];
const STAGES = [4, 8, 16];
function stroke(g, pts){ g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts) g.lineTo(p[0], p[1]); g.stroke(); }
const CRACK = STAGES.map((n, st) => canvasTex(CW, CH, g => {
  g.save(); archPath(g); g.clip();
  const r = rng(7); g.fillStyle = '#2a2420'; g.fillRect(0, 0, CW, CH);   // mortar
  for (let y = 4; y < CH; y += 16 + r() * 6) for (let x = 6 - r() * 10; x < CW; x += 18 + r() * 12){   // rubble stones
    const v = 150 + r() * 70 | 0; g.fillStyle = `rgb(${v},${v - 8},${v - 16})`;
    g.beginPath(); g.moveTo(x + 2 + r() * 3, y + 2); g.lineTo(x + 16 + r() * 8, y + 1 + r() * 3); g.lineTo(x + 17 + r() * 8, y + 13 + r() * 4); g.lineTo(x + 1 + r() * 3, y + 14 + r() * 3); g.closePath(); g.fill();
  }
  g.strokeStyle = 'rgba(10,6,4,1)'; g.lineJoin = g.lineCap = 'round';
  CRACKS.slice(0, n).forEach((c, i) => { g.lineWidth = i < 4 ? 5 : 3.5; stroke(g, c); });
  if (st === 2){ g.fillStyle = '#000'; for (const [x, y, w, h] of HOLES){ g.beginPath(); g.ellipse(x, y, w, h, 0.3, 0, Math.PI * 2); g.fill(); } }
  g.restore();
  g.strokeStyle = 'rgba(20,14,10,0.9)'; g.lineWidth = 4; archPath(g); g.stroke();   // the arch's edge
}));
const GLOW = STAGES.map((n, st) => canvasTex(CW, CH, g => {
  g.save(); archPath(g); g.clip(); g.lineJoin = g.lineCap = 'round';
  g.filter = 'blur(5px)'; g.strokeStyle = 'rgba(255,170,80,0.9)';
  CRACKS.slice(0, n).forEach((c, i) => { g.lineWidth = i < 4 ? 12 : 9; stroke(g, c); });
  g.filter = 'none'; g.strokeStyle = 'rgba(255,236,190,1)';
  CRACKS.slice(0, n).forEach((c, i) => { g.lineWidth = i < 4 ? 2.2 : 1.6; stroke(g, c); });
  if (st === 2){ g.fillStyle = 'rgba(255,220,160,1)'; for (const [x, y, w, h] of HOLES){ g.beginPath(); g.ellipse(x, y, w * 0.8, h * 0.8, 0.3, 0, Math.PI * 2); g.fill(); } }
  g.restore();
}));
const TABLET = canvasTex(128, 80, (g, w, h) => {            // rows of cut marks, worn
  g.fillStyle = '#8a8070'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(3, 3, w - 6, h - 6);
  const r = rng(5); g.strokeStyle = 'rgba(30,24,18,0.85)'; g.lineWidth = 2;
  for (let row = 0; row < 5; row++) for (let x = 10; x < w - 12; x += 6 + r() * 6){
    const y = 12 + row * 13; g.beginPath(); g.moveTo(x, y + r() * 3); g.lineTo(x + (r() - 0.5) * 6, y + 7 + r() * 2); if (r() < 0.4){ g.moveTo(x - 2, y + 4); g.lineTo(x + 4, y + 3); } g.stroke();
  }
});
const DEPTH = 3.0, MID = 0.1;   // the floor's depth, and how far behind the walking line its middle sits
const light = new THREE.PointLight(0xffb070, 0, 9, 2); scene.add(light);
const chunks = [];

for (const h of HALLS){
  const z = ZONES[h.z], stone = new THREE.Color(z.stone), wallC = new THREE.Color(z.wall);
  // the crack on the wall behind the landing
  const cy = h.yA + 1.4, crack = new THREE.Group();
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), new THREE.MeshLambertMaterial({ map: CRACK[0], color: wallC.clone().lerp(new THREE.Color(0xd8c8b0), 0.35), transparent: true, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }));
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), new THREE.MeshBasicMaterial({ map: GLOW[0], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  crack.add(dark, glow); glow.position.z = 0.01; glow.renderOrder = 2;
  vArc(h.a0, RW - 0.04, cy, crack.position); crack.lookAt(0, cy, 0); scene.add(crack);
  // grit fallen from it, at the back of the landing
  const pm = rockMaterial(stone.clone().multiplyScalar(0.8).getHex()), rr = rng(h.j * 31 + 3), grit = new THREE.Group(); scene.add(grit);
  for (let k = 0; k < 4; k++){ const a = h.a0 + (rr() - 0.5) * 0.08, p = vArc(a, RW - 0.35 - rr() * 0.3, h.yA + 0.06); grit.add(rock(pm, { w: 0.12 + rr() * 0.12, h: 0.08 + rr() * 0.08, d: 0.12 + rr() * 0.1, jag: 0.4 }, p.x, p.y, p.z, rr)); }
  // the hall itself, hidden until it is broken into
  const g = new THREE.Group(); g.visible = false; scene.add(g);
  const floorMat = new THREE.MeshLambertMaterial({ color: stone.clone().multiplyScalar(0.85), map: stoneTex });
  const slab = (u0, u1, top, th = 1.3) => {
    const len = u1 - u0, a = hallA(h, (u0 + u1) / 2), m = new THREE.Mesh(bgeo(len, th, DEPTH), floorMat);
    vArc(a, h.r + MID, top - th / 2, m.position); m.rotation.set(0, yawFor(a), 0); g.add(m);
  };
  slab(-0.3, h.entry, h.yA);
  for (let i = 0; i < h.nSteps; i++) slab(h.entry + i * h.stepL - 0.01, h.entry + (i + 1) * h.stepL + 0.01, h.yA + (i + 1) * h.rise, 1.3 + h.rise * i * 0.5);
  slab(h.entry + h.run, h.len, h.yTop, 1.6);
  // the back wall and the ceiling (the ceiling stops where the hall breaks out onto its ledge)
  const back = h.r + MID + DEPTH / 2, inner = RW - 0.15, roofEnd = h.len - HALL.ledge, N = Math.ceil(h.len * 3);
  const ribbon = (pts, mat) => {
    const pos = [], uv = [], idx = [];
    pts.forEach((p, i) => { pos.push(...p[0], ...p[1]); uv.push(i / 3, 0, i / 3, 1.2); if (i < pts.length - 1){ const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); g.add(m); return m;
  };
  const wt = wallTex.clone(); wt.needsUpdate = true; wt.wrapS = wt.wrapT = THREE.RepeatWrapping;
  const rockMat = new THREE.MeshLambertMaterial({ map: wt, color: wallC.clone().multiplyScalar(0.5), side: THREE.DoubleSide });
  const backPts = [], roofPts = [];
  for (let i = 0; i <= N; i++){
    const u = -0.3 + (h.len + 0.3) * i / N, a = hallA(h, u), yl = hallLine(h, Math.max(0, u)), jag = (hash(h.j, i) - 0.5) * 0.2, c = Math.cos(a), s = Math.sin(a);
    backPts.push([[(back + jag) * c, yl - 1.4, (back + jag) * s], [(back + jag) * c, yl + (u < roofEnd ? 4.1 : 2.6 + (hash(i, h.j) - 0.5) * 0.8), (back + jag) * s]]);
    if (u <= roofEnd + 0.2) roofPts.push([[inner * c, yl + 3.9 + jag, inner * s], [back * c, yl + 4.0, back * s]]);
  }
  ribbon(backPts, rockMat); ribbon(roofPts, rockMat);
  { const a = hallA(h, -0.3), c = Math.cos(a), s = Math.sin(a);   // the hall's blind end, behind the mouth
    ribbon([[[inner * c, h.yA - 1.4, inner * s], [inner * c, h.yA + 4.0, inner * s]], [[back * c, h.yA - 1.4, back * s], [back * c, h.yA + 4.0, back * s]]], rockMat); }
  // the ledge's broken lip
  for (let k = 0; k < 3; k++){ const a = hallA(h, h.len - 0.05), p = vArc(a, h.r - 1 + k * 0.9, h.yTop - 0.2); g.add(rock(pm, { w: 0.4, h: 0.45, d: 0.5, jag: 0.4 }, p.x, p.y, p.z, rr)); }
  // the carving on the back wall of the chamber
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshLambertMaterial({ map: TABLET, color: stone.clone().lerp(new THREE.Color(0xffffff), 0.3) }));
  vArc(hallA(h, h.tabletU), back - 0.06, h.yTop + 1.45, tab.position); tab.lookAt(0, h.yTop + 1.45, 0); g.add(tab);
  // the chest: wood and iron, lid hinged at the back (local +z faces the shaft's centre)
  const chest = new THREE.Group(), wood = lam(0x6a4428), iron = lam(0x3a3a42);
  chest.add(mbox(0.9, 0.48, 0.58, wood, 0, 0.24, 0), mbox(0.94, 0.08, 0.62, iron, 0, 0.08, 0), mbox(0.94, 0.08, 0.62, iron, 0, 0.42, 0));
  const gold = mbox(0.7, 0.1, 0.4, new THREE.MeshLambertMaterial({ color: 0xe8b04a, emissive: 0x5a3a00 }), 0, 0.45, 0); chest.add(gold);
  const lid = new THREE.Group(); lid.position.set(0, 0.48, -0.29); chest.add(lid);
  lid.add(mbox(0.92, 0.22, 0.6, wood, 0, 0.11, 0.3), mbox(0.96, 0.06, 0.64, iron, 0, 0.2, 0.3), mbox(0.12, 0.16, 0.06, iron, 0, 0.0, 0.62));
  vArc(hallA(h, h.chestU), h.r + 0.55, h.yTop, chest.position); chest.rotation.y = yawFor(hallA(h, h.chestU)); g.add(chest);
  // a lamp hung over the chest: the light that showed through the cracks
  const lamp = mbox(0.16, 0.24, 0.16, new THREE.MeshBasicMaterial({ color: 0xffc070 }));
  vArc(hallA(h, h.chestU - 0.6), h.r + 0.9, h.yTop + 2.5, lamp.position); g.add(lamp);
  h.vis = { crack, grit, dark, glow, g, chest, lid, gold, lamp, lidT: 0, open: -Infinity, read: false };
}

// Reset for a new climb: the walls shut, the cracks fresh, the chests closed.
function reset(){
  for (const h of HALLS){
    const v = h.vis; v.open = -Infinity; openHallWall(h, -Infinity); v.g.visible = false; v.lidT = 0; v.lid.rotation.x = 0; v.gold.visible = true; v.read = false;
    v.dark.material.map = CRACK[0]; v.glow.material.map = GLOW[0]; v.crack.visible = v.grit.visible = h.open && !ST.practice;
  }
  for (const c of chunks) scene.remove(c.m); chunks.length = 0;
}

// A blow landed near a cracked wall (player.js asks after its own targets). True if it struck one.
export function hitHall(G, swing){
  if (ST.practice || !G.grounded) return false;
  const h = hallAt(G.s); if (!h || h.broken) return false;
  h.hits++;
  const v = h.vis, at = vArc(h.a0, RW - 0.15, h.yA + 1.2 + (Math.random() - 0.5) * 0.4), last = h.hits >= HALL.hits;
  impact(at, ({ slash: -1.25, back: -1.1, chop: 1.0 }[swing.pose] || 0) * G.face, { heavy: last });
  burst(at, 10, '#9a8f84', 2.4, 9, 0.07); sfx.crack();
  const st = Math.min(STAGES.length - 1, h.hits); v.dark.material.map = CRACK[st]; v.glow.material.map = GLOW[st]; 
  if (last) breakHall(h);
  return true;
}
function breakHall(h){
  const v = h.vis; h.broken = true; v.crack.visible = false; v.g.visible = true; v.open = 0;
  sfx.rumble(); sfx.slam(); shake(0.35);
  const pm = rockMaterial(new THREE.Color(ZONES[h.z].wall).multiplyScalar(0.6).getHex()), r = rng(h.j * 17 + h.hits);
  for (let k = 0; k < 12; k++){   // the plug of rock, bursting out over the landing
    const a = h.a0 + (r() - 0.5) * 0.11, y = h.yA + 0.3 + r() * 2.4, p = vArc(a, RW - 0.1, y);
    const m = rock(pm, { w: 0.25 + r() * 0.35, h: 0.2 + r() * 0.3, d: 0.25 + r() * 0.3, jag: 0.45 }, p.x, p.y, p.z, r); scene.add(m);
    const inward = new THREE.Vector3(-Math.cos(a), 0, -Math.sin(a)).multiplyScalar(1.5 + r() * 3);
    chunks.push({ m, v: inward.setY(1 + r() * 3), spin: (r() - 0.5) * 8, t: 0 });
  }
  burst(vArc(h.a0, RW - 0.3, h.yA + 1.3), 30, '#a49a90', 3.4, 6, 0.1);
  if (!S.seen.includes('hall')) setToast('A hidden hall', 'Something was walled up here', 2.4);
}

let lastG = null, dustT = 0;
export function updateHalls(dt){
  const G = ST.G;
  if (G !== lastG){ lastG = G; reset(); }
  if (!G) return;
  const inHall = hallOf(G.s), pw = vArc(posOf(G.s).a, posOf(G.s).r, G.y);
  let lit = null, litD = 1e9;
  for (const h of HALLS){
    if (!h.open || ST.practice) continue;
    const v = h.vis;
    if (!h.broken){
      // grit trickles from the cracks while he is near, and the lamplight in them breathes
      const near = Math.abs(G.s - landingS(h.kH)) < 14 && !routeOfOther(G);
      v.glow.material.opacity = (0.7 + 0.1 * h.hits) * (0.8 + 0.2 * Math.sin(ST.time * 2.3 + h.j));
      if (near && (dustT -= dt) < 0){ dustT = 0.5 + Math.random() * 0.9; burst(vArc(h.a0 + (Math.random() - 0.5) * 0.04, RW - 0.1, h.yA + 1.2 + Math.random() * 1.2), 3, '#9a9088', 0.4, 9, 0.05); }
      continue;
    }
    // the wall falls away along the hall, a wave from the mouth, dust where it goes
    if (v.open < h.len + 1){
      const was = v.open; v.open += dt * 14; openHallWall(h, v.open);
      if (Math.floor(was / 2) !== Math.floor(v.open / 2)){ burst(vArc(hallA(h, v.open), RW - 0.2, hallLine(h, Math.min(h.len, v.open)) + 1.5), 8, '#a49a90', 2, 7, 0.09); sfx.crack(); }
    }
    const lp = v.lamp.position, d = lp.distanceTo(pw); if (d < litD){ litD = d; lit = v; }
    // the chest: reaching it opens it
    if (inHall === h && !h.looted && G.s - h.s0 > h.chestU - 0.55) loot(G, h);
    if (h.looted && v.lidT < 1){ v.lidT = Math.min(1, v.lidT + dt * 3); v.lid.rotation.x = -1.9 * (1 - (1 - v.lidT) ** 3); }
  }
  if (lit && litD < 14){ light.position.copy(lit.lamp.position); light.intensity = 1.6 * (0.9 + 0.1 * Math.sin(ST.time * 11) * Math.sin(ST.time * 7.3)); } else light.intensity = 0;
  for (let i = chunks.length - 1; i >= 0; i--){
    const c = chunks[i]; c.t += dt; c.v.y -= 24 * dt; c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.spin * dt; c.m.rotation.z += c.spin * 0.6 * dt;
    if (c.t > 2.5){ scene.remove(c.m); chunks.splice(i, 1); }
  }
}
const routeOfOther = G => G.s >= 100000 && !hallOf(G.s);   // on a high road or a spur: the crack is not his business
function loot(G, h){
  h.looted = true; const v = h.vis, n = addGold(GOLD.hall(h.z)), w = WELL.hall(h.z);
  G.well += w; G.flask = G.flaskMax; updatePips(); v.gold.visible = false;
  // and something to keep: the ram, the first time a hall above the Deep is opened; else a blueprint if any is left
  const p0 = v.chest.position.clone(); p0.y += 0.8;
  setTimeout(() => { if (h.z >= 1 && giveRune('ram')) return; findBlueprint(p0); }, 900);
  sfx.repair(); for (let k = 0; k < 4; k++) setTimeout(() => sfx.gold(), 80 * k);
  const p = v.chest.position.clone(); p.y += 0.6; burst(p, 18, '#e8b04a', 3, 6, 0.08);
  float('+' + n + ' ◆  +' + w + ' ✦  flask full', p, '#e8b04a');
}

// What to say: at a cracked wall, at a broken one, at the carving (its words), and on the ledge the first time.
export function hallHint(G){
  if (ST.practice) return null;
  const h = hallOf(G.s);
  if (h){
    const u = G.s - h.s0, L = loreOf(h);
    if (Math.abs(u - h.tabletU) < 1.1){ h.vis.read = true; return L[0] + '. ' + L[1]; }
    if (u > h.len - HALL.ledge - 0.2 && !S.seen.includes('ledge')){ if (u > h.len - 0.3){ S.seen.push('ledge'); save(); } return 'The hall comes out on a ledge above the stair: walk off it to drop back down.'; }
    if (!S.seen.includes('hall')){ S.seen.push('hall'); save(); }
    return null;
  }
  const w = G.grounded && G.s < 100000 && hallAt(G.s);
  if (!w) return null;
  if (!w.broken) return S.seen.includes('crack') ? null : 'The wall here is cracked, and there is light behind it. Strike it with {attack}.';
  if (!S.seen.includes('crack')){ S.seen.push('crack'); save(); }
  return S.seen.includes('hall') ? null : 'Stand in the opening and press {jump} to go in.';
}
