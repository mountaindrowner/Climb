// Zone 5: The Collapsed Workings
// Unstable floors and cave-ins.
// Spawn: Crumbling steps. (Proposed.)
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'collapsed',
  name: 'The Collapsed Workings',
  boss: 'The Broken Warden',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#0f0c08', wall: '#7a6e54', stone: '#5e5644', top: '#867a60', glow: '#ffd36b',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'],
};
