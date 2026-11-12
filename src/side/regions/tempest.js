// The Tempest: a placeholder until the region is built (a way in, a shrine, and its keeper's stage).
import { room, rect, walls, door, ledge, mark, CRACKED, GLASS_A, GLASS_B } from '../rooms.js';
function tempestGate(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  rect(r, 18, 2, 24, 2);
  mark(r, 'bloom', 12, 2); mark(r, 'updraft', 27, 2, { w: 5, h: 16 }); ledge(r, 30, 36, 16); ledge(r, 6, 9, 8, GLASS_A); ledge(r, 12, 15, 11, GLASS_B); rect(r, 2, 2, 4, 6, CRACKED);
  mark(r, 'spawn', 6, 2); mark(r, 'shrine', 21, 3); mark(r, 'torch', 5, 7); mark(r, 'torch', 34, 7); mark(r, 'crystal', 12, 2);
  return r;
}
function gale(){
  const r = room(2, 2); walls(r); door(r, 'left', 2, 7);
  ledge(r, 4, 11, 8); ledge(r, 68, 75, 8);
  mark(r, 'boss', 40, 2); mark(r, 'exit', 72, 2); mark(r, 'torch', 14, 9); mark(r, 'torch', 30, 9); mark(r, 'torch', 50, 9); mark(r, 'torch', 66, 9);
  return r;
}
export default { name: 'The Tempest', theme: 'tempest', sub: 'the storm that wraps the mountain', card: 'Over the pass, the mountain goes on, into the storm.', epithet: 'THE STORM HAS A FACE', quiet: ['gale'], seed: 5550123, wear: { sag: 0.6, swell: 0.5, humps: 0.4 },
  layout: [[0, 0, tempestGate], [1, 0, gale, 2, 2]] };
