# Economy and progression

Gold is earned on the climb, spent at rest stops, and half is lost on every fall. Throwing it down the shaft is a real gamble. Code: `src/config/economy.js`, the rest stop in `src/ui/screens/camp.js`.

**Sources.** Nugget 1, crawler 3, spitter killed by parry 4, Warden 25 + 10 per zone.

**Rest stop.** Flask charge 12 (heals 2). Whetstone 25 (+1 damage this climb, up to 2). Iron heart 30 (+1 max health this climb, up to 2). Throw gold: all of it; waits in the Pool unless the pouch bursts (10% + 1% per 4 m, capped at 60%). Weapon swap free.

**Weapons.** Short sword 1 dmg / 0.22 s / reach 1.7. War pick 2 / 0.5 / 1.6. Spear 1 / 0.32 / 2.5.

**What persists.** Lifts, beaten Wardens, stashed gold, weapon, best height, falls. Half of carried gold. Not: rest stop upgrades.

**Proposed progression.** Throw gear, not just gold, each with a break chance. Height-based unlocks (starting gear, abilities, perks). Flask upgrades. Cooldown abilities. A ghost of your best run. Home: `src/save/` for what persists, a future `src/progression/` for unlock tables.
