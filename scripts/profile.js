import { bands } from './data.js?v=20261012-1';
import { bandName, characterName, getLanguage, t } from './language.js?v=20261012-1';
import { savePosterImage, fitPosterPreview } from './poster-export.js?v=20261024-3';
import { bandById, characterById, characterForm, characterImage, couplingName, bandLogo } from './poster.js?v=20261024-3';
import { loadSongGroup } from './song-data.js?v=20261012-1';
import { initProfileEffects } from './profile-effects.js?v=20261024-1';

function profileSinceYear(saved, currentYear) {
  const year = Number(saved.sinceYear ?? (typeof saved.sinceDate === 'string' ? saved.sinceDate.slice(0, 4) : NaN));
  return Number.isInteger(year) && year >= 2015 && year <= currentYear ? year : null;
}

function cardTitleColor(color) {
  const hex = color.slice(1);
  const fullHex = hex.length === 3 ? [...hex].map((channel) => channel.repeat(2)).join('') : hex;
  const channels = fullHex.match(/../g).map((channel) => parseInt(channel, 16) / 255);
  const luminance = channels
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.18 ? '#151b32' : '#fff';
}

const mainBands = bands.filter(({ id }) => id !== 'others');
const pickStorageKey = 'bandori-pick-v1';
const songStorageKey = 'bandori-song-pick-v1';
const profileStorageKey = 'bandori-profile-v1';
const readStore = (key) => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
const currentYear = new Date().getFullYear();
function readProfile() {
  const saved = readStore(profileStorageKey);
  return {
    nickname: typeof saved.nickname === 'string' ? saved.nickname : '',
    sinceYear: profileSinceYear(saved, currentYear),
    favoriteBand: mainBands.some(({ id }) => id === saved.favoriteBand) ? saved.favoriteBand : mainBands[0].id,
  };
}
const state = readProfile();
const $ = (selector) => document.querySelector(selector);
const preview = $('#poster-preview');
const previewWrap = $('.profile-preview-wrap');
const saveButton = $('#save-profile');
const persist = () => localStorage.setItem(profileStorageKey, JSON.stringify(state));
let loadingSong = false;
let saving = false;
const updateSaveButton = () => { saveButton.disabled = loadingSong || saving; };
initProfileEffects(preview.parentElement);

function renderPortrait(card, character) {
  const portrait = card.querySelector('.profile-card-portrait');
  if (!character) {
    portrait.classList.add('is-empty');
    const title = document.createElement('strong');
    title.textContent = 'MY FAVORITE';
    const hint = document.createElement('span');
    hint.textContent = 'Choose your favorite character.';
    portrait.append(title, hint);
    return;
  }
  const image = document.createElement('img');
  image.src = characterImage(character);
  image.alt = characterName(character);
  const originalImage = characterImage(characterById[character.id]);
  if (image.src !== originalImage) {
    image.dataset.fallbackSrc = originalImage;
    image.addEventListener('error', () => { image.src = image.dataset.fallbackSrc; }, { once: true });
  }
  const caption = document.createElement('p');
  caption.className = 'profile-card-character-caption';
  caption.textContent = characterName(character);
  portrait.append(image, caption);
}

function renderProfileFields(card) {
  const owner = card.querySelector('.profile-card-owner');
  owner.textContent = state.nickname.trim() || t('profile.defaultName');
  owner.classList.toggle('is-long', owner.textContent.length > 12);
  const since = card.querySelector('.profile-card-since');
  since.hidden = !state.sinceYear;
  since.textContent = state.sinceYear ? `since ${state.sinceYear}` : '';
}

