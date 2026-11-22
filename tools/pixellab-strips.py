# fetch every animation of a state of the hero as strips (east). Usage: strips.py <character_id> <state folder> <outdir>
import sys, io, zipfile, urllib.request, os
from PIL import Image
cid, state, out = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(out, exist_ok=True)
req = urllib.request.Request(f'https://api.pixellab.ai/v2/characters/{cid}/zip', headers={'Authorization': 'Bearer from-proxy'})
z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(req, timeout=240).read()))
g = {}
for n in z.namelist():
    p = n.split('/')
    if p[0] == state and len(p) >= 5 and p[1] == 'animations' and p[3] == 'east' and n.endswith('.png'): g.setdefault(p[2], []).append(n)
print(sorted((k, len(v)) for k, v in g.items()))
for k, fs in g.items():
    fs.sort(); ims = [Image.open(io.BytesIO(z.read(f))).convert('RGBA') for f in fs]; w, h = ims[0].size
    s = Image.new('RGBA', (w * len(ims), h)); [s.paste(im, (i * w, 0)) for i, im in enumerate(ims)]; s.save(os.path.join(out, k + '.png'))
