const load = (file) => fetch(new URL(`${file}?v=20261005-1`, import.meta.url)).then((response) => {
  if (!response.ok) throw new Error(`데이터를 불러오지 못했습니다: ${file}`);
  return response.json();
});

export const [bands, characters] = await Promise.all([
  load('../data/bands.json'),
  load('../data/characters.json'),
]);
