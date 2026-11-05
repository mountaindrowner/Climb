// Progress that survives a fall and a reload: best height, falls, repaired lifts, beaten Wardens, gold, stash, weapon.
import { DEFAULT_WEAPON } from '../config/weapons.js';

export const SAVE_KEY = 'the-climb-v2';
const fresh = () => ({ best: 0, lifts: [], bosses: [], falls: 0, gold: 0, stash: 0, weapon: DEFAULT_WEAPON });

export const S = fresh();

export function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) Object.assign(S, JSON.parse(raw));
  } catch (e) { /* private mode or blocked storage: play without persistence */ }
  return S;
}
export function save(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
}
export function resetSave(){
  Object.assign(S, fresh());
  save();
}
