# The Climb: itch.io page kit

Made from the game as it is at build 80. Work down this list; each line says where the thing goes.

| # | Item | File or value | Where |
|---|---|---|---|
| 1 | Cover | `images/cover.png` (630 x 500; `cover@2x.png` is the same at double size). `cover-alt.png` is a second choice: the title screen's mountain | Edit game > Upload Cover Image |
| 2 | Title, tagline | `fields.md` | Edit game |
| 3 | Embed settings | 960 x 540, fullscreen button, click to play, landscape (`fields.md`) | Edit game > Embed options |
| 4 | Screenshots | `images/screenshot-1.png` to `-5.png`, in that order: the Gardens, the Warden, a fight in the Cloister, the Spires, talking to Ordric | Edit game > Add Screenshots |
| 5 | Trailer | none; a shot list is in `fields.md` | Edit game |
| 6 | Banner | `images/banner.png` | Edit Theme > Banner |
| 7 | Colours | `theme.md` | Edit Theme |
| 8 | Fonts | `theme.md` | Edit Theme |
| 9 | Embed background | `images/embed-bg.png` | Edit Theme |
| 10 | Page background | `images/page-bg.png` | Edit Theme > Background |
| 11 | Layout | Screenshots: Sidebar | Edit Theme > Layout |
| 12 | AI disclosure | Yes: Graphics, Sound, Text & Dialog, Code | Edit game |
| 13 | Genre, tags | `fields.md` | Edit game |
| 14 | Metadata | `fields.md` | Metadata tab |
| 15 | Description | `description.html`, pasted in the `</>` mode. Where it says `[insert image: ...]`, delete the line and use the editor's image button to upload that file from `images/` | Edit game > Description |
| 16 | Release status | In development | Edit game |
| 17 | Pricing | $0 or donate | Edit game |
| 18 | Community | Comments | Edit game |
| 19 | Visibility | already Public | Edit game |

## The web build, checked

`build/game.zip` (not kept in git; `node tools/build-itch.mjs` makes it, and build 80 is already on the page):
`index.html` at the root, every path relative, 591 files, 22.8 MB in all, largest file 1.4 MB, longest path 47
characters, plain ASCII names. Inside itch's limits on every count. The page asks Google Fonts for its menu font; if
that is blocked the menus fall back to a system font and the game still runs.

## How the pictures were made

Frames of the running game, taken in a headless browser at three screen pixels to one game pixel (1320 x 744), with
nothing drawn on top except the title on the covers and banner, which is set in the game's own pixel letters. No image
model was used to make them. The game's art itself is generated, though, which is why the disclosure says Graphics.

## Guessed, for you to settle

- The tagline and the opening of the description are the game's own lines, not a pitch in your words.
- Pricing, average session length, the tags.
- Which cover: the gameplay one or the mountain.
