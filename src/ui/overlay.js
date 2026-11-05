// The menu overlay over the stage. Screens render HTML into it and register the actions their buttons name (data-act).
import { ac } from '../audio/sfx.js';
import { ST } from '../core/state.js';

const overlay = document.getElementById('overlay');
const pipsEl = document.getElementById('pips');
const ACTIONS = {};

export function registerActions(map){ Object.assign(ACTIONS, map); }
export function showMenu(html){
  overlay.innerHTML = html; overlay.classList.add('show');
  const b = overlay.querySelector('.choice.go, .choice'); if (b) b.focus({ preventScroll: true });
}
export function hideMenu(){ overlay.classList.remove('show'); overlay.innerHTML = ''; }
export const menuOpen = () => overlay.classList.contains('show');
export const overlayData = overlay.dataset;
export function updatePips(){ const G = ST.G; pipsEl.textContent = G ? '●'.repeat(G.flask) + '○'.repeat(Math.max(0, G.flaskMax - G.flask)) : '●●●'; }

overlay.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  ac();
  const fn = ACTIONS[b.dataset.act]; if (fn) fn(b);
});
