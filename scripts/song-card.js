import { bandName, getLanguage, t } from './language.js?v=20261012-1';

export function createSongCard(song, band, rank, artistName = (name) => name) {
  const card = document.querySelector('#song-card-template').content.firstElementChild.cloneNode(true);
  const bandLine = card.querySelector('.song-poster-band');
  const original = card.querySelector('.song-poster-original');
  card.style.setProperty('--song-color', band?.color || '#a6a7a1');
  card.querySelector('.song-poster-rank').textContent = rank ? String(rank).padStart(2, '0') : '';

  if (song) {
    const name = getLanguage() === 'ja' ? song.title : song.koTitle || song.title;
    const secondary = getLanguage() === 'ja' ? song.koTitle : song.title;
    card.querySelector('.song-poster-name').textContent = name;
    if (secondary && secondary !== name) original.textContent = secondary;
    else original.remove();
    card.querySelector('.song-poster-artist').textContent = artistName(song.band === band?.name ? bandName(band) : song.band);
  } else {
    card.classList.add('is-empty');
    card.querySelector('.song-poster-name').textContent = t('songs.empty');
    card.querySelector('.song-poster-artist').textContent = band ? bandName(band) : '';
    original.remove();
  }

  if (band?.logo) {
    const logo = document.createElement('img');
    logo.src = `./assets/images/bands_big/${band.logo}`;
    logo.alt = bandName(band);
    logo.dataset.fallbackText = bandName(band);
    logo.addEventListener('error', () => { bandLine.textContent = bandName(band); }, { once: true });
    bandLine.append(logo);
  } else if (band) {
    bandLine.textContent = song && song.band !== band.name ? artistName(song.band) : bandName(band);
  }
  return card;
}
