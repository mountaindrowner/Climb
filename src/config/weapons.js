// Weapons found on the floor of the Pool. Damage, cooldown (s) and reach (step units).
export const WEAPONS = {
  sword: { name: 'Short sword', desc: 'Fast, 1 dmg', dmg: 1, cd: 0.22, reach: 1.7 },
  pick:  { name: 'War pick',    desc: 'Slow, 2 dmg', dmg: 2, cd: 0.5,  reach: 1.6 },
  spear: { name: 'Spear',       desc: 'Long reach',  dmg: 1, cd: 0.32, reach: 2.5 },
};
export const DEFAULT_WEAPON = 'sword';
