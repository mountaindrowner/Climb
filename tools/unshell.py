#!/usr/bin/env python3
# python3 tools/unshell.py px_hermit px_hermit_free: Mirel without her shell, from her own drawing (so the two match).
# Mirel without her shell, made from her own drawing: the warm blob highest on her back (the shell) is taken out, its
# outline with it, and the cloak's edge where it was is closed with ink.
import sys, json, colorsys
from PIL import Image
from collections import deque
def warm(c):
    r,g,b,a=c
    if a<128: return False
    h,l,s=colorsys.rgb_to_hls(r/255,g/255,b/255)
    return l>0.25 and not (0.5<h<0.8 and s<0.6) and (h<0.15 or h>0.75 or (r>g>b))
def ink(c): return c[3]>=128 and sum(c[:3])<150
def unshell(fr):
    W,H=fr.size; px=fr.load(); seen=set(); comps=[]
    for y in range(H):
        for x in range(W):
            if (x,y) in seen or not warm(px[x,y]): continue
            q=deque([(x,y)]); seen.add((x,y)); comp=[]
            while q:
                a,b=q.popleft(); comp.append((a,b))
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                    n=(a+dx,b+dy)
                    if 0<=n[0]<W and 0<=n[1]<H and n not in seen and warm(px[n]): seen.add(n); q.append(n)
            comps.append(comp)
    big=[c for c in comps if len(c)>25]
    if not big: return fr
    sh=min(big,key=lambda c: sum(p[1] for p in c)/len(c))
    xs=[p[0] for p in sh]; ys=[p[1] for p in sh]; x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
    gone=set(sh)
    for p in sh: px[p]=(0,0,0,0)
    # the shell's outline and its cords: ink and dark pixels in its box left touching nothing but air or the shell
    for _ in range(3):
        for y in range(max(0,y0-2),min(H,y1+3)):
            for x in range(max(0,x0-2),min(W,x1+3)):
                c=px[x,y]
                if c[3]<128: continue
                nb=[px[x+dx,y+dy] for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)) if 0<=x+dx<W and 0<=y+dy<H]
                solid=[n for n in nb if n[3]>=128 and not ink(n)]
                if (ink(c) or sum(c[:3])<260) and len(solid)<=1 and any(n[3]<128 for n in nb): px[x,y]=(0,0,0,0)
    # close the edge: a coloured pixel now beside air, where the shell was, becomes ink
    out=[]
    for y in range(max(0,y0-2),min(H,y1+3)):
        for x in range(max(0,x0-2),min(W,x1+3)):
            c=px[x,y]
            if c[3]>=128 and not ink(c) and any(0<=x+dx<W and 0<=y+dy<H and px[x+dx,y+dy][3]<128 and (x+dx,y+dy) in gone for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))): out.append((x,y))
    for p in out: px[p]=(24,20,37,255)
    # the carrier the shell sat in (on her back, just under it): in the rows from the shell down a little way, whatever is
    # behind the back of her cloak goes, then its edge is inked as above
    def greyish(c): r,g,b,a_=c; return a_>=128 and b+6>=r and max(r,g,b)-min(r,g,b)<40 and max(r,g,b)>45
    cut=set()
    for y in range(max(0,y0),min(H,y1+15)):
        back=next((x for x in range(W) if greyish(px[x,y])), None)
        if back is None: continue
        for x in range(0,back):
            if px[x,y][3]>=128: px[x,y]=(0,0,0,0); cut.add((x,y))
    for (x,y) in [(x,y) for y in range(H) for x in range(W) if px[x,y][3]>=128 and not ink(px[x,y]) and any((x+dx,y+dy) in cut for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)))]:
        px[x,y]=(24,20,37,255)
    # keep only her: the largest piece; specks of the shell's shading left in the air go
    seen=set(); best=[]
    for y in range(H):
        for x in range(W):
            if (x,y) in seen or px[x,y][3]<128: continue
            q=deque([(x,y)]); seen.add((x,y)); comp=[]
            while q:
                a,b=q.popleft(); comp.append((a,b))
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    n=(a+dx,b+dy)
                    if 0<=n[0]<W and 0<=n[1]<H and n not in seen and px[n][3]>=128: seen.add(n); q.append(n)
            if len(comp)>len(best): best=comp
    keep=set(best)
    for y in range(H):
        for x in range(W):
            if px[x,y][3]>=128 and (x,y) not in keep: px[x,y]=(0,0,0,0)
    # and thin dark spurs, in the shell's box, sticking out into the air
    for _ in range(2):
        for y in range(max(0,y0-2),min(H,y1+3)):
            for x in range(max(0,x0-2),min(W,x1+3)):
                c=px[x,y]
                if c[3]<128 or sum(c[:3])>330: continue
                nb=sum(1 for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)) if 0<=x+dx<W and 0<=y+dy<H and px[x+dx,y+dy][3]>=128)
                if nb<=1: px[x,y]=(0,0,0,0)
    return fr
A='/home/user/climb-2d/assets/side/'; src=sys.argv[1]; dst=sys.argv[2]
import os, shutil
os.makedirs(A+dst,exist_ok=True); m=json.load(open(A+src+'/sprite.json'))
for an,d in m['anims'].items():
    im=Image.open(A+src+f'/{an}.png').convert('RGBA'); w=d['w']; n=d['frames']; out=Image.new('RGBA',im.size,(0,0,0,0))
    for i in range(n): out.paste(unshell(im.crop((i*w,0,(i+1)*w,im.height))),(i*w,0))
    out.save(A+dst+f'/{an}.png')
    if os.path.exists(A+src+f'/{an}_n.png'):
        nm=Image.open(A+src+f'/{an}_n.png').convert('RGBA'); a=out.split()[3]; nm.putalpha(a); nm.save(A+dst+f'/{an}_n.png')
m['name']=dst; json.dump(m,open(A+dst+'/sprite.json','w'),indent=1); print('ok')
