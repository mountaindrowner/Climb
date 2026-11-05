// The threat catalog: what each threat is, how it warns you, and its one answer. Pure data, shared by the layout,
// the Practice screen, the tests and the docs. Every id here has a module registered in registry.js.
// `space` is extra room (in steps) the layout leaves after one, for threats whose motion reaches along the stair.
export const CATALOG = [
  { id: 'gap',      name: 'Broken step',   kind: 'hazard', answer: '▲', verb: 'Jump',  space: 0,
    tell: 'The step is split with glowing cracks. It crumbles into the shaft as you come near and leaves a hole.' },
  { id: 'beam',     name: 'Fallen beam',   kind: 'hazard', answer: '▼', verb: 'Crouch or roll under', space: 0,
    tell: 'A splintered timber wedged across the stair at head height. You cannot pass it standing; running into it hurts.' },
  { id: 'rockfall', name: 'Rockfall',      kind: 'hazard', answer: 'B', verb: 'Shield up, or wait', space: 0.5,
    tell: 'Grit trickles from the dark and a shadow grows on a step. The boulder drops as you step under it.' },
  { id: 'swing',    name: 'Swinging weight', kind: 'hazard', answer: '▼', verb: 'Crouch, roll or time it', space: 2.5,
    tell: 'A chained boulder hangs cocked up the stair. The rope snaps as you near and it keeps swinging through your lane.' },
  { id: 'crawler',  name: 'Crawler',       kind: 'enemy',  answer: 'A', verb: 'Strike; block or roll the lunge', space: 0.5,
    tell: 'A crack in the wall glows. It skitters out and chases you, rears with red eyes, lunges, then is open for a moment.' },
  { id: 'spitter',  name: 'Spitter',       kind: 'enemy',  answer: 'B', verb: 'Block; parry to kill', space: 0,
    tell: 'Clings to the wall above. Its sac swells and glows, then it spits straight along the aim line, again and again.' },
  { id: 'burrower', name: 'Burrower',      kind: 'enemy',  answer: '▲', verb: 'Jump it, or kill it', space: 1,
    tell: 'A ring of cracks marks a step and a bone fin ploughs toward it. Jaws rise there and wait, snapping at anything in them.' },
  { id: 'flitter',  name: 'Flitter',       kind: 'enemy',  answer: 'A', verb: 'Swat; block or roll', space: 0.5,
    tell: 'Roosts on the wall. It shrieks, loops out over the shaft and dives at your head, then circles back for more.' },
];
export const catalogById = id => CATALOG.find(t => t.id === id);
