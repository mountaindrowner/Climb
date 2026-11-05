# Controls and movement

You move the warrior yourself. Right along the stair climbs, left goes back down. The feel follows Dead Cells: the controls should never be the challenge, so movement is instant and forgiving and the difficulty lives in the threats. Code: `src/core/input.js` (what is held and pressed), `src/entities/player/motor.js` (movement and actions), `src/entities/player/animate.js` (the pose), numbers in `TUNE.move` in `src/config/tuning.js`.

## The pad

Left thumb: a stick. Left or right of its centre moves; below it crouches; both together crouch-walk. Right thumb: four buttons, Block and Roll above, Attack and Jump below, like a controller's face buttons. The flask sits between.

| Input | Action | Keyboard |
| --- | --- | --- |
| Stick ◀ ▶ | Move along the stair | A / D or ← → |
| Stick ▼ | Crouch (hold); crouch-walk with ◀ ▶ | S or ↓ |
| ▲ Jump | Jump (hold for height); repair a lift standing on its landing; grab a root while falling | Space, W or ↑ |
| A Attack | Swing; press again to chain the weapon's combo | J or Z |
| B Block | Hold to raise the shield; raising it as a hit lands is a parry | K or X |
| ⟳ Roll | Roll, invulnerable for most of it, under beams and swings, out of a swing's recovery | L, C or Shift |
| Flask | Heal 2 | F or Q |

## What makes it tight

These are the techniques used, with their values. Motion Twin has described Dead Cells as hiding 30 to 40 small tricks like these so the controls feel fair.

| Technique | What it does | Value |
| --- | --- | --- |
| Instant acceleration | Top speed almost at once, stop almost at once | run 3.8, accel 60, decel 75 (≈0.06 s and 0.05 s) |
| Instant turn | Facing flips the frame you press the other way; a skid puff if you were running | — |
| Full air control | Steer in the air, a touch softer than on the ground | air accel 38 |
| Variable jump | Hold for full height; let go to cut it short | height 1.55, cut 0.42 |
| Minimum hop | The quickest tap still clears a broken step or a set of jaws | 0.1 s before a release can cut the jump |
| Heavy fall | Falls faster than it rises, so jumps feel weighty, not floaty | gravity up 32, down 54, max fall 18 |
| Apex hang | Holding jump near the top hangs a moment for aiming | gravity ×0.55 within 1.6 of the apex |
| Coyote time | A jump still works just after the ground drops away (Motion Twin's "just in time jump") | 0.1 s |
| Jump buffer | A jump pressed just before landing still happens | 0.13 s |
| Step-up assist | Landing a little below the next step's top puts you on it | — |
| Forgiving lips | You can stand a little way over the edge of a broken step | 0.2 |
| Roll | Fast, invulnerable for most of it, low enough for beams and swings; cancels a swing's recovery | 0.4 s, i-frames 0.03 to 0.32 s, speed 6.2, cooldown 0.37 s |
| Combo buffering | An attack pressed during a swing queues the next one | — |
| Recovery cancel | Moving or jumping late in a swing's recovery cancels it | after 40% |
| Lunge | Each swing steps you forward | per swing, 0.3 to 0.9 |
| Hit-stop and knockback | Hits freeze for a few frames; being hit knocks you back and up | knock 3.2, hop 3.5, flinch 0.22 s |
| Commit points | Enemies lock their aim before the hit, so a late roll or step still works | crawler at wind-up, flitter 0.35 s before contact, spitter at the spit |
| Camera lead | The view leads the way you face and swings over when you turn | — |

## Weapons

| Weapon | Combo | Feel |
| --- | --- | --- |
| Short sword | slash, back-slash, overhead chop (1, 1, 2) | Fast; short wind-ups, short recovery |
| War pick | chop, chop (2, 3) | Slow; long wind-up and recovery, heavy hits |
| Spear | thrust, thrust, lunge (1, 1, 2) | Long reach; the third steps far in |

Each swing has a wind-up (anticipation), active frames (the hit, with a bright smear arc), and a recovery. The pose is reached fast in the wind-up, overshoots on the strike, and eases out in the recovery.
