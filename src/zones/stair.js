// Zone 6: The Long Stair
// The long final climb. Placeholder name: "The Endless Stair" is Tolkien's term and needs replacing.
// Spawn: Not yet defined.
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'stair',
  name: 'The Long Stair',
  boss: 'The Stair Warden',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#090910', wall: '#6e6e88', stone: '#58586e', top: '#7e7e98', glow: '#d6e3ff',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'],
};
