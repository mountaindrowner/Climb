#!/usr/bin/env python3
# The game's recorded sound, packed for play. Takes a folder of what PixelLab made (music as <key>_1.mp3 / <key>_2.mp3,
# two takes of each piece; sound effects as <name>.wav) and writes assets/audio/:
#   music/<key>.mp3   the take with the least dead air, at 128 kbit/s
#   sfx/<name>.wav    mono, 22 kHz, the silence before it cut off (so it sounds when it is asked for), its peak set level
#   manifest.json     what is there, for src/audio/sfx.js and the score to load
#   python3 tools/audio-pack.py <folder>
import sys, os, json, subprocess, glob
import numpy as np
SRC = sys.argv[1]; ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')); OUT = os.path.join(ROOT, 'assets', 'audio')
os.makedirs(OUT + '/music', exist_ok=True); os.makedirs(OUT + '/sfx', exist_ok=True)
def pcm(path, rate):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(rate), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
man = { 'music': {}, 'sfx': {} }
for key in sorted({os.path.basename(p).rsplit('_', 1)[0] for p in glob.glob(SRC + '/*_[12].mp3')}):
    best = None
    for t in (1, 2):
        p = f'{SRC}/{key}_{t}.mp3'
        if not os.path.exists(p): continue
        a = pcm(p, 8000); sec = len(a) / 8000; rms = np.sqrt(np.array([np.mean(a[i:i + 8000] ** 2) for i in range(0, len(a) - 8000, 8000)]) + 1e-12)
        dead = float(np.mean(rms < 0.01)); score = dead * 100 - min(sec, 95) * 0.1   # little dead air, and not cut short
        print(f'  {key} take {t}: {sec:.0f} s, dead air {dead * 100:.0f}%, level {20 * np.log10(np.mean(rms) + 1e-9):.1f} dB')
        if best is None or score < best[0] - 0.5: best = (score, t, p, sec, float(np.mean(rms)))
    _, t, p, sec, lvl = best
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-codec:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', f'{OUT}/music/{key}.mp3'], check=True)
    man['music'][key] = { 'f': f'music/{key}.mp3', 's': round(sec, 1), 'v': round(float(min(1.4, 0.12 / max(lvl, 1e-3))), 2) }   # v: evens the pieces out
    print(key, 'take', t, os.path.getsize(f'{OUT}/music/{key}.mp3') // 1024, 'KB')
for p in sorted(glob.glob(SRC + '/*.wav')):
    name = os.path.basename(p)[:-4]
    if name in ('probe', 'test_swing', 'dl_test'): continue
    a = pcm(p, 22050); amb = name.startswith('amb_')
    if not len(a): continue
    peak = float(np.max(np.abs(a))) or 1
    if not amb:
        on = np.nonzero(np.abs(a) > peak * 0.04)[0]; a = a[max(0, on[0] - 60):] if len(on) else a   # the first sound, less 3 ms
        off = np.nonzero(np.abs(a) > peak * 0.01)[0]; a = a[:min(len(a), off[-1] + 2200)] if len(off) else a
        fade = min(len(a), 660); a[-fade:] *= np.linspace(1, 0, fade)
    if amb:   # an ambience goes round: its last half second is laid into its first, so the join cannot be heard
        x = 11025; tail = a[-x:].copy(); a = a[:-x].copy(); k = np.linspace(0, 1, x); a[:x] = a[:x] * k + tail * (1 - k)
    a = a / (float(np.max(np.abs(a))) or 1) * 0.89
    import wave
    w = wave.open(f'{OUT}/sfx/{name}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((a * 32767).astype(np.int16).tobytes()); w.close()
    man['sfx'][name] = { 'f': f'sfx/{name}.wav', 's': round(len(a) / 22050, 2) }
json.dump(man, open(OUT + '/manifest.json', 'w'), indent=1)
print(len(man['music']), 'pieces,', len(man['sfx']), 'sounds;', sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs) // 1024, 'KB')
