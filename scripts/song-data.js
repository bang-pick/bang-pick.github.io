const loadedGroups = new Map();

export function loadSongGroup(id) {
  if (!loadedGroups.has(id)) {
    const request = fetch(`./data/songs/${id}.json?v=20261005-7`)
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
