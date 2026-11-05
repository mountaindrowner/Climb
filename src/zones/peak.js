// Zone 7: The Peak
// The final fight in the open air.
// Spawn: Not yet defined.
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'peak',
  name: 'The Peak',
  boss: 'The Last Warden',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#0b1222', wall: '#6a7496', stone: '#5a6282', top: '#8e97ba', glow: '#ffffff',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'],
};
