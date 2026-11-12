// The Gardens: a placeholder until the region is built (a way in, a shrine, and its keeper's stage).
import { room, rect, walls, door, ledge, mark } from '../rooms.js';
function gardensGate(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  rect(r, 18, 2, 24, 2);
  mark(r, 'spawn', 6, 2); mark(r, 'shrine', 21, 3); mark(r, 'torch', 5, 7); mark(r, 'torch', 34, 7); mark(r, 'crystal', 12, 2);
  return r;
}
function bower(){
  const r = room(2, 2); walls(r); door(r, 'left', 2, 7);
  ledge(r, 4, 11, 8); ledge(r, 68, 75, 8);
  mark(r, 'boss', 40, 2); mark(r, 'exit', 72, 2); mark(r, 'torch', 14, 9); mark(r, 'torch', 30, 9); mark(r, 'torch', 50, 9); mark(r, 'torch', 66, 9);
  return r;
}
export default { name: 'The Gardens', theme: 'gardens', sub: 'above the cloud, in the sun', card: 'Above the storm: sun, and green things growing.', epithet: 'WHAT THE GARDEN GREW', quiet: ['bower'], seed: 6660123, wear: { sag: 0.6, swell: 0.5, humps: 0.4 },
  layout: [[0, 0, gardensGate], [1, 0, bower, 2, 2]] };
