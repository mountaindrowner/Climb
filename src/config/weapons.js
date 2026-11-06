import { FEATURES } from './features.js';
// Weapons found on the floor of the Pool. Each has a combo: A presses chain through its swings.
// Per swing: damage, wind-up (anticipation), active (when it hits), recovery, the lunge forward, and the pose.
// Times in seconds, reach and lunge in world units. Deliberate, weighty swings: a clear wind-up, a quick strike, and a
// recovery you commit to.
export const WEAPONS = {
  sword: { name: 'Short sword', desc: 'Fast three-hit combo', reach: 1.7, combo: [
    { dmg: 1, wind: 0.085, active: 0.081, rec: 0.216, lunge: 0.35, pose: 'slash' },
    { dmg: 1, wind: 0.085, active: 0.081, rec: 0.216, lunge: 0.35, pose: 'back' },
    { dmg: 2, wind: 0.17, active: 0.103, rec: 0.378, lunge: 0.6, pose: 'chop' },
  ] },
  pick:  { name: 'War pick', desc: 'Slow, heavy blows', reach: 1.6, combo: [
    { dmg: 2, wind: 0.238, active: 0.103, rec: 0.405, lunge: 0.3, pose: 'chop' },
    { dmg: 3, wind: 0.306, active: 0.115, rec: 0.567, lunge: 0.5, pose: 'back' },
  ] },
  spear: { name: 'Spear', desc: 'Long reach, lunging', reach: 2.5, combo: [
    { dmg: 1, wind: 0.136, active: 0.103, rec: 0.27, lunge: 0.5, pose: 'jab' },
    { dmg: 1, wind: 0.102, active: 0.103, rec: 0.27, lunge: 0.5, pose: 'thrust' },
    { dmg: 2, wind: 0.204, active: 0.115, rec: 0.405, lunge: 0.9, pose: 'lunge' },
  ] },
};
export const DEFAULT_WEAPON = 'sword';
// the weapons on offer: only the sword for now (FEATURES.allWeapons brings the others back); a save holding another
// keeps it, and plays the sword
export const OFFERED = FEATURES.allWeapons ? Object.keys(WEAPONS) : ['sword'];
export const usable = id => OFFERED.includes(id) ? id : DEFAULT_WEAPON;
