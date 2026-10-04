import { bands, characters } from './data/index.js';

const asset = (folder, name) => name ? new URL(`./assets/images/${folder}/${name}`, import.meta.url).href : null;
const exclamationImage = new URL('./assets/exclamation.svg', import.meta.url).href;
export const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
export const characterById = Object.fromEntries(characters.map((character) => [character.id, character]));

export const characterImage = (character) => asset('characters', character.image);
export const bandLogo = (band) => asset('bands', band.logo);
export const bandBigLogo = (band) => asset('bands_big', band.bigLogo || band.logo);
export const initials = (name) => name.replace(/\s/g, '').slice(0, 2);
export const pickedEntries = (picks, outputScope) => (outputScope === 'all'
  ? [...picks.all].map((id) => ({ id, bandId: characterById[id]?.band }))
  : outputScope === 'couples'
    ? (picks.couples || []).flatMap((pair) => pair.map((id) => ({ id, bandId: characterById[id]?.band })))
    : Object.entries(picks.bands).flatMap(([bandId, set]) => [...set].map((id) => ({ id, bandId }))))
  .filter((entry) => entry.bandId && (outputScope !== 'band' || entry.bandId !== 'others'));

const characterForm = (id, picks) => {
  const character = characterById[id];
  return picks.alternateForms?.has(id) && character.alternateName
    ? { ...character, name: character.alternateName, japanese: character.alternateJapanese, color: character.alternateColor, image: character.alternateImage }
    : character;
};

function createPoster(outputScope, nickname, picks) {
  const entries = pickedEntries(picks, outputScope);
  if (!entries.length) return null;
  const poster = document.createElement('article');
  poster.className = 'print-poster';
  const header = document.createElement('header');
  header.className = 'print-poster-header';
  const heading = document.createElement('h2');
  const owner = document.createElement('span');
  owner.className = 'print-poster-owner';
  owner.textContent = nickname.trim() || '나';
  const title = document.createElement('span');
  title.textContent = `의 ${outputScope === 'all' ? '베스트 9' : outputScope === 'couples' ? '최애커플' : '밴드별 최애'}`;
  const logo = document.createElement('img');
  logo.src = exclamationImage;
  logo.alt = '';
  heading.append(owner, title, logo);
  header.append(heading);
  poster.append(header);

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
      image.src = bandBigLogo(band) || bandLogo(band);
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
      const logo = bandBigLogo(band) || bandLogo(band);
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
    const name = document.createElement('strong');
    name.textContent = character.name;
    info.append(name);
    card.append(portrait, info);
    return card;
  };

  if (outputScope === 'couples') {
    const list = document.createElement('div');
    list.className = 'print-couples';
    for (const [firstId, secondId] of picks.couples || []) {
      const first = characterForm(firstId, picks);
      const second = characterForm(secondId, picks);
      const pair = document.createElement('div');
      pair.className = 'print-couple';
      const name = document.createElement('strong');
      name.className = 'print-couple-name';
      name.textContent = `${first.name.split(' ').at(-1).slice(0, 2)}${second.name.split(' ').at(-1).slice(0, 2)}`;
      const cards = document.createElement('div');
      cards.className = 'print-couple-cards';
      const direction = document.createElement('div');
      direction.className = 'print-couple-direction';
      direction.append(name, Object.assign(document.createElement('span'), { className: 'print-couple-arrow', textContent: '→' }));
      cards.append(createCard({ id: firstId }, null), direction, createCard({ id: secondId }, null));
      pair.append(cards);
      list.append(pair);
    }
    poster.append(list);
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
    poster.append(podium);
    if (entries.length > 3) {
      const grid = document.createElement('div');
      grid.className = 'print-poster-grid print-poster-lower-grid';
      entries.slice(3).forEach((entry, index) => grid.append(createCard(entry, index + 4)));
      poster.append(grid);
    }
  } else {
    const grid = document.createElement('div');
    grid.className = 'print-poster-grid print-poster-band-grid';
    entries.forEach((entry) => grid.append(createCard(entry)));
    poster.append(grid);
  }
  const footer = document.createElement('footer');
  footer.className = 'print-poster-footer';
  const copyright = document.createElement('span');
  copyright.textContent = '©BanG Dream! Project, Bushiroad All Rights Reserved.';
  const attribution = document.createElement('span');
  attribution.textContent = '비공식 팬사이트 방픽!에서 생성되었습니다.';
  footer.append(copyright, attribution);
  poster.append(footer);
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
  const scale = preview.clientWidth / 1200;
  poster.style.transform = `scale(${scale})`;
  preview.style.height = `${poster.scrollHeight * scale}px`;
  empty.hidden = true;
}