let renderVersion = 0;
async function renderCard() {
  const version = ++renderVersion;
  const card = $('#profile-card-template').content.firstElementChild.cloneNode(true);
  renderProfileFields(card);
  const band = bandById[state.favoriteBand];
  const picks = readStore(pickStorageKey);
  const forms = { alternateForms: new Set(Array.isArray(picks.alternateForms) ? picks.alternateForms : []) };
  const characterId = Array.isArray(picks.all) ? picks.all.find((id) => Object.hasOwn(characterById, id)) : null;
  const character = characterId ? characterForm(characterId, forms) : null;
  renderPortrait(card, character);
  const themeColor = character?.color || band.color;
  card.style.setProperty('--card-color', themeColor);
  card.style.setProperty('--header-title-color', cardTitleColor(themeColor));
  previewWrap.style.setProperty('--card-color', themeColor);
  const logo = card.querySelector('.profile-card-band-logo');
  logo.src = bandLogo(band);
  logo.alt = t('common.bandLogo', { name: bandName(band) });
  const couple = Array.isArray(picks.couples) ? picks.couples.find((pair) =>
    Array.isArray(pair) && pair.length === 2 && pair[0] !== pair[1] && pair.every((id) => Object.hasOwn(characterById, id))) : null;
  const coupleName = card.querySelector('.profile-card-favorite-couple');
  coupleName.textContent = 'NOT SELECTED';
  if (couple) {
    const names = couple.map((id) => characterName(characterForm(id, forms)));
    coupleName.textContent = getLanguage() === 'ja'
      ? names.map((name) => name.split(' ').at(-1)).join(' → ')
      : couplingName(couple[0], couple[1], forms);
    coupleName.title = names.join(' → ');
  }
  const songName = card.querySelector('.profile-card-favorite-song');
  songName.textContent = 'NOT SELECTED';
  preview.replaceChildren(card);
  fitPosterPreview();

  const songPicks = readStore(songStorageKey);
  const savedKeys = songPicks.bestNine || songPicks.picks;
  const songKey = Array.isArray(savedKeys) ? savedKeys.find((key) => typeof key === 'string' && Object.hasOwn(bandById, key.split(':')[0])) : null;
  loadingSong = Boolean(songKey);
  updateSaveButton();
  if (!songKey) return;
  try {
    const songs = await loadSongGroup(songKey.split(':')[0]);
    if (version !== renderVersion) return;
    const song = songs.find(({ key }) => key === songKey);
    if (song) {
      songName.textContent = getLanguage() === 'ja' ? song.title : song.koTitle || song.title;
      songName.title = songName.textContent;
    }
  } catch (error) {
    if (version !== renderVersion) return;
    console.error(error);
    songName.textContent = 'UNAVAILABLE';
  } finally {
    if (version === renderVersion) {
      fitPosterPreview();
      loadingSong = false;
      updateSaveButton();
    }
  }
}

$('#profile-nickname').value = state.nickname;
const sinceYear = $('#profile-since-year');
sinceYear.max = String(currentYear);
sinceYear.value = state.sinceYear || '';
sinceYear.addEventListener('input', () => {
  state.sinceYear = profileSinceYear({ sinceYear: sinceYear.value }, currentYear);
  persist();
  renderProfileFields(preview.firstElementChild);
});
const favoriteBand = $('#profile-band');
function renderBandOptions() {
  favoriteBand.replaceChildren(...mainBands.map((band) => new Option(bandName(band), band.id)));
  favoriteBand.value = state.favoriteBand;
}
renderBandOptions();
renderCard();
$('#profile-nickname').addEventListener('input', (event) => {
  state.nickname = event.target.value;
  persist();
  renderProfileFields(preview.firstElementChild);
});
favoriteBand.addEventListener('change', (event) => { state.favoriteBand = event.target.value; persist(); renderCard(); });
saveButton.addEventListener('click', async () => {
  if (saving || loadingSong) return;
  saving = true;
  updateSaveButton();
  try {
    const withBackground = $('input[name="profile-export"]:checked').value === 'background';
    await savePosterImage(withBackground ? 'bang-dream-profile-background.png' : 'bang-dream-profile.png', {
      backgroundColor: withBackground ? preview.firstElementChild.style.getPropertyValue('--card-color') : null,
    });
  }
  catch (error) { window.alert(error.message || t('profile.saveError')); }
  finally { saving = false; updateSaveButton(); }
});
window.addEventListener('resize', fitPosterPreview);
function reloadProfile() {
  Object.assign(state, readProfile());
  $('#profile-nickname').value = state.nickname;
  sinceYear.value = state.sinceYear || '';
  favoriteBand.value = state.favoriteBand;
  renderCard();
}
window.addEventListener('storage', (event) => {
  if (event.key === null || event.key === profileStorageKey) reloadProfile();
  else if ([pickStorageKey, songStorageKey].includes(event.key)) renderCard();
});
window.addEventListener('pageshow', (event) => { if (event.persisted) reloadProfile(); });
document.fonts.ready.then(fitPosterPreview);

document.addEventListener('app-language-change', () => {
  renderBandOptions();
  renderCard();
});
