# Phase 19: sound and music, complete (the sheet)

*Written 28 Nov, from the roadmap's phase 19: "A piece for every section (the wings, the passages, the Deep), the
intro's music, an ambience for each. Every creature's sound mixed. The voices tuned from your listening notes. Real
voices only if decision 0.9 changes." Nothing here is built, and nothing is made until you say yes. Sound is the one
thing I cannot judge, so every build in this phase comes with a short list of what to listen for.*

## What this phase is for

- **Every place sounds like itself.** Today six places have a piece of their own. Most of the rest borrow one, and
  fourteen play nothing.
- **The changes between places are heard as he climbs,** not as a switch in one doorway.
- **The big moments each have their own sound:** the keepers, the throw, the Shard, the Source, the ending.
- **Nothing is too loud or lost under something else:** the creatures, the hero, the music and the ambience balanced
  against each other.
- **The voices tuned to your ear,** once you have listened to them.

## What there is now

Two scores, one chosen in Options ("Score"):
- **Recorded** (the default): ten pieces made with PixelLab on 12 Nov, about ninety seconds each, going round. The
  title (also played under the intro), the six regions, one fight piece, the Fallen's fight piece, and the ending.
  Thirteen megabytes, most of the game's twenty-one megabyte download.
- **Made as it plays** (`src/side/music.js`): built in the browser from simple instruments. The same places, one tune
  set differently for each.

The piece is picked by the look of the room he is in (`score()` in `main.js`). A room with a look that has no piece
plays nothing. That is what happens in the wings and most far ends: each wears a look of its own, and no piece was
ever made for it. Nothing written says this was meant. **I have read it from the code and not heard it.** It is one
of the sounds the build log has listed as unheard since phase 9.

**Ambience:** four recordings (caves, wind, storm, garden), about five seconds each, going round under everything.

### Every section, and what it plays

| Section | What it is | Music now | Ambience now |
|---|---|---|---|
| **The Roots** | region | its own | caves |
| The Drowned Galleries | Roots, west wing | the Roots' | caves |
| The Drawing-Place, the Well's Foot | Roots, far west | the Roots' | caves |
| The Ossuary | Roots, east wing | the Cloister's (its rooms wear the Cloister's look) | caves |
| The Unsorted | Roots, far east | the Cloister's | caves |
| The Crypt Stair | passage, Roots to Cloister | the Roots', then the Cloister's in its top room | caves |
| **The Cloister** | region | its own | caves |
| The Scriptorium | Cloister, west wing | **nothing** | **nothing** |
| The Empty Shelves | Cloister, far west | **nothing** | **nothing** |
| The Bell-Foundry | Cloister, east wing | **nothing** | **nothing** |
| The Cull | Cloister, far east | **nothing** | **nothing** |
| The Bell Road | passage, Cloister to Spires | the Cloister's, then the Spires' at the top | caves, then wind |
| **The Spires** | region | its own | wind |
| The Pilgrims' Cairns | Spires, west wing | the Spires' | wind |
| The Way Down | Spires, far west | the Spires' | wind |
| The Glacier Galleries | Spires, east wing | **nothing** | **nothing** |
| The Crevasse | Spires, far east | **nothing** | **nothing** |
| The Last Hut | passage, Spires to Tempest | the Spires', then the Tempest's in the hut itself | wind, then storm |
| **The Tempest** | region | its own | storm |
| The Wreck of the Works | Tempest, west wing | the Tempest's | storm |
| The Great Rod | Tempest, far west | the Tempest's | storm |
| The Eye of the Storm | Tempest, east wing | **nothing** | **nothing** |
| The Blue | Tempest, far east | **nothing** | **nothing** |
| The Breach | passage, Tempest to Gardens | the Tempest's, then the Gardens' | storm, then garden |
| **The Gardens** | region | its own | garden |
| The Aqueducts | Gardens, west wing | **nothing** | **nothing** |
| The Rising Main | Gardens, far west | **nothing** | **nothing** |
| The Keepers' Houses | Gardens, east wing | **nothing** | **nothing** |
| The Last House | Gardens, far east | **nothing** | **nothing** |
| The Long Stair | passage, Gardens to Firmament | the Gardens', then the Firmament's | garden, then wind |
| **The Firmament** | region | its own | wind |
| The Orrery Wing | Firmament, east wing | **nothing** | **nothing** |
| The Outer Ring | Firmament, far east | **nothing** | **nothing** |
| The Shard | Firmament, west | the Firmament's on the way; **nothing** in its room | wind; **nothing** in its room |
| The Workings | the Deep | the Roots' | caves |
| The Winding-House | Workings, far end | the Roots' | caves |
| The Flooded Levels | the Deep | the Roots' | caves |
| The Drowned Stope | Flooded Levels, far end | the Roots' | caves |
| The Vein | the Deep | the Roots' | caves |
| The False Lode | Vein, far end | the Roots' | caves |
| The Great Shaft | the Deep | the Roots' | wind |
| The Adit | Great Shaft, far end | the Roots' | wind |
| The Hollow | the Deep | the Roots' | caves |
| The Far Wall | Hollow, far end | the Roots' | caves |

