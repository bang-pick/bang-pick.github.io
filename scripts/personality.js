import { getLanguage, bandName, characterName, t } from './language.js?v=20261012-1';
import * as current from './personality-data.js?v=20261128-30';
import { bands, characters } from './data.js?v=20261012-1';
import { fitPosterPreview, savePosterImage } from './poster-export.js?v=20261024-3';

const koreanCopy = Object.fromEntries([...document.querySelector('#personality-copy').content.querySelectorAll('[data-copy]')].map((element) => [element.dataset.copy, element.textContent]));

// 각 축의 문구는 양수, 음수, 중립 순서로 두고 결과별 문장으로 이어 붙인다.
const koreanDetails = [
  ['먼저 다가가고', '천천히 가까워지고', '다가가는 두 방식을 고르게 선택하셨고'],
  ['떠오른 대로 움직이며', '차근차근 준비하며', '즉흥과 준비를 고르게 선택하시며'],
  ['마음은 말로 전하고', '마음은 행동으로 전하고', '마음을 전할 때 말과 행동을 고르게 선택하고'],
  ['새로운 가능성에 마음이 향하시네요.', '익숙한 것에서 편안함을 찾으시네요.', '새로움과 익숙함을 고르게 선택하셨네요.'],
  ['함께할 때는 방향을 먼저 제안하며', '함께할 때는 주변부터 살피며', '함께할 때의 제안과 관찰도 고르게 선택하시며'],
  ['걱정은 추스르는 편이고', '걱정은 오래 남는 편이고', '걱정을 받아들이는 두 방식을 고르게 선택하셨고'],
  ['속마음은 털어놓으시는 편이네요.', '속마음은 혼자 간직하시는 편이네요.', '속마음을 전하는 방식도 고르게 선택하셨네요.'],
  ['상대의 반응도 세심히 살피시네요.', '대화에서는 자신의 생각에 집중하시네요.', '대화에서는 자신의 생각과 상대의 반응을 고르게 선택하셨네요.'],
  ['의견은 바로 전하시네요.', '의견을 전할 때는 말을 신중히 고르시네요.', '의견을 전하는 두 방식도 고르게 선택하셨네요.'],
];

const app = document.querySelector('#personality-app');
const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
let answers = Array(current.questions.length).fill(null);
let screen = 'intro';
let index = 0;
let saving = false;
const storageKey = 'bang-pick-personality';
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function validAnswers(value) {
  return Array.isArray(value) && value.length === current.questions.length && value.every((answer, i) => answer === null || (Number.isInteger(answer) && answer >= 0 && answer < current.questions[i][1].ko.length));
}

function saveProgress() {
  try { localStorage.setItem(storageKey, JSON.stringify({ answers, screen, index })); } catch { /* 저장이 불가능해도 현재 화면은 사용할 수 있다. */ }
}

function restoreProgress() {
  const encoded = new URLSearchParams(window.location.hash.slice(1)).get('result');
  const encodedAnswers = encoded || '';
  if (/^[0-4]+$/.test(encodedAnswers) && validAnswers([...encodedAnswers].map(Number))) {
    answers = [...encodedAnswers].map(Number);
    screen = 'result';
    index = current.questions.length - 1;
    return;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && validAnswers(saved.answers) && ['intro', 'question', 'result'].includes(saved.screen) && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < current.questions.length && (saved.screen !== 'result' || saved.answers.every((answer) => answer !== null))) {
      answers = saved.answers;
      screen = saved.screen;
      index = saved.index;
      return;
    }
  } catch { /* 저장된 값이 없거나 유효하지 않으면 처음부터 시작한다. */ }
}

function resultUrl() {
  const url = new URL(window.location.href);
  url.hash = `result=${answers.join('')}`;
  return url.href;
}

function updateResultUrl() {
  if (screen === 'result') history.replaceState(null, '', resultUrl());
  else if (new URLSearchParams(window.location.hash.slice(1)).has('result')) {
    const url = new URL(window.location.href);
    url.hash = '';
    history.replaceState(null, '', url.href);
  }
}

function resultData() {
  const { axes, profiles } = current;
  const candidates = characters.filter((character) => character.band !== 'others' && profiles[character.id]);
  const { totals, counts } = current.scoreAnswers(answers);
  const values = totals.map((total, axis) => 3 * total / counts[axis]);
  const matches = candidates.map((character, order) => ({
    character, order,
    distance: profiles[character.id].reduce((sum, value, axis) => sum + (value - values[axis]) ** 2, 0),
  })).sort((a, b) => a.distance - b.distance || a.order - b.order);
  const compatible = matches.slice(1).map(({ character, order }) => ({
    character, order, distance: current.compatibilityDistance(values, profiles[character.id]),
  })).sort((a, b) => a.distance - b.distance || a.order - b.order)[0].character;
  const bandMatches = bands.flatMap((band, order) => {
    const members = candidates.filter((character) => character.band === band.id);
    if (!members.length) return [];
    const average = axes.map((_, axis) => members.reduce((sum, character) => sum + profiles[character.id][axis], 0) / members.length);
    const distance = average.reduce((sum, value, axis) => sum + (value - values[axis]) ** 2, 0);
    return [{ band, order, distance }];
  }).sort((a, b) => a.distance - b.distance || a.order - b.order);
  return { totals, counts, matches, bandMatches, compatible };
}

