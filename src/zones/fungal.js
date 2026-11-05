// Zone 4: The Fungal Caverns
// Glowing, strange, full of ambushes.
// Spawn: Creatures burst from spore pods. (Proposed.)
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'fungal',
  name: 'The Fungal Caverns',
  boss: 'The Spore Warden',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#06100a', wall: '#4f7556', stone: '#3e5c45', top: '#628c6a', glow: '#a6ff6b',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'],
};
