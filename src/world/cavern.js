// The collapsed sections behind each Warden's stretch: a rubble slope falling away from the stair, broken edges of wall
// above and below, and a few standing stubs of wall for parallax. Built once; the Warden climbs this ground.
import { R, RW } from '../config/constants.js';
import { ZONES } from '../zones/index.js';
import { rng } from '../core/math.js';
import { scene } from '../render/renderer.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { OPEN_BANDS } from './shaft.js';
const THREE = window.THREE;

export const CAVERN_R = 10.4;       // where the Warden walks
const group = new THREE.Group(); scene.add(group);
for (const b of OPEN_BANDS){
  const zz = ZONES[b.z], r = rng(4000 + b.z * 61);
  // rubble is darker and duller than the Warden's stone, so the golem reads against it
  const stone = rockMaterial(new THREE.Color(zz.wall).multiplyScalar(0.42).getHex());
  const dark = rockMaterial(new THREE.Color(zz.wall).multiplyScalar(0.24).getHex());
  const hi = rockMaterial(new THREE.Color(zz.wall).multiplyScalar(0.55).getHex());
  const H = b.y1 - b.y0;
  // the rubble slope: boulders from just behind the stair out to the cavern, following the climb
  for (let i = 0; i < 90; i++){
    const a = r() * Math.PI * 2, rad = RW - 0.2 + r() * 5.5, t = r();
    const y = b.y0 + t * H - 2.6 - (rad - RW) * 0.55 + (r() - 0.5) * 1.0;   // a slope falling away below the stair line
    const s = 0.6 + r() * 1.3;
    group.add(rock(i % 3 ? stone : dark, { w: s * (1 + r() * 0.6), h: s * 0.7, d: s, jag: 0.35 }, rad * Math.cos(a), y, rad * Math.sin(a), r));
  }
  // broken edges: a ring of rock at the top and bottom of the break
  for (const [y, n] of [[b.y0, 40], [b.y1, 40]]) for (let i = 0; i < n; i++){
    const a = (i + r() * 0.6) / n * Math.PI * 2, rad = RW + (r() - 0.5) * 0.6, s = 0.9 + r() * 1.2;
    group.add(rock(i % 2 ? stone : hi, { w: s, h: s * 0.8, d: s * 1.3, jag: 0.4 }, rad * Math.cos(a), y + (r() - 0.5) * 1.0, rad * Math.sin(a), r));
  }
  // stubs of wall still standing
  for (let i = 0; i < 7; i++){
    const a = r() * Math.PI * 2, h = 2 + r() * (H - 4), rad = RW + 0.2;
    const m = rock(dark, { w: 1.1 + r() * 0.8, h, d: 1.4 + r() * 1.2, jag: 0.2, tilt: 0.1 }, rad * Math.cos(a), b.y0 + h / 2 + r() * (H - h), rad * Math.sin(a), r);
    group.add(m);
  }
  // the floor of the cavern far out, so the Warden is not walking on nothing
  for (let i = 0; i < 30; i++){
    const a = r() * Math.PI * 2, rad = CAVERN_R - 1 + r() * 3.5, t = r(), s = 2 + r() * 2.5;
    group.add(rock(dark, { w: s * 1.4, h: s * 0.5, d: s * 1.4, jag: 0.3, tilt: 0.15 }, rad * Math.cos(a), b.y0 + t * H - 2.6, rad * Math.sin(a), r));
  }
}
