# The keepers' entrances

How each keeper comes in (`src/side/entrance.js`), and why. The code holds the numbers; this says what each part is for.

## What the research says

Dev blogs, design write-ups and forum threads on boss intros come back to the same handful of things:

1. **An intro has two jobs:** build anticipation, and show that this is a real threat (its scale, its weight) before
   it does anything. A boss dropped in cold reads as difficulty for its own sake.
2. **Quiet first.** Cutting the music and the ambience before the reveal resets the ear, builds dread better than a
   sting, and makes the theme that comes in land twice as hard. The classic case is Super Metroid's Ridley: the silence,
   then the music the moment it slides out of the dark.
3. **The name and the music change together.** Hollow Knight's convention: the name comes up as the battle theme starts.
4. **The length matches the keeper's weight.** Small for a lesser boss, longest for the last.
5. **Retries must not pay for it again.** The commonest complaint about boss intros is sitting through them on every
   attempt (15 to 40 seconds of it, in the threads). Play it whole once; after that make it short and skippable, and
   never make the player walk back to the trigger.
6. **A boss is a story beat.** The intro should say something about this one, in the world's own terms, not be the
   same scene with a different monster.
7. **Show scale with the camera.** Pull back, look where it will come from.

Sources:
- [How to design a boss intro that builds anticipation (Bugnet)](https://bugnet.io/blog/how-to-design-a-boss-intro-that-builds-anticipation)
- [How to design a reveal moment (Bugnet)](https://bugnet.io/blog/how-to-design-a-reveal-moment)
- [The case for silence in game audio (Bugnet)](https://bugnet.io/blog/the-case-for-silence-in-game-audio)
- [How to make a great boss fight (PC Gamer)](https://www.pcgamer.com/how-to-make-a-great-boss-fight/2)
- [Boss Battle Design and Structure (Game Developer)](https://www.gamedeveloper.com/design/boss-battle-design-and-structure)
- [Game boss design (Game Design Skills)](https://gamedesignskills.com/game-design/game-boss-design/)
- [The strength of Super Metroid's soundtrack is in its silences (AV Club)](https://www.avclub.com/super-metroid-music-soundtrack-silence)
- [Bosses (Hollow Knight wiki)](https://hollowknight.wiki/w/Bosses_(Hollow_Knight))
- [Boss Warning Siren (TV Tropes)](https://www.tvtropes.org/pmwiki/pmwiki.php/Main/BossWarningSiren)
- [Unskippable cutscenes are bad game design (r/gamedesign)](https://nyc1.lr.ggtyler.dev/r/gamedesign/comments/1azr8m6/unskippable_cutscenes_are_bad_game_design)
- [River City Girls' boss fights punish the player for learning (Pixel Poppers)](https://pixelpoppers.com/2020/01/river-city-girls-boss-fights-punish-the-player/)
- [Pepper Grinder boss intro thread (Steam)](https://steamcommunity.com/app/2076580/discussions/0/4358995119366644009)
- [Balancing challenge and hype (RPG Maker forums)](https://rpgmaker.net/forums/topics/18743)

## Watching them

The title has **The keepers**: pick one, or all six one after another. Each plays in full, as the first time it is met, in its own hall, and then it is back to the list. Nothing touches him while he watches, and the save is put back exactly as it was (`main.js` `keepers`, `watch`, `VIEW`).

## The shape every entrance has

| Beat | What happens | Rule |
|---|---|---|
| **Seal** | The ways out shut, nearest first, each in the keeper's own way; the camera goes to look. They are solid. | 1, 7 |
| **Dread** | Music and ambience stop. The picture darkens to the keeper's colour and closes in. The keeper's own sounds and signs build. He turns to where it will come from and raises his guard. The keeper's music is loaded meanwhile. | 2, 6 |
| **Rise** | The keeper's own (each keeper's file). | 6 |
| **Reveal** | At the keeper's best moment in its rise: its name, big, slammed in on a flash, a line over it saying what it keeps, its words under it; its music cut in on the beat (not faded); its own burst. | 3 |
| **After** | The dark lifts; the fight. When it falls the seals break; if he falls, they are gone when he is raised. | 5 |

First time: the whole of it (about 4 to 6 seconds before the keeper shows, the last keeper the longest). Again: a short
one, and jump or attack skips straight to the keeper (rule 5). He wakes at the last flame, so he never walks far back.

## Each keeper's

| Keeper | Seal | Dread | Reveal (in its rise) | Burst |
|---|---|---|---|---|
| **The Warden** (the Roots) | Dressed stone slabs, the mark burning red, slammed down | A heartbeat in the rock, two beats at a time, quicker and quicker; the roof sheds grit with each | Its roar, its head up (2.1 s) | The hall quakes: the roof comes down, a ring, dust everywhere |
| **The Toll** (the Cloister) | Iron grates dropped, sparks | A bell tolls five times, nearer each time; each stroke a ring through the hall and a light going out | As the bell settles (0.9 s) | Four rings out from the bell, amber light |
| **The Rime Wyrm** (the Spires) | Ice grows up across the way | The wind drops, snow comes down slow, the cold closes in white at the edges, and a vast shadow passes over the sky | Over the summit, its jaws open (1.0 s) | A white flash and a blizzard |
| **The Thunderhead** (the Tempest) | A bolt strikes the doorway and the storm stands in it, crawling | No rain, no wind: the air crackles, lightning closer and closer | Its mask comes out of the cloud (1.8 s) | The brightest flash in the game, a bolt to the stage |
| **Mother Thorn** (the Gardens) | Thorns grow across | The light goes green, petals fall, the ground swells and settles under him like breath | Her bud parts (2.0 s) | Petals burst, a ring of green |
| **The Fallen** (the Firmament) | Star-glass fades in | Nothing moves. The lights go out, then the stars. His own two steps. One star falls, to where it stands | It draws (2.3 s) | Time slows; a white star bursts |

## Each keeper's rise (its own file)

After the entrance's seal and dread, each keeper's own coming (`rise`), the moment its name lands in bold:

| Keeper | Its rise |
|---|---|
| **The Warden** (`boss.js` `W.rise`, about 6.4 s) | Up out of the dark, unlit, nearly black, head bowed. One eye catches, then the other; the core kindles and the stone takes its colour. Both armoured fists rise high over the stage and **slam down together (4.95 s)**; it roars. |
| **The Toll** (`toll.js` `TOLL.rise`, about 5.4 s) | Heard before seen: high in the dark, small, it tolls five times, each stroke nearer, bigger, its light flaring. Hauled up out of sight; a beat of silence; it drops out of the roof full size and **slams to a stop on its chain (3.6 s)**, and a throbbing red aura comes on round it (and stays, quieter, through the fight). |
| **The Rime Wyrm** (`wyrm.js` `RISE`, about 5.8 s) | Glimpsed small, far off across the sky, crying out; it dives in huge just over his head, circles, crashes onto the summit, rears, throws its head back and **roars frost (4.75 s)**: a cone of cold light, ice shards bursting up toward him. |
| **The Thunderhead** (`thunderhead.js` `TH.rise`, about 6 s) | The cloud gathers and blackens; six pairs of eyes open in it one after another; lightning walks the rods faster and faster; a hush, the eyes shut, light gathers over him; a **thunderclap (4.9 s)**: the mask drops out of the cloud, arcs to every rod, a crown of lightning. |
| **Mother Thorn** (`mother.js` `MOTHER.rise`, about 5.7 s) | The stage cracks and thorns burst up through it in waves; the stalk climbs, the bud beats like a heart, light leaking from it; it **bursts open (3.6 s)** in a storm of petals, her arms erupt from the stage and lash down. |
| **The Fallen** (`fallen.js`, about 6.3 s) | Its back to him, still; the fallen star's light gathers into its hand and runs up its blade; an eye opens over its shoulder; it turns, slowly; raises the blade and **drives it into the stage (5.0 s)**: cracks of cold light run out across the floor. |

A keeper can tell the entrance when its name comes (`B.revealAt`, for a rise that differs, like the Toll's short one); else `STYLES[theme].reveal`. During the rise the camera holds him and the keeper both in view. The name comes a beat after the blow it lands on, so the blow is seen.

**The Warden's arms** are armoured now (`tools/armor_arms.py`): its stone arms half again as thick, iron plates curved round them, rivets, teal runes in the plates, a gauntlet on each fist. **Its sweep** is tethered: the fist comes away from the arm, sweeps the stage on a crackling beam of green lightning, rests (strike it then), and flies back along the beam to lock on again; the arm stays up at the shoulder.

