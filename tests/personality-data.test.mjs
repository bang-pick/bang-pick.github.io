import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../scripts/personality-data.js', import.meta.url));
const { axes, questions, profiles, scoreAnswers, resultAxisValues, compatibilityDistance } = await import(`data:text/javascript;base64,${source.toString('base64')}`);

assert.equal(questions.length, 30);
assert.equal(axes.length, 9);
for (const profile of Object.values(profiles)) {
  assert.equal(profile.length, axes.length);
  assert(profile.every((value) => Number.isInteger(value) && value >= -3 && value <= 3));
}

const neutralAnswers = questions.map(([axis]) => Array.isArray(axis) ? 4 : 2);
const neutral = scoreAnswers(neutralAnswers);
assert(neutral.counts.every((count) => count >= 3));
assert(neutral.totals.every((total) => total === 0));
assert.deepEqual(resultAxisValues(neutral.totals, neutral.counts), [0, 0, 0, 0]);
assert.deepEqual(resultAxisValues([2, 3, -4, -2, -4, 2, -1, 3, 6], [2, 3, 4, 2, 4, 2, 1, 3, 6]), [1 / 3, 0, -1, 0]);
assert.deepEqual(resultAxisValues([0, 0, 0, 0, 0, 0, 0, -3, 0], [1, 1, 1, 1, 1, 1, 1, 3, 1]), [0, 0, 0, 0]);
assert(compatibilityDistance([3, 1, 0, 0, 3, 0, 0, 0, 0], [-2, 1, 0, 0, -2, 0, 0, 0, 0]) < compatibilityDistance([3, 1, 0, 0, 3, 0, 0, 0, 0], [3, 1, 0, 0, 3, 0, 0, 0, 0]));
assert(compatibilityDistance([0, 3, 0, 0, 0, 0, 0, 0, 0], [0, 3, 0, 0, 0, 0, 0, 0, 0]) < compatibilityDistance([0, 3, 0, 0, 0, 0, 0, 0, 0], [0, -3, 0, 0, 0, 0, 0, 0, 0]));

questions.forEach(([axis, text], index) => {
  const combined = Array.isArray(axis);
  assert.equal(text.ko.length, combined ? 5 : 3);
  assert.equal(text.ja.length, text.ko.length);
  assert([...text.ko, ...text.ja].every((item) => item.trim()));
  const expected = combined ? [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]] : [[1], [-1], [0]];
  const axisList = combined ? axis : [axis];
  expected.forEach((scores, answer) => {
    const answers = [...neutralAnswers];
    answers[index] = answer;
    const result = scoreAnswers(answers);
    axisList.forEach((item, i) => assert.equal(result.totals[item], scores[i]));
    result.totals.forEach((total, item) => { if (!axisList.includes(item)) assert.equal(total, 0); });
  });
});
console.log('Personality question scoring and profiles passed.');
