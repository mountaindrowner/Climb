// Produces dist/artifact.html: the game page as hosted-artifact content (no document skeleton, styles inlined).
// The modules under src/ and vendor/three are published alongside it unchanged.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(root + 'index.html', 'utf8');
const css = readFileSync(root + 'src/ui/styles.css', 'utf8');
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const fonts = html.match(/<link[^>]+fonts\.googleapis\.com\/css2[^>]+>/)[0];
// The hosted page cannot serve .glb, so each warrior model goes as glTF JSON with its binary chunk embedded as base64.
function glbToEmbeddedJson(glbPath){
  const d = readFileSync(glbPath), jsonLen = d.readUInt32LE(12), json = JSON.parse(d.subarray(20, 20 + jsonLen).toString('utf8'));
  const binStart = 20 + jsonLen + 8, binLen = d.readUInt32LE(20 + jsonLen), bin = d.subarray(binStart, binStart + binLen);
  json.buffers = [{ byteLength: binLen, uri: 'data:application/octet-stream;base64,' + bin.toString('base64') }];
  return JSON.stringify(json);
}
const MODELS = { skeleton: 'skeleton/skeleton', knight: 'knight/knight', blender: 'warrior/warrior', bat: 'bat/bat', burrower: 'burrower/burrower', crawler: 'crawler/crawler', spitter: 'spitter/spitter', props: 'props/props' };
const urls = {};
for (const [rig, path] of Object.entries(MODELS)){
  mkdirSync(root + 'dist/assets/models/' + path.split('/')[0], { recursive: true });
  writeFileSync(root + `dist/assets/models/${path}.json`, glbToEmbeddedJson(root + `assets/models/${path}.glb`));
  urls[rig] = `assets/models/${path}.json`;
}

const page = `<title>The Climb</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#0d0b12">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>
/* The Climb: a single dark world. Tokens on :root; the game is dark by design, so no light theme. */
${css}
/* hosted page: the host pads :root by the phone's safe areas; the stage fills what is left */
html,body{height:100%}
#app{padding-left:max(0px, env(safe-area-inset-left, 0px));padding-right:max(0px, env(safe-area-inset-right, 0px))}
</style>
<script>window.CLIMB_MODEL_URLS = ${JSON.stringify(urls)};</script>
${body}`;
mkdirSync(root + 'dist', { recursive: true });
writeFileSync(root + 'dist/artifact.html', page);
console.log('dist/artifact.html', page.length, 'bytes; models:', Object.values(urls).join(', '));
