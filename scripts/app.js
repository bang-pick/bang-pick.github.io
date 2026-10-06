import { bands, characters } from './data.js?v=20261006-3';
import { bandName, characterName, getLanguage, otherCharacterName, t } from './language.js?v=20261006-4';
import { renderRankEditor as renderRankRows } from './rank-editor.js?v=20261006-3';
import {
  bandById,
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
} from './poster.js?v=20261006-7';

const bestNineLimit = 9;
const coupleLimit = 8;
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
const couples = (saved.couples || []).map((pair) => pair.filter((id) => characterById[id])).filter((pair) => pair.length === 2).slice(0, coupleLimit);
const alternateForms = new Set(saved.alternateForms || []);
picks.couples = couples;
picks.alternateForms = alternateForms;
let scope = 'all';
let activeBand = 'all';
let query = '';
let nickname = typeof saved.nickname === 'string' ? saved.nickname : '';
let pendingCouple = null;

const $ = (selector) => document.querySelector(selector);
const characterCardTemplate = $('#character-card-template').content.firstElementChild;
const scopeTabs = document.querySelectorAll('.scope-tab');
const persist = () => localStorage.setItem(storageKey, JSON.stringify({
  all: [...picks.all],
  bands: Object.fromEntries(bands.map(({ id }) => [id, [...picks.bands[id]]])),
  couples,
  alternateForms: [...alternateForms],
  nickname,
}));
const selectedSet = (character) => scope === 'all' ? picks.all : picks.bands[character.band];
const hasPicks = () => picks.all.size > 0 || couples.length > 0 || pendingCouple || Object.values(picks.bands).some((set) => set.size > 0);
const ranksById = () => new Map([...picks.all].map((id, index) => [id, index + 1]));
function updateCardSelection(card, ranks) {
  const id = card.dataset.characterId;
  const character = characterById[id];
  const rank = scope === 'all' ? ranks.get(id) || 0 : 0;
  let chosen;
  if (scope === 'all') chosen = Boolean(rank);
  else if (scope === 'couples') chosen = id === pendingCouple || couples.some((pair) => pair.includes(id));
  else chosen = selectedSet(character).has(id);
  card.classList.toggle('chosen', chosen);
  card.querySelector('.picked-mark').textContent = scope === 'all' ? (rank ? t('pick.rank', { rank }) : '') : '✓';
  card.setAttribute('aria-pressed', String(chosen));
  const state = chosen ? (rank ? t('pick.rank', { rank }) : t('pick.selected')) : t('pick.selection');
  card.setAttribute('aria-label', `${characterName(characterForm(id, picks))}, ${bandName(bandById[character.band])}, ${state}`);
}

function renderBands() {
  const select = $('#band-filter');
  select.replaceChildren(new Option(t('filter.allBands'), 'all'));
  for (const band of bands.filter(({ id }) => scope !== 'band' || id !== 'others')) {
    select.add(new Option(bandName(band), band.id));
  }
  select.value = activeBand;
}

function createCharacterCard(character, ranks) {
  const id = character.id;
  const display = characterForm(id, picks);
  const band = bandById[character.band];
  const card = characterCardTemplate.cloneNode(true);
  const portrait = card.querySelector('.portrait');
  card.dataset.characterId = id;
  card.style.setProperty('--band-color', band.color);
  card.style.setProperty('--character-color', display.color || band.color);
  card.querySelector('.portrait-initial').textContent = initials(characterName(display));
  card.querySelector('.character-name').textContent = characterName(display);
  const secondaryName = otherCharacterName(display);
  card.querySelector('.character-japanese').textContent = secondaryName;
  card.querySelector('.character-sub i').hidden = !secondaryName;
  card.querySelector('.character-part').textContent = character.part;

  const sprite = characterImage(display);
  const image = portrait.querySelector('img');
  if (sprite) {
    image.addEventListener('load', () => card.classList.add('has-image'), { once: true });
    image.addEventListener('error', () => {
      if (alternateForms.has(id) && character.alternateImage && !image.dataset.fallback) {
        image.dataset.fallback = 'true';
        image.src = characterImage(character);
      } else image.remove();
    });
    image.src = sprite;
  } else image.remove();

  const bandLine = card.querySelector('.character-band');
  const logo = bandLogo(band);
  const logoImage = bandLine.querySelector('img');
  if (logo) {
    logoImage.alt = t('common.bandLogo', { name: bandName(band) });
    logoImage.addEventListener('error', () => { bandLine.textContent = bandName(band); }, { once: true });
    logoImage.src = logo;
  } else bandLine.textContent = bandName(band);

  const switcher = portrait.querySelector('.character-form-switch');
  if (character.alternateName) {
    switcher.dataset.formId = id;
    switcher.textContent = alternateForms.has(id)
      ? (getLanguage() === 'ja' ? character.japanese : character.name)
      : (getLanguage() === 'ja' ? character.alternateJapanese : character.alternateName);
  } else switcher.remove();
  updateCardSelection(card, ranks);
  return card;
}

