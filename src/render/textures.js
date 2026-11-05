// All textures are generated in code, so the game ships with no image files. Real art can replace these per zone later.
import { hash } from '../core/math.js';
const THREE = window.THREE;

export function canvasTex(w, h, draw){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
export const wallTex = canvasTex(256, 256, (g, w, h) => {
  const im = g.createImageData(w, h), d = im.data, rows = 16, bh = h / rows, bw = 32;
  for (let y = 0; y < h; y++){
    const r = Math.floor(y / bh), off = (r % 2) * bw / 2, yy = y - r * bh;
    for (let x = 0; x < w; x++){
      const cx = Math.floor((x + off) / bw), xx = (x + off) - cx * bw, bv = hash(r, cx);
      let v;
      if (yy < 2 || xx < 2) v = 26 + Math.random() * 14;
      else {
        v = 92 + bv * 58 + (hash(x >> 2, (y >> 2) + 7) - 0.5) * 30 + (Math.random() - 0.5) * 30;
        if (yy < 4) v += 16;
        if (yy > bh - 4 || xx > bw - 3) v *= 0.72;
      }
      if (hash(x >> 3, 3) > 0.78) v *= 0.62 + 0.38 * ((y % 96) / 96);
      const i = (y * w + x) * 4; d[i] = v; d[i + 1] = v * 0.97; d[i + 2] = v * 1.03; d[i + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
  g.strokeStyle = 'rgba(12,10,14,0.85)'; g.lineWidth = 1;
  for (let c = 0; c < 9; c++){ let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 7; q++){ x += (Math.random() - 0.5) * 18; y += Math.random() * 12; g.lineTo(x, y); } g.stroke(); }
  for (let c = 0; c < 14; c++){ const x = (Math.random() * w) | 0, y = (Math.random() * h) | 0; g.fillStyle = '#ffffff'; g.fillRect(x, y, 3, 3); g.fillRect(x + 3, y + 2, 2, 2); }
  // an opening into the caverns behind the wall
  g.clearRect(48, 44, 36, 58); g.clearRect(52, 38, 28, 8); g.clearRect(58, 34, 16, 6);
});
export const stoneTex = canvasTex(64, 64, (g, w, h) => {
  const im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    let v = 160 + (hash(x >> 3, y >> 3) - 0.5) * 50 + (hash(x >> 1, (y >> 1) + 99) - 0.5) * 30 + (Math.random() - 0.5) * 36;
    const e = Math.min(x, y, w - 1 - x, h - 1 - y);
    if (e < 2) v *= 0.55; else if (e < 4) v *= 0.8;
    const i = (y * w + x) * 4; d[i] = v; d[i + 1] = v * 0.98; d[i + 2] = v * 1.04; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  g.strokeStyle = 'rgba(18,14,22,0.85)'; g.lineWidth = 1;
  for (let c = 0; c < 3; c++){ let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 6; q++){ x += (Math.random() - 0.5) * 14; y += (Math.random() - 0.3) * 10; g.lineTo(x, y); } g.stroke(); }
  for (let c = 0; c < 8; c++){ g.fillStyle = 'rgba(14,10,16,0.75)'; g.fillRect((Math.random() * w) | 0, (Math.random() * h) | 0, 2, 2); }
});
export const grimeTex = canvasTex(32, 32, (g, w, h) => {
  const im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const v = 200 + (hash(x >> 2, y >> 2) - 0.5) * 60 + (Math.random() - 0.5) * 50;
    const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v)); d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
});
export const outerTex = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#1a1820'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++){
    const v = hash(r + 40, c); const l = 46 + Math.floor(v * 30);
    g.fillStyle = `rgb(${l},${l},${l + 8})`; g.fillRect(c * 22 + (r % 2) * 10 + 1, r * 16 + 1, 20, 14);
    if (v > 0.85){ g.fillStyle = '#ffffff'; g.fillRect(c * 22 + 8, r * 16 + 6, 2, 2); }
  }
});
export const chainTex = canvasTex(16, 32, (g) => {
  g.clearRect(0, 0, 16, 32);
  g.fillStyle = '#4a4552'; g.fillRect(4, 1, 8, 14); g.clearRect(6, 3, 4, 10);
  g.fillStyle = '#3a3542'; g.fillRect(7, 15, 2, 17);
});
export const silTex = canvasTex(128, 192, (g) => {
  g.clearRect(0, 0, 128, 192);
  g.fillStyle = '#000';
  g.fillRect(34, 40, 60, 80); g.fillRect(48, 14, 32, 28); g.fillRect(14, 44, 20, 70); g.fillRect(94, 44, 20, 70);
  g.fillRect(40, 120, 18, 60); g.fillRect(70, 120, 18, 60);
  g.fillStyle = '#ffffff'; g.fillRect(54, 26, 6, 4); g.fillRect(68, 26, 6, 4);
});
silTex.wrapS = silTex.wrapT = THREE.ClampToEdgeWrapping;
