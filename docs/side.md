# The side view (branch `claude/climb-2d`)

The Climb as a 2.5D side-scroller: a flat plane that climbs up through shafts, tunnels and chambers, metroidvania-style, with HD pixel art from PixelLab and a bright, glowing look. Open `side.html`.

- **World** (`src/side/level.js`): tiles half a unit square (32 pixels), rooms a screen each (40 x 23 tiles), joined into a region by doorways, shafts and tunnels. Rooms are built from pieces (walls, doors, ledges, stairs, low tunnels, spikes) and markers (spawn, torches, crystals, enemies, the exit).
- **Motor** (`src/side/motor.js`): Movement v2 on tile collision. Same tuning (`TUNE.move`), the same F9 feel panel and input queue as the climb: the double jump, launch float, air-control fade, coyote time, jump buffer, roll cancels, plunge, heavy landings, the ledge grab; and walls, ceilings, one-way ledges (down + jump drops through), steps climbed as you walk, low tunnels (crouch or roll), spikes.
- **Look** (`src/side/render.js`): rendered pixel-exact at 64 pixels a unit and scaled up whole; a narrow perspective camera so the stone has depth and the background slides past slower; PixelLab's side-scroller corner tiles on the dual grid (rock interiors darkened), the painted cavern far behind, torches and crystals with real light, and bloom on everything bright.
- **Art** (`tools/pixellab.py`): characters, side-view animations, backgrounds and tilesets from PixelLab, pulled through the API's own exports and packed into strips (`assets/side/<name>/<anim>.png` + `sprite.json` with where the feet and middle sit). The token is the session's, added by its network proxy; nothing secret is in the repository. `assets/side/pixellab.json` records what was made.

Why PixelLab over rendering our 3D models to sprites (Dead Cells' own pipeline): a bake-off of the same warrior both ways; PixelLab's was crisp hand-pixel art, the render soft and muddy at the same size.
