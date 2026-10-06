import { getLanguage, t } from './language.js?v=20261006-3';

export function fitPosterPreview() {
  const preview = document.querySelector('#poster-preview');
  const poster = preview.firstElementChild;
  if (!poster || preview.hidden || !preview.clientWidth) return;
  const scale = preview.clientWidth / poster.offsetWidth;
  const transform = `scale(${scale})`;
  const height = `${Math.ceil(poster.scrollHeight * scale)}px`;
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

async function embeddedFontStyles() {
  const importRule = [...document.styleSheets].flatMap((sheet) => {
    try { return [...sheet.cssRules].filter((rule) => rule instanceof CSSImportRule); }
    catch { return []; }
  }).find((rule) => rule.href.includes('wanted-sans'));
  if (!importRule) throw new Error(t('export.fontUrlError'));
  const response = await fetch(importRule.href);
  if (!response.ok) throw new Error(t('export.fontLoadError'));
  const css = await response.text();
  const faces = [...css.matchAll(/@font-face\s*\{[^}]+\}/g)]
    .map(([face]) => face)
    .filter((face) => /font-family:\s*["']?Wanted Sans Variable/i.test(face));
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
  return Promise.all([
    ...faces.map((face) => embedFace(face, importRule.href)),
    ...localFaces.map(({ face, base }) => embedFace(face, base)),
  ]).then((rules) => rules.join('\n'));
}

export async function savePosterImage(filename) {
  const preview = document.querySelector('#poster-preview > .print-poster');
  if (!preview) throw new Error(t('export.previewError'));
  const poster = preview.cloneNode(true);
  document.body.append(poster);
  poster.classList.add('print-poster-export');
  const width = poster.offsetWidth;
  let canvas;
  try {
    const fonts = [document.fonts.load('16px "Wanted Sans Variable"')];
    if (getLanguage() !== 'ja') fonts.push(document.fonts.load('700 42px "Godo"'));
    await Promise.all(fonts);
    await embedPosterImages(poster);
    const fontStyles = await embeddedFontStyles();
    const clone = poster.cloneNode(true);
    inlineComputedStyles(poster, clone);
    Object.assign(clone.style, { transform: 'none', position: 'static', left: 'auto' });
    const markup = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${poster.scrollHeight}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${fontStyles}</style>${markup}</div></foreignObject></svg>`;
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = poster.scrollHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error(t('export.canvasError'));
    context.drawImage(image, 0, 0);
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