function renderCharacters() {
  const band = bandById[activeBand];
  const search = query.toLowerCase();
  const ranks = ranksById();
  const visible = characters.filter((character) => {
    const matchBand = (activeBand === 'all' || character.band === activeBand)
      && (scope !== 'band' || character.band !== 'others');
    const text = `${character.name} ${character.japanese} ${character.alternateName || ''} ${character.alternateJapanese || ''} ${bandById[character.band].name} ${bandById[character.band].nameJa || ''}`.toLowerCase();
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
      heading.textContent = bandName(group.band);
      section.append(heading, grid);
      list.append(section);
    } else {
      list.append(grid);
    }
    for (const character of group.characters) grid.append(createCharacterCard(character, ranks));
  }
  $('#empty-state').hidden = visible.length !== 0;
  $('#roster-title').textContent = activeBand === 'all' ? t('pick.rosterAll') : bandName(band);
  updateRosterSubtitle();
}

function updateRosterSubtitle() {
  let subtitle = t('pick.bandSubtitle');
  if (scope === 'all') subtitle = t('pick.bestSubtitle', { count: picks.all.size });
  if (scope === 'couples') subtitle = t('pick.coupleSubtitle', {
    count: couples.length,
    limit: coupleLimit,
    pending: pendingCouple ? t('pick.pending') : '',
  });
  $('#roster-subtitle').textContent = subtitle;
}

function renderCouples() {
  const pairList = $('#couple-selection-list');
  $('#couple-selection').hidden = scope !== 'couples';
  pairList.replaceChildren();
  if (scope !== 'couples') return;
  couples.forEach(([firstId, secondId], index) => {
    const pair = document.createElement('div');
    pair.className = 'couple-selection-item';
    const label = document.createElement('span');
    label.textContent = getLanguage() === 'ja'
      ? `${characterName(characterForm(firstId, picks))} → ${characterName(characterForm(secondId, picks))}`
      : `${index + 1}. ${couplingName(firstId, secondId, picks)}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.dataset.removeCouple = index;
    remove.textContent = t('pick.coupleRemove');
    pair.append(label, remove);
    pairList.append(pair);
  });
}

function toggleCharacter(id) {
  if (scope === 'couples') {
    if (pendingCouple) {
      if (pendingCouple !== id) couples.push([pendingCouple, id]);
      pendingCouple = null;
    } else {
      if (couples.length >= coupleLimit) return;
      pendingCouple = id;
    }
    persist();
    updateCharacterCards();
    updateRosterSubtitle();
    renderPicks();
    return;
  }
  const character = characterById[id];
  const selected = selectedSet(character);
  if (selected.has(id)) selected.delete(id);
  else if (scope === 'all' && selected.size >= bestNineLimit) {
    window.alert(t('pick.bestLimit'));
    return;
  } else {
    if (scope === 'band') selected.clear();
    selected.add(id);
  }
  persist();
  updateRosterSubtitle();
  updateCharacterCards();
  renderPicks();
}

function renderPicks() {
  const entries = pickedEntries(picks, scope);
  $('#save-image').disabled = entries.length === 0;
  renderCouples();
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
  renderRankRows(editor, $('#rank-editor-list'), scope === 'all' ? ids : [],
    (id) => characterName(characterById[id]),
    (from, to) => {
      const reordered = [...picks.all];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      picks.all.clear();
      reordered.forEach((pickedId) => picks.all.add(pickedId));
      persist();
      updateCharacterCards();
      renderPicks();
    });
}

function render() {
  renderBands();
  renderCharacters();
  renderPicks();
  scopeTabs.forEach((button) => {
    const selected = button.dataset.scope === scope;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

window.addEventListener('resize', fitPosterPreview);
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
  updateCharacterCards();
  updateRosterSubtitle();
  renderPicks();
});
scopeTabs.forEach((button) => button.addEventListener('click', () => {
  scope = button.dataset.scope;
  activeBand = 'all';
  pendingCouple = null;
  render();
}));
$('#band-filter').addEventListener('change', (event) => {
  activeBand = event.currentTarget.value;
  renderCharacters();
});
$('#nickname').value = nickname;
$('#nickname').addEventListener('input', (event) => {
  nickname = event.currentTarget.value;
  persist();
  const owner = $('#poster-preview .print-poster-owner');
  if (owner) owner.textContent = nickname.trim() || t('poster.defaultOwner');
});
$('#search').addEventListener('input', (event) => { query = event.target.value.trim(); renderCharacters(); });
$('#clear-picks').addEventListener('click', () => {
  if (!hasPicks()) return;
  if (!window.confirm(t('pick.deleteConfirm'))) return;
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
    window.alert(error.message || t('pick.saveError'));
  } finally {
    button.disabled = pickedEntries(picks, scope).length === 0;
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !document.activeElement.matches('input, textarea, select, [contenteditable]')) {
    event.preventDefault();
    $('#search').focus();
  }
});

document.addEventListener('app-language-change', render);
document.fonts.ready.then(fitPosterPreview);
render();
