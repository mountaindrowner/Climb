// Pause, settings and controls. Pause (Esc / Start) freezes the climb; settings hold the render size, volume, screen
// shake and rumble; controls list every action's key and pad button, each rebindable by pressing the new one.
// Every screen has a back button (data-back) that Esc / Ⓑ also press.
import { ST } from '../../core/state.js';
import { showMenu, hideMenu, menuOpen, registerActions } from '../overlay.js';
import { SET, saveSettings, resetControls, bindKey, bindPad, REBINDABLE, PAD_REBINDABLE } from '../../core/settings.js';
import { keyName, padName, DEVICE, onDeviceChange } from '../../core/prompts.js';
import { onPause, captureNext, cancelCapture, release } from '../../core/input.js';
import { setVolume } from '../../audio/sfx.js';
import { resize } from '../../render/renderer.js';

const NAMES = { left: 'Move left (down the stair)', right: 'Move right (up the stair)', down: 'Crouch', jump: 'Jump · repair · grab a root',
  attack: 'Attack', block: 'Block (hold) · parry', roll: 'Roll', flask: 'Drink the flask', sprint: 'Sprint (hold)' };
const LINES = [[540, 'Chunky'], [720, 'Classic'], [1080, 'Fine']];
let backTo = 'pause';                 // where settings and controls go back to: the pause menu or the title

// ---- pause
export function togglePause(onlyPause){
  if (ST.paused){ if (!onlyPause) resume(); return; }
  if (!(ST.mode === 'climb' || ST.mode === 'fall') || menuOpen()) return;
  ST.paused = true; release(); pauseMenu();
}
function resume(){ cancelCapture(); hideMenu(); ST.paused = false; }
function pauseMenu(){
  backTo = 'pause';
  showMenu(`<div class="card">
    <h1>Paused</h1>
    <button class="choice go" data-act="unpause" data-back>Resume</button>
    <button class="choice" data-act="settings">Settings</button>
    <button class="choice" data-act="controls">Controls</button>
    <button class="choice" data-act="quit">Leave the climb</button>
    <p class="note">Leaving ends this climb. Repaired lifts stay repaired.</p>
  </div>`);
}
onPause(togglePause);

// ---- settings
export function settingsMenu(from){
  if (from) backTo = from;
  const pct = v => Math.round(v * 100);
  showMenu(`<div class="card">
    <h2>Settings</h2>
    <div class="set-row"><span>Pixels</span><span class="seg">${LINES.map(([n, l]) => `<button class="seg-b${SET.lines === n ? ' on' : ''}" data-act="set-lines" data-n="${n}" aria-pressed="${SET.lines === n}">${l}</button>`).join('')}</span></div>
    <label class="set-row"><span>Volume</span><input type="range" min="0" max="100" step="5" value="${pct(SET.volume)}" data-set="volume" aria-label="Volume"><output>${pct(SET.volume)}%</output></label>
    <label class="set-row"><span>Screen shake</span><input type="range" min="0" max="100" step="10" value="${pct(SET.shake)}" data-set="shake" aria-label="Screen shake"><output>${pct(SET.shake)}%</output></label>
    <div class="set-row"><span>Pad rumble</span><button class="seg-b on-off${SET.rumble ? ' on' : ''}" data-act="set-rumble" aria-pressed="${SET.rumble}">${SET.rumble ? 'On' : 'Off'}</button></div>
    <button class="choice" data-act="controls">Controls</button>
    <button class="choice go" data-act="settings-back" data-back>Back</button>
  </div>`);
  const first = document.querySelector('#overlay .seg-b.on') || document.querySelector('#overlay .seg-b'); if (first) first.focus();
  document.querySelectorAll('#overlay input[data-set]').forEach(el => el.addEventListener('input', () => {
    const v = el.value / 100; SET[el.dataset.set] = v; el.nextElementSibling.textContent = el.value + '%';
    if (el.dataset.set === 'volume') setVolume(v);
    saveSettings();
  }));
}

// ---- controls
let listening = null;   // { action, kind }
export function controlsMenu(){
  const pad = DEVICE.kind === 'ps' || DEVICE.kind === 'xbox' ? DEVICE.kind : 'xbox';
  const row = a => {
    const k = SET.keys[a], p = SET.pad[a];
    const kb = listening && listening.action === a && listening.kind === 'key' ? '<i>press a key…</i>' : k.map(keyName).join(' · ');
    const pb = !PAD_REBINDABLE.includes(a) ? '<span class="dim">stick · d-pad</span>'
      : listening && listening.action === a && listening.kind === 'pad' ? '<i>press a button…</i>' : (p || []).map(i => padName(i, pad)).join(' · ');
    return `<div class="bind-row"><span class="what">${NAMES[a]}</span>
      <button class="bind" data-act="rebind" data-a="${a}" data-kind="key" aria-label="Change the key for ${NAMES[a]}">${kb}</button>
      ${PAD_REBINDABLE.includes(a) ? `<button class="bind" data-act="rebind" data-a="${a}" data-kind="pad" aria-label="Change the pad button for ${NAMES[a]}">${pb}</button>` : `<span class="bind static">${pb}</span>`}</div>`;
  };
  showMenu(`<div class="card wide">
    <h2>Controls</h2>
    <p class="sub">${listening ? (listening.kind === 'key' ? 'Press the new key. Esc cancels.' : 'Press the new button. Start cancels.') : 'Pick an action to change it, then press the new key or button.'}</p>
    <div class="bind-row head"><span></span><span>Keyboard</span><span>${pad === 'ps' ? 'PlayStation' : 'Xbox'} pad</span></div>
    ${REBINDABLE.map(row).join('')}
    <p class="note">Esc or Start pauses. In menus: ↑ ↓ or the d-pad to move, Enter or Ⓐ to pick, Esc or Ⓑ to go back.</p>
    <button class="choice" data-act="controls-reset">Reset to defaults</button>
    <button class="choice go" data-act="controls-back" data-back>Back</button>
  </div>`);
  const b = listening ? document.querySelector(`#overlay [data-a="${listening.action}"][data-kind="${listening.kind}"]`) : document.querySelector('#overlay .bind');
  if (b) b.focus();
}
onDeviceChange(() => { if (menuOpen() && document.querySelector('#overlay .bind-row') && !listening) controlsMenu(); });

registerActions({
  unpause(){ resume(); },
  quit(){ resume(); import('./title.js').then(m => m.titleMenu()); },
  settings(){ settingsMenu(); },
  'settings-back'(){ if (backTo === 'title') import('./title.js').then(m => m.titleMenu()); else pauseMenu(); },
  'set-lines'(b){ SET.lines = +b.dataset.n; saveSettings(); resize(); settingsMenu(); },
  'set-rumble'(){ SET.rumble = !SET.rumble; saveSettings(); settingsMenu(); },
  controls(){ listening = null; controlsMenu(); },
  'controls-back'(){ listening = null; cancelCapture(); settingsMenu(); },
  'controls-reset'(){ listening = null; cancelCapture(); resetControls(); controlsMenu(); },
  rebind(b){
    const action = b.dataset.a, kind = b.dataset.kind;
    listening = { action, kind }; controlsMenu();
    // the click itself came from Enter or Ⓐ: wait a moment so that press is not taken as the new binding
    setTimeout(() => captureNext(kind, v => {
      if (v != null){ if (kind === 'key') bindKey(action, v); else bindPad(action, v); }
      listening = null; controlsMenu();
    }), 180);
  },
});
