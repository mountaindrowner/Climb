// The threat catalog: what each threat is, how it warns you, and its one answer. Pure data, shared by the layout,
// the Practice screen, the tests and the docs. Every id here has a module registered in registry.js.
// `space` is extra room (in steps) the layout leaves after one, for threats whose motion reaches along the stair.
export const CATALOG = [
  { id: 'gap',      name: 'Broken step',   kind: 'hazard', answer: '▲', verb: 'Jump',  space: 0,
    tell: 'The step is split with glowing cracks. It crumbles into the shaft as you reach it.' },
  { id: 'beam',     name: 'Fallen beam',   kind: 'hazard', answer: '▼', verb: 'Duck',  space: 0,
    tell: 'A splintered timber jammed across the stair at head height. It creaks and sheds dust as you near.' },
  { id: 'rockfall', name: 'Rockfall',      kind: 'hazard', answer: 'B', verb: 'Shield up', space: 0.5,
    tell: 'Grit trickles from the dark and a shadow grows on a step. A boulder follows it down.' },
  { id: 'swing',    name: 'Swinging weight', kind: 'hazard', answer: '▼', verb: 'Duck', space: 2.5,
    tell: 'A chained boulder hangs cocked back up the stair. The rope snaps and it swings down through your lane.' },
  { id: 'crawler',  name: 'Crawler',       kind: 'enemy',  answer: 'A', verb: 'Strike, or block then strike', space: 0.5,
    tell: 'A crack in the wall glows. It skitters out, rears with red eyes and lunges.' },
  { id: 'spitter',  name: 'Spitter',       kind: 'enemy',  answer: 'B', verb: 'Block, parry to kill', space: 0,
    tell: 'Clings to the wall above. Its sac swells and glows, then it spits along the aim line.' },
  { id: 'burrower', name: 'Burrower',      kind: 'enemy',  answer: '▲', verb: 'Jump',  space: 1,
    tell: 'A mound of rubble ploughs down the stair toward you. Jaws burst from the step where it stops.' },
  { id: 'flitter',  name: 'Flitter',       kind: 'enemy',  answer: 'A', verb: 'Swat, or block', space: 0.5,
    tell: 'Roosts on the wall. It shrieks, drops, loops out over the shaft and dives at your head.' },
];
export const catalogById = id => CATALOG.find(t => t.id === id);
