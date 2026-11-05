// The seven zones of the shaft, bottom to top.
// Colours drive the fog, wall tint, stair stone and the glow of that zone's creatures and Warden.
// `warden` names the moveset module in src/wardens/movesets used for that zone's fight.
export const ZONES = [
  { id: 'deep',      name: 'The Deep',               boss: 'Warden of the Deep',  warden: 'deep', bg: '#0b0912', wall: '#6a6280', stone: '#5a5470', top: '#7a7294', glow: '#a07cff' },
  { id: 'flooded',   name: 'The Flooded Halls',      boss: 'The Drowned Warden',  warden: 'deep', bg: '#050d13', wall: '#4f7482', stone: '#3f5c6a', top: '#628a9a', glow: '#4fd1ff' },
  { id: 'forge',     name: 'The Forge Galleries',    boss: 'The Forge Warden',    warden: 'deep', bg: '#120705', wall: '#7a4a36', stone: '#64402f', top: '#8c5a42', glow: '#ff7a2f' },
  { id: 'fungal',    name: 'The Fungal Caverns',     boss: 'The Spore Warden',    warden: 'deep', bg: '#06100a', wall: '#4f7556', stone: '#3e5c45', top: '#628c6a', glow: '#a6ff6b' },
  { id: 'collapsed', name: 'The Collapsed Workings', boss: 'The Broken Warden',   warden: 'deep', bg: '#0f0c08', wall: '#7a6e54', stone: '#5e5644', top: '#867a60', glow: '#ffd36b' },
  // "The Endless Stair" is Tolkien's term and needs a new name. Placeholder until one is chosen.
  { id: 'stair',     name: 'The Long Stair',         boss: 'The Stair Warden',    warden: 'deep', bg: '#090910', wall: '#6e6e88', stone: '#58586e', top: '#7e7e98', glow: '#d6e3ff' },
  { id: 'peak',      name: 'The Peak',               boss: 'The Last Warden',     warden: 'deep', bg: '#0b1222', wall: '#6a7496', stone: '#5a6282', top: '#8e97ba', glow: '#ffffff' },
];
