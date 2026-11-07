// Oath stones: three to a region, on landings drawn for each climb (never the tutorial's, a fork's, the lift's, the rest
// stop's, or a hidden hall's, or the one a hall drops you on). A rough standing stone at the back of the landing, two lines of the Lanternbearer's oath
// cut into it and glowing in their colours. Reaching the middle of its landing going up, he may swear one (a choice:
// ui/screens/oath.js); sworn or passed, the stone goes dark.
import { R, OMEGA, ZF, MAXK } from '../config/constants.js';
import { OATHS, OATH_STONES } from '../config/run.js';
import { FEATURES } from '../config/features.js';
import { ZONES } from '../config/zones.js';
import { rng } from '../core/math.js';
import { mbox, vArc } from '../render/primitives.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { landingS, landingY, special, arenaOf, HALLS, BRANCHES } from './path.js';
import { offeredOaths } from '../run/run.js';
const THREE = window.THREE;

export const STONES = [];
export function setOaths(seed, dyn){
  STONES.length = 0;
  for (let z = 0; z < ZONES.length; z++){
    const r = rng(seed * 31 + z * 977 + 5), ok = [];
    for (let l = 0; l < ZF - 1; l++){
      const k = z * ZF + l;
      if (k < 4 || k >= MAXK - 1 || special(k) || BRANCHES.some(b => b.kA === k) || HALLS.some(h => h.open && (h.kH === k || h.kH + 1 === k))) continue;   // nor where a hall comes out
      if (FEATURES.wardens && arenaOf(k) >= 0) continue;
      ok.push(k);
    }
    for (let n = 0; n < OATH_STONES && ok.length; n++){
      const k = ok.splice(Math.floor(r() * ok.length), 1)[0];
      STONES.push(build({ k, z, offer: offeredOaths(seed, k), used: false }, dyn, r));
    }
  }
}
function build(st, dyn, r){
  const a = landingS(st.k) * OMEGA + 0.075, y = landingY(st.k), g = new THREE.Group();
  const mat = rockMaterial(new THREE.Color(ZONES[st.z].stone).multiplyScalar(0.85).getHex());
  const stone = rock(mat, { w: 0.62, h: 2.0, d: 0.45, jag: 0.2, tilt: 0.1 }, 0, 0.98, 0, r); g.add(stone);
  st.glyphs = st.offer.map((id, i) => {
    const m = new THREE.MeshBasicMaterial({ color: OATHS[id].color });
    const gl = new THREE.Group(); gl.position.set(0, 0.8 + i * 0.6, 0.25); gl.scale.setScalar(1.4);
    gl.add(mbox(0.06, 0.26, 0.04, m, 0, 0, 0), mbox(0.2, 0.05, 0.04, m, 0, 0.06 - i * 0.1, 0), mbox(0.05, 0.12, 0.04, m, 0.09 * (i ? 1 : -1), -0.08, 0));
    g.add(gl); return { m, id };
  });
  g.position.copy(vArc(a, R + 1.15, y)); g.lookAt(0, y, 0);   // its face (+z) toward the shaft's centre
  dyn.add(g); st.g = g; return st;
}
export const stoneAt = k => STONES.find(s => s.k === k) || null;
// the stone's lines: lit until it is used; the sworn one flares a moment first
export function updateOaths(t){
  for (const st of STONES){
    for (const gl of st.glyphs){
      const base = new THREE.Color(OATHS[gl.id].color);
      if (st.used){ const f = st.sworn === gl.id && t - st.usedAt < 1.2 ? 1.5 - (t - st.usedAt) : 0.12; gl.m.color.copy(base).multiplyScalar(Math.max(0.12, f)); }
      else gl.m.color.copy(base).multiplyScalar(0.75 + 0.25 * Math.sin(t * 2.2 + st.k));
    }
  }
}
