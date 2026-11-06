// Button prompts that match the device in your hands. Text names actions as tokens, {jump} {attack} {block} {roll}
// {down} {left} {right} {flask} {sprint}; say() renders them for whatever was used last: the touch pad's glyphs, your keys
// (as you bound them), or the buttons on an Xbox or PlayStation pad.
import { SET } from './settings.js';

const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
export const DEVICE = { kind: coarse ? 'touch' : 'keys' };
const listeners = new Set();
export const onDeviceChange = f => listeners.add(f);
export function setDevice(kind){ if (DEVICE.kind === kind) return; DEVICE.kind = kind; for (const f of listeners) f(kind); }

const TOUCH = { left: '◀', right: '▶', down: '▼', jump: '▲', attack: 'A', block: 'B', roll: '⟳', flask: 'flask', sprint: 'push ◀ ▶ all the way' };
const XBOX = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'LS', 'RS', '↑', '↓', '←', '→'];
const PS = ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Share', 'Options', 'L3', 'R3', '↑', '↓', '←', '→'];
const STICK = { left: '←', right: '→', down: '↓' };
const NAMED = { Space: 'Space', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ShiftLeft: 'Shift', ShiftRight: 'Shift',
  ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt', Enter: 'Enter', Tab: 'Tab', Backspace: 'Bksp',
  Escape: 'Esc', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', BracketLeft: '[', BracketRight: ']', Backquote: '`' };
export function keyName(code){
  if (!code) return '—';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  return NAMED[code] || code;
}
export const padName = (i, kind = DEVICE.kind) => i == null ? '—' : ((kind === 'ps' ? PS : XBOX)[i] || 'B' + i);
export function label(action, kind = DEVICE.kind){
  if (kind === 'touch') return TOUCH[action] || action;
  if (kind === 'keys') return keyName((SET.keys[action] || [])[0]);
  if (STICK[action]) return STICK[action];
  return padName((SET.pad[action] || [])[0], kind);
}
export const say = s => String(s).replace(/\{(\w+)\}/g, (m, a) => label(a));
export const sayHTML = s => String(s).replace(/\{(\w+)\}/g, (m, a) => `<b class="key">${label(a)}</b>`);
