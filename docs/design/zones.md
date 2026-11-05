# Zones

One round shaft, seven zones stacked bottom to top. The oldest, scariest things live at the bottom, where you start. Each zone is 15 flights (135 m): a broken lift on flight 5, a rest stop on flight 8, and the Warden's stretch over flights 10 to 14, fought on the move. Code: one module per zone in `src/zones/`; per-zone notes in `docs/design/zones/`.

| # | Zone | Flavour | Spawn | Warden | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | The Deep | Ancient nameless things, darkness | Things crawl out of cracks in the wall | Warden of the Deep | Built |
| 2 | The Flooded Halls | Water rising behind you forces you on | Shapes rise from the water | The Drowned Warden | Palette only |
| 3 | The Forge Galleries | Fire, heat vents, old machinery | Constructs step out of casting molds | The Forge Warden | Palette only |
| 4 | The Fungal Caverns | Glowing, strange, full of ambushes | Creatures burst from spore pods | The Spore Warden | Palette only |
| 5 | The Collapsed Workings | Unstable floors and cave-ins | Crumbling steps | The Broken Warden | Palette only |
| 6 | The Long Stair (placeholder) | The long final climb | Not yet defined | The Stair Warden | Palette only |
| 7 | The Peak | The final fight in the open air | Not yet defined | The Last Warden | Palette only |

A zone is "built" when it has: its own spawn that doubles as a warning, at least one hazard that only it has, a Warden with its own moveset, and a palette pass on the wall and stone. Difficulty also rises per zone through climb speed, obstacles per flight, crawler health from zone 3 and shorter Warden wind-ups.
