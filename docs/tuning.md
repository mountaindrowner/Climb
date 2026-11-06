# Tuning reference

Every value below lives in `src/config/tuning.js` or `src/config/constants.js`. Change it there; this page is the explanation.

## Geometry (`constants.js`)

| Value | Setting | Note |
| --- | --- | --- |
| Steps per flight | 8 | plus a landing of 1.8 step units |
| Step rise | 0.55 units | was 0.75 in prototype v3; lowered so the ramp is shallower (about 29° instead of 37°) |
| Path radius | 7 units | steps 2.6 units wide |
| Flights per zone | 15 | lift on flight 5, rest stop on 8, the Warden's stretch over flights 10 to 14 |
| Metres per zone | 135 m | `MPU` is derived from this, so the height meter stays stable when the rise is tuned |
| Flights per turn | about 4.5 | one turn is 2π·7 ≈ 44 step units; a root waits every turn during a fall |

## Movement (`TUNE.move`)

See `docs/design/controls.md` for what each does. Run 3.8, sprint 6.0; accel 19 (top speed in 0.2 s), decel 75 (also used for turning and slowing), air accel 38; crouch ×0.45, blocking ×0.35; jump height 1.55, gravity up 32 and down 54, max fall 18; apex hang ×0.55 within 1.6; release cut 0.42 after a minimum hop of 0.1 s; coyote 0.1 s; buffer 0.13 s; standable lip 0.2; roll 0.4 s at 6.2, invulnerable 0.03 to 0.32 s, cooldown 0.37 s; knockback 3.2 with a 3.5 hop and a 0.22 s flinch; a beam hurts above 2.6 speed.

The warrior's height for threats: crown 2.45 standing, 1.05 crouched or rolling.

## Player

| Value | Setting |
| --- | --- |
| Health / flask | 5, 3 charges of 2 |
| Jump | airborne 0.5 s, 0.95 units high |
| Duck | 0.55 s |
| Block | 0.4 s; parry if pressed within 0.2 s of impact |
| Invulnerability after a hit | 1 s |
| Root grab | cooldown 0.45 s between attempts; lands you at a third of max health |

## Climb speed

2.25 steps/s + 0.12 per zone. ×0.35 while stumbling, ×0.25 while a crawler duels you, ×0.4 on an unrepaired lift landing. The foot plants at 42% of each step; that is when the thud, squash, dust and camera dip fire.

## Threats

| Threat | Timing |
| --- | --- |
| Crawler | wakes 4.8 steps out, emerges at 3.2 (or after 1.2 s), rears at 1.7, lunges after 0.5 s; a block stuns it 0.7 s; 2 hp from zone 3 |
| Spitter | charges 0.6 s from 3.7 steps out; orb flies 0.62 s; a parry reflects it in 0.28 s |
| Hazard icons | shown from 3.8 steps ahead; hints from 4 |
| Broken step | crumbles when you come within 1.4; the hole opens 0.28 s later |
| Fallen beam | creaks from 3.2 steps |
| Rockfall | warns from 4.6 steps; drops 0.55 s before you arrive, from 9 units up; hits within 0.7 steps |
| Swinging weight | 2.8-unit chain (short, so the uphill side of the arc clears a crouch on a rising stair), cocked at 1.15 rad, settling to 0.5 rad, 2.6 s period; the bottom of the arc is 2.6 above its step |
| Burrower | wakes 5.4 out, ploughs 4 at 4.5/s to its mark, rises in 0.25 s, waits; snaps within 0.45, shut for 0.5 s; 2 hp; sinks once you are 2.6 past |
| Flitter | wakes 4.4 out; drops 0.28 s, dives 1.0 s (commits 0.35 s before contact), leaves 0.8 s, circles 1.1 s, dives again; swattable in the last 0.34 s |

## Wardens

The fight runs over the last five flights of the zone while you climb. Each attack is anchored 3.2 steps ahead of you; the stuck arm or head can be hit from within 2.2 steps. The climb slows to 55% while it winds up or is exposed.

| Value | Phase 1 | Phase 2 (from half health) |
| --- | --- | --- |
| Wind-up | 1.15 s − 0.06/zone, min 0.75 | 0.78 s − 0.04/zone, min 0.5 |
| The opening (stuck in the breach) | 1.5 s | 1.1 s |
| Cracks and markers | whole wind-up | last 0.42 s only |
| Prompts and timing rings | shown | hidden |
| Combos | none | 55% of turns are two attacks |

Intro 1.4 s, strike 0.35 s, withdraw 0.4 s, death 2.2 s. Spit orb flies 0.5 s; a parry reflects it for 3 and adds 0.5 s to the opening. Slam 2 damage, swipe 1, spit 1. Health 12 + 5 per zone. Reward 25 + 10 per zone gold. Reaching the top of the stretch with it alive drops you into a fall.

## Fall

Gravity 34, top speed max(16, height/2.3). Time runs at 0.3× near a root; the grab window is 1.4 units either side.

## Camera (`TUNE.camera`)

| Mode | back | up | look |
| --- | --- | --- | --- |
| Climb | −6.5 (−3.4 in portrait, R 7) | 4.2 | 1.7 |
| Warden's stretch | −7.5 | 4.8 | 2.1 |
| Pool | −4 | 5.5 | 0 |
| Title | −5 | 4.4 | 1.6 |

`back` is the camera's radius measured from the shaft centre; negative puts it on the far side of the centre from the warrior, so a larger magnitude pulls it out. With the shaft at R 11 the climb camera is about 17.5 units from the warrior; screens under about 900 px tall bring it in (to 62% at 420 px). Landscape FOV 50° (portrait 76° is kept but unused), fog density 0.032, internal render height 720 lines. The page fills the window (decision 0008).

## Grade (`GRADE` in `src/config/constants.js`)

The rise of one step, flight by flight through a zone: `0.45, 0.35, 0.3, 0.6, 0.75, 0, 0.35, 0.45, 0.3, 0.75, 0.6, 0, 0.35, 0.45, 0.55`. Zone z plays it rotated by 4z. A zone is 8 × the sum = 50 units tall (135 m); the mean rise is 0.42 (one rise of 0.55 everywhere until 0.17). Broken steps and swings only on flights of 0.6 or less (`MAX_RISE_FOR` in `src/world/layout.js`).

## Camera v2 (`src/render/camera.js`)

| Framing | Rule |
| --- | --- |
| Grade zoom | 1.25 − 0.5 × the mean rise over the next 6 steps ahead, clamped 0.88 to 1.15 (a gallery or gentle ramp pulls out, a steep flight pushes in) |
| Slope tilt | look up by (rise − 0.45) × 2.2, clamped −0.6 to 0.8, the way he faces |
| Combat | lead toward the awake creatures within 7 steps (70%), zoom × (1 + 0.06 per creature up to 3 + 0.02 × the farthest one's distance) |
| Punch | kills and parries (hit-stop ≥ 0.09 s) push in 7%, decaying in about 0.17 s |

The zoom scales his distance from the camera; the camera stays at least 1.2 inside the wall.

## The crumbling handoff (`HANDOFF` in `src/world/handoff.js`, geometry in `src/world/path.js`)

| Value | Setting |
| --- | --- |
| Slab | from the high road's foot to 1.5 short of the first intact step; rests level with the fork landing |
| First intact step | the first step boundary at least 4.6 along the high road |
| Rises to | 0.15 under the first intact step's top |
| Timing | shudder 0.6 s, rise 1.3 s, hold 1.1 s (it shakes for the last 0.45), fall, gone 2.2 s, a new slab rises in 1.0 s |
| Miss | one health; back on the fork landing |