**In all, 44 sections:** 6 have a piece of their own; 24 borrow another's (the Shard's way across among them); 14
play nothing, and so does the Shard's room.

### The moments

| Moment | Now |
|---|---|
| The title | its own piece |
| The intro (his fall) | the title's piece |
| A keeper's hall shutting, its name | silence, then the fight piece comes in on the name |
| The Warden, the Toll, the Wyrm, the Thunderhead, Mother Thorn, the Auger | **one fight piece for all six** |
| The Fallen | its own fight piece |
| The twelve wing keepers and elites (the Sexton, the Squid, the Corrector, the Cracked Bell, the Turned, the Seated, the Jar, the Lock, the Housekeeper, the Almanac, the Assayer, the Pump) | no change: the wing's music, which is mostly nothing |
| A keeper's death | its hall silent; the region's piece again when he leaves it |
| A death, and the run back | the piece runs fast |
| The throw | the Firmament's piece goes on under its screen; then the Roots' piece in the Hollow |
| The Source | the sound resting at a pool makes, and nothing else |
| The ending | its own piece |

### The creatures, the keepers, the voices

- **Creatures:** 61 kinds, in eight families of sound (chitter, wings, wet, grunt, moan, crackle, rustle, chime), each
  kind its own pitch. Three cries each: it notices him, it attacks, it dies. All made in code from plain tones and
  noise. Each is quieter the further it is, to nothing about a screen away. None is placed left or right. Fifteen
  kinds share the chime.
- **Everything else he hears** (his steps, his blows, doors, chests, bells, thunder) is forty-four recordings, made
  with PixelLab on 12 Nov, each with a stand-in made in code.
- **Keepers:** the Wyrm has six sounds of its own (build 99: its breath, its ice). The Fallen uses his own sounds. The
  other five share the same creak, slam, rumble, roar and crack.
- **Voices:** five (Ordric, Mirel, Mirel without her shell, Corwen, Hob), made as each line types out
  (`docs/voices.md`). The Fallen's words at the throw are written, not spoken. **No listening notes yet.**

### Small faults found on the way

- **In "made as it plays", the Auger's fight is silent.** There is no made piece for it.
- **The Last Hut's hut plays the Tempest's piece,** because the hut is the Tempest's first room. The place that says
  "stay" sounds like the storm.
- **The Cloister wears the caves' ambience,** and the Firmament the Spires' wind.

## What is missing

1. A piece for each of the 38 sections that have none of their own.
2. An ambience for every section; there are four for all of them.
3. The passages: each is one quick fade in one room.
4. The intro's own music.
5. Each keeper's own sounds, and a change in the fight piece when it rages.
6. Music for the wing keepers and elites.
7. The throw, the Shard and the Source: nothing is done for them yet.
8. The creatures balanced, placed left and right, and kept from all crying at once.
9. The voices tuned, which waits on your notes.

## How the music would be made

Three ways. I would use the first two, and not the third (question 1).

- **(a) The region's piece, changed by the place.** The recording the region already plays, through a filter, slower or
  quieter, with a layer of its own made in code on top. The Scriptorium is the Cloister's piece heard through a wall,
  with quills scratching the beat. It costs nothing, adds nothing to the download, and uses the recording already in
  memory. Best of all, the change is smooth: walking into the wing, the region's piece does not stop and another
  start. It turns into the wing's.
