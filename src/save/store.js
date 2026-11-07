// Progress that survives a fall and a reload: best height, falls, repaired lifts, beaten Wardens, gold, stash, weapon.
import { DEFAULT_WEAPON } from '../config/weapons.js';
import { migrate, SAVE_VERSION } from './migrations.js';

export const SAVE_KEY = 'the-climb';
// Older keys are read once and migrated, so progress from the prototypes carries over.
const LEGACY_KEYS = ['the-climb-v2', 'the-climb-spiral-v1'];

// `seen` lists the threats whose first-sight hint has been shown. The run layer (config/run.js): `well` banked wellstone,
// `found` blueprints found, `unlocked` blueprints bought, `upgrades` the Pool's upgrades by tier, `runes` route-openers.
export const fresh = () => ({ version: SAVE_VERSION, best: 0, lifts: [], bosses: [], falls: 0, gold: 0, stash: 0, weapon: DEFAULT_WEAPON, seen: [],
  well: 0, found: [], unlocked: [], upgrades: { flask: 0, mail: 0, credit: 0 }, runes: [] });
export const S = fresh();

function read(key){ try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }

export function load(){
  let data = read(SAVE_KEY);
  if (!data) for (const k of LEGACY_KEYS){ data = read(k); if (data) break; }
  if (data){ const f = fresh(), d = migrate(data); Object.assign(S, f, d); S.upgrades = Object.assign(f.upgrades, d.upgrades || {}); }
  return S;
}
export function save(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* private mode or blocked storage: play without persistence */ }
}
export function resetSave(){
  Object.assign(S, fresh());
  save();
}
