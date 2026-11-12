// The Rime Wyrm: the Spires' boss, and the last thing between him and the top. A serpent of ice that keeps the summit:
// a head with a jaw, a body of rings that follow where the head has been, a tail. A puppet of flat pieces
// (tools/boss-parts.py), moved here: the head steers after a point, the rings trail along its path.
//   sweep    it rears at one end of the summit and roars (a red line along the ground), then runs the length of it,
//            low: jump over its head, or roll through
//   plunge   it climbs over him, follows (a red mark), and drives its head into the ground: get out from under. Its
//            head is caught in the ice a while: that is when to cut it (a plunge onto it hurts more). From half health
//            the blow throws spikes of ice up out of the ground, one after another, away to both sides: jump them
//   breath   from half health it hangs at one end and breathes: icicles fall in a line that walks the summit
// It wakes when he stands on the summit, and starts over if he dies. Only its head can hurt him or be hurt.
import { T, LEVEL } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { tex, glow, additive } from './boss.js';
import { lit as litMat } from './render.js';
const THREE = window.THREE;
export const WYRM = {
  name: 'The Rime Wyrm', hp: 30, phase2: 0.5,
  rings: ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'm', 'm', 'm', 'm', 'm', 's', 's', 's', 's'], gap: { l: 1.1, m: 0.9, s: 0.7 },   // close enough to overlap: one body, not beads
  headR: 1.15,
  cruise: 9, turn: 5,                                  // how fast it flies, how sharply it comes round
  sweep: { tell: [0.9, 0.7], speed: [15, 19], low: 1.15 },
  plunge: { aim: [1.0, 0.8], high: 9.5, dive: 34, stuck: [1.9, 1.35], pull: 0.7, reach: 1.7 },
  spikes: { n: 5, step: 2.3, lag: 0.13, warn: 0.4, up: 0.45 },
  breath: { time: 2.4, every: 0.15, step: 1.7, warn: 0.6, fall: 17 },
  cd: [1.4, 0.8],
};
const W = WYRM;