- **(b) A piece made in code** (`music.js`, as the "made as it plays" score is), extended with a few new instruments: a
  drone, a breathy pipe, a music box, a voice without words (from the voices' own maker), an anvil, a clock's tick.
  Free, and adds nothing to the download. For the Deep and the passages, which should sound unlike the regions.
- **(c) Recorded, with PixelLab, as the first ten were.** It would match the regions best. Each piece adds about 1.4
  megabytes to the download, and thirty would more than double it, which matters on a phone (phase 20). I do not know
  what PixelLab charges for a piece today; the first ten were made in one go and their cost was not written down. I
  would find out and ask before making any.

**Ambience:** made in the browser as it plays, from noise and tones with things that happen now and then (a drip, a
creak, a far bell), so it never goes round audibly and adds nothing to the download. The four recordings stay where
they fit.

**Keepers' sounds:** made by rule, as the Wyrm's were (`tools/ice-sounds.py`): a small tool for each keeper writes
its sounds as recordings. About 50 KB each.

**Cost: nothing,** if the music is made by (a) and (b). If (c), whatever PixelLab asks, shown to you first.

## The pieces, one for each section

Each piece, and each ambience, in plain words, tied to what the place was and what it is now (`docs/world.md`). The
tune that runs through the made score (four phrases, each starting higher than the last) is the thread: it is heard,
changed, in every new piece, so the mountain sounds like one place.

### The Roots, and its wings

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Drowned Galleries | The halls of the first people, who kept the water. The water rose and took them; it fills and empties every half minute | (a) The Roots' piece, rising and falling with the water: louder and brighter at low water, muffled at high water as if heard from under it | Water lapping; the stone gates in their grooves |
| The Drawing-Place, the Well's Foot | Where the Well's keepers drew water: buckets on a chain into the dark | (a) The Roots' piece, thinner, with the chain's turn as the beat once he sets it going | The chain, the buckets, water a long way down |
| The Ossuary | The house's dead, sorted and counted by sextons who are counting still | (a) The Cloister's piece, low and slow (it is the house's), and a stylus scratching the count: four strokes and a stroke through | Bones shifting, candles guttering, the scratch |
| The Unsorted | Where the dead went when there was no more room | (a) The Ossuary's, with the count gone | Dry; a fall of bones now and then |
| The Crypt Stair | The house's old way down to the water, its founders along it. Water runs down it; it is lit at the top | (b) Its own, short: the Roots' piece falls away at the foot; water down the steps; halfway up, one bell far above; the Cloister's piece comes in at the top | Running water, thinning as he climbs; the bell |

### The Cloister, and its wings

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Cloister | The house that rang the flame's hours, still ringing | Its own, as now | Its own, in place of the caves: a large quiet room, far footsteps, the bell |
| The Scriptorium | The copyists, copying the first page for ever; one blot and it is begun again | (a) The Cloister's piece through a wall, and a harpsichord figure over it that never reaches its end: near the last note it starts over | Quills, pages, ink; the furnace in the red rooms |
| The Empty Shelves | Where the finished books were to go. None came | (a) The Scriptorium's, with the harpsichord gone: only the held chords | The ladders' wheels on their rails; dust |
| The Bell-Foundry | Where the bells were cast, and one rung until it cracked. Iron rings at a touch, and silence ends it | (a) The Cloister's piece, very low and quiet, in the cracked bell's key. While the iron rings, it is loud and harsh, the bell's wrong note in it; when the silence comes back, so does the quiet | Slag ticking as it cools; the bell's hum |
| The Cull | The pit where the bells that came out wrong were thrown | (a) The Foundry's, and a chord of bells each a little off its note | The crane's chain |
| The Bell Road | The pilgrims' road to the pass, a shrine at every turn, names on every shrine | (b) Its own: a walking piece, plucked, at a walk's pace; one bell at each shrine; wind rising toward the top | The Cloister behind him, the open air ahead |

### The Spires, and its wings

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Pilgrims' Cairns | Where those who turned back built a cairn, each stone a reason | (a) The Spires' piece, thinned, stones knocking as the beat; at his own cairn, nothing but the wind | High wind, stones settling |
| The Way Down | The path those who turned back went down | (a) The Spires' piece with its tune turned over: each phrase falls where it rose | Wind from below |
| The Glacier Galleries | Caves where climbers sat down to rest, and the ice took them. Fires lit by a blow melt the ice | (a) The Spires' piece slowed nearly to stopping, held chords that hardly move. Each fire he lights adds a part to it | Ice creaking, a far drip; near a lit fire, the fire |
| The Crevasse | The glacier split, three screens down, blue to black | (a) The Galleries' chord, lower the further down, one note at the bottom | Ice; the wind gone |
| The Last Hut | The climbers' last shelter, a fire, the storm through the window | (b) Its own, and inside the hut **no music:** the fire, the pot, the storm outside. Opening the door, the Tempest's wind comes in, and its piece with it | The fire; the storm through stone |

### The Tempest, and its wings

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Wreck of the Works | The Wrights' works for catching lightning, torn apart. The current lives in one half of the iron | (a) The Tempest's piece, with the current's hum in it; the hum is heard on the side where the current is, and crosses when the lever sends it over | Hum and crackle; wind in loose iron |
| The Great Rod | The Wrights' tallest rod, and the stair up it | (a) The Works' hum, rising in pitch as he climbs; thunder near the top | Wind, closer thunder |
| The Eye of the Storm | The middle of the storm, still. Things move only while he stands still | (b) Almost none. While he stands still a high chord swells, as the Hush come; moving, it fades. The music is the warning | **No wind** for the first time in the Tempest; the storm a wall of sound far off |
| The Blue | Clear sky over the still rooms | (b) The Eye's chord, let finish: one slow phrase of the tune | Almost nothing; a little high wind |
| The Breach | The garden wall, where the storm broke in. Storm and garden both | (b) Its own: the Tempest's and the Gardens' pieces at once, the storm's going as he climbs | Rain on leaves, thinning to sun |

### The Gardens, and its wings

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Aqueducts | The garden's water, carried up through the mountain from the pool at the bottom. It still runs | (a) The Gardens' piece, with the Roots' first phrase in it: the same water | Running water in stone channels; the sluice wheels |
| The Rising Main | The shaft the water comes up by | (a) The Drowned Galleries' rise and fall, heard from far below | Water rising in a pipe |
| The Keepers' Houses | Houses kept for no one; a servant setting tables. Disturb nothing | (a) The Gardens' piece made small: a music box, the tune for two hands with the second hand missing. When something is upset it stops, and starts again when it is set right | A clock; plates set down; the Housekeeper's steps |
| The Last House | One more house, never given to anyone | (a) The Houses' music box, running down and stopping | Dust; nothing |
| The Long Stair | The keepers' stair to the summit, a step for each day, swept. The Sweeper always ahead | (b) Its own: slow, a note a step, a broom's stroke between; the Gardens' warmth gone by the top and the Firmament's bells begun | The broom ahead; the air thinning |

### The Firmament, and its wings

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Firmament | The summit, where the flame burned; the astronomers' instruments | Its own, as now | Its own, in place of the Spires' wind: thin high air, brass ticking, star-glass |
| The Orrery Wing | A brass sky wound to tell when the flame comes back. Wrong every time; it calls the hour an hour late | (a) The Firmament's piece over an escapement's tick, the tune on a music box in strict time, and a chime that strikes the hour a beat late | Gears, the arms going round |
| The Outer Ring | The far planets, on arms out over nothing | (a) The Orrery's, slower and wider | The same, further off |
| The Shard | A piece of the mountain, broken off the night he fell, the beacon's bowl in it. Left alone | The Firmament's piece thinning as he climbs the underside; **in the gap, only the wind; in its room, the flame and one held chord, very quiet.** The only warm sound above the Gardens | Wind; in the room, the flame |

### The Deep

The Deep borrows the Roots' piece for all five levels. It should sound unlike anything above: each level made in
code (b), each darker and sparer than the one above it.

| Section | Was, and is | Its piece | Its ambience |
|---|---|---|---|
| The Workings | The guild's shallow mines. Timbers, rails, the lamps someone fills, the dates that stop | (b) Slow and low. A pick on stone every other bar; a drone; now and then the tune on a thin pipe, far off | Drips, timbers creaking, rails ticking; a lamp's hiss near a lamp |
| The Winding-House | The engine for the cage | (b) The Workings', and the engine's beat in it once it runs | The engine |
| The Flooded Levels | Four levels flooded in a night. The pump still working, the water still winning | (b) Its beat is the pump's stroke; everything heard as if from under the water. **When he is under the water, all the music is muffled further** | Water slapping, the pump, bubbles |
| The Drowned Stope | A working flooded to the roof | (b) The Flooded Levels', with the pump gone | Only water |
| The Vein | The lampstone growing in crystals, too bright. Tunnels that double back; the Echo, who goes where he went | (b) Glassy high bells. Each phrase is played and then played again a beat late, as the Echo does | A high ringing in the crystal; small ticks |
| The False Lode | A glitter that is not the vein | (b) The Vein's, with no second voice: the echo gone | The same, thinner |
| The Great Shaft | The Auger's hole. Nobody. The quietest place in the game | (b) **Almost none:** one low held note and the cold air coming up. At its floor, where he first sees the light below, the tune's first four notes, once | Air rising; ropes creaking on the hanging camp |
| The Adit | A side cut off the Shaft | (b) The Shaft's held note | The same |
| The Hollow | Older than anything. The Auger boring its floor in circles; water falling through the roof; a warm light | (b) At first only the falling water. Then a deep, slow piece under the Auger's far grinding. **At the Source, the tune whole, warm, for the first time in the Deep** | Water in long threads; the grinding, which stops when the Auger falls |
| The Far Wall | The climb home from the Hollow to the Roots | (b) The Hollow's, and as he nears the top the Roots' piece coming down to meet him, as the Cloister's light comes down the Crypt Stair | Water; then the Roots' caves |

## How the music changes between sections

- **A region and its wing.** Today the look of a doorway blends over a few steps, and the music jumps once he is past
  the middle. With (a) the music does not jump: the region's piece turns into the wing's as the look does.
- **The passages.** The lower region's piece fades out over the first third of the climb, the passage's own piece
  plays through the middle, and the upper region's fades in over the last third, by how high he is. (Two recordings
  playing at once take about 30 megabytes of memory each, too much on a phone, so they never overlap for long.)
- **A keeper.** As now: the hall shuts and the music stops; the name brings the fight piece in on the beat. New:
  **when it rages** (its second half), the fight piece goes up a step and a little faster. When it falls, the hall
  is silent, as now. Each keeper gets its own sounds (below).
- **A wing keeper or elite.** While it is awake, the wing's piece is driven: faster, with drums. When it falls, the
  wing's piece as it was.
- **The throw.** The Firmament's piece **stops dead** when the Fallen comes up the ledge. Its words in silence. The
  fall: wind rising with the speed, the intro's music run at the fall's pace, cut at the water. Under the water, one
  low sound and the light. Then the Hollow, with no music: only the falling water, until he walks out of the landing
  room.
- **The Shard.** As in its row above: the summit's piece thins as he climbs away from it, nothing but wind in the
  gap, and the flame in the room.
- **The intro.** Its own piece, quiet: the tune alone, slow, ending on the splash. The title keeps its piece.
- **The ending.** Phase 18's ending is not built yet (its part 5). When it is: the three at the summit with the
  Firmament's piece low and bare; the beacon with the ending's piece. **If he has stood at the Source,** the ending
  closes on the phrase the Source played; if not, it closes as it does now.

## The creatures and the keepers

- **Balanced** against the hero's sounds and the music, one region at a time, with a level set for each kind.
- **Placed left or right** by where they are, as the Wyrm's flight is already.
- **Kept from all crying at once:** at most three of one kind in a moment. Today the Keepers' Houses can have 23
  settings and the Tempest 17 sparks in hearing.
- **A sound when struck,** each family its own, in place of the one shared hit.
- **The families looked at again,** kind by kind. Some are near but wrong: the Hush is "wet", the cairns "crackle".
- **The made cries are plain tones beside recordings,** and may sound like another game. If you hear them so,
  they are made again by rule, as the Wyrm's were.
- **Each keeper its own sounds,** made by rule as the Wyrm's were: the Warden (stone and chain), the Toll (its own
  bell, struck and swung), the Thunderhead (thunder near and far, the bolt drawn down), Mother Thorn (wood splitting,
  thorns, a slow creak), the Auger (the engine, the bit biting, the floor going). The Fallen keeps his sounds, made
  darker and lower.

