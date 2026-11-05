// One thumb each side: ▲▼ on the left, B and A on the right, the flask between. Keyboard map for desktop testing.
import { press } from '../entities/player/player.js';
import { menuOpen } from '../ui/overlay.js';
import { save } from './save.js';

export const KEYMAP = {
  ArrowUp: 'up', w: 'up', W: 'up', ' ': 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  j: 'a', J: 'a', z: 'a', Z: 'a',
  k: 'b', K: 'b', x: 'b', X: 'b',
  f: 'flask', F: 'flask', q: 'flask', Q: 'flask',
};
export function bindInput(){
  document.querySelectorAll('.btn').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); press(k); });
    const up = () => b.classList.remove('on');
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); press(k); } });
  });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('keydown', e => {
    if (menuOpen()) return;
    const k = KEYMAP[e.key]; if (!k || e.repeat) return;
    e.preventDefault(); press(k);
    const b = document.querySelector(`.btn[data-k="${k}"]`); if (b){ b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 90); }
  });
}