export function makeWyrm(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'crown'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, xMin = room.x0 + 4, xMax = room.x1 - 4, lair = { x: room.x1 + 8, y: stageY - 6 };
  const B = { name: W.name, hint: 'cut its head when it is caught in the ice', rage: 'the mountain itself turns on you', fell: 'the pass is open',
    st: 'dormant', tm: 0, hp: W.hp, phase: 1, flash: 0, cd: 1.5, room, stageY, cx, mode: 'circle', mt: 0, acts: 0,
    h: { x: lair.x, y: lair.y, vx: -1, vy: 0, a: Math.PI }, trail: [], jaw: 0, spikes: [], ice: [], gone: 0 };
  const piece = (file, z) => { const t = tex(`assets/side/wyrm/${file}.png`), m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), litMat({ map: t, normalMap: tex(`assets/side/wyrm/${file}_n.png`), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); m.position.z = z; m.visible = false; scene.add(m); return m; };
  const SIZE = { l: [34, 41], m: [28, 35], s: [22, 29], head: [70, 46], jaw: [46, 16], tail: [34, 16] };
  const rings = W.rings.map((k, i) => ({ k, m: piece('ring_' + k, -0.6 - i * 0.004), x: lair.x, y: lair.y }));
  const tail = piece('tail', -0.7), jaw = piece('jaw', -0.52), head = piece('head', -0.5);
  for (const [m, k] of [[head, 'head'], [jaw, 'jaw'], [tail, 'tail'], ...rings.map(r => [r.m, r.k])]) m.scale.set(SIZE[k][0] / 16, SIZE[k][1] / 16, 1);
  let total = 0; for (const r of rings){ total += W.gap[r.k]; r.d = total; } const tailD = total + 0.9;
  const eyeLight = new THREE.PointLight(0x9fefff, 0, 6, 1.5); scene.add(eyeLight);   // its eye lights its own snout and the rings behind
  const eyeTex = glow('rgba(160,250,255,1)'), warnTex = glow('rgba(255,60,50,1)');
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), additive(eyeTex, 0x7ff6ff, 0)); scene.add(eye);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), additive(eyeTex, 0x8ff0ff, 0)); scene.add(halo);
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.1), additive(warnTex, 0xff5040, 0)); scene.add(warn);
  const markGeo = new THREE.PlaneGeometry(1.4, 0.6), iceGeo = new THREE.PlaneGeometry(0.45, 1.3), iceMat = new THREE.MeshBasicMaterial({ color: 0xc8f4ff });
  // a spike of ice out of the ground: a narrow blade, drawn as two flat triangles' worth of plane
  const spikeGeo = new THREE.BufferGeometry(); spikeGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.45, 0, 0, 0.45, 0, 0, 0, 2.1, 0], 3));
  const spikeMat = new THREE.MeshBasicMaterial({ color: 0xbfefff, side: THREE.DoubleSide });

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = x => Math.max(xMin, Math.min(xMax, x));
  const go = m => { B.mode = m; B.mt = 0; B.hit = false; };
  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: W.name, frac: Math.max(0, B.hp / W.hp), phase: B.phase } : null;
  const clear = () => { for (const s of B.spikes){ scene.remove(s.m); scene.remove(s.mark); } B.spikes.length = 0; for (const c of B.ice){ scene.remove(c.m); scene.remove(c.mark); } B.ice.length = 0; };
  B.reset = () => { Object.assign(B, { st: 'dormant', tm: 0, hp: W.hp, phase: 1, cd: 1.5, mode: 'circle', mt: 0, acts: 0, jaw: 0, gone: 0 }); Object.assign(B.h, { x: lair.x, y: lair.y, vx: -1, vy: 0, a: Math.PI }); B.trail.length = 0; clear(); };
  // the head steers toward a point: it has a speed and can only turn so fast, so it comes round in arcs
  function steer(tx, ty, speed, turn, dt){
    const H = B.h, want = Math.atan2(ty - H.y, tx - H.x); let d = want - H.a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    H.a += Math.max(-turn * dt, Math.min(turn * dt, d)); H.vx = Math.cos(H.a) * speed; H.vy = Math.sin(H.a) * speed; H.x += H.vx * dt; H.y += H.vy * dt;
  }
  const spike = (x, lag) => { const m = new THREE.Mesh(spikeGeo, spikeMat), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0)); m.visible = false; m.position.set(x, stageY, 0.3); mark.position.set(x, stageY + 0.2, 0.4); scene.add(m); scene.add(mark); B.spikes.push({ x, t: -lag, m, mark, hit: false }); };
  const icicle = x => { const m = new THREE.Mesh(iceGeo, iceMat), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0.8)); m.visible = false; mark.position.set(x, stageY + 0.2, 0.4); scene.add(m); scene.add(mark); B.ice.push({ x, y: stageY + 11.5, t: 0, m, mark }); };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt);
    const H = B.h, inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 - 1 && P.y < room.y1;
    let warnA = 0, warnX = 0, warnW = 4, weak = 0, open = 0, still = false;
    if (B.st === 'dormant'){ if (inRoom && P.grounded && P.y >= stageY - 0.05 && P.y < stageY + 0.5 && P.hp > 0){ B.st = 'rise'; B.tm = 0; events.push({ type: 'bossWake', boss: B }); } }
    else if (B.st === 'rise'){
      // up over the horn at the far end, in a long arc over the summit
      steer(cx + 6 - B.tm * 5, stageY + 10, 13, 2.2, dt); open = B.tm > 0.8 && B.tm < 2 ? 1 : 0;
      if (B.tm > 2.8){ B.st = 'fight'; B.tm = 0; go('circle'); }
    }
    else if (B.st === 'die'){
      // it drops; its rings burst, tail first; the head lies on the summit
      H.vy -= 30 * dt; H.x += H.vx * dt; H.y += H.vy * dt; H.vx *= Math.exp(-dt * 2);
      const floor = stageY + 1.0; if (H.y < floor){ H.y = floor; H.vy = 0; if (!B.down){ B.down = true; events.push({ type: 'bossSlam', at: { x: H.x, y: stageY } }); } }
      H.a += ((H.vx < 0 ? Math.PI : 0) - H.a) * Math.min(1, dt * 3); open = 1;
      const n = Math.floor(B.tm / 0.16);
      while (B.gone < n && B.gone < rings.length + 1){ const r = B.gone === 0 ? tail : rings[rings.length - B.gone].m; fx.burst({ x: r.position.x, y: r.position.y }, 18, 0xc8f4ff); fx.ring({ x: r.position.x, y: r.position.y }, 0x9ff0ff); events.push({ type: 'rockLand', at: { x: r.position.x, y: r.position.y } }); B.gone++; }
      if (B.tm > 3.6){ B.st = 'dead'; events.push({ type: 'bossDead', boss: B }); }
    }
    else if (B.st === 'fight'){
      const M = B.mode;
      if (M === 'circle'){
        // a long figure of eight over the summit, out of his reach
        const t = B.tm * 0.55; steer(cx + Math.sin(t) * 14, stageY + 8.5 + Math.sin(t * 2) * 2.2, W.cruise, W.turn, dt);
        B.cd -= dt;
        if (B.cd <= 0){
          B.acts++; const r = Math.random();
          if (B.phase === 2 && B.acts % 3 === 0){ go('breathGo'); B.side = P.x > cx ? -1 : 1; }
          else if (r < 0.42){ go('sweepGo'); B.side = H.x > cx ? 1 : -1; }
          else go('aim');
          events.push({ type: 'bossTell' });
        }
      }
      else if (M === 'sweepGo'){
        // to one end, low, and turn to face along the ground
        const tx = cx + B.side * (room.x1 - room.x0) / 2 * 0.8, ty = stageY + 3.2; steer(tx, ty, 14, 7, dt);
        if (Math.hypot(H.x - tx, H.y - ty) < 1.6 || B.mt > 2.2) go('sweepTell');
      }
      else if (M === 'sweepTell'){
        still = true; H.a += ((B.side > 0 ? Math.PI : 0) - H.a) * Math.min(1, dt * 8); H.y += (stageY + W.sweep.low + 0.6 - H.y) * Math.min(1, dt * 4); H.x += B.side * dt * 1.2;
        open = 1; warnA = 0.4 + 0.5 * B.mt / ph(W.sweep.tell); warnX = cx; warnW = xMax - xMin + 6;
        if (B.mt >= ph(W.sweep.tell)){ go('sweep'); events.push({ type: 'bossSweep', at: { x: H.x, y: stageY } }); }
      }
      else if (M === 'sweep'){
        const sp = ph(W.sweep.speed); H.a = B.side > 0 ? Math.PI : 0; H.vx = -B.side * sp; H.vy = 0; H.x += H.vx * dt; H.y = stageY + W.sweep.low + Math.sin(B.mt * 9) * 0.12; open = 0.6;
        if (Math.random() < 0.8) fx.dust({ x: H.x, y: stageY }, 2, 2.6);
        if ((B.side > 0 && H.x < xMin - 1) || (B.side < 0 && H.x > xMax + 1)){ H.a = B.side > 0 ? Math.PI * 0.75 : Math.PI * 0.25; go('circle'); B.cd = ph(W.cd); }
      }
      else if (M === 'aim'){
        // over him, following
        const tx = clampX(P.x), ty = stageY + W.plunge.high; steer(tx, ty, 13, 6, dt);
        warnA = 0.3 + 0.4 * Math.min(1, B.mt / ph(W.plunge.aim)); warnX = tx;
        if (B.mt >= ph(W.plunge.aim) && Math.abs(H.x - tx) < 2.5 && H.y > stageY + 6){ go('dive'); B.tx = H.x + (tx - H.x) * 0.6; }
        else if (B.mt > 3.5){ go('dive'); B.tx = H.x; }
      }
      else if (M === 'dive'){
        H.a = -Math.PI / 2 + (B.tx - H.x) * 0.05; H.x += (B.tx - H.x) * Math.min(1, dt * 6); H.vx = 0; H.vy = -W.plunge.dive; H.y += H.vy * dt; open = 1; warnA = 1; warnX = B.tx;
        if (H.y <= stageY + 1.0){
          H.y = stageY + 1.0; events.push({ type: 'bossSlam', at: { x: H.x, y: stageY } }); fx.burst({ x: H.x, y: stageY + 0.5 }, 30, 0xc8f4ff);
          if (Math.abs(P.x - H.x) < W.plunge.reach && P.y < stageY + 2.6 && P.y > stageY - 1 && !isRollInv(P)) hurt(P, 1, H.x, 'Run through');
          if (B.phase === 2) for (const dir of [-1, 1]) for (let k = 1; k <= W.spikes.n; k++){ const x = H.x + dir * (0.8 + k * W.spikes.step); if (x > xMin - 2 && x < xMax + 2) spike(x, k * W.spikes.lag); }
          go('stuck');
        }
      }
      else if (M === 'stuck'){ still = true; weak = 1; H.a = -Math.PI / 2 + Math.sin(B.mt * 22) * 0.05 * Math.max(0, 1 - B.mt); H.vx = H.vy = 0; if (B.mt >= ph(W.plunge.stuck)) go('pull'); }
      else if (M === 'pull'){ const t = Math.min(1, B.mt / W.plunge.pull); weak = 1 - t; H.a = Math.PI / 2; H.vx = 0; H.vy = 9 * t; H.y += H.vy * dt; if (t >= 1){ go('circle'); B.cd = ph(W.cd); } }
      else if (M === 'breathGo'){
        const tx = cx + B.side * (room.x1 - room.x0) / 2 * 0.72, ty = stageY + 6; steer(tx, ty, 13, 7, dt);
        if (Math.hypot(H.x - tx, H.y - ty) < 1.6 || B.mt > 2.4){ go('breath'); B.n = 0; }
      }
      else if (M === 'breath'){
        // it hangs there, head down toward the summit, and the icicles walk away from it
        still = true; H.a += ((B.side > 0 ? Math.PI * 1.15 : -Math.PI * 0.15) - H.a) * Math.min(1, dt * 6); H.y += Math.sin(B.mt * 5) * dt * 0.4; open = 1;
        const k = Math.floor(B.mt / W.breath.every);
        while (B.n < k){ B.n++; const x = H.x - B.side * (1.5 + B.n * W.breath.step); if (x > xMin - 2 && x < xMax + 2) icicle(x); }
        if (Math.random() < 0.7) fx.burst({ x: H.x - B.side * 1.8, y: H.y - 0.6 }, 2, 0xc8f4ff);
        if (B.mt >= W.breath.time){ go('circle'); B.cd = ph(W.cd); }
      }
      // its head against him
      if ((M === 'sweep' || M === 'dive') && !B.hit && !isRollInv(P)){
        const nx = Math.max(P.x - 0.34, Math.min(P.x + 0.34, H.x)), ny = Math.max(P.y, Math.min(P.y + P.h, H.y));
        if (Math.hypot(nx - H.x, ny - H.y) < W.headR){ if (hurt(P, 1, H.x - Math.sign(H.vx || 1), 'Bitten')) B.hit = true; }
      }
    }
    // where the head has been: a point every quarter unit; the rings sit along it
    const tr = B.trail;
    if (!tr.length || Math.hypot(H.x - tr[0].x, H.y - tr[0].y) > 0.25){ tr.unshift({ x: H.x, y: H.y }); if (tr.length > 120) tr.pop(); }
    const at = d => { const k = d / 0.25, i = Math.min(tr.length - 1, Math.floor(k)), j = Math.min(tr.length - 1, i + 1), f = k - Math.floor(k), a = tr[i] || H, b = tr[j] || a; return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; };
    // spikes out of the ground, icicles out of the air
    for (let i = B.spikes.length - 1; i >= 0; i--){
      const s = B.spikes[i]; s.t += dt;
      if (s.t < 0) continue;
      if (s.t < W.spikes.warn){ s.mark.material.opacity = 0.5 + 0.4 * Math.sin(s.t * 30); }
      else { const u = (s.t - W.spikes.warn) / W.spikes.up, k = u < 0.25 ? u / 0.25 : u > 0.75 ? Math.max(0, (1 - u) / 0.25) : 1; s.mark.material.opacity = 0; s.m.visible = true; s.m.scale.y = k;
        if (!s.up){ s.up = true; events.push({ type: 'rockLand', at: { x: s.x, y: stageY } }); fx.burst({ x: s.x, y: stageY + 0.6 }, 8, 0xc8f4ff); }
        if (!s.hit && k > 0.6 && Math.abs(P.x - s.x) < 0.7 && P.y < stageY + 1.6 && P.y > stageY - 1 && !isRollInv(P)){ if (hurt(P, 1, s.x, 'Spiked')) s.hit = true; }
        if (u >= 1){ scene.remove(s.m); scene.remove(s.mark); B.spikes.splice(i, 1); } }
    }
    for (let i = B.ice.length - 1; i >= 0; i--){
      const c = B.ice[i]; c.t += dt; c.mark.material.opacity = 0.5 + 0.4 * Math.sin(c.t * 24);
      if (c.t >= W.breath.warn){ c.m.visible = true; c.y -= W.breath.fall * dt; c.m.position.set(c.x, c.y, 0.3);
        if (Math.abs(P.x - c.x) < 0.6 && c.y < P.y + P.h && c.y > P.y && !isRollInv(P)){ hurt(P, 1, c.x, 'Pierced'); c.y = -1e9; }
        if (c.y <= stageY + 0.5){ if (c.y > -1e8){ events.push({ type: 'rockLand', at: { x: c.x, y: stageY } }); fx.burst({ x: c.x, y: stageY + 0.4 }, 8, 0xc8f4ff); } scene.remove(c.m); scene.remove(c.mark); B.ice.splice(i, 1); } }
    }
    // draw it: each piece turned along the way it goes, its back kept up
    const show = B.st !== 'dormant' && B.st !== 'dead' || (B.st === 'dead');
    const place = (m, x, y, a, hide) => { m.visible = show && !hide; m.position.x = x; m.position.y = y; m.rotation.z = a; m.scale.y = Math.abs(m.scale.y) * (Math.cos(a) < 0 ? -1 : 1); };
    let prev = { x: H.x, y: H.y };
    rings.forEach((r, i) => { const p = at(r.d); const a = Math.atan2(prev.y - p.y, prev.x - p.x) + Math.sin(B.tm * 4 - i * 0.7) * 0.05; r.x = p.x; r.y = p.y; place(r.m, p.x, p.y + Math.sin(B.tm * 3 - i * 0.6) * 0.08, a, B.st === 'dead' || (B.st === 'die' && rings.length - i <= B.gone - 1)); prev = p; });
    { const p = at(tailD), a = Math.atan2(prev.y - p.y, prev.x - p.x); place(tail, p.x, p.y, a, B.st === 'dead' || (B.st === 'die' && B.gone > 0)); }
    B.jaw += (open - B.jaw) * Math.min(1, dt * 12);
    const flip = Math.cos(H.a) < 0 ? -1 : 1, ca = Math.cos(H.a), sa = Math.sin(H.a), on = (lx, ly) => [H.x + lx * ca - ly * flip * sa, H.y + lx * sa + ly * flip * ca];
    place(head, H.x, H.y, H.a, false);
    { const ja = H.a - flip * B.jaw * 0.5, [jx, jy] = on(0.55 - B.jaw * 0.2, -0.95 - B.jaw * 0.25); place(jaw, jx, jy, ja, false); }
    const lit = B.st === 'fight' ? 1 : B.st === 'rise' ? Math.min(1, B.tm) : B.st === 'die' ? Math.max(0, 1 - B.tm / 2) : 0;
    { const [ex, ey] = on(0.06, 0.19); eye.position.set(ex, ey, -0.45); eye.material.opacity = lit * (0.8 + 0.2 * Math.sin(B.tm * 7)); eye.material.color.setHex(weak > 0 ? 0xffffff : B.phase === 2 ? 0xff5a50 : 0x7ff6ff); eye.scale.setScalar(1 + weak * 0.6); eye.visible = show; }
    halo.position.set(H.x, H.y, -0.8); halo.material.opacity = weak * (0.35 + 0.15 * Math.sin(B.tm * 9)) + B.flash * 3; halo.visible = show;
    eyeLight.position.set(H.x, H.y + 0.3, 1.0); eyeLight.intensity = show ? lit * 0.9 + weak * 1.2 + B.flash * 4 : 0; eyeLight.color.setHex(B.phase === 2 ? 0xff7060 : 0x9fefff);
    if (show) R.glint(H.x, H.y, B.phase === 2 ? 0xff7060 : 0x9fefff, lit * 0.35 + weak * 0.45 + B.flash * 3, 5.5);
    warn.material.opacity = warnA; warn.scale.set(warnW / 4, 1, 1); warn.position.set(warnX, stageY + (B.mode === 'sweepTell' ? W.sweep.low : 0.25), 0.5);
  };

  // his cut: its head takes it while it is caught in the ice; at any other time it only rings off the scales
  function struck(P, near, dmg, events){
    if (B.st !== 'fight' || !near) return false;
    const H = B.h;
    if (B.mode === 'stuck' || (B.mode === 'pull' && B.mt < 0.2)){
      B.hp -= dmg; B.flash = 0.12; events.push({ type: 'hit', at: { x: H.x - P.face * 0.8, y: Math.min(H.y + 0.6, P.y + 1.3) }, heavy: dmg >= 2 });
      if (B.phase === 1 && B.hp <= W.hp * W.phase2){ B.phase = 2; events.push({ type: 'bossPhase', boss: B }); }
      if (B.hp <= 0){ B.st = 'die'; B.tm = 0; B.gone = 0; B.down = false; H.vx = P.face * 4; H.vy = 9; clear(); events.push({ type: 'bossDie' }); }
    } else events.push({ type: 'block', at: { x: H.x - P.face * 0.8, y: P.y + 1.3 } });
    return true;
  }
  B.strike = (P, reach, dmg, events) => { const H = B.h, ahead = (H.x - P.x) * P.face; return struck(P, ahead > -0.9 && ahead < reach + W.headR && Math.abs(H.y - (P.y + 1.2)) < W.headR + 1.4, dmg, events); };
  B.slam = (P, radius, dmg, events) => { const H = B.h; return struck(P, Math.abs(H.x - P.x) < radius + W.headR && P.y < H.y + 2.6 && P.y > H.y - 2.5, dmg + 1, events); };
  return B;
}
