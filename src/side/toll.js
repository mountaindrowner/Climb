// The Toll: the Cloister's boss. A great bronze bell with a face cut in it, hung by a chain from a beam that runs along
// the chapel's roof. It is a puppet of flat pieces (tools/boss-parts.py: bell, clapper, beam, chain), moved here.
//   swing   the beam stops over him, the chain pays out until the bell hangs just over the stage, and it swings through
//           where he stood, two or three times: be well to one side, or roll under it as it passes
//   slam    it follows him along the roof, holds (a red mark under it), and drops: get out from under. Then it lies on
//           the stage a while: that is when to cut it (a plunge onto it hurts more). From half health the blow sends a
//           ripple along the stage both ways: jump it
//   toll    from half health it rings, and cinders fall from the roof where red marks show
// It wakes when he stands on the stage, and starts over if he dies.
import { T, LEVEL } from './level.js';
import { hurt, isRollInv } from './motor.js';
import { tex, glow, additive, ease } from './boss.js';
const THREE = window.THREE;
export const TOLL = {
  name: 'The Toll', hp: 26, phase2: 0.5,
  H: 5.4, R: 2.5,                                   // the bell: crown to rim, and the round of its body for what it hits
  idle: 4.6, low: 0.9, high: 6.5,                   // its rim over the stage: at rest, swinging, and before a slam
  swing: { raise: 1.0, arc: 0.95, half: [1.5, 1.2], passes: [2, 3], settle: 0.9 },
  slam: { aim: [1.0, 0.8], track: 10, hold: [0.38, 0.3], drop: 0.13, rest: [1.7, 1.25], lift: 0.7, reach: 2.9 },
  toll: { rings: 3, every: 0.55, warn: 0.8, fall: 17 },
  ripple: { speed: 11, life: 1.1 },
  cd: [1.3, 0.75],
};
const W = TOLL;

