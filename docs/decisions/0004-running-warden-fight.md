# 0004 — The Warden fight happens on the move

**Context.** The prototype stopped the climb on a platform for each Warden. That broke the one rule the game is built on (the climb is the score, and it never stops) and made the Warden a wall of blocks beside the stair. The direction notes asked for the Warden to be part of the backdrop, smashing through the layers while the warrior keeps running.

**Decision.** There is no boss mode and no arena platform. The Warden lives behind the wall and hunts the warrior over the last five flights of its zone. It attacks by breaking through: cracks, then a breach, then an arm or head in the lane. The opening is the stuck limb, hit in passing. Reaching the top of the stretch alive makes it tear the stair out, so the fight is also a race.

**Consequences.** The fight is driven from the climb loop (`modes/climb.js` calls `startBoss` and `updWarden` while `arenaOf(k)` matches). The lift moved to flight 5 and the rest stop to flight 8 to make room. Per-zone Wardens are now mostly a question of what comes through the wall and how, which is a content and visuals job on top of the shared state machine.
