import { fitPosterPreview, savePosterImage } from './poster-export.js?v=20261006-8';
import { bands, characters } from './data.js?v=20261006-4';
import { bandName, getLanguage, t } from './language.js?v=20261006-5';
import { renderRankEditor as renderRankRows } from './rank-editor.js?v=20261006-4';

const $ = (selector) => document.querySelector(selector);
const storageKey = 'bandori-song-pick-v1';
const limit = 9;
const mainBands = bands.filter(({ id }) => id !== 'others');
const songs = (await Promise.all(bands.map(async ({ id }) => {
  const response = await fetch('./data/songs/' + id + '.json?v=20261005-7');
  return (await response.json()).map((song) => ({
    ...song,
    group: id,
    key: id + ':' + song.band + ':' + song.title,
  }));
}))).flat();
const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
const songByKey = new Map(songs.map((song) => [song.key, song]));
let saved;
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { saved = {}; }
const bestNine = Array.isArray(saved.bestNine || saved.picks)
  ? [...new Set(saved.bestNine || saved.picks)].filter((key) => songByKey.has(key)).slice(0, limit)
  : [];
const bandPicks = Object.fromEntries(mainBands.map(({ id }) => {
  const key = saved.bands?.[id];
  return [id, songByKey.get(key)?.group === id ? key : null];
}));
let nickname = typeof saved.nickname === 'string' ? saved.nickname : '';
let scope = 'all';

$('#song-nickname').value = nickname;
const songName = (song) => getLanguage() === 'ja' ? song.title : song.koTitle || song.title;
const artistReplacements = [
  ...characters.flatMap(({ name, japanese }) => [
    [name, japanese],
    [name.split(' ').at(-1), japanese.split(' ').at(-1)],
  ]),
  ...bands.filter(({ nameJa }) => nameJa).map(({ name, nameJa }) => [name, nameJa]),
  ['사아야', '沙綾'],
  ['야마부키 사아야', '山吹 沙綾'],
  ['별 내리는 티파티', '星降るティーパーティー'],
  ['스페셜밴드', 'スペシャルバンド'],
].sort(([a], [b]) => b.length - a.length);
const artistName = (name) => getLanguage() === 'ja'
  ? artistReplacements.reduce((localized, [korean, japanese]) => localized.replaceAll(korean, japanese), name)
  : name;
const persist = () => localStorage.setItem(storageKey, JSON.stringify({ bestNine, bands: bandPicks, nickname }));
const hasPicks = () => scope === 'all' ? bestNine.length > 0 : Object.values(bandPicks).some(Boolean);

function renderBands() {
  const select = $('#song-band');
  const selectedBand = select.value;
  const availableBands = scope === 'all' ? bands : mainBands;
  select.replaceChildren(new Option(t('filter.allBands'), 'all'));
  for (const { id } of availableBands) {
    select.add(new Option(id === 'others' ? t('filter.others') : bandName(bandById[id]), id));
  }
  select.value = selectedBand === 'all' || availableBands.some(({ id }) => id === selectedBand)
    ? selectedBand
    : 'all';
}