export function makeToll(scene, R){
  const room = LEVEL.rooms.find(r => r.name === 'chapel'), mk = LEVEL.marks.find(m => m.type === 'boss');
  if (!room || !mk) return null;
  const stageY = mk.y * T, cx = (mk.x + 0.5) * T, railY = room.y1 - 1.7, D = railY - stageY, xMin = room.x0 + 4, xMax = room.x1 - 4;
  const lenFor = rim => D - rim - W.H;               // the chain's length that puts the rim that far over the stage
  const B = { name: W.name, hint: 'cut it when it lies on the stage', rage: 'it tolls, and the roof answers', fell: 'the way up is open',
    st: 'dormant', tm: 0, hp: W.hp, phase: 1, flash: 0, cd: 1.2, room, stageY, cx, mode: 'idle', mt: 0, px: cx, len: lenFor(13), ang: 0, clap: 0, clapV: 0, n: 0, acts: 0, ripples: [], cinders: [], fall: null };
  const mesh = (file, w, h, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w / 16, h / 16), new THREE.MeshBasicMaterial({ map: tex(`assets/side/toll/${file}.png`), transparent: true, alphaTest: 0.5, color: 0xa8a098 })   /* a little under full, so the bronze does not bloom its face away */); m.position.z = z; m.visible = false; scene.add(m); return m; };
  const bell = mesh('bell', 90, 88, -1), clapper = mesh('clapper', 16, 44, -1.1), beam = mesh('beam', 72, 18, -1.2);
  const chainTex = tex('assets/side/toll/chain.png'); chainTex.wrapT = THREE.RepeatWrapping;
  const chain = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: chainTex, transparent: true, alphaTest: 0.5 })); chain.visible = false; scene.add(chain);
  const eyeTex = glow('rgba(255,200,120,1)'), warnTex = glow('rgba(255,60,50,1)');
  const eyes = [[-0.81, -0.27], [0.81, -0.27]].map(p => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), additive(eyeTex, 0xffb040, 0)); scene.add(m); return { m, p }; });
  const maw = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), additive(eyeTex, 0xffb040, 0)); scene.add(maw);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), additive(eyeTex, 0xff9a40, 0)); scene.add(halo);
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.1), additive(warnTex, 0xff5040, 0)); scene.add(warn);
  const rippleMat = additive(glow('rgba(255,210,140,1)'), 0xffc070, 0.9), rippleGeo = new THREE.PlaneGeometry(1.4, 1.2);
  const cinderGeo = new THREE.PlaneGeometry(0.5, 0.9), cinderMat = additive(eyeTex, 0xff8030, 1), markGeo = new THREE.PlaneGeometry(1.6, 0.6);

  const ph = v => Array.isArray(v) ? v[B.phase - 1] : v, clampX = x => Math.max(xMin, Math.min(xMax, x));
  const go = m => { B.mode = m; B.mt = 0; B.hit = false; };
  // where its parts are: the crown (where the chain ends), the middle of its body, the middle of its rim
  const crown = () => ({ x: B.px + Math.sin(B.ang) * B.len, y: railY - Math.cos(B.ang) * B.len });
  const along = d => { const c = crown(); return { x: c.x + Math.sin(B.ang) * d, y: c.y - Math.cos(B.ang) * d }; };
  const body = () => B.fall ? { x: B.fall.x, y: B.fall.y } : along(W.H * 0.55);
  const touches = P => { const c = body(), nx = Math.max(P.x - 0.34, Math.min(P.x + 0.34, c.x)), ny = Math.max(P.y, Math.min(P.y + P.h, c.y)); return Math.hypot(nx - c.x, ny - c.y) < W.R; };

  B.active = () => B.st === 'rise' || B.st === 'fight' || B.st === 'die';
  B.hud = () => B.active() ? { name: W.name, frac: Math.max(0, B.hp / W.hp), phase: B.phase } : null;
  B.reset = () => {
    Object.assign(B, { st: 'dormant', tm: 0, hp: W.hp, phase: 1, cd: 1.2, mode: 'idle', mt: 0, px: cx, len: lenFor(13), ang: 0, clap: 0, clapV: 0, acts: 0, fall: null });
    for (const r of B.ripples) scene.remove(r.m); B.ripples.length = 0; for (const c of B.cinders){ scene.remove(c.m); scene.remove(c.mark); } B.cinders.length = 0;
  };
  const cinder = x => { const m = new THREE.Mesh(cinderGeo, cinderMat), mark = new THREE.Mesh(markGeo, additive(warnTex, 0xff5040, 0.8)); m.visible = false; mark.position.set(x, stageY + 0.2, 0.4); scene.add(m); scene.add(mark); B.cinders.push({ x, y: room.y1 - 1.5, t: 0, m, mark }); };

  B.step = (P, dt, fx, events) => {
    B.tm += dt; B.mt += dt; B.flash = Math.max(0, B.flash - dt);
    const inRoom = P.x > room.x0 && P.x < room.x1 && P.y > room.y0 && P.y < room.y1;
    let warnA = 0, warnX = B.px, warnW = 6.4, weak = 0, toLen = null, lenK = 3;
    if (B.st === 'dormant'){ if (inRoom && P.grounded && P.y >= stageY - 0.05 && P.y < stageY + 0.5 && P.hp > 0){ B.st = 'rise'; B.tm = 0; events.push({ type: 'bossWake', boss: B }); } }
    else if (B.st === 'rise'){ toLen = lenFor(W.idle); lenK = 1.6; B.ang = Math.sin(B.tm * 3) * 0.12 * Math.max(0, 1 - B.tm / 2.4); if (B.tm > 2.6){ B.st = 'fight'; B.tm = 0; go('idle'); } }
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
    const c = crown(), F = B.fall, rot = F ? F.rot : B.ang, mid = F ? { x: F.x, y: F.y } : along(W.H * 0.5 + 0.05);
    beam.visible = chain.visible = B.st !== 'dormant' || true; beam.position.set(snap(B.px), railY + 0.35, -1.2);
    const cl = F ? Math.max(0.5, B.len * 0.35) : B.len, ca = F ? Math.sin(B.tm * 3) * 0.2 * Math.max(0, 1 - B.tm) : B.ang;
    chain.position.set(B.px + Math.sin(ca) * cl / 2, railY - Math.cos(ca) * cl / 2, -1.15); chain.rotation.z = ca; chain.scale.set(0.5, cl, 1); chainTex.repeat.set(1, cl);
    bell.visible = clapper.visible = true; bell.position.set(snap(mid.x), snap(mid.y), -1); bell.rotation.z = rot;
    const ca2 = rot + (F ? 0 : B.clap); clapper.position.set(mid.x + Math.sin(ca2) * 1.9 + Math.sin(rot) * 0.2, mid.y - Math.cos(ca2) * 1.9, -1.1); clapper.rotation.z = ca2;
    const lit = B.st === 'fight' ? 1 : B.st === 'rise' ? Math.min(1, B.tm / 1.2) : B.st === 'die' ? Math.max(0, 1 - B.tm / 1.6) : 0;
    const col = weak > 0 ? 0xfff0a0 : B.phase === 2 ? 0xff5030 : 0xffb040, k = lit * (0.75 + 0.2 * Math.sin(B.tm * 6)) + weak * 0.3, cs = Math.cos(rot), sn = Math.sin(rot);
    for (const e of eyes){ e.m.position.set(mid.x + e.p[0] * cs - e.p[1] * sn, mid.y + e.p[0] * sn + e.p[1] * cs, -0.95); e.m.rotation.z = rot; e.m.material.opacity = k; e.m.material.color.setHex(col); }
    maw.position.set(mid.x + 1.25 * sn, mid.y - 1.25 * cs, -0.95); maw.rotation.z = rot; maw.material.opacity = k * 0.8; maw.material.color.setHex(col);
    halo.position.set(mid.x, mid.y, -1.3); halo.material.opacity = lit * 0.18 + weak * (0.3 + 0.15 * Math.sin(B.tm * 9)) + B.flash * 3; halo.material.color.setHex(weak > 0 ? 0xffe090 : 0xff9a40);
    warn.material.opacity = warnA; warn.scale.set(warnW / 6.4, 1, 1); warn.position.set(warnX, stageY + 0.25, 0.5);
    R.glint(mid.x, mid.y, col, lit * 0.45 + weak * 0.35 + B.flash * 3, 6.5);   // the light in it
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
