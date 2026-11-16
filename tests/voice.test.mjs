// The folk's mumble speech (src/audio/voice.js): where the syllables fall, their vowels, the tune the punctuation gives
// them, and the typing rhythm. The examples are the method's own (docs/voices.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planLine, pauseAfter, voiceOf, VOICES } from '../src/audio/voice.js';
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
