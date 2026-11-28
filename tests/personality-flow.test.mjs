import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

const file = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const data = await import(`data:text/javascript;base64,${Buffer.from(await file('scripts/personality-data.js')).toString('base64')}`);
const html = await file('personality/index.html');
const labels = [...html.matchAll(/<span data-copy="([^"]+)">([^<]*)<\/span>/g)].map(([, key, value]) => ({ dataset: { copy: key }, textContent: value }));
const translations = await file('scripts/language.js');
for (const { dataset: { copy } } of labels.filter(({ dataset }) => /^resultAxis\d/.test(dataset.copy))) {
  assert(translations.includes(`"personality.${copy}"`), `Missing Japanese result copy: ${copy}`);
}
for (let axis = 0; axis < 9; axis++) {
  for (const direction of ['Positive', 'Negative', 'Neutral']) {
    assert(translations.includes(`"personality.detail${axis}${direction}"`));
  }
}
const handlers = {};
const documentHandlers = {};
const app = { innerHTML: '', addEventListener: (name, fn) => { handlers[name] = fn; }, querySelector: () => ({ disabled: false, focus() {} }) };
const saved = new Map();
const choices = data.questions.map(([axis]) => Array.isArray(axis) ? 4 : 2);
const hash = `#result=v9.${choices.join('')}`;
globalThis.document = {
  querySelector: (selector) => selector === '#personality-app' ? app : { content: { querySelectorAll: () => labels } },
  addEventListener: (name, fn) => { documentHandlers[name] = fn; }, fonts: { ready: Promise.resolve() },
};
globalThis.window = { location: { href: `https://example.test/personality/${hash}`, hash }, addEventListener() {}, scrollTo() {} };
globalThis.history = { replaceState() {} };
globalThis.localStorage = { getItem: (key) => saved.get(key), setItem: (key, value) => saved.set(key, value) };
let language = 'ko';
const japanese = Object.fromEntries([...translations.matchAll(/"(personality\.[^"]+)":\s*"([^"]*)"/g)].map(([, key, value]) => [key, value]));
globalThis.personalityTestImports = {
  getLanguage: () => language, bandName: (band) => band.name, characterName: (character) => character.name,
  t: (key) => japanese[key] ?? key, current: data,
  bands: [{ id: 'test', name: 'Test', color: '#000', logo: 'test.png' }],
  characters: ['chihaya-anon', 'nagasaki-soyo', 'takamatsu-tomori', 'shiina-taki', 'kaname-rana', 'toyama-kasumi'].map((id) => ({ id, band: 'test', name: id, japanese: id, image: 'test.png', color: '#000', part: 'Gt.' })),
  fitPosterPreview() {}, savePosterImage() {},
};
const source = (await file('scripts/personality.js')).replace(/^import .*;\s*$/gm, '').replace(/^/, 'const { getLanguage, bandName, characterName, t, current, bands, characters, fitPosterPreview, savePosterImage } = globalThis.personalityTestImports;\n');
await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
assert.equal((app.innerHTML.match(/class="personality-axis"/g) || []).length, axesCount());
assert(!app.innerHTML.includes('personality-axis-character'));
assert(!app.innerHTML.includes('personality-print-legend'));
assert(!app.innerHTML.includes('personality-result-intro'));
assert(app.innerHTML.includes('자신의 생각과 상대의 반응을 고르게 선택하셨네요'));
assert.equal((app.innerHTML.match(/class="personality-axis-description"/g) || []).length, 8);
assert.equal((app.innerHTML.match(/class="personality-match"/g) || []).length, 8);
assert.equal((app.innerHTML.match(/class="personality-result-caption"/g) || []).length, 4);
assert(app.innerHTML.includes('나와 어울리는 캐릭터'));
assert(app.innerHTML.includes('result=v9.'));
language = 'ja';
documentHandlers['app-language-change']();
assert(app.innerHTML.includes('会話では自分の考えと相手の反応を同じくらい選ばれましたのね。'));
assert(app.innerHTML.includes('あなたと相性のいいキャラクター'));
assert(!app.innerHTML.includes('personality.detail'));
language = 'ko';

await handlers.click({ target: { closest: () => ({ dataset: { action: 'restart' } }) } });
assert(app.innerHTML.includes('data-action="start"'));
assert.equal(JSON.parse(saved.get('bang-pick-personality-v9')).screen, 'intro');
const click = (action) => handlers.click({ target: { closest: () => ({ dataset: { action } }) } });
await click('start');
for (let i = 0; i < 7; i++) {
  handlers.change({ target: { name: 'answer', value: '0' } });
  await click('next');
}
assert(app.innerHTML.includes('value="4"'));
handlers.change({ target: { name: 'answer', value: '4' } });
await click('next');
assert.equal(JSON.parse(saved.get('bang-pick-personality-v9')).answers[7], 4);
await click('previous');
assert(app.innerHTML.includes('value="4" checked'));
console.log('Personality result-link, restart and combined-choice progress passed.');

function axesCount() { return 4 * 2; }
