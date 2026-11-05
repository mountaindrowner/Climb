export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smooth = t => t * t * (3 - 2 * t);
export const lerp = (a, b, t) => a + (b - a) * t;
export const yawFor = a => -a - Math.PI / 2;

// Stable 2D hash in [0,1).
export function hash(a, b){
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
// Mulberry32 seeded generator.
export function rng(seed){
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
