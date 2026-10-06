import { t } from './language.js?v=20261006-4';

const load = (file) => fetch(new URL(`${file}?v=20261006-1`, import.meta.url)).then((response) => {
  if (!response.ok) throw new Error(t('data.loadError', { file }));
  return response.json();
});

export const [bands, characters] = await Promise.all([
  load('../data/bands.json'),
  load('../data/characters.json'),
]);
