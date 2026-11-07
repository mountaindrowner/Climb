// Hit juice: what a landed blow looks and sounds like. A white-gold flash at the point of contact, a shock ring, two
// slash streaks along the swing, sparks, the struck thing flashing white, a short freeze, a shake and a small push in,
// and a weighty thump under the hit sound. Runs on real time, so it plays across the freeze-frame it starts.
import { scene } from '../render/renderer.js';
import { burst } from '../render/particles.js';
import { ST } from '../core/state.js';
import { TUNE } from '../config/tuning.js';
import { sfx } from '../audio/sfx.js';
import { hitstop, shake } from './feedback.js';
const THREE = window.THREE;

function canvasTex(draw, w = 64, h = 64){
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}
const STAR = canvasTex((g, w, h) => {             // a hot core and four spikes
  const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(255,240,200,0.9)'); r.addColorStop(0.5, 'rgba(255,190,90,0.25)'); r.addColorStop(1, 'rgba(255,160,60,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,250,230,0.95)';
  for (const [x, y, ww, hh] of [[w / 2 - 1.5, 0, 3, h], [0, h / 2 - 1.5, w, 3]]) g.fillRect(x, y, ww, hh);
});
const RING = canvasTex((g, w, h) => { g.strokeStyle = 'rgba(255,235,200,1)'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.stroke(); });
const STREAK = canvasTex((g, w, h) => {           // a thin blade of light, bright in the middle, tapered at both ends
  const r = g.createLinearGradient(0, 0, w, 0);
  r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.5, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w / 2, h / 2 - 3); g.lineTo(w, h / 2); g.lineTo(w / 2, h / 2 + 3); g.closePath(); g.fill();
}, 128, 16);
const live = [], flashing = [];
function sprite(tex, color){
  const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(m); s.renderOrder = 10; scene.add(s); return s;
}
// pos: world point of contact; angle: the swing's direction on screen (radians); heavy: a finishing or heavy blow;
// target: the struck thing's 3D root, to flash white
export function impact(pos, angle = 0, { heavy = false, target = null } = {}){
  const k = heavy ? 1.35 : 1;
  const star = sprite(STAR, 0xffffff); star.position.copy(pos); live.push({ s: star, t: 0, life: 0.16, grow: [0.5 * k, 1.9 * k] });
  const ring = sprite(RING, 0xffd9a0); ring.position.copy(pos); live.push({ s: ring, t: 0, life: 0.22, grow: [0.3 * k, 2.4 * k] });
  for (const [da, len] of [[0, 2.6], [1.15, 1.5]]){
    const st = sprite(STREAK, da ? 0xffe2b0 : 0xffffff); st.position.copy(pos); st.material.rotation = angle + da;
    live.push({ s: st, t: 0, life: 0.13, grow: [len * 0.4 * k, len * k], thin: 0.22 * k });
  }
  burst(pos, heavy ? 22 : 14, '#ffd27a', heavy ? 6 : 4.5, 7, 0.06);
  burst(pos, 6, '#ffffff', 2.5, 2, 0.05);
  if (target) flashWhite(target, heavy ? 0.16 : 0.11);
  hitstop(heavy ? TUNE.feel.hitstopKill : TUNE.feel.hitstopHit + 0.02);
  shake(heavy ? 0.28 : 0.17); ST.punch = Math.max(ST.punch || 0, heavy ? 1 : 0.55);
  sfx.impact(heavy);
}
// the struck thing goes white for a moment (each creature builds its own materials, so only it flashes)
function flashWhite(root, dur){
  root.traverse(o => {
    if (!o.isMesh || !o.material || !o.material.emissive) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats){ if (flashing.some(f => f.m === m)) continue; flashing.push({ m, was: m.emissive.getHex(), t: 0, dur }); m.emissive.setHex(0xffffff); }
  });
}
export function updateImpacts(dt){
  for (let i = live.length - 1; i >= 0; i--){
    const e = live[i]; e.t += dt; const u = Math.min(1, e.t / e.life);
    const sc = e.grow[0] + (e.grow[1] - e.grow[0]) * (1 - (1 - u) * (1 - u));
    e.s.scale.set(sc, e.thin ? e.thin * (1 - u * 0.6) : sc, 1); e.s.material.opacity = 1 - u * u;
    if (u >= 1){ scene.remove(e.s); e.s.material.dispose(); live.splice(i, 1); }
  }
  for (let i = flashing.length - 1; i >= 0; i--){
    const f = flashing[i]; f.t += dt; const u = Math.min(1, f.t / f.dur);
    f.m.emissive.setHex(0xffffff).lerp(new THREE.Color(f.was), u);
    if (u >= 1){ f.m.emissive.setHex(f.was); flashing.splice(i, 1); }
  }
}
