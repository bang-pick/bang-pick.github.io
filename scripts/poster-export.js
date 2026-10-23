import { getLanguage, t } from './language.js?v=20261012-1';

export function fitPosterPreview() {
  const preview = document.querySelector('#poster-preview');
  const poster = preview.firstElementChild;
  if (!poster || preview.hidden || !preview.clientWidth) return;
  const scale = preview.clientWidth / poster.offsetWidth;
  const transform = `scale(${scale})`;
  const height = `${Math.ceil(Math.max(poster.scrollHeight, poster.offsetHeight) * scale)}px`;
  if (poster.style.transform !== transform) poster.style.transform = transform;
  if (preview.style.height !== height) preview.style.height = height;
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
      image.src = await fetchDataUrl(image.src, t('export.imageError'));
    } catch (error) {
      if (image.dataset.fallbackText) {
        image.replaceWith(document.createTextNode(image.dataset.fallbackText));
        return;
      }
      if (!image.dataset.fallbackSrc) throw error;
      image.src = await fetchDataUrl(image.dataset.fallbackSrc, t('export.imageError'));
    }
    await image.decode();
  }));
}

async function embeddedFontStyles(poster) {
  const importRules = [...document.styleSheets].flatMap((sheet) => {
    try { return [...sheet.cssRules].filter((rule) => rule instanceof CSSImportRule); }
    catch { return []; }
  });
  const importRule = importRules.find((rule) => rule.href.includes('pretendardvariable-jp'));
  if (!importRule) throw new Error(t('export.fontUrlError'));
  const response = await fetch(importRule.href);
  if (!response.ok) throw new Error(t('export.fontLoadError'));
  const css = await response.text();
  const faces = [...css.matchAll(/@font-face\s*\{[^}]+\}/g)]
    .map(([face]) => face)
    .filter((face) => /font-family:\s*["']?Pretendard JP Variable["']?/i.test(face));
  if (!faces.length) throw new Error(t('export.fontFaceError'));
  const localFaces = getLanguage() === 'ja' ? [] : [...document.styleSheets].flatMap((sheet) => {
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
      const font = await fetchDataUrl(new URL(path, base), t('export.fontFileError'));
      face = face.replace(source, `url("${font}")`);
    }
    return face;
  };
  const extraFaces = [];
  if (getComputedStyle(poster).fontFamily.includes('Montserrat')) {
    const montserratRule = importRules.find((rule) => rule.href.includes('family=Montserrat'));
    if (!montserratRule) throw new Error(t('export.fontFileError'));
    const response = await fetch(montserratRule.href);
    if (!response.ok) throw new Error(t('export.fontFileError'));
    const css = await response.text();
    for (const [face] of css.matchAll(/@font-face\s*\{[^}]+\}/g)) {
      if (/font-family:\s*["']?Montserrat["']?/i.test(face)) {
        extraFaces.push({ face, base: montserratRule.href });
      }
    }
    if (!extraFaces.length) throw new Error(t('export.fontFileError'));
  }
  return Promise.all([
    ...faces.map((face) => embedFace(face, importRule.href)),
    ...localFaces.map(({ face, base }) => embedFace(face, base)),
    ...extraFaces.map(({ face, base }) => embedFace(face, base)),
  ]).then((rules) => rules.join('\n'));
}

export async function savePosterImage(filename, { backgroundColor = null } = {}) {
  const preview = document.querySelector('#poster-preview > .print-poster');
  if (!preview) throw new Error(t('export.previewError'));
  const poster = preview.cloneNode(true);
  document.body.append(poster);
  poster.classList.add('print-poster-export');
  const width = poster.offsetWidth;
  let canvas;
  try {
    const fonts = [document.fonts.load('16px "Pretendard JP Variable"')];
    if (getLanguage() !== 'ja') fonts.push(document.fonts.load('700 42px "Godo"'));
    if (getComputedStyle(poster).fontFamily.includes('Montserrat')) fonts.push(document.fonts.load('650 17px "Montserrat"'));
    await Promise.all(fonts);
    await embedPosterImages(poster);
    const fontStyles = await embeddedFontStyles(poster);
    const height = Math.max(poster.offsetHeight, poster.scrollHeight);
    const clone = poster.cloneNode(true);
    inlineComputedStyles(poster, clone);
    Object.assign(clone.style, {
      transform: 'none', position: 'relative', inset: 'auto', insetBlock: 'auto', insetInline: 'auto',
    });
    const markup = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${fontStyles}</style>${markup}</div></foreignObject></svg>`;
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    canvas = document.createElement('canvas');
    const padding = backgroundColor ? Math.round(width * .07) : 0;
    canvas.width = width + padding * 2;
    canvas.height = height + padding * 2;
    const context = canvas.getContext('2d');
    if (!context) throw new Error(t('export.canvasError'));
    if (backgroundColor) {
      context.fillStyle = '#f5f6f8';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.globalAlpha = .045;
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
      context.save();
      context.shadowColor = '#27334930';
      context.shadowBlur = 38;
      context.shadowOffsetY = 18;
      context.fillStyle = '#b2bbc5';
      context.beginPath();
      context.roundRect(padding, padding + 4, width, height, parseFloat(getComputedStyle(poster).borderTopLeftRadius) || 0);
      context.fill();
      context.restore();
    }
    context.drawImage(image, padding, padding);
  } finally {
    poster.remove();
  }
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error(t('export.pngError'));
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
