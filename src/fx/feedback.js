// Screen feedback: freeze-frames, shake, camera dip, flashes, toasts and floating text.
import { ST } from '../core/state.js';

export function setToast(text, sub, dur){ ST.toast = { text, sub: sub || '', t: 0, dur: dur || 2.2 }; }
export function float(text, p, color){ ST.floats.push({ text, p: p.clone(), t: 0, color: color || '#efe6d2' }); }
export function hitstop(t){ ST.hitstop = Math.max(ST.hitstop, t); }
export function shake(v){ ST.shake = Math.max(ST.shake, v); }
export function flash(v){ ST.flash = v; }

export function updateFeedback(dt){
  if (ST.toast){ ST.toast.t += dt; if (ST.toast.t > ST.toast.dur) ST.toast = null; }
  for (let i = ST.floats.length - 1; i >= 0; i--){ ST.floats[i].t += dt; if (ST.floats[i].t > 1.1) ST.floats.splice(i, 1); }
  ST.shake *= Math.exp(-dt * 10); if (ST.shake < 0.01) ST.shake = 0;
  ST.dip *= Math.exp(-dt * 14);
  if (ST.flash > 0) ST.flash = Math.max(0, ST.flash - dt); else if (ST.flash < 0) ST.flash = Math.min(0, ST.flash + dt);
}
