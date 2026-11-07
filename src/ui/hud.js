// The sharp 2D layer over the pixelated 3D view: health, gold, height, the height meter, prompts, timing rings, toasts and hints.
import { say } from '../core/prompts.js';
import { FH, ZF, MPU, LIFT_FLIGHT, CAMP_FLIGHT, BOSS_FLIGHT, R, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { clamp } from '../core/math.js';
import { S } from '../save/store.js';
import { ST } from '../core/state.js';
import { hx, view, camera } from '../render/renderer.js';
import { posOf, zoneOf, kAtY, flightY, landingY, forkFrom } from '../world/path.js';
import { switchbackOf } from '../world/decks.js';
import { OATHS, OATH_IDS, MARK_SLOTS } from '../config/run.js';
import { content } from '../world/generate.js';
import { ENTITIES } from '../entities/registry.js';
import { head } from '../entities/player/player.js';
import { bossTop } from '../wardens/warden.js';
const THREE = window.THREE;
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
const FONT = '"Pixelify Sans", sans-serif';

export function toScreen(p){ _v.copy(p).project(camera); return { x: (_v.x + 1) / 2 * view.W, y: (1 - _v.y) / 2 * view.H, ok: _v.z < 1 }; }
function wrap(text, maxW){
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words){ const t = cur ? cur + ' ' + w : w; if (hx.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
// A shrinking ring over the warrior's head that closes at the moment to press `label`.
export function drawTiming(label, t, dur){
  label = say(label);
  const s = toScreen(head(3.2)); if (!s.ok) return;
  const q = clamp(t / dur, 0, 1), r = 14 + (1 - q) * 34;
  hx.strokeStyle = 'rgba(239,230,210,0.9)'; hx.lineWidth = 2; hx.beginPath(); hx.arc(s.x, s.y, r, 0, 7); hx.stroke();
  hx.strokeStyle = 'rgba(232,176,74,0.95)'; hx.beginPath(); hx.arc(s.x, s.y, 14, 0, 7); hx.stroke();
  hx.fillStyle = '#efe6d2'; hx.font = `700 ${label.length > 2 ? 11 : 16}px ${FONT}`; hx.textAlign = 'center'; hx.textBaseline = 'middle';
  hx.fillText(label, s.x, s.y + 1); hx.textAlign = 'left'; hx.textBaseline = 'alphabetic';
}
export function drawIcon(p, label, color){
  label = say(label);
  const s = toScreen(p); if (!s.ok) return;
  const pz = 1 + 0.12 * Math.sin(ST.time * 14);
  hx.fillStyle = 'rgba(9,8,12,0.78)'; hx.beginPath(); hx.arc(s.x, s.y, 15 * pz, 0, 7); hx.fill();
  hx.strokeStyle = color; hx.lineWidth = 2.5; hx.stroke();
  hx.fillStyle = color; hx.font = `700 ${label.length > 2 ? 11 : 16}px ${FONT}`; /* a key name (Space, Shift) is longer than a glyph */ hx.textAlign = 'center'; hx.textBaseline = 'middle';
  hx.fillText(label, s.x, s.y + 1); hx.textAlign = 'left'; hx.textBaseline = 'alphabetic';
}
const HUD_API = { drawIcon, drawTiming };

// The height meter down the right edge: this zone's lift, rest stop and Warden, your best, and you.
function drawMeter(y){
  const { W, H } = view;
  const zk = zoneOf(kAtY(y)), k0 = zk * ZF, k1 = k0 + BOSS_FLIGHT;
  const y0 = flightY(k0), y1 = landingY(k1);
  const X = W - 14, T = 64, Bm = H - 70;
  const map = v => Bm - clamp((v - y0) / (y1 - y0), 0, 1) * (Bm - T);
  hx.fillStyle = 'rgba(9,8,12,0.6)'; hx.fillRect(X - 3, T - 4, 6, Bm - T + 8);
  hx.fillStyle = '#3a3448'; hx.fillRect(X - 1, T, 2, Bm - T);
  const lk = k0 + LIFT_FLIGHT, ck = k0 + CAMP_FLIGHT;
  hx.fillStyle = S.lifts.includes(lk) ? '#e8b04a' : '#6b6378'; hx.fillRect(X - 5, map(landingY(lk)) - 3, 10, 6);
  hx.fillStyle = '#ff9a3c'; hx.fillRect(X - 4, map(landingY(ck)) - 4, 8, 8);
  hx.fillStyle = S.bosses.includes(k1) ? '#6b6378' : '#d9483b'; hx.fillRect(X - 6, T - 6, 12, 12);
  hx.fillStyle = '#09080c'; hx.fillRect(X - 3, T - 3, 2, 2); hx.fillRect(X + 1, T - 3, 2, 2);
  if (S.best > 0){ const by = map(S.best / MPU); hx.fillStyle = 'rgba(239,230,210,0.6)'; hx.fillRect(X - 7, by, 14, 2); }
  const py = map(y);
  hx.fillStyle = '#efe6d2'; hx.beginPath(); hx.moveTo(X - 12, py - 5); hx.lineTo(X - 5, py); hx.lineTo(X - 12, py + 5); hx.fill();
}
const grainC = document.createElement('canvas'); grainC.width = grainC.height = 96;
(() => { const g = grainC.getContext('2d'), im = g.createImageData(96, 96), d = im.data; for (let i = 0; i < d.length; i += 4){ const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } g.putImageData(im, 0, 0); })();
let grainPat = null;

export function drawHUD(){
  const { W, H } = view, { mode, G, B, FALL, time } = ST;
  hx.clearRect(0, 0, W, H);
  // vignette and film grain
  const vg = hx.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.32, W / 2, H * 0.5, Math.max(W, H) * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  hx.fillStyle = vg; hx.fillRect(0, 0, W, H);
  if (!grainPat) grainPat = hx.createPattern(grainC, 'repeat');
  hx.save(); hx.globalAlpha = 0.06; hx.globalCompositeOperation = 'overlay';
  hx.translate((Math.random() * 96) | 0, (Math.random() * 96) | 0); hx.fillStyle = grainPat; hx.fillRect(-96, -96, W + 192, H + 192);
  hx.restore();
  hx.textBaseline = 'alphabetic';
  if (ST.flash > 0){ hx.fillStyle = `rgba(217,72,59,${ST.flash * 0.55})`; hx.fillRect(0, 0, W, H); }
  else if (ST.flash < 0){ hx.fillStyle = `rgba(159,208,255,${-ST.flash * 0.55})`; hx.fillRect(0, 0, W, H); }
  if (ST.slowmo < 1){ hx.fillStyle = 'rgba(232,176,74,0.07)'; hx.fillRect(0, 0, W, H); }
  if (G && mode !== 'title'){
    for (let i = 0; i < G.maxHp; i++){
      const x = 12 + i * 20, y = 12;
      hx.fillStyle = '#09080c'; hx.fillRect(x, y + 3, 16, 16);
      hx.fillStyle = i < G.hp ? '#d9483b' : '#3a2f3a'; hx.fillRect(x, y, 16, 16);
      if (i < G.hp){ hx.fillStyle = '#ff8a78'; hx.fillRect(x + 3, y + 3, 5, 4); }
    }
    hx.font = `600 15px ${FONT}`;
    hx.fillStyle = '#e8b04a'; hx.fillText('◆ ' + G.gold, 12, 48);
    let hxX = 12 + hx.measureText('◆ ' + G.gold).width + 14;
    hx.fillStyle = '#5ce1c6'; hx.fillText('flask ' + G.flask, hxX, 48); hxX += hx.measureText('flask ' + G.flask).width + 14;
    if (G.well != null){ hx.fillStyle = '#7cf0d8'; hx.fillText('✦ ' + G.well, hxX, 48); }
    // the oaths sworn this climb, and the marks carried
    if (G.oaths){
      hx.font = `600 12px ${FONT}`; let ox = 12;
      for (const id of OATH_IDS){ const n = G.oaths[id]; if (!n) continue; const t = OATHS[id].name + ' ' + n; hx.fillStyle = OATHS[id].color; hx.fillText(t, ox, 66); ox += hx.measureText(t).width + 12; }
      if (G.marks && G.marks.length){ hx.fillStyle = '#c7bed2'; hx.fillText('marks ' + G.marks.length + '/' + MARK_SLOTS, ox, 66); }
    }
    const y = mode === 'fall' && FALL ? FALL.y : mode === 'pool' ? 0 : G.y;
    const m = Math.max(0, Math.floor(y * MPU));
    hx.textAlign = 'right';
    hx.fillStyle = '#09080c'; hx.font = `700 28px ${FONT}`; hx.fillText(m + ' m', W - 30, 36);
    hx.fillStyle = '#efe6d2'; hx.fillText(m + ' m', W - 30, 34);
    hx.fillStyle = '#968ca3'; hx.font = `400 13px ${FONT}`; hx.fillText('best ' + S.best + ' m', W - 30, 50);
    hx.textAlign = 'left';
    drawMeter(y);
  }
  if (G && mode === 'climb'){
    for (const c of content.values()) for (const o of c.obs){
      const e = ENTITIES[o.type]; if (e.hud) e.hud(o, o.s - G.s, HUD_API);
    }
  }
  if (B){
    const bw = W * 0.7, bx = (W - bw) / 2, by = 66;
    hx.fillStyle = '#efe6d2'; hx.font = `600 14px ${FONT}`; hx.textAlign = 'center';
    hx.fillText(B.name, W / 2, by - 4); hx.textAlign = 'left';
    hx.fillStyle = '#09080c'; hx.fillRect(bx, by, bw, 10);
    hx.fillStyle = B.phase === 2 ? '#d9483b' : '#a07cff'; hx.fillRect(bx + 2, by + 2, (bw - 4) * B.hp / B.max, 6);
    hx.fillStyle = 'rgba(239,230,210,0.5)'; hx.fillRect(bx + bw / 2, by, 2, 10);
    if (B.phase === 1){ // phase 2 drops the prompts
      const prompt = B.moves.attacks[B.atk] && B.moves.attacks[B.atk].prompt;
      if (B.st === 'tele') drawTiming(prompt, B.tm, B.atk === 'spit' ? B.T + TUNE.warden.spitFlight : B.T);
      if (B.st === 'orb' && B.orb && !B.orb.back) drawTiming('B', B.T + B.orb.t, B.T + B.orb.dur);
      if (B.st === 'opening' && Math.abs(B.s - G.s) < TUNE.warden.hitRange + 1.5) drawIcon(bossTop(), 'A', '#e8b04a');
    }
  }
  hx.textAlign = 'center';
  for (const f of ST.floats){
    const s = toScreen(_v2.copy(f.p).setY(f.p.y + 1.0 + (f.lift || 0) + f.t * 0.9)); if (!s.ok) continue;   // above the action, not on it
    hx.globalAlpha = clamp(1 - f.t / 1.1, 0, 1) * 0.92; hx.font = `700 14px ${FONT}`;
    hx.fillStyle = '#09080c'; hx.fillText(f.text, s.x, s.y + 2); hx.fillStyle = f.color; hx.fillText(f.text, s.x, s.y);
  }
  hx.globalAlpha = 1; hx.textAlign = 'left';
  const toast = ST.paused ? null : ST.toast;   // paused: the menu has the screen
  if (toast){
    const a = toast.t < 0.25 ? toast.t / 0.25 : toast.t > toast.dur - 0.4 ? (toast.dur - toast.t) / 0.4 : 1;
    hx.globalAlpha = clamp(a, 0, 1); hx.textAlign = 'center';
    hx.fillStyle = '#09080c'; hx.font = `700 30px ${FONT}`; hx.fillText(say(toast.text), W / 2, H * 0.2 + 3);
    hx.fillStyle = '#efe6d2'; hx.fillText(say(toast.text), W / 2, H * 0.2);
    if (toast.sub){ hx.fillStyle = '#c7bed2'; hx.font = `400 15px ${FONT}`; hx.fillText(say(toast.sub), W / 2, H * 0.2 + 24); }
    hx.textAlign = 'left'; hx.globalAlpha = 1;
  }
  if (ST.hint && mode === 'climb' && !ST.paused){
    hx.font = `600 15px ${FONT}`;
    const lines = wrap(say(ST.hint), W - 64), lh = 19, bh = lines.length * lh + 16, by = H - bh - 14;
    hx.fillStyle = 'rgba(9,8,12,0.82)'; hx.fillRect(20, by, W - 40, bh);
    hx.fillStyle = '#e8b04a'; hx.fillRect(20, by, 4, bh);
    hx.fillStyle = '#efe6d2'; lines.forEach((l, i) => hx.fillText(l, 34, by + 22 + i * lh));
  }
  // a fork: mark the switchback's first ledge while he stands on the fork landing
  if (mode === 'climb' && G && G.s < 100000 && G.grounded && !G.on){
    const p = posOf(G.s), b = p.land && forkFrom(p.k), sw = b && switchbackOf(b.kA);
    if (sw){ const d = sw.ledges[0], a = (d.s0 + d.s1) / 2 * OMEGA; drawIcon(new THREE.Vector3(R * Math.cos(a), d.top + 0.7, R * Math.sin(a)), '{jump}', '#e8b04a'); }
  }
  if (mode === 'fall'){
    hx.fillStyle = 'rgba(9,8,12,0.7)'; hx.fillRect(0, H - 44, W, 44);
    hx.fillStyle = '#e8b04a'; hx.font = `600 16px ${FONT}`; hx.textAlign = 'center';
    hx.fillText(say('Press {jump} as a root passes your hands'), W / 2, H - 17); hx.textAlign = 'left';
  }
}
