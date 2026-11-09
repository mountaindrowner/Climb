# Controls and movement

You move the warrior yourself. Right along the stair climbs, left goes back down. The feel follows Dead Cells: the controls should never be the challenge, so movement is responsive and forgiving and the difficulty lives in the threats. Code: `src/core/input.js` (what is held and pressed), `src/entities/player/motor.js` (movement and actions), `src/entities/player/animate.js` (the pose), numbers in `TUNE.move` in `src/config/tuning.js`.

## Devices

PC is the main platform (decision 0008): keyboard or a gamepad. Phones play on their side with a touch pad. All four sources (keyboard, gamepad, touch pad, the test bot) feed the same eight actions, so gameplay never knows which one you used. Code: `src/core/input.js` (sources and menus), `src/core/settings.js` (bindings and settings, stored apart from the save), `src/core/prompts.js` (button prompts), `src/ui/screens/settings.js` (pause, settings, controls).

| Action | Keyboard (default) | Xbox pad | PlayStation pad | Touch |
| --- | --- | --- | --- | --- |
| Move along the stair | A / D or ← → | left stick, d-pad | left stick, d-pad | stick ◀ ▶ |
| Crouch (hold); creep (a slow crouch-walk) while moving | S or ↓ | stick down, d-pad ↓ | stick down, d-pad ↓ | stick ▼ |
| Jump (hold for height); again in the air for the double jump; catch a ledge's edge and haul up (automatic in a jump); repair a lift on its landing; step into a hidden hall from its opening; grab a root while falling | Space, W or ↑ | A | ✕ | ▲ |
| Attack; press again to chain the combo; breaks a cracked wall; in the air with crouch held, the plunge | left mouse or J | X, RT | □, R2 | A |
| Block (hold); raise it as a hit lands to parry | right mouse or K | LB, LT | L1, L2 | B |
| Roll: invulnerable for most of it, under beams and swings, cancels anything | Shift, C or L | B, RB | ○, R1 | ⟳ |
| Drink the flask: heals 2 | Q or F | Y | △ | flask |
| Pause | Esc | Start (Menu) | Options | — |

Keys are bound by position (`KeyboardEvent.code`), so they sit in the same place on any keyboard layout. Every action's keys and pad buttons can be rebound under Controls (from the title or the pause menu): pick the action, press the new key or button. Taking a key from another action removes it there, so one input never does two things. Moving always uses the stick and the d-pad.

**Prompts match your hands.** Text in the game names actions as tokens (`{jump}`, `{attack}`, ...). Whatever you used last decides how they read: your bound key (Space, J), the Xbox button (A, X) or the PlayStation one (✕, □), or the touch glyph (▲, A). Hints, the icons over hazards, the timing rings, the practice list and the title's help all follow it, and switch as soon as you pick up a different device.

**Menus without a mouse.** ↑ ↓ or the d-pad move between choices, ← → or the stick nudge sliders, Enter or Ⓐ picks, Esc or Ⓑ goes back. Esc or Start pauses the climb; the game also pauses itself when the window loses focus.

**Settings.** Pixels (the internal render height: Chunky 540, Classic 720, Fine 1080 lines), volume, screen shake (scales every shake), pad rumble (hits and hit-stop buzz the pad).

## What makes it tight

These are the techniques used, with their values. Motion Twin has described Dead Cells as hiding 30 to 40 small tricks like these so the controls feel fair. Movement v2 (0.28) brought the controls to Dead Cells' set, from the developer's own sources: his GDC 2019 talk (just-in-time jumps, arrival assistance, a double jump from the start, free turnaround, auto-aim) and his MIT-licensed game-feel demo (`deepnight/gamefeel`: the input queue, gravity eased in after take-off, a stronger double jump, air control that fades, exponential braking, landings scaled by height). Their exact numbers are unpublished; ours are tuned to the warrior's size. **The feel panel** (F9, or `#feel` on the page) switches each assist on and off while you play.

