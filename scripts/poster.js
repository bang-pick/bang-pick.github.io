import { fitPosterPreview, savePosterImage } from './poster-export.js?v=20261005-2';
import { bands, characters } from './data.js?v=20261005-1';

const asset = (folder, name) => name ? new URL(`../assets/images/${folder}/${name}`, import.meta.url).href : null;
const posterTitles = { all: '베스트 9', band: '밴드별 최애', couples: '최애커플' };
export const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
export const characterById = Object.fromEntries(characters.map((character) => [character.id, character]));

export const characterImage = (character) => asset('characters', character.image);
export const bandLogo = (band) => asset('bands_big', band.logo);
export const initials = (name) => name.replace(/\s/g, '').slice(0, 2);
export function pickedEntries(picks, outputScope) {
  let entries;
  if (outputScope === 'all') {
    entries = [...picks.all].map((id) => ({ id, bandId: characterById[id]?.band }));
  } else if (outputScope === 'couples') {
    entries = (picks.couples || []).flatMap((pair) => pair.map((id) => ({ id, bandId: characterById[id]?.band })));
  } else {
    entries = Object.entries(picks.bands).flatMap(([bandId, set]) => [...set].map((id) => ({ id, bandId })));
  }
  return entries.filter((entry) => entry.bandId && (outputScope !== 'band' || entry.bandId !== 'others'));
}

export const characterForm = (id, picks) => {
  const character = characterById[id];
  return picks.alternateForms?.has(id) && character.alternateName
    ? { ...character, name: character.alternateName, japanese: character.alternateJapanese, color: character.alternateColor, image: character.alternateImage }
    : character;
};

export const couplingName = (firstId, secondId, picks) =>
  [firstId, secondId].map((id) => characterForm(id, picks).name.split(' ').at(-1).slice(0, 2)).join('');

function createPoster(outputScope, nickname, picks) {
  const entries = pickedEntries(picks, outputScope);
  if (!entries.length) return null;
  const poster = document.querySelector('#poster-template').content.firstElementChild.cloneNode(true);
  poster.querySelector('.print-poster-owner').textContent = nickname.trim() || '나';
  poster.querySelector('.print-poster-title').textContent = `의 ${posterTitles[outputScope] || posterTitles.band}`;
  const content = poster.querySelector('.print-poster-content');

  const createCard = (entry, rank = null) => {
    const character = characterForm(entry.id, picks);
    const band = bandById[character.band];
    const card = document.createElement('article');
    card.className = `print-poster-card${outputScope === 'band' ? ' print-poster-card-band' : ''}${rank ? ` rank-${rank}` : ''}`;
    card.style.setProperty('--character-color', character.color || band.color);
    if (outputScope === 'band') {
      const logo = document.createElement('div');
      logo.className = 'print-poster-featured-logo';
      const image = document.createElement('img');
      image.src = bandLogo(band);
      image.alt = `${band.name} 로고`;
      logo.append(image);
      card.append(logo);
    }
    const portrait = document.createElement('div');
    portrait.className = 'print-poster-portrait';
    const sprite = characterImage(character);
    if (sprite) {
      const image = document.createElement('img');
      image.src = sprite;
      if (character.alternateImage && character.image === 'misaki_2.webp') image.dataset.fallbackSrc = characterImage(characterById[entry.id]);
      image.addEventListener('error', () => {
        if (image.dataset.fallbackSrc && !image.dataset.fallback) {
          image.dataset.fallback = 'true';
          image.src = image.dataset.fallbackSrc;
        }
      });
      image.alt = '';
      portrait.append(image);
    } else {
      portrait.textContent = initials(character.name);
    }
    if (rank) {
      const badge = document.createElement('span');
      badge.className = 'print-poster-rank';
      badge.textContent = `${rank}위`;
      portrait.append(badge);
    }
    const info = document.createElement('footer');
    info.className = 'print-poster-info';
    if (outputScope === 'all' || outputScope === 'couples') {
      const bandLine = document.createElement('div');
      bandLine.className = 'print-poster-band';
      const logo = bandLogo(band);
      if (logo) {
        const image = document.createElement('img');
        image.src = logo;
        image.alt = '';
        bandLine.append(image);
      } else {
        bandLine.textContent = band.name;
      }
      info.append(bandLine);
    }
    const name = document.createElement('span');
    name.className = 'print-poster-name';
    name.textContent = character.name;
    const details = document.createElement('small');
    details.className = 'print-poster-sub';
    details.textContent = `${character.japanese} · ${character.part}`;
    info.append(name, details);
    card.append(portrait, info);
    return card;
  };

  if (outputScope === 'couples') {
    const list = document.createElement('div');
    list.className = 'print-couples';
    const pairs = picks.couples || [];
    for (const [firstId, secondId] of pairs.slice(0, 4)) {
      const pair = document.createElement('div');
      pair.className = 'print-couple';
      const name = document.createElement('span');
      name.className = 'print-couple-name';
      name.textContent = couplingName(firstId, secondId, picks);
      const cards = document.createElement('div');
      cards.className = 'print-couple-cards';
      const direction = document.createElement('div');
      direction.className = 'print-couple-direction';
      direction.append(name, Object.assign(document.createElement('span'), { className: 'print-couple-arrow', textContent: '→' }));
      cards.append(createCard({ id: firstId }, null), direction, createCard({ id: secondId }, null));
      pair.append(cards);
      list.append(pair);
    }
    content.append(list);
  } else if (outputScope === 'all') {
    const podium = document.createElement('div');
    podium.className = 'print-poster-podium';
    for (const rank of [2, 1, 3]) {
      const entry = entries[rank - 1];
      if (entry) podium.append(createCard(entry, rank));
      else {
        const placeholder = document.createElement('div');
        placeholder.className = `print-poster-podium-placeholder rank-${rank}`;
        podium.append(placeholder);
      }
    }
    content.append(podium);
    if (entries.length > 3) {
      const grid = document.createElement('div');
      grid.className = 'print-poster-grid print-poster-lower-grid';
      entries.slice(3).forEach((entry, index) => grid.append(createCard(entry, index + 4)));
      content.append(grid);
    }
  } else {
    const grid = document.createElement('div');
    grid.className = 'print-poster-grid print-poster-band-grid';
    entries.forEach((entry) => grid.append(createCard(entry)));
    content.append(grid);
  }
  return poster;
}

export function renderPosterPreview(scope, nickname, picks) {
  const preview = document.querySelector('#poster-preview');
  const empty = document.querySelector('#poster-empty');
  const poster = createPoster(scope, nickname, picks);
  if (!poster) {
    preview.replaceChildren();
    preview.hidden = true;
    empty.hidden = false;
    return;
  }
  preview.replaceChildren(poster);
  preview.hidden = false;
  empty.hidden = true;
  fitPosterPreview();
}

export { fitPosterPreview };
export const saveFavoritesImage = (scope) => savePosterImage(
  scope === 'all' ? 'bandori-best-nine.png' : scope === 'couples' ? 'bandori-favorite-couples.png' : 'bandori-band-picks.png'
);
