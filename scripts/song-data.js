import { getLanguage } from './language.js?v=20261012-1';

const loadedGroups = new Map();

export const songDisplayName = (song) => getLanguage() === 'ja' ? song.title : song.koTitle || song.title;

export function loadSongGroup(id) {
  if (!loadedGroups.has(id)) {
    const request = fetch(`./data/songs/${id}.json?v=20261125-9`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load songs for ${id}: ${response.status}`);
        return response.json();
      })
      .then((songs) => songs.map((song) => ({
        ...song,
        group: id,
        key: `${id}:${song.band}:${song.title}`,
      })))
      .catch((error) => {
        loadedGroups.delete(id);
        throw error;
      });
    loadedGroups.set(id, request);
  }
  return loadedGroups.get(id);
}
