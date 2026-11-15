# The Circle of the Moon project (theory)

An idea for The Climb, taken from what made *Castlevania: Circle of the Moon* (Konami, Game Boy Advance, 2001) so loved:
its **Dual Set-up System**, where two small sets of collectibles multiply into a large set of powers. Nothing here is
built yet. Everything we have stays: the blade and its combo, the keepers' gifts, the relics, the Metroidvania plan
(`docs/metroidvania.md`). This would sit on top of all of it.

We take the *idea* (two halves that combine), not the game: no planets, no cards, no mythical-beast names, none of its
effects copied. Ours is made from The Climb's own places and people.

## What Circle of the Moon did

**The system.** Twenty cards, ten of each kind. An **action** card says *what form* the power takes; an **attribute**
card says *what it is made of*. Set one of each from the pause menu and the pair becomes a power: about a hundred
combinations from twenty cards. Examples reported by guides:
- the same "attack from the whip" action makes a fireball with the fire attribute, freezing rays with ice, a homing ball
  of light with light;
- one action is always a kind of **defence**: two fireballs circling him, a ring-shaped barrier of light;
- another **changes the weapon**: a holy sword, a slow laser, a blade whose damage and reach grow the longer it is held;
- another turns an element's hits into **healing**;
- others **raise stats**, or **summon** a companion or a creature.

The powers ran on magic points: some cost per use, some drained while held.

**Movement.** Separate from the cards, the game gave movement relics that opened the castle: a dash, a double jump, a
shoulder tackle through certain blocks, wall-kicking boots, a ring for pushing heavy blocks, a way to walk through
poisoned water, a very high jump.

**Afterwards.** Finishing it unlocked new ways to play again, each changing the rules (one starts with every card and is
physically weak; another has no cards and is strong; one is about luck).

**What players loved:**
- the experimenting ("what does this pair do?");
- that twenty finds became a hundred powers;
- the strong combinations that let you break the game a little;
- the replay modes.

**What they criticised:**
- the cards dropped rarely, and only from certain enemies, so the best ones meant a long grind;
- you were never told where a card was;
- some combinations made the game trivial while many were barely useful;
- the dark screen, on the original hardware, which does not apply to us.

## The idea for The Climb: kindling

Our version, in plain words: **he carries two halves, and together they make a power.**

- **A way** (the form): how the power comes out. In the blade, thrown, as a ring around him, along the ground. Later:
  through his scarf, as mending, as a small companion.
- **A kindling** (what it is made of): something taken from a place on the mountain. Water from the Roots' pool, bone
  from the Ossuary, a bell's ring from the Cloister, frost from the Spires. Later: storm, thorn, starlight, lamp-fire.

**Embers** (what he already gathers from fallen creatures) are what the power burns. A thrown power costs a few embers a
throw; a ring around him burns them while it lasts. So embers stop being only slow healing and become something to choose
how to spend, the way Hollow Knight's soul works.

Names are working names: they follow `docs/writing.md` (plain; what a thing is).

### What makes ours different: every power also changes the world

In Circle of the Moon, the combinations were almost all for fighting, and the castle was opened by the separate movement
relics. In The Climb, **many combinations are also keys**, so the Metroidvania plan gets a second layer of things to
come back for:
- ice laid across a gap;
- a geyser that throws him higher;
- a sound that finds hollow walls;
- a bubble to stand on.

The keepers' gifts stay the big movement powers. The kindlings add smaller, cleverer ways through, and secrets that need
a particular pair (with a clue in the room).

### The first sixteen (four ways by four kindlings)

| | **Water** (the Roots) | **Bone** (the Ossuary) | **Bell** (the Cloister) | **Frost** (the Spires) |
|---|---|---|---|---|
| **In the blade** | Cuts send a wave that pushes back. *Douses fires.* | Hits mend him a little | Every third cut rings out and stuns. *Rings the bell-doors open.* | Cuts freeze; a frozen creature is a step for a moment. *Freezes dripping water into ledges.* |
| **Thrown** | A bubble that carries small creatures off. *A bubble he can bounce on.* | A bone that comes back, hitting twice. *Hits switches round corners.* | A ring of sound that goes through walls. *Shows hollow walls and hidden rooms.* | An ice shard. *Freezes a pool where it lands into floor.* |
| **A ring around him** | A shell of water: hits soaked, half the harm. *Walks through flames.* | Bone shards circling, cutting what comes close | A ward of sound that turns back spit and thrown things | Cold that slows what is near. *Freezes water under his feet as he walks.* |
| **Along the ground** | A geyser under him. *Throws him higher than any jump.* | A row of bones bursting up from the floor | A shock through the floor that knocks loose stone down. *Topples boulders and statues.* | A path of ice laid out ahead. *Bridges a gap for a few seconds.* |

