// The Firmament: a placeholder until the region is built (a way in, a shrine, and its keeper's stage).
import { room, rect, walls, door, ledge, mark } from '../rooms.js';
function firmamentGate(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  rect(r, 18, 2, 24, 2);
  mark(r, 'spawn', 6, 2); mark(r, 'shrine', 21, 3); mark(r, 'torch', 5, 7); mark(r, 'torch', 34, 7); mark(r, 'crystal', 12, 2);
  return r;
}
function zenith(){
  const r = room(2, 2); walls(r); door(r, 'left', 2, 7);
  ledge(r, 4, 11, 8); ledge(r, 68, 75, 8);
  mark(r, 'boss', 40, 2); mark(r, 'exit', 72, 2); mark(r, 'torch', 14, 9); mark(r, 'torch', 30, 9); mark(r, 'torch', 50, 9); mark(r, 'torch', 66, 9);
  return r;
}
export default { name: 'The Firmament', theme: 'firmament', sub: 'the summit, among the stars', card: 'The last of the mountain. The stars are close.', epithet: 'IT WAITED AT THE TOP', quiet: ['zenith'], seed: 7770123, wear: { sag: 0.6, swell: 0.5, humps: 0.4 },
  layout: [[0, 0, firmamentGate], [1, 0, zenith, 2, 2]] };
