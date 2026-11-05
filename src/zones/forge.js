// Zone 3: The Forge Galleries
// Fire, heat vents, old machinery.
// Spawn: Constructs step out of casting molds. (Proposed.)
// Palette drives the fog (bg), the wall tint, stair stone, landing top, and the glow of this zone's creatures and Warden.
export default {
  id: 'forge',
  name: 'The Forge Galleries',
  boss: 'The Forge Warden',
  warden: 'deep',          // moveset module in src/wardens/movesets (every zone reuses the Deep's until it has its own)
  bg: '#120705', wall: '#7a4a36', stone: '#64402f', top: '#8c5a42', glow: '#ff7a2f',
  // Threat pool drawn from after the tutorial; repeats weight a type. Add this zone's own spawns here as they are built.
  threats: ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'],
};
