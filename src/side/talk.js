// The people on the mountain, and what they say. Three of them go up it as he does: the Lamplighter, who keeps the
// shrines and trades for shards; Wren, a climber; and the Scribe, who charts it. Each has something to say in each
// region (SCRIPT[who][region], a list of lines; said once in full, then its last line again).
//   makeTalk(hud) -> { on, start(who, lines, after), press(), draw(H, dt) }: a box at the foot of the picture, the words
//   typed out; a press finishes the line, the next press goes on.
import { sfx } from '../audio/sfx.js';
import { text, width, fine } from './pixelfont.js';
export const PEOPLE = { lamplighter: { name: 'THE LAMPLIGHTER', art: 'px_lamplighter', col: '#feae34' }, wren: { name: 'WREN', art: 'px_wren', col: '#63c74d' }, scribe: { name: 'THE SCRIBE', art: 'px_scribe', col: '#2ce8f5' } };
export const SCRIPT = {
  lamplighter: [
    ['So. Something still falls this far, and gets up.', 'I keep the shrines lit. All the way up, though the stair grows long for old knees.', 'Your scarf burns down when you are hurt. The light mends it. Come to a shrine and it will know you.', 'If you find shards of the old lamps, bring them to me. I can do a little for you.'],
    ['The monks rang that bell for the beacon. Then the beacon went out, and it went on ringing.', 'What you took from the Warden: use it. Come down hard on cracked stone and it gives.', 'Shards, if you have them.'],
    ['Cold. The pass is above us, and what coils on it.', 'They say the wind up there will carry a man, if he has cloth enough.', 'Shards, if you have them.'],
    ['Do not ask how I came up before you. A lamplighter knows the back stairs.', 'Hold the scarf open in the rising air. Let go and you drop. That is all the art there is.', 'Shards, if you have them.'],
    ['Sun. I had forgotten it has a smell.', 'Somebody planted all this for the ones who kept the beacon. Nobody told the garden they were gone.', 'Shards, if you have them.'],
    ['This is my last lamp. After it there is only the beacon, and that one is not mine to light.', 'Whatever waits by it has your walk. I have watched it pace. Go carefully.', 'And go on. It has been dark up here a long time.'],
  ],
  wren: [
    ['Oh! You are alive. I watched you come down past me. I thought, well, that is him done.', 'I am Wren. I am climbing it too. Slower than you fell.', 'Break the pots. People hid things in them when the lights went out.'],
    ['You again! I came round by the stairwell. Did you see the size of that bell?', 'There are threads caught on the high places. Red ones, like your scarf. I cannot reach them. You might.'],
    ['My fingers have stopped working. But look at it. You can see the whole world.', 'I found a crack in the rock with a draught coming through. Something is behind it.'],
    ['I am not going out there until it stops.', 'It is not going to stop, is it.', 'The rods draw the lightning. I would not stand by a tall one when the sky goes white.'],
    ['I could stay here. I think I might stay here.', 'No. One more. I want to see the top.'],
    ['This is as far as I go. I can see it from here, and that is enough.', 'The last door is yours. It always was. You fell from there.', 'Light it for all of us.'],
  ],
  scribe: [
    ['Hm? A climber. I chart the mountain. Somebody must, now that nobody looks at it.', 'These are the Roots. Everything above stands on what is down here, and forgets it.'],
    ['The Cloister was built to keep the beacon\'s hours. Read the walls: every bell is a night.'],
    ['The Spires are the mountain\'s own bones. Nothing was built here. Things only cling.'],
    ['The Tempest is new. There was no storm while the beacon burned.'],
    ['The Gardens fed the keepers. See how well it does without them.'],
    ['The Firmament. I have charted every star from here but one.', 'That one is on the ground, up ahead, and dark.'],
  ],
};
const wrap = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(' ')){ const t = line ? line + ' ' + word : word; if (width(t) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
export function makeTalk(){
  const S = { on: false, who: '', lines: [], i: 0, n: 0, after: null, held: 0 }, faces = {};
  // a face for the box: the head and shoulders of their standing drawing, at a whole number of pixels to one
  const face = who => { if (faces[who] !== undefined) return faces[who]; faces[who] = null; const P = PEOPLE[who]; if (!P) return null; const im = new Image(); im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const s = y1 - y0 > 50 ? 32 : 16; faces[who] = { im: c, x: Math.max(0, Math.min(c.width - s, Math.round((x0 + x1) / 2 - s / 2))), y: Math.max(0, y0 - 1), s }; }; im.src = `assets/side/${P.art}/stand.png`; return null; };
  S.start = (who, lines, after = null) => { S.on = true; S.who = who; S.lines = lines.slice(); S.i = 0; S.n = 0; S.after = after; S.held = 0; face(who); };
  S.press = () => { if (!S.on || S.held < 0.15) return; const L = S.lines[S.i] || ''; if (S.n < L.length){ S.n = L.length; return; } S.i++; S.n = 0; S.held = 0; if (S.i >= S.lines.length){ S.on = false; const a = S.after; S.after = null; if (a) a(); } };
  S.draw = (H, dt, t) => {
    if (!S.on) return; S.held += dt; const g = H.g, W = H.W, C = H.C, P = PEOPLE[S.who] || { name: S.who.toUpperCase(), col: C.cream }, L = S.lines[S.i] || '';
    const n0 = Math.floor(S.n); S.n = Math.min(L.length, S.n + dt * 42); if (Math.floor(S.n) > n0 && Math.floor(S.n) % 3 === 0 && L[Math.floor(S.n) - 1] !== ' ') sfx.talk();
    const bw = Math.min(300, W - 16), x = Math.round((W - bw) / 2), y = 8, bh = 46;   // at the top: he and whoever speaks stand at the foot of the picture
    H.px(C.ink, x - 1, y - 1, bw + 2, bh + 2); H.px('#262b44', x, y, bw, bh); H.px(C.ink, x + 1, y + 1, bw - 2, bh - 2); H.px(P.col, x + 1, y + 1, bw - 2, 1);
    const f = face(S.who); H.px('#262b44', x + 4, y + 5, 36, 36); H.px(C.ink, x + 5, y + 6, 34, 34);
    if (f){ g.imageSmoothingEnabled = false; g.drawImage(f.im, f.x, f.y, f.s, f.s, x + 6, y + 7, 32, 32); }
    text(g, P.name, x + 46, y + 5, P.col, 1, 'left');
    wrap(L.slice(0, Math.floor(S.n)), bw - 54).slice(0, 4).forEach((ln, k) => text(g, ln, x + 46, y + 15 + k * 8, C.cream, 1, 'left', null));
    if (S.n >= L.length && Math.floor(t * 3) % 2) for (let k = 0; k < 3; k++) H.px(C.cream, x + bw - 10 + k, y + bh - 8 + k, 5 - k * 2, 1);   // more: a mark that blinks
  };
  return S;
}