## The voices

- **There are no listening notes yet,** so nothing can be tuned from them.
- **The first build brings a listening page:** each voice saying three of its own lines, one after another, and each
  piece, ambience, creature family and keeper, each on its own button. You listen and send notes; I tune
  `src/audio/voice.js` from them.
- **Real voices stay out** unless you change decision 0.9.

## The order

One build each, published as it is done, each with what to listen for:

1. **No section silent, and the listening page.** Every wing and far end plays its region's piece, as a stand-in,
   with its region's ambience. The Auger's fight gets a made piece. A check that no room is silent unless this sheet
   says so. The page with every sound on it.
2. **The pilot: the Scriptorium, two ways.** Made as (a), the Cloister's piece changed, and as (b), a piece made in
   code. You hear both beside the Cloister and choose (question 1).
3. **The Deep:** five pieces, five ambiences, and their far ends.
4. **The Roots' and the Cloister's wings and far ends,** and the Cloister's own ambience.
5. **The Spires' and the Tempest's,** the Eye and the Blue among them.
6. **The Gardens' and the Firmament's,** the Firmament's own ambience, and the Shard.
7. **The five passages,** with the fade by height.
8. **The keepers:** each one's sounds, the rage, the wing keepers' music.
9. **The creatures mixed.**
10. **The intro, the throw, the Source and the ending.** The ending waits for phase 18's part 5.
11. **The voices,** from your notes. Whenever they come; it does not wait for the others.

