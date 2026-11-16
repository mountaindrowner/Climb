# Phase 3: teaching, and words (the sheet)

For approval before building (`docs/roadmap.md`, the finish line). What good tutorials do, what that means for The
Climb, and exactly what will be built.

## What the research says

Sources are at the end. Several developer sites are blocked from this session, so some points come from summaries of
their talks and articles.

1. **Teach by doing, in a safe place, one thing at a time.** Super Mario Bros. World 1-1 teaches jumping, enemies and
   power-ups without a word: the level is shaped so the player discovers each one. Celeste's prologue adds one move at
   a time.
2. **Introduce, then use, then combine.** A new thing is first met where failing costs nothing, then where it matters a
   little, then mixed with what came before (Celeste; Hollow Knight's King's Pass lets you confirm a move before the
   hazards come).
3. **Help only when it is needed.** The best help is a hint that appears only when the player struggles (stands at a
   gap, fails it), not a list of controls up front. Players rarely read blocks of text.
4. **Don't wall the tutorial off.** A studio found almost nobody finished their separate "tutorial island"; short hints
   that appear only when relevant worked best. Hyper Light Drifter's designer gives each thing as it is needed.
5. **Words only where a picture can't do it.** Hollow Knight teaches almost everything wordlessly, but explains its
   one hidden system (Soul) on a single readable tablet. Text is for systems, not for jumping.
6. **A new power is used at once.** Metroidvanias put an obstacle that only the new power clears right where it is
   given (Hollow Knight's first keys; The Messenger points out where to use a new move; Animal Well gives each item in
   a place that makes its use obvious).
7. **Respect the player.** Team Cherry added a gentler first area to Silksong, "respectful to the player, not trying to
   baby them": guidance that doesn't stop the game or talk down.
8. **Lessons that invite a return.** King's Pass shows something you can't use yet, so you come back with the "aha".
9. **Getting something is an event.** The pickup is confirmed visually and appears in the HUD.

## How The Climb applies it

- **No tutorial island.** The opening of the Roots (the cistern he wakes in, the corridor, the tunnel) becomes the
  lessons, in the game itself. Almost all of it already has the right shape (a spike pit to jump, a crawler to cut, a
  low stretch to crouch under); what is missing is order and help at the right moment.
- **Help only after a struggle, once each, never in the way.** A hint shows the real button for his device (keyboard,
  pad, touch), under him, small, and goes the moment he does it. Each appears once ever (saved). An option, Hints:
  on / off.
- **Words for systems only:** the knots, the embers, the map, weapons. One short card each, at the moment it first
  matters, with a picture. Two lines at most.
- **Everything he gets is an event:** a card in the middle with a picture of the thing, what it does (big, plain, with
  numbers where there are numbers), and where it came from (small, quiet, under it).

## What will be built

### 1. The opening, in order (the Roots' first rooms, reshaped where needed)

Each lesson: the place asks for it; if he hasn't managed after a moment there, the hint appears.

