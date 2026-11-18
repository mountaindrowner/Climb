// The folk's mumble speech (src/audio/voice.js): where the syllables fall, their vowels, the tune the punctuation gives
// them, and the typing rhythm. The examples are the method's own (docs/voices.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planLine, pauseAfter, voiceOf, VOICES, onsetOf } from '../src/audio/voice.js';
const vowels = t => [...planLine(t).values()].map(s => s.v).join('');

test('one sound for each group of vowels, a silent final e silent', () => {
  assert.equal(vowels("Machines don't come past the ramp. Usually."), 'aieooaeauui');
  assert.equal(vowels('house'), 'u'); assert.equal(vowels('said'), 'e'); assert.equal(vowels('come'), 'o');
});
test('a word that starts with a vowel speaks it; y starting a word is a consonant', () => {
  assert.equal(vowels('up out I'), 'uui'); assert.equal(vowels('you yes'), 'ue');
});
test('the tune: a phrase falls, a question rises at its end, capitals shout, trailing dots fade', () => {
  const p = [...planLine('one two three four').values()]; assert.ok(p[0].p > p[p.length - 1].p, 'it falls');
  const q = [...planLine('Where did you go?').values()]; assert.ok(q[q.length - 1].p > 1.1, 'a question rises');
  const shout = [...planLine('I SAID it').values()][1]; assert.ok(shout.p > 1.2 && shout.g > 1.3, 'capitals: higher and louder');
  const dots = [...planLine('it was fine...').values()]; assert.ok(dots[dots.length - 1].g < 0.6, 'trailing off');
});
test('the typing rhythm waits at punctuation', () => {
  const t = 'Wait, then go. Now... and…'; const at = c => pauseAfter(t, t.indexOf(c));
  assert.equal(pauseAfter(t, 0), 1); assert.equal(at(','), 3); assert.equal(at('.'), 6); assert.equal(at('…'), 9);
  assert.equal(pauseAfter(t, t.indexOf('...') + 2), 4);
});
test('every one who speaks has a voice, and anyone else a fixed one from their name', () => {
  for (const who of ['lamplighter', 'wren', 'wren_free', 'scribe', 'hob']) assert.ok(VOICES[who] && VOICES[who].f0 > 60, who);
  assert.deepEqual(voiceOf('a stranger'), voiceOf('a stranger')); assert.notDeepEqual(voiceOf('a stranger'), voiceOf('another'));
});
// phase 8: a hint of the words, and each a sharper character
test('each syllable knows how it begins: a hiss, a pop, a hum, a roll, or nothing', () => {
  const on = t => [...planLine(t).values()].map(s => s.c || '-').join('');
  assert.equal(on('so'), 's'); assert.equal(on('pat'), 'p'); assert.equal(on('me'), 'm'); assert.equal(on('row'), 'r'); assert.equal(on('up'), '-');
  assert.equal(on('the ship'), 'ss'); assert.equal(on('chin'), 'p'); assert.equal(on('cell'), 's'); assert.equal(on('cup'), 'p');
  assert.equal(on('slow frost'), 'ss', 'a hiss before a roll stays a hiss'); assert.equal(on('you'), 'r', 'y starting a word is a consonant');
  assert.equal(on('water'), 'rp', 'each syllable has its own'); assert.equal(onsetOf('', 'a'), '');
});
test('the last syllable of each phrase is marked, for a voice that turns it up', () => {
  const s = [...planLine('Forty falls. I keep the count.').values()]; assert.deepEqual(s.map(x => x.end ? 1 : 0), [0, 0, 1, 0, 0, 0, 1]);
  assert.ok(VOICES.wren.rise > 0 && !VOICES.wren_free.rise, 'Mirel turns her phrases up, until she has put the shell down');
});
test('each has a character of their own: pace, how clearly they speak, how long they hold a vowel', () => {
  const V = VOICES; assert.ok(V.lamplighter.rate < V.hob.rate && V.hob.rate < V.scribe.rate && V.scribe.rate < V.wren.rate, 'Ordric slowest, Mirel quickest');
  assert.ok(V.scribe.artic > V.wren.artic && V.wren.artic > V.lamplighter.artic && V.lamplighter.artic > V.hob.artic, 'Corwen the clearest, Hob a mutter');
  assert.ok(V.lamplighter.hold > 1.2 && V.wren.hold < 0.9, 'Ordric holds his vowels, Mirel clips hers');
  const t = 'Wait, then go.'; assert.ok(pauseAfter(t, 4, V.scribe) > pauseAfter(t, 4, V.wren), 'Corwen waits at a comma');
});
