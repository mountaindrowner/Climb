// Input: what is held and what was just pressed. Four sources feed the same actions: the keyboard (by physical key, as
// bound in settings), a gamepad (polled each frame), the touch pad (a stick and buttons, on touch screens), and the
// test bot. Gameplay reads IN.held and consume(). Menus are driven by keys or the pad too: up and down move between
// choices, Enter / Ⓐ picks, Esc / Ⓑ goes back, Esc / Start pauses.
import { menuOpen } from '../ui/overlay.js';
import { save } from './save.js';
import { ac } from '../audio/sfx.js';
import { SET } from './settings.js';
import { setDevice } from './prompts.js';

export const ACTIONS = ['left', 'right', 'down', 'jump', 'attack', 'block', 'roll', 'flask'];
// mag: how hard he is asked to move, 0..1 (a stick pushed part way walks; keys and the d-pad are always 1)
export const IN = { held: Object.fromEntries(ACTIONS.map(a => [a, false])), pressed: new Set(), at: {}, mag: 1 };
const blank = () => Object.fromEntries(ACTIONS.map(a => [a, false]));
const keyHeld = blank(), padHeld = blank(), gpHeld = blank(), botHeld = blank();
let gpMag = 1, padMag = 1;
function sync(a){
  const was = IN.held[a];
  IN.held[a] = keyHeld[a] || padHeld[a] || gpHeld[a] || botHeld[a];
  const digital = keyHeld.left || keyHeld.right || botHeld.left || botHeld.right;
  IN.mag = digital ? 1 : gpHeld.left || gpHeld.right ? gpMag : padHeld.left || padHeld.right ? padMag : 1;
  if (IN.held[a] && !was){ IN.pressed.add(a); IN.at[a] = performance.now() / 1000; }
}
const clamp01 = (x, lo) => Math.max(lo, Math.min(1, x));
export function consume(a){ if (IN.pressed.has(a)){ IN.pressed.delete(a); return true; } return false; }
export function endFrame(){ IN.pressed.clear(); }
// for scripted play (the test bot) and older callers
export function hold(a, v){ botHeld[a] = !!v; sync(a); }
export function tap(a){ hold(a, true); hold(a, false); IN.pressed.add(a); }
export function release(){ for (const a of ACTIONS){ keyHeld[a] = padHeld[a] = gpHeld[a] = botHeld[a] = false; IN.held[a] = false; } }

// Hooks the UI sets: what Esc / Start does, and a one-shot capture for rebinding (the next key or pad button).
const hooks = { pause: null, back: null };
export const onPause = f => { hooks.pause = f; };
let capture = null;   // { kind: 'key' | 'pad', fn }
export function captureNext(kind, fn){ capture = { kind, fn }; release(); }
export const capturing = () => !!capture;
export function cancelCapture(){ capture = null; }

// ---- menus: move between the overlay's choices, pick, go back
function focusables(){
  const ov = document.getElementById('overlay');
  return ov ? [...ov.querySelectorAll('button:not([disabled]):not([hidden]), input, select')].filter(e => e.offsetParent !== null) : [];
}
function moveFocus(dir){
  const list = focusables(); if (!list.length) return;
  const i = list.indexOf(document.activeElement);
  list[i < 0 ? 0 : (i + dir + list.length) % list.length].focus({ preventScroll: false });
}
function nudge(dir){   // left / right on a focused slider
  const el = document.activeElement;
  if (el && el.type === 'range'){ dir > 0 ? el.stepUp() : el.stepDown(); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; }
  return false;
}
function pick(){ const el = document.activeElement; if (el && focusables().includes(el)) el.click(); else moveFocus(1); }
function back(){ const b = document.querySelector('#overlay [data-back]'); if (b) b.click(); }

// ---- keyboard, by physical key
function actionOf(code){ for (const a in SET.keys) if (SET.keys[a].includes(code)) return a; return null; }
function key(e, down){
  if (down) setDevice('keys');
  if (capture && capture.kind === 'key' && down){
    e.preventDefault();
    const c = capture; capture = null;
    if (e.code !== 'Escape') c.fn(e.code); else c.fn(null);
    return;
  }
  if (down && e.code === 'Escape'){ e.preventDefault(); if (menuOpen() && document.querySelector('#overlay [data-back]')) back(); else if (hooks.pause) hooks.pause(); return; }
  if (menuOpen()){
    if (!down) return;
    if (e.code === 'ArrowDown' || e.code === 'KeyS'){ e.preventDefault(); moveFocus(1); }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW'){ e.preventDefault(); moveFocus(-1); }
    return;   // Enter and Space on a focused button pick it (the browser does that)
  }
  const a = actionOf(e.code); if (!a) return;
  e.preventDefault(); if (e.repeat) return;
  ac(); keyHeld[a] = down; sync(a);
  const b = document.querySelector(`.btn[data-k="${a}"]`); if (b) b.classList.toggle('on', down);
}

