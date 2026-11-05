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
| Climb | −3.4 (was −0.9 in v3, −2.3 in 0.4) | 3.2 | 1.45 |
| Warden's stretch | −4.6 | 3.7 | 1.9 |
| Pool | −2 | 4.5 | 0 |
| Title | −2.6 | 3.6 | 1.4 |

`back` is the camera's radius measured from the shaft centre; negative puts it on the far side of the centre from the warrior, so a larger magnitude pulls it out. Portrait FOV 76°, landscape 58°, fog density 0.05. The stage is capped at 600 px wide on desktop.
