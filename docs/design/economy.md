# Economy and progression

Gold is earned on the climb, spent at rest stops, and half is lost on every fall. Throwing it down the shaft is a real gamble. Code: `src/config/economy.js`, the rest stop in `src/ui/screens/camp.js`.

**Sources.** Nugget 1, crawler 3, spitter killed by parry 4, a hidden hall's chest 10 + 4 per zone (and the flask filled), Warden 25 + 10 per zone.

**Rest stop.** Flask charge 12 (heals 2). Whetstone 25 (+1 damage this climb, up to 2). Iron heart 30 (+1 max health this climb, up to 2). Throw gold: all of it; waits in the Pool unless the pouch bursts (10% + 1% per 4 m, capped at 60%). Weapon swap free.

**Weapons.** Short sword 1 dmg / 0.22 s / reach 1.7. War pick 2 / 0.5 / 1.6. Spear 1 / 0.32 / 2.5.

**What persists.** Lifts, beaten Wardens, stashed gold, weapon, best height, falls, half of carried gold; banked wellstone, blueprints found and bought, the Pool's upgrades, runes. Not: rest stop upgrades, oaths, marks, carried wellstone.

**The run layer (0.25).** Definitions in `src/config/run.js`, the rules in `src/run/run.js`.

- *Wellstone.* Kills: crawler 2, flitter 1, burrower 2, spitter 3 (half again with the Mark of the Seam). A hidden hall's chest: 6 + 2 per zone. Sent down from a rest stop it is banked for good; carried, a fall loses all of it.
- *Blueprints.* A kill finds one 7% of the time while any are left; every hidden hall's chest has one (the first hall opened above the Deep gives the ram instead). Found is for good. Prices at the Pool: Vigil 40, Fleet 45, Finisher 50, Bearer 55, Seam 60, Second Breath 70.
- *Oaths.* Edge: blows ×(1 + 0.3 per oath). Lantern: +1 max health and healed 1 per oath. Knell: swings 8% quicker per oath and the parry window 0.03 s wider. Three stones a region, two oaths each.
- *Marks.* One per rest stop, three a climb. Root (the first fall is caught at a root), Tithe (gold ×1.5, keep ¾ on a fall), Ward (a parry heals 1, every 8 s), Vigil (every 4th kill heals 1), Finisher (the combo's last blow +1), Fleet (roll cooldown halved, sprint +10%), Seam (wellstone ×1.5), Second Breath (at 1 health, recover to 3, once a climb), Bearer (the flask heals 3).
- *The Pool's upgrades.* A deeper flask (+1 charge) 50, 120. Hald mail (+1 max health) 80, 180. Fetch's credit (+15 starting gold) 40, 90, 160.

**Proposed progression.** Throw gear, not just gold, each with a break chance. Height-based unlocks (starting gear, abilities, perks). Flask upgrades. Cooldown abilities. A ghost of your best run. Home: `src/save/` for what persists, a future `src/progression/` for unlock tables.
