// Input: what is held and what was just pressed. A thumb stick on the left (move, crouch), four buttons on the right
// (jump, attack, block, roll), the flask between. A keyboard map for desktop. Gameplay reads IN.held and consume().
import { menuOpen } from '../ui/overlay.js';
import { save } from './save.js';
import { ac } from '../audio/sfx.js';

export const ACTIONS = ['left', 'right', 'down', 'jump', 'attack', 'block', 'roll', 'flask'];
export const IN = { held: Object.fromEntries(ACTIONS.map(a => [a, false])), pressed: new Set(), at: {} };
const keyHeld = Object.fromEntries(ACTIONS.map(a => [a, false]));
const padHeld = Object.fromEntries(ACTIONS.map(a => [a, false]));
const botHeld = Object.fromEntries(ACTIONS.map(a => [a, false]));
function sync(a){
  const was = IN.held[a];
  IN.held[a] = keyHeld[a] || padHeld[a] || botHeld[a];
  if (IN.held[a] && !was){ IN.pressed.add(a); IN.at[a] = performance.now() / 1000; }
}
export function consume(a){ if (IN.pressed.has(a)){ IN.pressed.delete(a); return true; } return false; }
export function endFrame(){ IN.pressed.clear(); }
// for scripted play (the test bot) and older callers
export function hold(a, v){ botHeld[a] = !!v; sync(a); }
export function tap(a){ hold(a, true); hold(a, false); IN.pressed.add(a); }
export function release(){ for (const a of ACTIONS){ keyHeld[a] = padHeld[a] = botHeld[a] = false; IN.held[a] = false; } }

export const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump',
  j: 'attack', J: 'attack', z: 'attack', Z: 'attack',
  k: 'block', K: 'block', x: 'block', X: 'block',
  l: 'roll', L: 'roll', c: 'roll', C: 'roll', Shift: 'roll',
  f: 'flask', F: 'flask', q: 'flask', Q: 'flask',
};

export function bindInput(){
  // buttons: held while a finger is on them
  document.querySelectorAll('.btn[data-k]').forEach(b => {
    const a = b.dataset.k, fingers = new Set();
    const set = () => { padHeld[a] = fingers.size > 0; b.classList.toggle('on', padHeld[a]); sync(a); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); ac(); b.setPointerCapture?.(e.pointerId); fingers.add(e.pointerId); set(); });
    const up = e => { fingers.delete(e.pointerId); set(); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); tap(a); } });
  });
  // the stick: a fixed centre; left or right of it moves, below it crouches, and both together crouch-walk
  const stick = document.getElementById('stick'), knob = stick && stick.querySelector('.knob');
  if (stick){
    let id = null;
    const read = e => {
      const r = stick.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      padHeld.left = dx < -0.2; padHeld.right = dx > 0.2; padHeld.down = dy > 0.38;
      if (knob) knob.style.transform = `translate(${Math.max(-1, Math.min(1, dx)) * 36}%, ${Math.max(-1, Math.min(1, dy)) * 30}%)`;
      ['left', 'right', 'down'].forEach(sync);
      stick.dataset.dir = (padHeld.left ? 'l' : padHeld.right ? 'r' : '') + (padHeld.down ? 'd' : '');
    };
    const end = () => { id = null; padHeld.left = padHeld.right = padHeld.down = false; ['left', 'right', 'down'].forEach(sync); if (knob) knob.style.transform = ''; stick.dataset.dir = ''; };
    stick.addEventListener('pointerdown', e => { e.preventDefault(); ac(); id = e.pointerId; stick.setPointerCapture?.(id); read(e); });
    stick.addEventListener('pointermove', e => { if (e.pointerId === id) read(e); });
    stick.addEventListener('pointerup', e => { if (e.pointerId === id) end(); });
    stick.addEventListener('pointercancel', end);
  }
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden){ save(); release(); } });
  window.addEventListener('blur', release);
  const key = (e, v) => {
    const a = KEYMAP[e.key]; if (!a) return;
    if (v && menuOpen()) return;
    e.preventDefault(); if (e.repeat) return;
    ac(); keyHeld[a] = v; sync(a);
    const b = document.querySelector(`.btn[data-k="${a}"]`); if (b) b.classList.toggle('on', v);
  };
  window.addEventListener('keydown', e => key(e, true));
  window.addEventListener('keyup', e => key(e, false));
}
