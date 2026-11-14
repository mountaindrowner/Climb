// A worker that paints regions (paint.js) away from the page, so the game never stops for it: asked for region n, it
// builds the region, paints it, and sends the paintings back as bitmaps. It says hello first, so the page knows it runs.
import { paintRegion } from './paint.js';
self.onmessage = e => {
  const n = e.data.n;
  try {
    const R = paintRegion(n, true), bmp = c => c && c.transferToImageBitmap ? c.transferToImageBitmap() : null;
    const out = { n, back: bmp(R.back), bh: R.bh, play: bmp(R.play), normals: bmp(R.normals), glows: R.glows };
    self.postMessage(out, [out.back, out.play, out.normals].filter(Boolean));
  } catch (err){ self.postMessage({ n, error: String(err && err.stack || err) }); }
};
self.postMessage({ hello: true });
