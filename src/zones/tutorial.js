// The first five flights teach one threat each, with a hint bar. Flight 0 is a clean start.
export const TUTORIAL = [
  null,
  { type: 'gap',     t: 4.3, hint: 'The step crumbles as you come near. Tap ▲ to jump the hole.' },
  { type: 'beam',    t: 4.5, hint: 'Hold ▼ to crouch under the beam, or tap ⟳ to roll under it.' },
  { type: 'crawler', t: 5.3, hint: 'Strike with A. Hold B to block its lunge, or roll through it, then hit it while it recovers.' },
  { type: 'spitter', t: 4.6, hint: 'Hold B to block the spit. Raise it just as the spit lands to parry it back.' },
];