| Technique | What it does | Value |
| --- | --- | --- |
| Fast from the first step | Full speed in under a tenth of a second; stopping takes a hair of skid. No sprint: he always runs fast. A stick pushed part way walks | run 5.5, accel 70, decel 60 (≈0.08 s and 0.09 s) |
| Input queue | Every press waits until it can happen, for a moment, instead of being dropped: an attack in the last of a roll, a roll as a stun wears off | jump 0.14 s, attack 0.24, roll 0.2, flask 0.2 |
| Instant turn | Facing flips the frame you press the other way; a skid puff if you were running | — |
| Air control | Steer in the air, a touch stronger than on the ground at first, fading over a long fall | air accel 46, fading over 2.4 s to 40% |
| Variable jump | Hold for full height; let go to cut it short | height 1.55, cut 0.42 |
| Launch float | Gravity is light at take-off and eases back in: the jump pops, then floats | 12% at take-off, full after 0.1 s (0.26 s for the double jump) |
| Double jump | Once in the air, from the start, with a somersault; a press just before landing is the next ground jump instead | height 1.35 more |
| Minimum hop | The quickest tap still clears a broken step or a set of jaws | 0.1 s before a release can cut the jump |
| Heavy fall | Falls faster than it rises, so jumps feel weighty, not floaty | gravity up 32, down 54, max fall 18 |
| Apex hang | Holding jump near the top hangs a moment for aiming | gravity ×0.55 within 1.6 of the apex |
| Coyote time | A jump still works just after the ground drops away (Motion Twin's "just in time jump") | 0.1 s |
| Jump buffer | A jump pressed just before landing still happens (and is not spent as the double jump) | 0.13 s |
| Step-up assist | Landing a little below the next step's top puts you on it | — |
| Forgiving lips | You can stand a little way over the edge of a broken step | 0.2 |
| Roll | Fast, invulnerable for most of it, low enough for beams and swings; cancels anything, a swing at any point included; in its last 45% an attack or a jump comes straight out of it | 0.4 s, i-frames 0.03 to 0.32 s, speed 7.0, cooldown 0.37 s |
| Free turn and aim | Turn early in a swing's wind-up (and any time in its recovery); with no direction held, a swing turns to a foe just behind you | turn in the first 70% of the wind-up; aim 0.7 past the weapon's reach |
| Plunge | In the air, crouch + attack: straight down, a slam either side on landing, a beat planted; it soaks a little of the fall | speed 21, slam radius 1.6, damage 2, soaks 4 of the drop |
| Heavy landings | Only a real drop lands heavily (dust, a jolt, half your speed); short ones cost nothing | over 2.6 |
| Combo buffering | An attack pressed during a swing queues the next one | — |
| Recovery cancel | Moving or jumping late in a swing's recovery cancels it | after 40% |
| Lunge | Each swing steps you forward | per swing, 0.3 to 0.9 |
| Hit-stop and knockback | Hits freeze for a few frames; being hit knocks you back and up | knock 3.2, hop 3.5, flinch 0.22 s |
| Commit points | Enemies lock their aim before the hit, so a late roll or step still works | crawler at wind-up, flitter 0.35 s before contact, spitter at the spit |
| Camera lead | The view leads the way you face (further at a full run) and swings over when you turn | — |
| Smooth camera | The camera's height follows the slope of the stair through a spring, not each step; footfalls do not dip it, landings do | about 0.35 s to catch up |

## Weapons

| Weapon | Combo | Feel |
| --- | --- | --- |
| Short sword | slash, back-slash, overhead chop (1, 1, 2) | Fast; short wind-ups, short recovery |
| War pick | chop, chop (2, 3) | Slow; long wind-up and recovery, heavy hits |
| Spear | thrust, thrust, lunge (1, 1, 2) | Long reach; the third steps far in |

Each swing has a wind-up (anticipation), active frames (the hit, with a bright smear arc), and a recovery. The pose is reached fast in the wind-up, overshoots on the strike, and eases out in the recovery.
