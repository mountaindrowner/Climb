// The first five flights teach one threat each, with a hint bar. Flight 0 is a clean start.
export const TUTORIAL = [
  null,
  { type: 'gap',     t: 4.3, hint: 'Tap ▲ to jump the broken step' },
  { type: 'beam',    t: 4.5, hint: 'Tap ▼ to duck under the beam' },
  { type: 'crawler', t: 5.3, hint: 'Tap A before it lunges. Late? Tap B to block it, then strike.' },
  { type: 'spitter', t: 4.6, hint: 'Tap B to block. Tap it right as the spit lands to parry.' },
];
