// Zone 1: The Deep
// Ancient nameless things, darkness. The oldest, scariest part of the mine is where you start.
// Spawn: Things crawl out of cracks in the wall.
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'deep',
  name: 'The Deep',
  boss: 'Warden of the Deep',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#0b0912', wall: '#6a6280', stone: '#5a5470', top: '#7a7294', glow: '#a07cff',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'gap', 'beam', 'beam', 'crawler', 'crawler', 'crawler', 'spitter', 'rockfall', 'flitter', 'swing', 'burrower'],
};
