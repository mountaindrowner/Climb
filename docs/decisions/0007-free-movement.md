# 0007 — The player moves the warrior

**Context.** The prototype auto-climbed, runner-style, with set moments to jump, duck and strike. The direction from playtest: let the player move him, with tight, snappy movement and animation like Dead Cells.

**Decision.** Free movement along the stair (right climbs, left goes back down), with a stick on the left thumb and Jump, Attack, Block and Roll on the right. The motor uses the standard tight-platformer techniques Motion Twin has described for Dead Cells: near-instant acceleration and turning, full air control, variable jump height with heavier fall gravity, coyote time and a jump buffer, an invulnerable roll that cancels attacks, buffered combos with recovery cancels, hit-stop, knockback, and enemy commit points. Threats were reworked for a player who can stop: traps trigger on approach, broken steps are real holes, beams are low ceilings, creatures chase, commit and recover.

**Consequences.** Waiting and backing off are now valid answers, so threats lean on positioning and commit points rather than forced timing. The climb's length is now set by the player's pace (the 30-minute target needs re-measuring on a phone). The test bot plays through the same controls as a player. The parked Warden fight reads the new state but has not been redesigned for free movement.
