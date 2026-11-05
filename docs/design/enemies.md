# The threat catalog

Every threat has one clear answer on the four buttons and a tell you can read before you need to act. B always defends and A always kills. Code: one module per threat in `src/entities/hazards/` and `src/entities/enemies/`, registered in `src/entities/registry.js`, described in `src/entities/catalog.js` (which the Practice screen and the tests read).

## Hazards

| Threat | Tell | Answer | Notes |
| --- | --- | --- | --- |
| Broken step | The slab is split by glowing cracks; it crumbles into the shaft as you reach it | ▲ jump | 1 damage and a stumble |
| Fallen beam | A splintered timber wedged diagonally across the stair at head height; it creaks and sheds dust as you near | ▼ duck | 1 damage |
| Rockfall | Grit trickles from the dark, a shadow ringed in amber grows on a step, a boulder drops to land as you arrive | B shield up (held overhead) | Parry as it lands to shatter it for 2 gold |
| Swinging weight | A chained, iron-banded boulder hangs cocked up the stair on a rope; the rope snaps and it swings down to the bottom of its arc, at head height, as you arrive | ▼ duck | Keeps swinging behind you, dying down |

## Creatures

| Threat | Tell | Answer | Notes |
| --- | --- | --- | --- |
| Crawler | A crack glows; it skitters out on six legs, rears with red eyes and open mandibles, lunges after 0.5 s | A, or B to block then A | 3 gold; 2 hits from zone 3 |
| Spitter | Grips the wall above; its sac swells and glows, an aim line finds you, it recoils as it spits | B to block; parry to burst it | 4 gold on a parry |
| Burrower | A ring of glowing cracks marks a step; a mound with a fin of bone ploughs down the stair toward it, leaving a glowing furrow; jaws burst up as you cross | ▲ jump | Its position follows yours, so it always arrives as you do |
| Flitter | Roosts head-down on the wall; shrieks, drops, loops out over the shaft and dives at your head while a ring closes | A to swat, or B to block | 2 gold on a swat |

## Rules that keep them fair

- **Timed to you.** Rockfall and the swinging weight start their motion from your current speed, so the boulder lands and the weight bottoms out as you arrive. The burrower's mound moves with your position. Slowing down never makes them unfair.
- **Physical resolution.** The rockfall only hits if you are under it when it lands, and the weight only hits if it actually reaches your head. A slow-down can make one miss you; it can never hit you from somewhere it is not.
- **One answer each.** The bot in `tools/smoke.mjs` plays a Practice run of every threat answering correctly and must take no hits, then idles through each one and must get hurt.
- **First-sight hints.** The first time a player meets a threat, that instance shows its hint. Seen threats are saved.
- **Readable on dark stone.** Creatures carry a faint outline in the zone's glow and glowing eyes; hazards have warm warning marks (glowing cracks, amber ring).

## Where they appear

Each zone module (`src/zones/*.js`) lists the threats it draws from, repeated to weight them. The Deep leans on the classic four and introduces the rest; the Collapsed Workings are heavy on rockfall and broken steps; the Fungal Caverns on flitters and burrowers.

## Practice

The title screen's **Practice a threat** runs nine flights of a single threat. Nothing is saved. Use it to judge each one on a phone.

## Designing a new threat

Name the tell, the one answer, the damage and the reward, and the zone feature it comes out of. Then write one module with `build`, `update`, `draw`, `hud` and a `hint` (plus `hittable`, `hit` and optionally `inReach` if A can strike it), add it to the registry and the catalog, add it to some zone pools, and teach the bot in `tools/smoke.mjs` how to answer it.
