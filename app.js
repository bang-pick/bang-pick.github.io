import { bands, characters } from './data/index.js';
import {
  bandById,
  bandBigLogo,
  bandLogo,
  characterById,
  characterForm,
  characterImage,
  couplingName,
  fitPosterPreview,
  initials,
  pickedEntries,
  renderPosterPreview,
  saveFavoritesImage,
} from './poster.js?v=20261004-3';

const bestNineLimit = 9;
const storageKey = 'bandori-pick-v1';
let saved;
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { saved = {}; }

const picks = {
  all: new Set((saved.all || []).filter((id) => characterById[id]).slice(0, bestNineLimit)),
  bands: Object.fromEntries(bands.map((band) => [
    band.id,
    new Set((saved.bands?.[band.id] || []).filter((id) => characterById[id]).slice(-1)),
  ])),
};
const couples = (saved.couples || []).map((pair) => pair.filter((id) => characterById[id])).filter((pair) => pair.length === 2).slice(0, 4);
const alternateForms = new Set(saved.alternateForms || []);
picks.couples = couples;
picks.alternateForms = alternateForms;
let scope = 'all';
let activeBand = 'all';
let query = '';
let nickname = typeof saved.nickname === 'string' ? saved.nickname : '';
let pendingCouple = null;

const $ = (selector) => document.querySelector(selector);
const persist = () => localStorage.setItem(storageKey, JSON.stringify({
  all: [...picks.all],
  bands: Object.fromEntries(bands.map(({ id }) => [id, [...picks.bands[id]]])),
  couples,
  alternateForms: [...alternateForms],
  nickname,
}));
const selectedSet = (character) => scope === 'all'
  ? picks.all
  : scope === 'couples'
    ? new Set([...couples.flat(), pendingCouple].filter(Boolean))
    : picks.bands[activeBand === 'all' ? character.band : activeBand];
const hasPicks = () => picks.all.size > 0 || couples.length > 0 || pendingCouple || Object.values(picks.bands).some((set) => set.size > 0);
const ranksById = () => new Map([...picks.all].map((id, index) => [id, index + 1]));

function updateCardSelection(card, ranks) {
  const id = card.dataset.characterId;
  const character = characterById[id];
  const rank = scope === 'all' ? ranks.get(id) || 0 : 0;
  const chosen = scope === 'all' ? Boolean(rank) : selectedSet(character).has(id);
  card.classList.toggle('chosen', chosen);
  card.querySelector('.picked-mark').textContent = scope === 'all' ? `${rank}위` : '✓';
  card.setAttribute('aria-pressed', String(chosen));
  card.setAttribute('aria-label', `${characterForm(id, picks).name}, ${bandById[character.band].name}${chosen ? (rank ? `, ${rank}위 선택됨` : ', 선택됨') : ', 선택'}`);
}

function renderBands() {
  const select = $('#band-filter');
  select.replaceChildren(new Option('전체 밴드', 'all'));
  for (const band of bands.filter(({ id }) => scope !== 'band' || id !== 'others')) {
    select.add(new Option(band.name, band.id));
  }
  select.value = activeBand;
}

