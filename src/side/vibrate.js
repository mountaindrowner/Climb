// The phone's own buzz (phase 20). A pad rumbles (core/input.js rumble); a phone has no pad, and on Android the browser
// can run the phone's motor instead (navigator.vibrate. An iPhone's browser has no such thing, and nothing happens).
// The motor has one strength, so a lighter blow is a shorter buzz: a tap for a hit, a long one for a fall. Only while
// the touch pad is what he is played with and no pad is in the hands, and never cutting short a longer buzz still going.
// main.js buzz() calls it beside rumble(), under the same option (Options, Rumble).
import { DEVICE } from '../core/prompts.js';
// min, most: the shortest and longest buzz (ms). until: when the one going now ends (performance.now() time)
export const VIBE = { min: 12, most: 400, until: 0 };
export const vibeMs = (strong, weak, ms) => Math.round(Math.min(VIBE.most, Math.max(VIBE.min, ms * Math.min(1, Math.max(0, strong, weak)))));
// the buzz made (ms), or 0 for none
export function vibrate(strong, weak = strong, ms = 120, now = performance.now()){
  if (DEVICE.kind !== 'touch') return 0;
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : null; if (!nav || typeof nav.vibrate !== 'function') return 0;
    for (const p of (nav.getGamepads ? nav.getGamepads() : []) || []) if (p && p.connected) return 0;
    const d = vibeMs(strong, weak, ms); if (now + d <= VIBE.until) return 0;
    if (nav.vibrate(d) === false) return 0;   // (false: the browser would not, e.g. before the first touch)
    VIBE.until = now + d; return d;
  } catch (e){ return 0; }
}