function renderList() {
  const query = $('#song-search').value.trim().toLocaleLowerCase();
  const band = $('#song-band').value;
  const visible = songs.filter((song) =>
    (scope === 'all' || song.group !== 'others')
    && (band === 'all' || song.group === band)
    && (songName(song) + ' ' + song.title + ' ' + (song.koTitle || '') + ' ' + song.band + ' ' + artistName(song.band) + ' ' + bandById[song.group].name + ' ' + bandById[song.group].nameJa).toLocaleLowerCase().includes(query)
  );
  const fragment = document.createDocumentFragment();
  let lastGroup = null;
  for (const song of visible) {
    if (scope === 'band' && song.group !== lastGroup) {
      const heading = document.createElement('li');
      heading.className = 'song-group-heading';
      heading.textContent = bandName(bandById[song.group]);
      fragment.append(heading);
      lastGroup = song.group;
    }
    const row = document.createElement('li');
    const button = document.createElement('button');
    const title = document.createElement('div');
    const primary = document.createElement('strong');
    const performer = document.createElement('div');
    const bandLabel = document.createElement('span');
    const mark = document.createElement('span');
    const rank = scope === 'all' ? bestNine.indexOf(song.key) + 1 : 0;
    const selected = scope === 'all' ? rank > 0 : bandPicks[song.group] === song.key;

    button.type = 'button';
    button.dataset.songKey = song.key;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${songName(song)}, ${artistName(song.band)}, ${selected ? (rank ? t('pick.rank', { rank }) : t('pick.selected')) : t('pick.selection')}`);
    title.className = 'song-title';
    primary.textContent = songName(song);
    title.append(primary);
    const secondaryTitle = getLanguage() === 'ja' ? song.koTitle : song.title;
    if (secondaryTitle && secondaryTitle !== songName(song)) {
      const original = document.createElement('small');
      original.textContent = secondaryTitle;
      title.append(original);
    }
    performer.className = 'song-performer';
    bandLabel.textContent = artistName(song.band);
    mark.className = 'song-selection-rank';
    mark.textContent = selected ? (rank ? t('pick.rank', { rank }) : '✓') : '+';
    performer.append(bandLabel, mark);
    button.append(title, performer);
    row.append(button);
    fragment.append(row);
  }
  $('#song-list').replaceChildren(fragment);
  $('#song-roster-title').textContent = band === 'all' ? t('songs.rosterAll') : bandName(bandById[band]);
  $('#song-count').textContent = t('songs.count', { count: visible.length });
  $('#song-empty').hidden = visible.length > 0;
}

function renderRanks() {
  const editor = $('#song-rank-editor');
  renderRankRows(editor, $('#song-rank-list'), scope === 'all' ? bestNine : [],
    (key) => songName(songByKey.get(key)),
    (from, to) => {
      const [moved] = bestNine.splice(from, 1);
      bestNine.splice(to, 0, moved);
      persist();
      render();
    });
}

function createCard(song, band, rank = null) {
  const card = $('#song-card-template').content.firstElementChild.cloneNode(true);
  const bandLine = card.querySelector('.song-poster-band');
  const rankLabel = card.querySelector('.song-poster-rank');
  card.style.setProperty('--song-color', band.color || '#ccc');
  rankLabel.textContent = rank ? String(rank).padStart(2, '0') : '';

  const displayBand = song && song.band !== band.name ? artistName(song.band) : bandName(band);
  if (band.logo) {
    const logo = document.createElement('img');
    logo.src = './assets/images/bands_big/' + band.logo;
    logo.alt = bandName(band);
    logo.dataset.fallbackText = bandName(band);
    logo.addEventListener('error', () => { bandLine.textContent = bandName(band); }, { once: true });
    bandLine.append(logo);
  } else {
    bandLine.textContent = displayBand;
  }

  if (song) {
    card.querySelector('.song-poster-name').textContent = songName(song);
    const original = card.querySelector('.song-poster-original');
    const secondaryTitle = getLanguage() === 'ja' ? song.koTitle : song.title;
    if (secondaryTitle && secondaryTitle !== songName(song)) original.textContent = secondaryTitle;
    else original.remove();
    card.querySelector('.song-poster-artist').textContent = artistName(song.band);
  } else {
    card.classList.add('is-empty');
    card.querySelector('.song-poster-name').textContent = t('songs.empty');
    card.querySelector('.song-poster-original').remove();
    card.querySelector('.song-poster-artist').textContent = bandName(band);
  }
  return card;
}

function renderPoster() {
  const preview = $('#poster-preview');
  const empty = $('#poster-empty');
  if (scope === 'all' && !hasPicks()) {
    preview.replaceChildren();
    preview.hidden = true;
    empty.hidden = false;
    return;
  }
  const poster = $('#song-poster-template').content.firstElementChild.cloneNode(true);
  poster.querySelector('.print-poster-owner').textContent = nickname.trim() || t('poster.defaultOwner');
  poster.querySelector('.print-poster-title').textContent = t(scope === 'all' ? 'songs.bestTitle' : 'songs.bandTitle');
  poster.querySelector('.print-poster-footer span:last-child').textContent = t('poster.footer');
  const content = poster.querySelector('.print-poster-content');
  const grid = document.createElement('div');
  grid.className = scope === 'all' ? 'song-poster-best' : 'song-poster-bands';

  if (scope === 'all') {
    bestNine.forEach((key, index) => {
      const song = songByKey.get(key);
      grid.append(createCard(song, bandById[song.group], index + 1));
    });
  } else {
    for (const [index, band] of mainBands.entries()) {
      const song = songByKey.get(bandPicks[band.id]);
      grid.append(createCard(song, band, index + 1));
    }
  }
  content.append(grid);
  preview.replaceChildren(poster);
  preview.hidden = false;
  empty.hidden = true;
  fitPosterPreview();
}

function render() {
  renderList();
  renderRanks();
  renderPoster();
  $('#save-songs').disabled = !hasPicks();
  document.querySelectorAll('.scope-tab').forEach((button) => {
    const selected = button.dataset.scope === scope;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

$('#song-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-song-key]');
  if (!button) return;
  const song = songByKey.get(button.dataset.songKey);
  if (scope === 'all') {
    const index = bestNine.indexOf(song.key);
    if (index >= 0) bestNine.splice(index, 1);
    else if (bestNine.length < limit) bestNine.push(song.key);
    else {
      window.alert(t('songs.bestLimit'));
      return;
    }
  } else {
    bandPicks[song.group] = bandPicks[song.group] === song.key ? null : song.key;
  }
  persist();
  render();
});
document.querySelectorAll('.scope-tab').forEach((button) => button.addEventListener('click', () => {
  scope = button.dataset.scope;
  renderBands();
  $('#song-band').value = 'all';
  render();
}));
$('#song-search').addEventListener('input', renderList);
$('#song-band').addEventListener('change', renderList);
$('#song-nickname').addEventListener('input', (event) => {
  nickname = event.target.value;
  persist();
  const owner = $('#poster-preview .print-poster-owner');
  if (owner) owner.textContent = nickname.trim() || t('poster.defaultOwner');
});
$('#clear-songs').addEventListener('click', () => {
  if (!bestNine.length && !Object.values(bandPicks).some(Boolean)) return;
  if (!window.confirm(t('songs.deleteConfirm'))) return;
  bestNine.length = 0;
  for (const band of mainBands) bandPicks[band.id] = null;
  persist();
  render();
});
$('#save-songs').addEventListener('click', async () => {
  const button = $('#save-songs');
  button.disabled = true;
  try {
    await savePosterImage(scope === 'all' ? 'bandori-best-songs.png' : 'bandori-band-songs.png');
  } catch (error) {
    window.alert(error.message || t('songs.saveError'));
  } finally {
    button.disabled = !hasPicks();
  }
});

window.addEventListener('resize', fitPosterPreview);
document.fonts.ready.then(fitPosterPreview);
document.addEventListener('app-language-change', () => {
  renderBands();
  render();
});
renderBands();
render();
