# Warden movesets

One module per Warden. A moveset exports `attacks` (name → `{ answer, prompt, damage, hitText }` where `answer` is `jump`, `duck` or `block`) and `pick()`, which chooses the next attack. The fight's phases, the kneel and the parry rules are shared in `../warden.js`; the pose for each attack is in `../visuals.js`.

| Zone | Module | Status |
| --- | --- | --- |
| The Deep | `deep.js` | Built: slam, sweep, spit |
| The Flooded Halls | `drowned.js` | Not started; zone points at `deep` |
| The Forge Galleries | `forge.js` | Not started |
| The Fungal Caverns | `spore.js` | Not started |
| The Collapsed Workings | `broken.js` | Not started |
| The Long Stair | `stair.js` | Not started |
| The Peak | `last.js` | Not started |

To bring a new one online: write the module, add it to `MOVESETS` in `../warden.js`, and set `warden:` in that zone's file under `src/zones/`. A new attack that needs a new pose or marker also needs a branch in `visuals.js`.
