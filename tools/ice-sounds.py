#!/usr/bin/env python3
"""The Rime Wyrm's sounds (build 99, docs/wyrm-sheet.md part 4: "every piece of ice gets a sound"), made by rule from
noise and tones, written as the game's other recordings are (assets/audio/sfx/<name>.wav, mono, 22 kHz) and entered in
assets/audio/manifest.json. src/audio/sfx.js plays them by name (USE), and has a thinner synthesised one of each.
  ice_inhale  it draws breath: wind and grit sucked in, rising to a catch (0.8 s)
  ice_breath  the breath: a long hiss of wind and grit with a cold roar under it, swelling and dying (2.9 s)
  ice_spit    a shard leaving its jaw: a puff, and a glassy ring falling away
  ice_crack   a shard landing: a hard crack, splinters, a tinkle of pieces
  ice_rise    spikes coming up out of the ground: a grinding crunch that climbs, then a ring
  wing_rush   its body going by: a great rush of air rising and falling, with the beat of it in it (played moving across
              the room: sfx.js pans it)
Run: python3 tools/ice-sounds.py"""
import os, json, wave
import numpy as np
R = 22050; ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')); OUT = os.path.join(ROOT, 'assets', 'audio')
rng = np.random.default_rng(99)
t_ = lambda d: np.arange(int(d * R)) / R
def band(x, lo, hi):
    """x through a band from lo to hi Hz (a soft-edged mask on its spectrum)"""
    f = np.fft.rfftfreq(len(x), 1 / R); X = np.fft.rfft(x)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def noise(d): return rng.standard_normal(int(d * R))
def env(n, a, r, shape=1.0):
    """attack a s, release r s, over n samples"""
    t = np.arange(n) / R; d = n / R
    return np.clip(t / max(a, 1e-4), 0, 1) * np.clip((d - t) / max(r, 1e-4), 0, 1) ** shape
def ping(d, f, decay, glide=0.0):
    t = t_(d); fr = f * (1 + glide * t); ph = 2 * np.pi * np.cumsum(fr) / R
    return np.sin(ph) * np.exp(-t / decay)
def grit(d, rate, lo=2500, hi=9000):
    """sparse clicks: grains of ice in the wind"""
    n = int(d * R); x = np.zeros(n); k = rng.random(n) < rate / R; x[k] = rng.standard_normal(k.sum()) * 3
    return band(x, lo, hi)
def norm(x, peak=0.9):
    x = x - np.mean(x); return x / (np.max(np.abs(x)) + 1e-9) * peak
def fit(x, d):
    n = int(d * R); return np.pad(x, (0, max(0, n - len(x))))[:n]

def breath():
    d = 2.9; n = int(d * R); t = t_(d)
    hiss = band(noise(d), 900, 6500) * (1 + 0.25 * np.sin(2 * np.pi * 6.5 * t))
    roar = band(noise(d), 70, 380) * 1.4
    g = grit(d, 140)
    e = env(n, 0.18, 0.7, 1.6)
    return norm((hiss + roar * 0.8 + g * 0.6) * e)
def inhale():
    d = 0.8; n = int(d * R); t = t_(d)
    x = band(noise(d), 1200, 7000) * (t / d) ** 2 + grit(d, 60) * 0.4 * (t / d)
    catch = np.zeros(n); k = int(0.72 * R); catch[k:] = band(noise(d - 0.72), 300, 1800) * np.exp(-np.arange(n - k) / R / 0.03)
    return norm((x + catch * 1.2) * env(n, 0.05, 0.03))
def spit():
    d = 0.5; n = int(d * R); t = t_(d)
    puff = band(noise(d), 1800, 8000) * np.exp(-t / 0.04)
    ring = sum(ping(d, f, dec, -0.08) * a for f, dec, a in ((2093, 0.22, 1), (3150, 0.16, 0.6), (4410, 0.1, 0.4)))
    return norm(puff * 1.1 + ring * 0.5)
def crack():
    d = 0.6; n = int(d * R); t = t_(d)
    snap = noise(d) * np.exp(-t / 0.006)
    body = band(noise(d), 1200, 6000) * np.exp(-t / 0.07)
    thud = ping(d, 140, 0.06, -0.5) * 0.6
    tink = np.zeros(n)
    for _ in range(9):
        s = int(rng.uniform(0.04, 0.38) * R); f = rng.uniform(3200, 7200); p = ping(0.15, f, 0.035) * rng.uniform(0.2, 0.5); tink[s:s + len(p)] += p[:n - s]
    return norm(snap * 0.9 + body + thud + tink)
def rise():
    d = 0.5; n = int(d * R); t = t_(d)
    grain = (rng.random(n) < 0.004).astype(float); grain = np.convolve(grain, np.exp(-np.arange(200) / 40), 'same')
    crunch = band(noise(d), 400, 2600) * (0.3 + grain * 2) * np.clip(t / 0.3, 0, 1)
    sweep = np.zeros(n); seg = band(noise(d), 1500, 5000); sweep = seg * np.clip((t - 0.1) / 0.25, 0, 1) * 0.5
    ring = np.zeros(n); k = int(0.34 * R); p = ping(d - 0.34, 2640, 0.08); ring[k:k + len(p)] = p[:n - k] * 0.6
    return norm((crunch + sweep) * env(n, 0.02, 0.12) + ring)
def rush():
    d = 1.6; n = int(d * R); t = t_(d)
    shape = np.exp(-((t - 0.65) / 0.33) ** 2)
    air = band(noise(d), 160, 1600) * shape
    hi = band(noise(d), 1500, 5000) * shape ** 2 * 0.4
    beat = band(noise(d), 50, 160) * (0.5 + 0.5 * np.sin(2 * np.pi * 4.2 * t)) ** 6 * shape * 2.2
    return norm(air + hi + beat)

def write(name, x):
    p = os.path.join(OUT, 'sfx', name + '.wav'); x16 = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes(x16.tobytes())
    return round(len(x) / R, 2)
if __name__ == '__main__':
    man = json.load(open(os.path.join(OUT, 'manifest.json')))
    for name, f in (('ice_inhale', inhale), ('ice_breath', breath), ('ice_spit', spit), ('ice_crack', crack), ('ice_rise', rise), ('wing_rush', rush)):
        s = write(name, f()); man['sfx'][name] = { 'f': f'sfx/{name}.wav', 's': s }; print(name, s, 's')
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
