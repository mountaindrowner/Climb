// Produces dist/artifact.html: the game page as hosted-artifact content (no document skeleton, styles inlined).
// The modules under src/ and vendor/three are published alongside it unchanged.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(root + 'index.html', 'utf8');
const css = readFileSync(root + 'src/ui/styles.css', 'utf8');
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const fonts = html.match(/<link[^>]+fonts\.googleapis\.com\/css2[^>]+>/)[0];
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
${body}`;
mkdirSync(root + 'dist', { recursive: true });
writeFileSync(root + 'dist/artifact.html', page);
console.log('dist/artifact.html', page.length, 'bytes');