## What I am not sure of

- **Pieces made in code beside the recorded ones may sound thin,** like another game. That is why the pilot comes
  before anything else, and why most wings are their region's piece changed rather than a new one.
- **A changed piece may sound muffled rather than different.** Slowing a recording also lowers it. Eleven wings that
  are "the region's piece, quieter" would be dull. The layer on top has to carry each one.
- **The silences may have been heard and liked.** The Eye of the Storm is meant to be silent (`docs/world.md`). I find
  nothing that says the others are, but you may have walked them and not minded.
- **Forty-four pieces may be too much music.** Rule 10 of the writing (leave room) asks for framed pauses. The Last
  Hut, the Eye, the Great Shaft and the Shard's gap are nearly silent on purpose here. There could be more.
- **Two scores.** Every new piece needs a made version too, or "made as it plays" has holes. With (a) that is the made
  region piece changed the same way; it may sound different from the recorded one.
- **Phones.** Two layers at once, and many creature cries, cost something; phase 20 measures it.
- **I cannot hear any of this.** I can measure how loud a piece is and which notes carry it; whether it is right is
  yours to say.

## To decide

1. **How are the new pieces made?** (a) the region's piece changed by the place, with a layer of its own in code;
   (b) made in code; (c) recorded with PixelLab, as the first ten. **I would do (a) for the wings and far ends and (b)
   for the Deep, the passages and the moments,** and let the pilot show you (a) and (b) beside the Cloister first.