*Italics: what it does in the world.* About half are keys as well as weapons; every one is worth something in a fight.

**Later halves:**
- **Kindlings:** storm, thorn, starlight, lamp-fire (each from its region).
- **Ways:**
  - *through the scarf:* it lashes out and grabs;
  - *mending:* each kindling heals a different way;
  - *a companion:* a small ember-moth that fights beside him.

All told, about seven ways by eight kindlings: some fifty-six powers.

### Built so that it is cheap to grow

Circle of the Moon had a hundred effects, each made by hand. We would build each **way** once (how it behaves: on the
blade, thrown, a ring, along the floor) and each **kindling** once:
- its look: colour and particles;
- what it does to a creature: freeze, stun, burn, push, steal life;
- what it does to the world: freeze water, ring bells, show hollow walls, raise water, grow on soil.

Each new half then adds a whole row or column of powers. Most of it is effects we can already draw (particles, light,
simple shapes), so it needs little new art.

## Learning from what players criticised

| Their problem | Ours |
|---|---|
| Rare random drops, and grinding for them | **Every half is placed**, never dropped at random. A kindling is found in its region, usually as the prize of a side area (so the wings get a reward that matters). A way is given by one of the people. |
| Never told where they were | **Corwen writes it down.** His Annals keep a page of every pair tried and what it did, and a hint for each half not yet found. |
| Some pairs broke the game, many were useless | Each pair costs embers in proportion to its strength; a keeper shrugs off its own region's kindling; every pair has a use. |
| Stopping to dig in a menu | Pairs are set in the pause, and **three favourite pairs** can be swapped with one button while playing. |
| | Corwen counts the pairs found: the fun of filling in the table. |

## How it fits with what we have

- **The blade** stays the main weapon. *In the blade* is one of the ways.
- **The keepers' gifts** stay the big movement powers.
- **Relics** stay passive. The earlier scarf-knots idea fits naturally: the two halves are worn as two knots in his scarf.
- **The second-weapon idea** (the Sexton's spade and others) can wait. Kindling gives most of the variety with far less
  art, and a weapon could later become one more *way*.
- **The Metroidvania plan:** the per-gift report (`tools/gifts-report.mjs`) can be extended to pairs, so we can measure
  what each pair opens, and secrets that need a pair are tested like gates.
- **Later, replay modes** in the same spirit:
  - a climb with every half from the start but fewer hearts;
  - a climb with no kindling at all, but a tempered blade.

## If we build it: in stages

1. **Feel test.** Embers as the meter, and two ways by two kindlings: in the blade and thrown, with water and frost.
   Four powers, playable, to see if it feels good.
2. **The first sixteen,** with the pause screen to set them, the three favourites, and Corwen's page.
3. **The world uses** of those sixteen, and a few secrets in the built regions that need a pair (with clues).
4. **The later halves,** one per region as the wings are built.

Sources (search summaries; several sites are blocked from this session):
- [Castlevania Wiki: Jupiter (card)](https://castlevania.fandom.com/wiki/Jupiter_(card))
- [Castlevania Wiki: Diana (card)](https://castlevania.fandom.com/wiki/Diana_(card))
- [Castlevania Wiki: Neptune (card)](https://castlevania.fandom.com/wiki/Neptune_(card))
- [Castlevania Dungeon: DSS cards](https://castlevaniadungeon.net/cotm/cards.htm)
- [Almar's Guides: cards](https://almarsguides.com/retro/walkthroughs/GBA/games/CastlevaniaCircleoftheMoon/Misc/Lists/Cards)
- [Hardcore Gaming 101: DSS card mythology](https://www.hardcoregaming101.net/cvbackup/myth/dsscardmyth.htm)
- [Nintendo Life review](https://www.nintendolife.com/games/gba/castlevania_circle_of_the_moon/review)
- [Goomba Stomp retrospective](https://goombastomp.com/castlevania-circle-of-the-moon-retrospective/)
- [Destructoid: the card grind](https://destructoid.com/?p=285952)
- [Steam discussion (Advance Collection)](https://steamcommunity.com/app/1552550/discussions/0/2953789422392720306)