function renderCharacters() {
  const band = bandById[activeBand];
  const search = query.toLowerCase();
  const ranks = ranksById();
  const visible = characters.filter((character) => {
    const matchBand = (activeBand === 'all' || character.band === activeBand)
      && (scope !== 'band' || character.band !== 'others');
    const text = `${character.name} ${character.japanese} ${character.alternateName || ''} ${bandById[character.band].name}`.toLowerCase();
    return matchBand && text.includes(search);
  });
  const list = $('#characters');
  list.replaceChildren();
  const grouped = scope === 'band' && activeBand === 'all';
  const groups = grouped
    ? bands.map((characterBand) => ({ band: characterBand, characters: visible.filter((character) => character.band === characterBand.id) })).filter((group) => group.characters.length)
    : [{ band, characters: visible }];
  for (const group of groups) {
    const grid = document.createElement('div');
    grid.className = 'character-grid';
    if (grouped) {
      const section = document.createElement('section');
      section.className = 'band-group';
      const heading = document.createElement('h4');
      heading.className = 'band-group-title';
      heading.textContent = group.band.name;
      section.append(heading, grid);
      list.append(section);
    } else {
      list.append(grid);
    }
    for (const character of group.characters) {
      const id = character.id;
      const display = characterForm(id, picks);
      const characterBand = bandById[character.band];
      const card = document.createElement('div');
      card.className = 'character-card';
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.dataset.characterId = id;
      card.style.setProperty('--band-color', characterBand.color);
      card.style.setProperty('--character-color', display.color || characterBand.color);
      const sprite = characterImage(display);
      const logo = bandBigLogo(characterBand) || bandLogo(characterBand);
      card.innerHTML = `<span class="portrait"><span class="portrait-initial">${initials(display.name)}</span>${sprite ? `<img src="${sprite}" alt="" loading="lazy" />` : ''}<span class="picked-mark" aria-hidden="true"></span></span><span class="character-info"><span class="character-band">${logo ? `<img src="${logo}" alt="" loading="lazy" />` : characterBand.name}</span><span class="character-name">${display.name}</span><span class="character-sub">${display.japanese} <i>·</i> ${character.part}</span></span>`;
      const image = card.querySelector('.portrait > img');
      if (image) {
        image.addEventListener('load', () => card.classList.add('has-image'), { once: true });
        image.addEventListener('error', () => {
          if (alternateForms.has(id) && character.alternateImage && !image.dataset.fallback) {
            image.dataset.fallback = 'true';
            image.src = characterImage(character);
          } else image.remove();
        });
      }
      const logoImage = card.querySelector('.character-band img');
      if (logoImage) logoImage.addEventListener('error', () => { logoImage.parentElement.textContent = characterBand.name; }, { once: true });
      if (character.alternateName) {
        const switcher = document.createElement('button');
        switcher.type = 'button';
        switcher.className = 'character-form-switch';
        switcher.dataset.formId = id;
        switcher.textContent = alternateForms.has(id) ? '미셸' : '미사키';
        card.querySelector('.portrait').append(switcher);
      }
      updateCardSelection(card, ranks);
      grid.append(card);
    }
  }
  $('#empty-state').hidden = visible.length !== 0;
  $('#roster-title').textContent = activeBand === 'all' ? '전체' : band.name;
  $('#roster-subtitle').textContent = scope === 'all' ? `최애 9명을 골라보세요. (현재 ${picks.all.size}/${bestNineLimit}명 선택됨)` : scope === 'couples' ? `두 캐릭터를 순서대로 선택하세요. (현재 ${couples.length}/4쌍 선택됨)${pendingCouple ? ' · 한 명 선택됨' : ''}` : '선택한 밴드 안에서 최애를 골라보세요.';
  const pairList = $('#couple-selection');
  pairList.hidden = scope !== 'couples';
  pairList.replaceChildren();
  couples.forEach(([firstId, secondId], index) => {
    const pair = document.createElement('div');
    pair.className = 'couple-selection-item';
    const label = document.createElement('span');
    label.textContent = `${index + 1}. ${couplingName(firstId, secondId, picks)}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.dataset.removeCouple = index;
    remove.textContent = '삭제';
    pair.append(label, remove);
    pairList.append(pair);
  });
}

function toggleCharacter(id) {
  if (scope === 'couples') {
    if (pendingCouple) {
      if (pendingCouple !== id) couples.push([pendingCouple, id]);
      pendingCouple = null;
    } else if (couples.length < 4) pendingCouple = id;
    persist();
    renderCharacters();
    renderPicks();
    return;
  }
  const character = characterById[id];
  const selected = selectedSet(character);
  if (selected.has(id)) selected.delete(id);
  else if (scope === 'all' && selected.size >= bestNineLimit) {
    window.alert('베스트 9은 최대 9명까지 선택할 수 있어요.');
    return;
  } else {
    if (scope === 'band') selected.clear();
    selected.add(id);
  }
  persist();
  if (scope === 'all') {
    $('#roster-subtitle').textContent = `최애 9명을 골라보세요. (현재 ${picks.all.size}/${bestNineLimit}명 선택됨)`;
  }
  updateCharacterCards();
  renderPicks();
}

function renderPicks() {
  const entries = pickedEntries(picks, scope);
  $('#save-image').disabled = entries.length === 0;
  renderRankEditor();
  renderPosterPreview(scope, nickname, picks);
}

function updateCharacterCards() {
  const ranks = ranksById();
  document.querySelectorAll('.character-card').forEach((card) => updateCardSelection(card, ranks));
}

function renderRankEditor() {
  const editor = $('#rank-editor');
  const ids = [...picks.all];
  editor.hidden = scope !== 'all' || ids.length === 0;
  editor.replaceChildren();
  if (editor.hidden) return;
  const heading = document.createElement('div');
  heading.className = 'rank-editor-heading';
  const label = document.createElement('span');
  label.textContent = '순위 조정';
  heading.append(label);
  editor.append(heading);
  const list = document.createElement('div');
  list.className = 'rank-editor-list';
  editor.append(list);
  ids.forEach((id, index) => {
    const character = characterById[id];
    const row = document.createElement('label');
    row.className = 'rank-editor-row';
    const name = document.createElement('span');
    name.textContent = character.name;
    const select = document.createElement('select');
    select.setAttribute('aria-label', `${character.name} 순위`);
    ids.forEach((_, rank) => select.add(new Option(`${rank + 1}위`, String(rank))));
    select.value = String(index);
    select.addEventListener('change', () => {
      const reordered = [...picks.all];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(Number(select.value), 0, moved);
      picks.all.clear();
      reordered.forEach((pickedId) => picks.all.add(pickedId));
      persist();
      updateCharacterCards();
      renderPicks();
    });
    row.append(name, select);
    list.append(row);
  });
}

function render() {
  renderBands();
  renderCharacters();
  renderPicks();
  document.querySelectorAll('.scope-tab').forEach((button) => {
    const selected = button.dataset.scope === scope;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
  });
}

new ResizeObserver(fitPosterPreview).observe($('#poster-preview'));
$('#characters').addEventListener('click', (event) => {
  const switcher = event.target.closest('.character-form-switch');
  if (switcher) {
    const id = switcher.dataset.formId;
    alternateForms.has(id) ? alternateForms.delete(id) : alternateForms.add(id);
    persist();
    render();
    return;
  }
  const card = event.target.closest('.character-card');
  if (card) toggleCharacter(card.dataset.characterId);
});
$('#characters').addEventListener('keydown', (event) => {
  const card = event.target.closest('.character-card');
  if (card && event.target === card && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    toggleCharacter(card.dataset.characterId);
  }
});
$('#couple-selection').addEventListener('click', (event) => {
  const remove = event.target.closest('[data-remove-couple]');
  if (!remove) return;
  couples.splice(Number(remove.dataset.removeCouple), 1);
  persist();
  render();
});
document.querySelectorAll('.scope-tab').forEach((button) => button.addEventListener('click', () => {
  scope = button.dataset.scope;
  activeBand = 'all';
  pendingCouple = null;
  render();
}));
$('#band-filter').addEventListener('change', (event) => {
  activeBand = event.currentTarget.value;
  render();
});
$('#nickname').value = nickname;
$('#nickname').addEventListener('input', (event) => {
  nickname = event.currentTarget.value;
  persist();
  renderPosterPreview(scope, nickname, picks);
});
$('#search').addEventListener('input', (event) => { query = event.target.value.trim(); renderCharacters(); });
$('#clear-picks').addEventListener('click', () => {
  if (!hasPicks()) return;
  if (!window.confirm('선택한 최애를 모두 지울까요?')) return;
  picks.all.clear();
  for (const set of Object.values(picks.bands)) set.clear();
  couples.splice(0);
  pendingCouple = null;
  persist();
  render();
});
$('#save-image').addEventListener('click', async () => {
  const button = $('#save-image');
  button.disabled = true;
  try {
    await saveFavoritesImage(scope);
  } catch (error) {
    window.alert(error.message || '이미지를 저장하지 못했습니다.');
  } finally {
    button.disabled = pickedEntries(picks, scope).length === 0;
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $('#search').focus();
  }
});

render();
