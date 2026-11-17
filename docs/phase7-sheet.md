# Phase 7: the keepers (the sheet)

For approval before building (`docs/roadmap.md`, the finish line). The aim is Hollow Knight's: a keeper takes a few
tries at Climber, and every time he is hurt the player can say what they should have done.

## What is there now

Every keeper already has two phases (the second from half health) and its own entrance. What each does:

| Keeper | Phase one | Added from half health | How it is hurt |
|---|---|---|---|
| The Warden | fist slam, fist sweep | ripples from the slam, stones from the roof | cut a fist while it rests |
| The Toll | swings, slam | ripples, cinders from the roof | cut the bell while it lies on the stage |
| The Rime Wyrm | sweep, plunge | ice spikes, a breath of icicles | cut its head while it is caught |
| The Thunderhead | bolts, a walking line, gust | both ends, two rods, arcs | cut a burning rod, then its bared heart |
| Mother Thorn | thorns, sweep, slam, pods | rows, both arms, three seeds | plunge into the open flower |
| The Fallen | his own combo, roll, dash, plunge, turn | steps through the world, star-shards | cut it as it recovers; parry |

What is missing:
- Nothing a keeper does comes from **its own place**; all are blows of its body, or things from the roof.
- **Warnings are uneven:** some attacks have a red mark and a sound, some only a pose.
- **Nothing checks that each attack can be avoided,** or how hard each fight is.
- Since phase 5 the **spade's great blow does 4**, twice what the keepers were measured against.

## 1. One new attack each, from its own place

Each is thrown or sent, so the fight has something to read at a distance. Each has a warning, a way out, and a second
form from half health. All drawn in code.

| Keeper | The attack | Warning | The way out | From half health |
|---|---|---|---|---|
| **The Warden** | It tears a block from the wall and **bowls it along the stage** | its arm goes back; the block glows | jump it; the spade breaks it | two, one from each end |
| **The Toll** | **Hymn-books** shaken from the lofts flutter down, drifting side to side | a toll, and pages falling first | stand between them; cut one | with every slam, **bell shards** fly out low in a fan: jump them |
| **The Rime Wyrm** | It rears and **spits three shards of ice** in a spread | its jaw glows blue, a line for each shard | stand between two; block; roll | five, then five more between |
| **The Thunderhead** | **Ball lightning** comes down a rod and rolls along the stage after him, slowly | the rod crackles; a spark runs down it | outrun it or jump it; it bursts on a burning rod, or when cut | two at once |
| **Mother Thorn** | **Seeds that root:** where a seed lies uncut it roots, and a patch of thorns stands there a while | the seed pulses; roots creep out | cut the seed first; step round the patch | the patches last longer; three seeds |
| **The Fallen** | It lifts the dark lamp and **embers drift out** in a ring, slowly, with gaps | it stops, and the lamp is raised | go through a gap; they can't be blocked | two rings, turned against each other |

## 2. Every attack warned the same way

One rule for all six, so a warning always reads the same:
- **Where:** a red mark or line on the stage exactly where it will land, for at least 0.45 s.
- **When:** the keeper's own sound as the warning starts, and a flash on the last tenth of a second.
- **Nothing lands without both.** I go through every attack of every keeper and bring it to this.

## 3. Hard, and fair (decided: the keepers grow with him)

He gathers hearts and harder blows as he climbs (threads, the spade, the tempered blade, relics), so each keeper has a
little more health than the last, and the later ones hit a little harder. Not much: the fight should get longer by a
few blows, not turn into a wall.

| Keeper | Health (was) | Its heaviest blow |
|---|---|---|
| The Warden | 28 (24) | 1 heart |
| The Toll | 32 (26) | 1 |
| The Rime Wyrm | 38 (30) | 2 (its plunge) |
| The Thunderhead | 40 (30) | 2 (a rod's strike) |
| Mother Thorn | 44 (32) | 2 (an arm's slam) |
| The Fallen | 44 (30) | 2 (its plunge and its dash) |

- Everything else a keeper does stays 1 heart.
- The spade keeps its full blows against keepers (2, 2 and 4).
- Second phases come a little faster (waits between attacks about 15% shorter).
- Story and Summit stay two hearts more and two fewer.

## 4. A check that plays every attack

A tool that runs the real game (`tools/keeper-check.mjs`), for every keeper and every attack, in both phases:
- he stands still: he must be hurt (the attack is real);
- he does the way out the sheet names (step aside, jump at the mark, roll, block): he must not be hurt;
- the warning lasted at least 0.45 s.

It prints a table. It runs in a browser, so it is run before each build that touches a keeper, not on every test run.
The table goes in `docs/keepers.md`, with each attack's warning and way out, so the next change starts from it.

## 5. What each leaves

Phase 5 made the gift a thing that comes to him. Each keeper's thing, named on its card:

| Keeper | Gift | The thing |
|---|---|---|
| The Warden | the spade | the spade (done) |
| The Toll | the air dash | **the ringers' boots** |
| The Rime Wyrm | the glide | **a wyrm's scale**, tied into the scarf |
| The Thunderhead | a heart | a heart of the storm (as now) |
| Mother Thorn | a flask draught | a drop of her dew (as now) |

The names of the powers stay (the Toll's Step, the Wyrm's Wind); the card's first line says what the thing is.

## Cost

- **Art:** none.
- **Size:** two builds: the Warden, the Toll and the Wyrm with the check; then the Thunderhead, Mother Thorn and the
  Fallen.

## Left for later

- The wings' and the Deep's own keepers (phases 10 to 17).
- Tuning from real playtests: the numbers here are a first setting.