function portrait(character, className) {
  return `<img class="${className}" src="./assets/images/characters/${escape(character.image)}" alt="" style="--character-color:${escape(character.color)}">`;
}

function render() {
  const lang = getLanguage();
  const { questions } = current;
  const c = Object.fromEntries(Object.entries(koreanCopy).map(([key, value]) => [key, lang === 'ja' ? t(`personality.${key}`) : value]));
  if (screen === 'intro') {
    app.innerHTML = `<section class="workspace personality-panel"><h1 class="section-title personality-title">${c.title}</h1><p class="personality-intro">${c.intro}</p><div class="personality-actions"><button class="personality-button" data-action="start">${c.start}</button></div></section>`;
  } else if (screen === 'question') {
    const questionData = questions[index];
    const question = [...questionData[1][lang], (Array.isArray(questionData[0]) ? current.neutralCombinedOption : current.neutralOption)[lang]];
    app.innerHTML = `<section class="workspace personality-panel"><div class="personality-progress"><span>${c.question}</span><span>${index + 1} / ${questions.length}</span></div><div class="personality-progress-bar" aria-hidden="true"><span style="width:${(index + 1) / questions.length * 100}%"></span></div><h1 class="section-title personality-question" id="question-title">${escape(question[0])}</h1><fieldset class="personality-options" aria-labelledby="question-title">${question.slice(1).map((option, value) => `<label class="personality-option"><input type="radio" name="answer" value="${value}" ${answers[index] === value ? 'checked' : ''}><span>${escape(option)}</span></label>`).join('')}</fieldset><div class="personality-actions"><button class="personality-button secondary" data-action="previous">${c.previous}</button><button class="personality-button" data-action="next" ${answers[index] === null ? 'disabled' : ''}>${index === questions.length - 1 ? c.result : c.next}</button></div></section>`;
  } else {
    const { totals, counts, matches, bandMatches, compatible } = resultData();
    const winner = matches[0].character;
    const detailGroups = [[0, 4, 8], [1, 3], [2, 7], [5, 6]];
    const axisMarkup = current.resultAxisValues(totals, counts).map((value, i) => {
      const title = c[`resultAxis${i}Title`];
      const positive = c[`resultAxis${i}Positive`];
      const negative = c[`resultAxis${i}Negative`];
      const direction = Math.abs(value) < 1e-10 ? c.neutral : value > 0 ? positive : negative;
      const position = (1 - value) / 2 * 100;
      const description = detailGroups[i].map((axis) => {
        const direction = totals[axis] > 0 ? 0 : totals[axis] < 0 ? 1 : 2;
        return lang === 'ja' ? t(`personality.detail${axis}${['Positive', 'Negative', 'Neutral'][direction]}`) : koreanDetails[axis][direction];
      }).join(' ');
      return `<div class="personality-axis"><div class="personality-axis-head"><span>${escape(title)}</span></div><div class="personality-axis-track" role="img" aria-label="${escape(title)}: ${escape(direction)}"><span class="personality-axis-user" style="left:${position}%"></span></div><div class="personality-axis-labels"><span>${escape(positive)}</span><span>${escape(negative)}</span></div><p class="personality-axis-description">${escape(description)}</p></div>`;
    }).join('');
    const alternatives = matches.slice(1).filter(({ character }) => character.id !== compatible.id).slice(0, 4).map(({ character }) => `<div class="personality-match">${portrait(character, '')}<div><strong>${escape(characterName(character))}</strong><span>${escape(bandName(bandById[character.band]))}</span></div></div>`).join('');
    const matchedBand = bandMatches[0].band;
    const characterCard = (character, label) => `<article class="personality-result" style="--character-color:${escape(character.color)}"><div class="personality-result-portrait">${portrait(character, 'personality-portrait')}</div><div class="personality-result-info"><p class="personality-result-caption">${escape(label)}</p><h2 class="personality-name">${escape(characterName(character))}</h2><p class="personality-sub">${escape(lang === 'ja' ? character.name : character.japanese)} · ${escape(character.part)}</p></div></article>`;
    const pairMarkup = `<div class="personality-result-pair">${characterCard(winner, c.similarCharacter)}<span class="personality-result-times" aria-hidden="true">×</span>${characterCard(compatible, c.compatibleCharacter)}</div><article class="personality-band-result" style="--band-color:${escape(matchedBand.color)}" aria-label="${escape(c.bandResult)}: ${escape(bandName(matchedBand))}"><span>${escape(c.bandResult)}</span><div class="personality-band-result-logo"><img src="./assets/images/bands_big/${escape(matchedBand.logo)}" alt=""></div></article>`;
    const printMarkup = `<article class="print-poster personality-print"><header class="print-poster-header"><h2><span>${escape(c.printTitlePrefix)}</span><span class="personality-print-title-accent">${escape(c.printTitleHighlight)}</span><span>${escape(c.printTitleSuffix)}</span></h2></header>${pairMarkup}<h2 class="personality-print-heading">${escape(c.axes)}</h2><div class="personality-axes personality-print-axes">${axisMarkup}</div><h2 class="personality-print-heading">${escape(c.similar)}</h2><div class="personality-matches">${alternatives}</div><footer class="print-poster-footer"><span>©BanG Dream! Project, Bushiroad All Rights Reserved.</span><span>${escape(t('poster.footer'))}</span></footer></article>`;
    app.innerHTML = `<div class="personality-result-layout"><section class="workspace personality-panel"><h1 class="section-title personality-title">${c.resultTitle}</h1><p class="personality-band-basis">${escape(c.bandBasis)}</p>${pairMarkup}<h2 class="section-title personality-section-title">${c.axes}</h2><div class="personality-axes">${axisMarkup}</div><h2 class="section-title personality-section-title">${c.similar}</h2><div class="personality-matches">${alternatives}</div></section><section class="picked-section personality-output"><div class="section-heading picked-heading"><h2>${escape(c.previewTitle)}</h2></div><div class="picked-panel"><div class="poster-preview-wrap"><div id="poster-preview" aria-label="${escape(c.previewTitle)}">${printMarkup}</div></div><button class="image-button" type="button" data-action="save" ${saving ? 'disabled' : ''}><span>${escape(c.saveImage)}</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg></button></div><div class="personality-share"><h2 class="section-title personality-section-title"><label for="personality-share-url">${escape(c.shareLabel)}</label></h2><div class="personality-share-controls"><input id="personality-share-url" type="text" readonly value="${escape(resultUrl())}"><button class="personality-button secondary personality-copy-button" type="button" data-action="copy"><span>${escape(c.copyLink)}</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button></div><p class="personality-share-status" role="status"></p></div><div class="personality-actions"><button class="personality-button secondary personality-restart-button" type="button" data-action="restart">${c.again}</button></div></section></div>`;
    fitPosterPreview();
  }
}

