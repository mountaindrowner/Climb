// The run: what a climb leaves you, and what grows a climb as you go (the Dead Cells layer, named from lore.md).
//
// Wellstone: the teal light the blade frees from a thing that drank the Pool. It drops from kills and hidden halls.
// Carried, it is lost on a fall; Fetch sends it down to the Pool from any rest stop. At the Pool it buys blueprints
// and the Pool's own upgrades, for every climb after.
// Blueprints: found on the climb (a rare drop, and in hidden halls), kept for good once found, bought at the Pool; each
// adds a mark to the ones Fetch can offer.
// Oaths: the Lanternbearer's oath in three parts. Oath stones on the landings offer two; the one you swear grows for
// the rest of this climb. Edge: harder blows. Lantern: more health. Knell: quicker swings and a wider parry.
// Marks: picked at rest stops, three at most a climb.
// Runes: route-openers, kept for good. The ram breaks the rubble over a closed fork.

export const WELL = {
  kill: { crawler: 2, flitter: 1, burrower: 2, spitter: 3 },   // wellstone a kill frees
  hall: z => 6 + 2 * z,                                         // a hidden hall's chest
  blueprintChance: 0.07,                                        // a kill drops a blueprint not yet found
};

export const OATHS = {
  edge:    { name: 'Edge',    line: 'What I find, I end.',          color: '#ff7a5c', desc: 'Your blows land 30% harder' },
  lantern: { name: 'Lantern', line: 'I go down with the light.',    color: '#ffd27a', desc: '+1 max health, and healed 1' },
  knell:   { name: 'Knell',   line: 'What ends, I name.',            color: '#9fd0ff', desc: 'Swings 8% quicker, a wider parry' },
};
export const OATH_IDS = Object.keys(OATHS);
export const OATH_STONES = 3;          // per region
export const edgeMul = n => 1 + 0.3 * n;
export const knellSpeed = n => 1 + 0.08 * n;
export const knellParry = n => 0.03 * n;

// Marks: start says whether it is known from the first climb; the rest come from blueprints.
export const MARKS = {
  root:    { name: 'Mark of the Root',        desc: 'Your first fall is caught by a root, without a grab', start: true },
  tithe:   { name: 'Mark of the Tithe',       desc: 'Half again as much gold; keep three quarters of it when you fall', start: true },
  ward:    { name: 'Mark of the Ward',        desc: 'A parry heals 1 (once every 8 seconds)', start: true },
  vigil:   { name: 'Mark of the Vigil',       desc: 'Every fourth kill heals 1', cost: 40 },
  finisher:{ name: 'Mark of the Finisher',    desc: 'The last blow of a combo deals 1 more', cost: 50 },
  fleet:   { name: 'Mark of the Fleet',       desc: 'Roll again twice as soon; sprint 10% faster', cost: 45 },
  seam:    { name: 'Mark of the Seam',        desc: 'Half again as much wellstone from kills', cost: 60 },
  breath:  { name: 'Mark of the Second Breath', desc: 'Once a climb, at 1 health, recover 2', cost: 70 },
  bearer:  { name: 'Mark of the Bearer',      desc: 'Your flask heals 3 instead of 2', cost: 55 },
};
export const MARK_SLOTS = 3;
export const BLUEPRINTS = Object.keys(MARKS).filter(id => !MARKS[id].start);   // what can be found

// The Pool's upgrades, bought with banked wellstone; each tier costs its own price.
export const UPGRADES = {
  flask:  { name: 'A deeper flask',  desc: '+1 flask charge on every climb', costs: [50, 120] },
  mail:   { name: 'Hald mail',       desc: '+1 max health on every climb', costs: [80, 180] },
  credit: { name: "Fetch's credit",  desc: 'Start every climb with 15 more gold', costs: [40, 90, 160] },
};

export const RUNES = {
  ram: { name: 'The Hald ram', desc: 'A gauntlet of wellstone for the shoulder. It breaks the rubble over a closed fork: strike the heap three times.' },
};
