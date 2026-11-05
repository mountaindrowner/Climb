# The threat catalog

Every threat has a clear first answer and a tell you can read before you need to act. B always defends, A always kills, and the roll gets you through most things. With free movement, waiting and backing off are answers too: traps trigger as you approach, creatures chase, commit and recover. Code: one module per threat in `src/entities/hazards/` and `src/entities/enemies/`, registered in `src/entities/registry.js`, described in `src/entities/catalog.js` (which the Practice screen and the tests read).

## Hazards

| Threat | Tell | Answer | Notes |
| --- | --- | --- | --- |
| Broken step | The slab is split by glowing cracks; it crumbles as you come near and leaves a real hole | ▲ jump | Fall in: 1 damage, back on the last solid step |
| Fallen beam | A splintered timber wedged diagonally across the stair at head height; it creaks and sheds dust as you near | ▼ crouch-walk or roll under | A low ceiling: standing, you cannot pass; running into it costs 1 |
| Rockfall | Grit trickles from the dark, a shadow ringed in amber grows on a step, a boulder drops as you would step under it | Hold B overhead, stop short, or roll | Parry as it lands to shatter it for 2 gold |
| Swinging weight | A chained, iron-banded boulder hangs cocked up the stair on a rope; the rope snaps as you near and its first pass reaches you at head height | ▼ crouch, roll, or time your run | Settles into a steady swing you can learn |

## Creatures

| Threat | Tell | Answer | Notes |
| --- | --- | --- | --- |
| Crawler | A crack glows; it skitters out and chases you, rears with red eyes, its aim locks, it lunges, then it is open for 0.6 s | A; hold B or roll the lunge | 3 gold; 2 hits from zone 3; a parry stuns it longer |
| Spitter | Grips the wall above; its sac swells and glows, an aim line finds you, it spits straight at where you were, again and again | Hold B; parry to burst it; roll or step aside | 4 gold on a parry |
| Burrower | A ring of glowing cracks marks a step; a mound with a fin of bone ploughs toward it; jaws rise there and wait, snapping at anything standing in them | ▲ jump over, or A to kill it | 3 gold for the kill; sinks once you are past |
| Flitter | Roosts head-down on the wall; shrieks, loops out over the shaft and dives at your head while a ring closes; circles back for more | A to swat; hold B or roll | 2 gold on a swat; commits 0.35 s before contact |

## Rules that keep them fair

- **Timed to you.** Rockfall and the swinging weight start their motion from your current velocity, so the boulder lands and the weight bottoms out as you would arrive. Stop short and they miss you.
- **Physical resolution.** The rockfall only hits if you are under it when it lands, and the weight only hits if it actually reaches your head. A slow-down can make one miss you; it can never hit you from somewhere it is not.
- **Fair, and dangerous.** The bot in `tools/smoke.mjs` plays a Practice run of every threat through the real controls, answering correctly, and must take no hits; then it walks straight into each one and must get hurt.
- **First-sight hints.** The first time a player meets a threat, that instance shows its hint. Seen threats are saved.
- **Readable on dark stone.** Creatures carry a faint outline in the zone's glow and glowing eyes; hazards have warm warning marks (glowing cracks, amber ring).

## Where they appear

Each zone module (`src/zones/*.js`) lists the threats it draws from, repeated to weight them. The Deep leans on the classic four and introduces the rest; the Collapsed Workings are heavy on rockfall and broken steps; the Fungal Caverns on flitters and burrowers.

## Practice

The title screen's **Practice a threat** runs nine flights of a single threat. Nothing is saved. Use it to judge each one on a phone.

## Designing a new threat

Name the tell, the one answer, the damage and the reward, and the zone feature it comes out of. Then write one module with `build`, `update`, `draw`, `hud` and a `hint` (plus `hittable`, `hit` and optionally `inReach` if A can strike it), add it to the registry and the catalog, add it to some zone pools, and teach the bot in `tools/smoke.mjs` how to answer it.
