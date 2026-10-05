export function fitPosterPreview() {
  const preview = document.querySelector('#poster-preview');
  const poster = preview.firstElementChild;
  if (!poster || preview.hidden || !preview.clientWidth) return;
  const scale = preview.clientWidth / poster.offsetWidth;
  const transform = `scale(${scale})`;
  const height = `${poster.scrollHeight * scale}px`;
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
      image.src = await fetchDataUrl(image.src, '이미지 파일을 불러오지 못했습니다.');
    } catch (error) {
      if (image.dataset.fallbackText) {
        image.replaceWith(document.createTextNode(image.dataset.fallbackText));
        return;
      }
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

export async function savePosterImage(filename) {
  const preview = document.querySelector('#poster-preview > .print-poster');
  if (!preview) throw new Error('이미지 미리보기를 찾지 못했습니다. 선택 항목을 확인해 주세요.');
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
    download: filename,
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
