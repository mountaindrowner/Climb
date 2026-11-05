// Zone 2: The Flooded Halls
// Water rising behind you forces you on.
// Spawn: Shapes rise from the water. (Proposed; uses The Deep's threats until built.)
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'flooded',
  name: 'The Flooded Halls',
  boss: 'The Drowned Warden',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#050d13', wall: '#4f7482', stone: '#3f5c6a', top: '#628a9a', glow: '#4fd1ff',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'],
};