function inlineComputedStyles(source, target) {
  const computed = getComputedStyle(source);
  target.style.cssText = [...computed].map((property) => `${property}:${computed.getPropertyValue(property)};`).join('');
  [...source.children].forEach((child, index) => inlineComputedStyles(child, target.children[index]));
}

async function fetchDataUrl(url, errorMessage) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(errorMessage);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function embedPosterImages(poster) {
  await Promise.all([...poster.querySelectorAll('img')].map(async (image) => {
    try {
      image.src = await fetchDataUrl(image.src, '이미지 파일을 불러오지 못했습니다.');
    } catch (error) {
      if (!image.dataset.fallbackSrc) throw error;
      image.src = await fetchDataUrl(image.dataset.fallbackSrc, '이미지 파일을 불러오지 못했습니다.');
    }
    await image.decode();
  }));
}

async function embeddedFontStyles() {
  const importRule = [...document.styleSheets].flatMap((sheet) => {
    try { return [...sheet.cssRules].filter((rule) => rule instanceof CSSImportRule); }
    catch { return []; }
  }).find((rule) => rule.href.includes('wanted-sans'));
  if (!importRule) throw new Error('Wanted Sans 폰트 주소를 찾지 못했습니다.');
  const response = await fetch(importRule.href);
  if (!response.ok) throw new Error('Wanted Sans 폰트 정보를 불러오지 못했습니다.');
  const css = await response.text();
  const faces = [...css.matchAll(/@font-face\s*\{[^}]+\}/g)]
    .map(([face]) => face)
    .filter((face) => /font-family:\s*["']?Wanted Sans Variable/i.test(face));
  if (!faces.length) throw new Error('Wanted Sans 폰트 정의를 찾지 못했습니다.');
  const localFaces = [...document.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules]
        .filter((rule) => rule.type === CSSRule.FONT_FACE_RULE && /font-family:\s*["']?Godo/i.test(rule.cssText))
        .map((rule) => ({ face: rule.cssText, base: sheet.href || document.baseURI }));
    } catch {
      return [];
    }
  });
  const embedFace = async (face, base) => {
    for (const [source, , path] of face.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
      const font = await fetchDataUrl(new URL(path, base), '글꼴 파일을 불러오지 못했습니다.');
      face = face.replace(source, `url("${font}")`);
    }
    return face;
  };
  return Promise.all([
    ...faces.map((face) => embedFace(face, importRule.href)),
    ...localFaces.map(({ face, base }) => embedFace(face, base)),
  ]).then((rules) => rules.join('\n'));
}

export async function saveFavoritesImage(scope) {
  const preview = document.querySelector('#poster-preview > .print-poster');
  if (!preview) throw new Error('최애표 미리보기를 찾지 못했습니다. 캐릭터 선택을 확인해 주세요.');
  const poster = preview.cloneNode(true);
  document.body.append(poster);
  poster.classList.add('print-poster-export');
  let canvas;
  try {
    await Promise.all([
      document.fonts.load('16px "Wanted Sans Variable"'),
      document.fonts.load('700 42px "Godo"'),
    ]);
    await embedPosterImages(poster);
    const fontStyles = await embeddedFontStyles();
    const clone = poster.cloneNode(true);
    inlineComputedStyles(poster, clone);
    Object.assign(clone.style, { transform: 'none', position: 'static', left: 'auto' });
    const markup = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${poster.scrollHeight}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${fontStyles}</style>${markup}</div></foreignObject></svg>`;
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = poster.scrollHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('이미지 캔버스를 만들 수 없습니다.');
    context.drawImage(image, 0, 0);
  } finally {
    poster.remove();
  }
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG 이미지를 만들 수 없습니다.');
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: scope === 'all' ? 'bandori-best-nine.png' : 'bandori-band-picks.png',
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
