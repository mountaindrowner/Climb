// Player settings: key and gamepad bindings, render size, volume, screen shake, rumble. Kept apart from the save (a
// per-device preference, not progress), under its own storage key, so resetting progress never resets the controls.
const KEY = 'the-climb-settings';

// Keyboard bindings by KeyboardEvent.code (layout-independent: the key in that place on any keyboard). The first
// binding of each action is the one prompts show. Gamepad bindings are standard-mapping button indices
// (0 A/✕, 1 B/○, 2 X/□, 3 Y/△, 4 LB/L1, 5 RB/R1, 6 LT/L2, 7 RT/R2, 10 LS/L3); moving is always the left stick and the d-pad.
export const DEFAULTS = {
  keys: {
    left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], down: ['KeyS', 'ArrowDown'],
    jump: ['Space', 'KeyW', 'ArrowUp'], attack: ['KeyJ', 'KeyZ'], block: ['KeyK', 'KeyX'],
    roll: ['KeyL', 'KeyC'], flask: ['KeyF', 'KeyQ'], sprint: ['ShiftLeft', 'ShiftRight'],
  },
  pad: { jump: [0], roll: [1, 5], attack: [2, 7], flask: [3], block: [4, 6], sprint: [10] },
  lines: 720,       // internal render height: 540 chunky, 720 classic, 1080 fine
  volume: 0.8, shake: 1, rumble: true,
};
export const REBINDABLE = ['left', 'right', 'down', 'jump', 'attack', 'block', 'roll', 'flask', 'sprint'];
export const PAD_REBINDABLE = ['jump', 'attack', 'block', 'roll', 'flask', 'sprint'];
const clone = o => JSON.parse(JSON.stringify(o));

function load(){
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  const out = clone(DEFAULTS);
  for (const k of ['lines', 'volume', 'shake', 'rumble']) if (s[k] !== undefined) out[k] = s[k];
  for (const k of ['keys', 'pad']) if (s[k]) for (const a in out[k]) if (Array.isArray(s[k][a])) out[k][a] = s[k][a];
  // an action added since the controls were saved keeps its defaults, and takes them back from whatever had them then
  for (const k of ['keys', 'pad']) if (s[k]) for (const a in DEFAULTS[k]) if (!Array.isArray(s[k][a]))
    for (const b in out[k]) if (b !== a) out[k][b] = out[k][b].filter(c => !DEFAULTS[k][a].includes(c));
  return out;
}
export const SET = load();
export function saveSettings(){ try { localStorage.setItem(KEY, JSON.stringify(SET)); } catch (e) {} }
export function resetControls(){ SET.keys = clone(DEFAULTS.keys); SET.pad = clone(DEFAULTS.pad); saveSettings(); }
// Give an action a new primary key (or pad button); whoever had it loses it, so one input never does two things.
export function bindKey(action, code){
  for (const a in SET.keys) SET.keys[a] = SET.keys[a].filter(c => c !== code);
  SET.keys[action] = [code, ...SET.keys[action]].slice(0, 3); saveSettings();
}
export function bindPad(action, button){
  for (const a in SET.pad) SET.pad[a] = SET.pad[a].filter(b => b !== button);
  SET.pad[action] = [button, ...(SET.pad[action] || [])].slice(0, 2); saveSettings();
}
