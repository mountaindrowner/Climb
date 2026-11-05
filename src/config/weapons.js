// Weapons found on the floor of the Pool. Each has a combo: A presses chain through its swings.
// Per swing: damage, wind-up (anticipation), active (when it hits), recovery, the lunge forward, and the pose.
// Times in seconds, reach and lunge in world units.
export const WEAPONS = {
  sword: { name: 'Short sword', desc: 'Fast three-hit combo', reach: 1.7, combo: [
    { dmg: 1, wind: 0.05, active: 0.07, rec: 0.16, lunge: 0.35, pose: 'slash' },
    { dmg: 1, wind: 0.05, active: 0.07, rec: 0.16, lunge: 0.35, pose: 'back' },
    { dmg: 2, wind: 0.10, active: 0.09, rec: 0.28, lunge: 0.6, pose: 'chop' },
  ] },
  pick:  { name: 'War pick', desc: 'Slow, heavy blows', reach: 1.6, combo: [
    { dmg: 2, wind: 0.14, active: 0.09, rec: 0.3, lunge: 0.3, pose: 'chop' },
    { dmg: 3, wind: 0.18, active: 0.1, rec: 0.42, lunge: 0.5, pose: 'chop' },
  ] },
  spear: { name: 'Spear', desc: 'Long reach, lunging', reach: 2.5, combo: [
    { dmg: 1, wind: 0.08, active: 0.09, rec: 0.2, lunge: 0.5, pose: 'thrust' },
    { dmg: 1, wind: 0.06, active: 0.09, rec: 0.2, lunge: 0.5, pose: 'thrust' },
    { dmg: 2, wind: 0.12, active: 0.1, rec: 0.3, lunge: 0.9, pose: 'thrust' },
  ] },
};
export const DEFAULT_WEAPON = 'sword';
