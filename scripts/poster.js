import { fitPosterPreview, savePosterImage } from './poster-export.js?v=20261006-6';
import { bands, characters } from './data.js?v=20261006-3';
import { bandName, characterName, getLanguage, otherCharacterName, t } from './language.js?v=20261006-4';

const asset = (folder, name) => name ? new URL(`../assets/images/${folder}/${name}`, import.meta.url).href : null;
export const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
export const characterById = Object.fromEntries(characters.map((character) => [character.id, character]));
export const coupleLimit = 6;

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
  [firstId, secondId].map((id) => {
    const name = characterName(characterForm(id, picks)).split(' ').at(-1);
    return id === 'kurata-mashiro' ? name.slice(-2) : name.slice(0, 2);
  }).join('');

function createPoster(outputScope, nickname, picks) {
  const entries = pickedEntries(picks, outputScope);
  const poster = document.querySelector('#poster-template').content.firstElementChild.cloneNode(true);
  poster.querySelector('.print-poster-owner').textContent = nickname.trim() || t('poster.defaultOwner');
  poster.querySelector('.print-poster-title').textContent = t(`poster.${outputScope === 'couples' ? 'couple' : outputScope}Title`);
  poster.querySelector('.print-poster-footer span:last-child').textContent = t('poster.footer');
  const content = poster.querySelector('.print-poster-content');

  const createCard = (entry, rank = null, emptyBand = null) => {
    const character = entry ? characterForm(entry.id, picks) : null;
    const band = character ? bandById[character.band] : emptyBand;
    const card = document.createElement('article');
    card.className = `print-poster-card${outputScope === 'band' ? ' print-poster-card-band' : ''}${rank ? ` rank-${rank}` : ''}${character ? '' : ' is-empty'}`;
    card.style.setProperty('--character-color', character?.color || band?.color || '#e8e8e5');
    if (outputScope === 'band') {
      const logo = document.createElement('div');
      logo.className = 'print-poster-featured-logo';
      if (band?.logo) {
        const image = document.createElement('img');
        image.src = bandLogo(band);
        image.alt = t('common.bandLogo', { name: bandName(band) });
        logo.append(image);
      }
      card.append(logo);
    }
    const portrait = document.createElement('div');
    portrait.className = 'print-poster-portrait';
    const sprite = character && characterImage(character);
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
    } else if (character) {
      portrait.textContent = initials(characterName(character));
    }
    if (rank) {
      const badge = document.createElement('span');
      badge.className = 'print-poster-rank';
      badge.textContent = t('poster.rank', { rank });
      portrait.append(badge);
    }
    const info = document.createElement('footer');
    info.className = 'print-poster-info';
    if (outputScope === 'all' || outputScope === 'couples') {
      const bandLine = document.createElement('div');
      bandLine.className = 'print-poster-band';
      const logo = band && bandLogo(band);
      if (logo) {
        const image = document.createElement('img');
        image.src = logo;
        image.alt = '';
        bandLine.append(image);
      } else if (band) {
        bandLine.textContent = bandName(band);
      }
      info.append(bandLine);
    }
    const name = document.createElement('span');
    name.className = 'print-poster-name';
    name.textContent = character ? characterName(character) : '';
    const details = document.createElement('small');
    details.className = 'print-poster-sub';
    details.textContent = character ? [otherCharacterName(character), character.part].filter(Boolean).join(' · ') : '';
    info.append(name, details);
    card.append(portrait, info);
    return card;
  };

  if (outputScope === 'couples') {
    const list = document.createElement('div');
    list.className = 'print-couples';
    const pairs = picks.couples || [];
    for (let index = 0; index < coupleLimit; index++) {
      const [firstId, secondId] = pairs[index] || [];
      const pair = document.createElement('div');
      pair.className = `print-couple${firstId && secondId ? '' : ' is-empty'}`;
      const cards = document.createElement('div');
      cards.className = 'print-couple-cards';
      const direction = document.createElement('div');
      direction.className = 'print-couple-direction';
      if (firstId && secondId && getLanguage() !== 'ja') {
        const name = document.createElement('span');
        name.className = 'print-couple-name';
        name.textContent = couplingName(firstId, secondId, picks);
        direction.append(name);
      }
      direction.append(Object.assign(document.createElement('span'), { className: 'print-couple-arrow', textContent: '→' }));
      cards.append(createCard(firstId ? { id: firstId } : null), direction, createCard(secondId ? { id: secondId } : null));
      pair.append(cards);
      list.append(pair);
    }
    content.append(list);
  } else if (outputScope === 'all') {
    const podium = document.createElement('div');
    podium.className = 'print-poster-podium';
    for (const rank of [2, 1, 3]) podium.append(createCard(entries[rank - 1] || null, rank));
    content.append(podium);
    const grid = document.createElement('div');
    grid.className = 'print-poster-grid print-poster-lower-grid';
    for (let index = 3; index < 9; index++) grid.append(createCard(entries[index] || null, index + 1));
    content.append(grid);
  } else {
    const grid = document.createElement('div');
    grid.className = 'print-poster-grid print-poster-band-grid';
    for (const band of bands.filter(({ id }) => id !== 'others')) {
      const id = picks.bands[band.id]?.values().next().value;
      grid.append(createCard(id ? { id, bandId: band.id } : null, null, band));
    }
    content.append(grid);
  }
  return poster;
}

export function renderPosterPreview(scope, nickname, picks) {
  const preview = document.querySelector('#poster-preview');
  const poster = createPoster(scope, nickname, picks);
  preview.replaceChildren(poster);
  preview.hidden = false;
  fitPosterPreview();
}

export { fitPosterPreview };
export const saveFavoritesImage = (scope) => savePosterImage(
  scope === 'all' ? 'bandori-best-nine.png' : scope === 'couples' ? 'bandori-favorite-couples.png' : 'bandori-band-picks.png'
);
