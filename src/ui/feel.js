// The feel panel (F9, or #feel / ?feel=1 on the page): each of the movement assists on or off while you play, to feel
// what it does, the way the Dead Cells developer's own game-feel demo works (deepnight/gamefeel). Not saved: a reload
// turns everything back on.
import { FEEL } from '../config/feel.js';
import { FEEL_INPUT } from '../core/input.js';

const ROWS = [
  ['queue', 'Input queue', 'presses wait until they can happen', FEEL_INPUT],
  ['buffer', 'Jump buffer', 'a jump pressed just before landing', FEEL],
  ['coyote', 'Coyote time', 'a jump just after leaving the ground', FEEL],
  ['doubleJump', 'Double jump', 'once in the air', FEEL],
  ['launch', 'Launch float', 'gravity eases in after take-off', FEEL],
  ['airFade', 'Air control fade', 'steering weakens in a long fall', FEEL],
  ['ledge', 'Ledge grab', 'catch an edge and haul up', FEEL],
  ['turn', 'Free turn', 'turn early in a swing', FEEL],
  ['aim', 'Aim', 'a swing turns to a foe behind', FEEL],
  ['rollCancel', 'Roll cancels', 'roll out of anything; attack or jump out of a roll', FEEL],
  ['dive', 'Plunge', 'down + attack in the air', FEEL],
];
let el = null;
function build(){
  el = document.createElement('div');
  el.id = 'feel';
  el.style.cssText = 'position:fixed;left:12px;top:90px;z-index:50;background:rgba(9,8,12,0.88);color:#efe6d2;font:12px/1.35 system-ui,sans-serif;padding:10px 12px;border:1px solid #3a3448;border-radius:6px;max-width:260px';
  el.innerHTML = '<div style="font-weight:700;margin-bottom:6px">Feel (F9)</div>' + ROWS.map(([k, name, help]) =>
    `<label style="display:block;margin:3px 0;cursor:pointer"><input type="checkbox" data-k="${k}" style="vertical-align:-2px;margin-right:6px">${name}<div style="color:#968ca3;font-size:11px;margin-left:20px">${help}</div></label>`).join('');
  el.addEventListener('change', e => { const k = e.target.dataset.k, row = ROWS.find(r => r[0] === k); if (row) row[3][k] = e.target.checked; e.target.blur(); });
  document.body.appendChild(el);
}
export function toggleFeel(show){
  if (!el) build();
  const on = show == null ? el.style.display === 'none' || !el.dataset.shown : show;
  el.dataset.shown = '1'; el.style.display = on ? 'block' : 'none';
  if (on) for (const [k, , , obj] of ROWS) el.querySelector(`[data-k="${k}"]`).checked = !!obj[k];
}
if (typeof window !== 'undefined'){
  window.addEventListener('keydown', e => { if (e.code === 'F9'){ e.preventDefault(); toggleFeel(); } });
  const loc = window.location;
  if (/feel/.test(loc.hash) || new URLSearchParams(loc.search).get('feel') === '1') addEventListener('load', () => toggleFeel(true));
}
