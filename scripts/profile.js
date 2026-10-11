import { bands, characters } from './data.js?v=20261012-1';
import { bandName, characterName, getLanguage, otherCharacterName, t } from './language.js?v=20261012-1';
import { savePosterImage, fitPosterPreview } from './poster-export.js?v=20261012-1';
import { bandLogo, characterForm, characterImage, couplingName, initials } from './poster.js?v=20261012-1';
import { loadSongGroup } from './song-data.js?v=20261012-1';
import { createSongCard } from './song-card.js?v=20261012-1';

const mainBands = bands.filter(({ id }) => id !== 'others');
const characterById = Object.fromEntries(characters.map((character) => [character.id, character]));
const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
const pickStorageKey = 'bandori-pick-v1';
const songStorageKey = 'bandori-song-pick-v1';
const profileStorageKey = 'bandori-profile-v1';
const readStore = (key) => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
const saved = readStore(profileStorageKey);
const state = {
  nickname: typeof saved.nickname === 'string' ? saved.nickname : '',
  sinceYear: Number.isInteger(Number(saved.sinceYear)) && Number(saved.sinceYear) >= 2015 && Number(saved.sinceYear) <= new Date().getFullYear()
    ? Number(saved.sinceYear) : null,
  favoriteBand: mainBands.some(({ id }) => id === saved.favoriteBand) ? saved.favoriteBand : mainBands[0].id,
};
const $ = (selector) => document.querySelector(selector);
const persist = () => localStorage.setItem(profileStorageKey, JSON.stringify(state));

function createPosterCard(id, alternateForms, rank = null) {
  const original = characterById[id];
  const character = original ? characterForm(id, { alternateForms }) : null;
  const band = original ? bands.find(({ id: bandId }) => bandId === original.band) : null;
  const card = document.createElement('article');
  const portrait = document.createElement('div');
  const info = document.createElement('footer');
  const bandLine = document.createElement('div');
  const name = document.createElement('span');
  const details = document.createElement('span');
  card.className = `print-poster-card${character ? '' : ' is-empty'}${rank ? ` rank-${rank}` : ''}`;
  card.style.setProperty('--character-color', character?.color || '#e8e8e5');
  portrait.className = 'print-poster-portrait';
  if (character) {
    const sprite = characterImage(character);
    if (sprite) {
      const image = document.createElement('img');
      image.src = sprite;
      if (character.alternateImage && character.image === 'misaki_2.webp') image.dataset.fallbackSrc = characterImage(original);
      image.addEventListener('error', () => {
        if (image.dataset.fallbackSrc && !image.dataset.fallback) {
          image.dataset.fallback = 'true';
          image.src = image.dataset.fallbackSrc;
        }
      });
      image.alt = '';
      portrait.append(image);
    } else portrait.textContent = initials(characterName(character));
  }
  if (rank) {
    const badge = document.createElement('span');
    badge.className = 'print-poster-rank';
    badge.textContent = t(`profile.rank${rank}`);
    portrait.append(badge);
  }
  info.className = 'print-poster-info';
  bandLine.className = 'print-poster-band';
  if (band?.logo) {
    const image = document.createElement('img');
    image.src = bandLogo(band);
    image.alt = bandName(band);
    bandLine.append(image);
  } else if (band) bandLine.textContent = bandName(band);
  name.className = 'print-poster-name';
  name.textContent = character ? characterName(character) : '';
  details.className = 'print-poster-sub';
  details.textContent = character ? [otherCharacterName(character), character.part].filter(Boolean).join(' · ') : '';
  info.append(bandLine, name, details);
  card.append(portrait, info);
  return card;
}