// ---- gamepad: polled once a frame from the main loop
let lastBtn = [], nav = { dir: 0, next: 0 }, pad = null;
export function pollPads(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  pad = null; for (const p of pads) if (p && p.connected){ pad = p; break; }
  if (!pad){ if (ACTIONS.some(a => gpHeld[a])){ for (const a of ACTIONS){ gpHeld[a] = false; sync(a); } } return; }
  const now = pad.buttons.map(b => !!b && (b.pressed || b.value > 0.5)), btn = i => !!now[i], edge = i => now[i] && !lastBtn[i];
  const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
  if (now.some(Boolean) || Math.abs(ax) > 0.5 || Math.abs(ay) > 0.5) setDevice(/playstation|dualsense|dualshock|054c/i.test(pad.id) ? 'ps' : 'xbox');
  if (capture && capture.kind === 'pad'){
    const i = now.findIndex((p, j) => p && !lastBtn[j] && j < 12 && j !== 9 && j !== 8);
    if (edge(9) || edge(8)){ const c = capture; capture = null; c.fn(null); }
    else if (i >= 0){ const c = capture; capture = null; c.fn(i); }
    lastBtn = now; return;
  }
  if (edge(9)){ if (menuOpen() && document.querySelector('#overlay [data-back]')) back(); else if (hooks.pause) hooks.pause(); }
  if (menuOpen()){
    for (const a of ACTIONS) if (gpHeld[a]){ gpHeld[a] = false; sync(a); }
    const dir = btn(13) || ay > 0.6 ? 1 : btn(12) || ay < -0.6 ? -1 : 0, side = btn(15) || ax > 0.6 ? 1 : btn(14) || ax < -0.6 ? -1 : 0;
    const t = performance.now(), d = dir ? dir * 2 : side;   // vertical moves focus; horizontal nudges sliders
    if (d !== nav.dir){ nav.dir = d; nav.next = t + 380; if (dir) moveFocus(dir); else if (side) nudge(side) || moveFocus(side); }
    else if (d && t > nav.next){ nav.next = t + 140; if (dir) moveFocus(dir); else nudge(side) || moveFocus(side); }
    if (edge(0)){ ac(); pick(); }
    if (edge(1)) back();
  } else {
    const dirs = { left: ax < -0.35 || btn(14), right: ax > 0.35 || btn(15), down: ay > 0.55 || btn(13) };
    gpMag = btn(14) || btn(15) ? 1 : clamp01((Math.abs(ax) - 0.25) / 0.6, 0.3);   // the stick part way: a walk
    for (const a of ACTIONS){
      const v = a in dirs ? dirs[a] : (SET.pad[a] || []).some(btn);
      if (v !== gpHeld[a]){ gpHeld[a] = v; if (v) ac(); sync(a); }
    }
  }
  lastBtn = now;
}
// A short buzz on the pad, if it has motors and rumble is on.
export function rumble(strong, weak = strong, ms = 120){
  if (!SET.rumble || !pad || !pad.vibrationActuator || !pad.vibrationActuator.playEffect) return;
  pad.vibrationActuator.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: Math.min(1, strong), weakMagnitude: Math.min(1, weak) }).catch(() => {});
}

export function bindInput(){
  // buttons: held while a finger is on them
  document.querySelectorAll('.btn[data-k]').forEach(b => {
    const a = b.dataset.k, fingers = new Set();
    const set = () => { padHeld[a] = fingers.size > 0; b.classList.toggle('on', padHeld[a]); sync(a); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); ac(); setDevice('touch'); b.setPointerCapture?.(e.pointerId); fingers.add(e.pointerId); set(); });
    const up = e => { fingers.delete(e.pointerId); set(); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
  // the stick: a fixed centre; left or right of it moves, below it crouches, and both together crouch-walk
  const stick = document.getElementById('stick'), knob = stick && stick.querySelector('.knob');
  if (stick){
    let id = null;
    const read = e => {
      const r = stick.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      padHeld.left = dx < -0.2; padHeld.right = dx > 0.2; padHeld.down = dy > 0.38;
      padMag = clamp01((Math.abs(dx) - 0.2) / 0.5, 0.3);
      if (knob) knob.style.transform = `translate(${Math.max(-1, Math.min(1, dx)) * 36}%, ${Math.max(-1, Math.min(1, dy)) * 30}%)`;
      ['left', 'right', 'down'].forEach(sync);
      stick.dataset.dir = (padHeld.left ? 'l' : padHeld.right ? 'r' : '') + (padHeld.down ? 'd' : '');
    };
    const end = () => { id = null; padHeld.left = padHeld.right = padHeld.down = false; ['left', 'right', 'down'].forEach(sync); if (knob) knob.style.transform = ''; stick.dataset.dir = ''; };
    stick.addEventListener('pointerdown', e => { e.preventDefault(); ac(); setDevice('touch'); id = e.pointerId; stick.setPointerCapture?.(id); read(e); });
    stick.addEventListener('pointermove', e => { if (e.pointerId === id) read(e); });
    stick.addEventListener('pointerup', e => { if (e.pointerId === id) end(); });
    stick.addEventListener('pointercancel', end);
  }
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden){ save(); release(); if (hooks.pause) hooks.pause(true); } });
  window.addEventListener('blur', () => { release(); if (hooks.pause) hooks.pause(true); });
  window.addEventListener('keydown', e => key(e, true));
  window.addEventListener('keyup', e => key(e, false));
}