| # | Where | The place asks | The hint (only if he struggles) |
|---|---|---|---|
| 1 | He wakes in the pool | Walk out of the cistern | "MOVE" with the stick or keys, after 4 s still |
| 2 | The cistern's lip (a step two tiles high) | Jump | "JUMP", after he walks into it twice |
| 3 | The red thread on the high ledge | A second jump (optional, a reward) | "JUMP AGAIN IN THE AIR", after two jumps under it that fall short |
| 4 | The corridor's spike pit | A running jump | none (2 has taught it) |
| 5 | The corridor's crawler, alone | Cut | "CUT", when it is near and he hasn't swung |
| 6 | Its lunge (it rears first) | Block, or roll through | "BLOCK" after the first lunge lands; after the first block, "BLOCK AS IT LANDS: IT GOES BACK" (the parry) |
| 7 | The tunnel's low stretch | Crouch, or roll under | "CROUCH" (or "ROLL"), after he walks into it |
| 8 | A plank floor with the way on below it (the tunnel's stair head) | Drop through | "DOWN AND JUMP: THROUGH THE PLANK", after 4 s on it |
| 9 | The first leak and the raising water | Rest; the knots later | the existing banners |

The wall of control text at the start is removed; the pause screen keeps the full list of controls.

### 2. Cards for the systems (once each, two lines, a picture)

- **The knots**, when the first relic is found: "Relics work only while tied into his scarf. He has a few knots; choose
  what he wears at the water." (Picture: the scarf with a gold knot.)
- **The embers**, when the first gift that uses them is given: "Embers come from every blow that lands. A full measure
  pays for a power, or mends a heart when the flask is dry." (Picture: the three measures.)
- **The map**, the first time it is opened: what the marks are.
- **A second weapon**, when the spade is taken: what it is and which key swaps.

### 3. Item cards (a page in the middle of the screen)

For every relic, gift and weapon:
- a picture of the thing (drawn in code from the palette, 32 px);
- its name;
- **what it does**, one plain line, large;
- where it came from, small and quiet under it.

What a relic does, rewritten plainly:

| Relic | Now | Becomes |
|---|---|---|
| Well-keeper's Whetstone | The third cut bites deeper. | The last cut of each string hits harder (+1). |
| Bell-ringer's Lodestone | Shards and embers come to him from further off. | Shards and embers fly to him from twice as far. |
| Climber's Knot | No fall can hurt him. | No fall can hurt him. |
| Wright's Stormglass | His plunge lands with lightning: wider, and harder. | His plunge strikes with lightning: wider, and +1 harm. |
| Gardener's Seed | Seven embers mend a heart, where it took ten. | Mending a heart costs 7 embers instead of 10. |
| Guild Tally | Urns spill half again as many shards. | Urns give 50% more shards. |
| Sexton's Stylus | Every creature he strikes down gives two embers more. | Each creature he kills gives 2 more embers. |
| Astronomer's Compass | The map shows what is still to be found. | The map shows what is still to be found. |

The gifts' cards get the same treatment: one plain line of what it does, then one line of how ("Down and cut, in the
air: the plunge"). The keeper's coalescing moment itself is phase 5.

### 4. Prompts say what they do

| Now | Becomes |
|---|---|
| S TALK | [S] TALK |
| S OPEN | [S] OPEN |
| S KNOTS | [S] REST · TIE KNOTS |

The key is drawn as a small key or button picture for the device, not a letter in the sentence.

### 5. The screen

- The ember meter is hidden until he has the first gift that uses embers.
- A small panel under the hearts shows the weapon in hand (a picture), and, once he has two, the swap key.
- The start's control text goes (see 1).

### 6. "What he carries" (a new screen from the pause)

One page, in four rows:
- the gifts (each as its picture, with its line);
- the weapons;
- the relics, tied ones lit, carried ones dim, with "x of y knots";
- the thread (hearts, strands toward the next) and the flask.

Selecting one shows its card.

### 7. The people say who they are

The first time each is met, their first line says who they are and what they do, in their own voice:
- **Ordric:** "I keep the lamps by the water. Bring me shards and I can do a little for you."
- **Corwen:** "I write the mountain down. Ask me what is still to be found here."
- **Mirel:** "I am Mirel. I climb, and I count."

Their later lines stay.

### 8. Tests

- A test that every hint's place exists and can be reached.
- A test that each card's text keeps to the writing rules: short lines, no theme words.
- The playtest list for you is the opening itself: a first-time player, no explanation from you, and note where they
  stop.

## Cost

- **Art:** none. The pictures (items, keys, buttons) are drawn in code from the palette.
- **Size:** about one build's work.
- **Left for later:** the keeper's gift moment (phase 5) and the people's own places (phase 8).

## Sources

- [Hollow Knight's Tutorial Is A Design Masterclass (Indie Game Culture)](https://indiegameculture.com/hollow-knight/hollow-knights-tutorial-is-a-design-masterclass)
- [Silksong's first area was added for a softer intro (GamesRadar)](https://www.gamesradar.com/games/action/silksongs-first-area-was-only-added-after-team-cherry-realized-it-needed-a-softer-intro-were-trying-to-be-kind-of-respectful-to-the-player-were-not-trying-to-baby-them)
- [How Miyamoto built World 1-1 (Game Developer)](https://gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1)
- [Miyamoto explains World 1-1 (BGR)](https://bgr.com/general/super-mario-bros-world-1-1-design/)
- [Level Design Workshop: Designing Celeste (GDC Vault)](https://gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste)
- [The art of the tutorial: when to hold a player's hand (Game Developer)](https://gamedeveloper.com/design/the-art-of-the-tutorial-when-to-hold-a-player-s-hand-when-to-let-it-go)
- [Lessons in onboarding from Plants vs Zombies (UX Collective)](https://uxdesign.cc/lessons-in-onboarding-from-plants-vs-zombies-d936d58c10c)
- [Tutorials as UX: an indie dev's onboarding roadmap (Wayline)](https://www.wayline.io/blog/tutorials-ux-indie-dev-onboarding)
- [Game UX: best practices for tutorial design (Inworld)](https://inworld.ai/blog/game-ux-best-practices-for-video-game-tutorial-design)
- [Metroidvania Analysis (HSLU)](https://blog.hslu.ch/games/files/2021/11/Metroidvania_Analysis.pdf)
- [How Animal Well turns Metroidvania tropes into a subtle tutorial](https://criticalvideogamestudies.com/learning-without-text-how-animal-well-turns-metroidvania-tropes-into-a-subtle-tutorial/)
- [How does The Messenger make you a master? (Game Developer)](https://gamedeveloper.com/design/how-does-the-messenger-make-you-a-master-)
- [Methods of creating invisible tutorials (Game Developer)](https://gamedeveloper.com/design/methods-of-creating-invisible-tutorials)
- [Prisoners' Quarters (Dead Cells wiki)](https://deadcells.wiki.gg/wiki/Prisoners%27_Quarters)