2. **May some places be nearly silent on purpose?** The Last Hut's hut, the Eye, the Great Shaft, the Shard's gap.
   **I would say yes,** each with its ambience.
3. **One fight piece for six keepers, or one each?** The roadmap does not ask for one each. **I would keep the one,**
   with each keeper's own sounds and the step up when it rages.
4. **Music for the twelve wing keepers and elites?** **I would drive the wing's piece while one is awake,** and not
   make them pieces of their own.
5. **The passages: a piece of their own each, faded by height?** **I would say yes.**
6. **The intro: its own quiet piece, or the title's as now?** **Its own,** as phase 2 said ("the intro gets quiet
   music").
7. **The throw: the music stopped dead for the Fallen's words?** **I would say yes.**
8. **The Shard's room: the flame and one held chord, or nothing at all?** **The flame and the chord,** very quiet.
9. **Does the Fallen speak aloud?** Its words at the throw are written only. **I would leave them silent:** he never
   speaks, and a voice for his shape would be the first.
10. **Real voices:** decision 0.9 stands? **I would keep the mumble voices.**

### Decided (28 Nov)

*Left to my judgment (decision 0.37): "decide on your own based on your own understanding and your estimation of what I would want." Any of these can still be changed.*

1. **(a) for the wings and far ends, (b) for the Deep, the passages and the moments.** The pilot is still built and the listening page still made, so you can hear it and change it.
2. **Yes:** the Last Hut's hut, the Eye, the Great Shaft and the Shard's gap are nearly silent, each with its ambience.
3. **One fight piece for the six keepers,** with each keeper's own sounds and the step up when it rages.
4. **The wing's piece is driven while a wing keeper or elite is awake.** No pieces of their own.
5. **Yes:** a piece for each passage, faded by height.
6. **The intro has its own quiet piece.**
7. **Yes:** the music stops dead for the Fallen's words.
8. **The flame and one held chord, very quiet.**
9. **The Fallen stays silent.**
10. **Decision 0.9 stands:** the mumble voices.