let renderVersion = 0;
function renderCard() {
  const version = ++renderVersion;
  const songPicks = readStore(songStorageKey);
  const savedKeys = songPicks.bestNine || songPicks.picks;
  const songKeys = Array.isArray(savedKeys) ? [...new Set(savedKeys.filter((key) => typeof key === 'string'))] : [];
  const groupIds = [...new Set(songKeys.map((key) => key.split(':')[0]))].filter((id) => bandById[id]?.id === id);
  const card = $('#profile-card-template').content.firstElementChild.cloneNode(true);
  card.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  card.querySelector('.profile-card-owner').textContent = state.nickname.trim() || t('profile.defaultName');
  const since = card.querySelector('.profile-card-since');
  if (state.sinceYear) {
    since.hidden = false;
    since.textContent = t('profile.yearValue', { year: state.sinceYear });
  }
  const favoriteBand = mainBands.find(({ id }) => id === state.favoriteBand);
  const favoriteLogo = document.createElement('img');
  if (favoriteBand.logo) favoriteLogo.src = bandLogo(favoriteBand);
  favoriteLogo.alt = bandName(favoriteBand);
  card.querySelector('.profile-card-favorite-band').append(favoriteLogo);

  const picks = readStore(pickStorageKey);
  const alternateForms = new Set(Array.isArray(picks.alternateForms) ? picks.alternateForms : []);
  const ranked = Array.isArray(picks.all) ? picks.all.filter((id) => characterById[id]).slice(0, 3) : [];
  const topThree = card.querySelector('.profile-card-top-three');
  for (const rank of [2, 1, 3]) topThree.append(createPosterCard(ranked[rank - 1], alternateForms, rank));

  const couples = Array.isArray(picks.couples) ? picks.couples.filter((pair) =>
    Array.isArray(pair) && pair.length === 2 && pair.every((id) => characterById[id])).slice(0, 2) : [];
  const coupleList = card.querySelector('.profile-card-couples');
  if (!couples.length) {
    const empty = document.createElement('div');
    empty.className = 'profile-card-couples-empty';
    empty.textContent = t('profile.emptyCouples');
    coupleList.append(empty);
  }
  for (const [firstId, secondId] of couples) {
    const pair = document.createElement('div');
    const cards = document.createElement('div');
    const direction = document.createElement('div');
    const arrow = document.createElement('span');
    pair.className = 'print-couple';
    cards.className = 'print-couple-cards';
    direction.className = 'print-couple-direction';
    arrow.className = 'print-couple-arrow';
    arrow.textContent = '→';
    if (getLanguage() !== 'ja') {
      const name = document.createElement('span');
      name.className = 'print-couple-name';
      name.textContent = couplingName(firstId, secondId, { alternateForms });
      direction.append(name);
    }
    direction.append(arrow);
    cards.append(createPosterCard(firstId, alternateForms), direction, createPosterCard(secondId, alternateForms));
    pair.append(cards);
    coupleList.append(pair);
  }
  const songList = card.querySelector('.profile-card-songs');
  for (let rank = 1; rank <= 3; rank++) songList.append(createSongCard(null, null, rank));
  $('#poster-preview').replaceChildren(card);
  fitPosterPreview();
  const saveButton = $('#save-profile');
  saveButton.disabled = Boolean(groupIds.length);
  if (!groupIds.length) return;

  Promise.allSettled(groupIds.map(loadSongGroup)).then((loaded) => {
    if (version !== renderVersion) return;
    for (const result of loaded) if (result.status === 'rejected') console.error(result.reason);
    const songByKey = new Map(loaded.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      .map((song) => [song.key, song]));
    const favoriteSongs = songKeys.map((key) => songByKey.get(key)).filter(Boolean).slice(0, 3);
    songList.replaceChildren(...[1, 2, 3].map((rank) => {
      const song = favoriteSongs[rank - 1];
      return createSongCard(song, song && bandById[song.group], rank);
    }));
    fitPosterPreview();
    saveButton.disabled = false;
  });
}

$('#profile-nickname').value = state.nickname;
const sinceYear = $('#profile-since-year');
sinceYear.max = String(new Date().getFullYear());
sinceYear.value = state.sinceYear || '';
sinceYear.addEventListener('input', (event) => {
  const year = Number(event.target.value);
  state.sinceYear = event.target.value && Number.isInteger(year) && year >= 2015 && year <= Number(sinceYear.max) ? year : null;
  persist();
  renderCard();
});
const favoriteBand = $('#profile-band');
favoriteBand.replaceChildren(...mainBands.map((band) => new Option(bandName(band), band.id)));
favoriteBand.value = state.favoriteBand;
renderCard();
$('#profile-nickname').addEventListener('input', (event) => { state.nickname = event.target.value; persist(); renderCard(); });
favoriteBand.addEventListener('change', (event) => { state.favoriteBand = event.target.value; persist(); renderCard(); });
$('#save-profile').addEventListener('click', async () => {
  const button = $('#save-profile');
  button.disabled = true;
  try { await savePosterImage('bang-dream-profile.png'); }
  catch (error) { window.alert(error.message || t('profile.saveError')); }
  finally { button.disabled = false; }
});
window.addEventListener('resize', fitPosterPreview);
window.addEventListener('storage', (event) => { if ([pickStorageKey, songStorageKey].includes(event.key)) renderCard(); });
window.addEventListener('pageshow', renderCard);
document.fonts.ready.then(fitPosterPreview);
document.addEventListener('app-language-change', () => {
  favoriteBand.replaceChildren(...mainBands.map((band) => new Option(bandName(band), band.id)));
  favoriteBand.value = state.favoriteBand;
  renderCard();
});