app.addEventListener('change', (event) => {
  if (event.target.name !== 'answer') return;
  answers[index] = Number(event.target.value);
  saveProgress();
  app.querySelector('[data-action="next"]').disabled = false;
});
app.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'save') {
    if (saving) return;
    saving = true;
    event.target.closest('[data-action="save"]').disabled = true;
    try { await savePosterImage('bang-dream-personality.png'); }
    catch (error) { window.alert(error.message || (getLanguage() === 'ja' ? t('personality.saveError') : koreanCopy.saveError)); }
    finally { saving = false; const button = app.querySelector('[data-action="save"]'); if (button) button.disabled = false; }
    return;
  }
  if (action === 'copy') {
    const status = app.querySelector('.personality-share-status');
    try {
      await navigator.clipboard.writeText(resultUrl());
      status.textContent = getLanguage() === 'ja' ? t('personality.copied') : koreanCopy.copied;
    } catch {
      const field = app.querySelector('#personality-share-url');
      field.focus();
      field.select();
      status.textContent = getLanguage() === 'ja' ? t('personality.copyFallback') : koreanCopy.copyFallback;
    }
    return;
  }
  if (action === 'start') { screen = 'question'; index = 0; }
  if (action === 'previous') { if (index === 0) screen = 'intro'; else index--; }
  if (action === 'next' && answers[index] !== null) {
    if (index === current.questions.length - 1) {
      const firstMissing = answers.findIndex((answer) => answer === null);
      if (firstMissing === -1) screen = 'result'; else index = firstMissing;
    } else index++;
  }
  if (action === 'restart') { answers = Array(current.questions.length).fill(null); index = 0; screen = 'intro'; }
  saveProgress();
  updateResultUrl();
  render();
  const heading = app.querySelector('h1');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
document.addEventListener('app-language-change', render);
window.addEventListener('resize', () => { if (screen === 'result') fitPosterPreview(); });
document.fonts.ready.then(() => { if (screen === 'result') fitPosterPreview(); });
restoreProgress();
render();
