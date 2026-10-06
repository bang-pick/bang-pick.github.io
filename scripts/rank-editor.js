import { t } from './language.js?v=20261006-3';

export function renderRankEditor(editor, list, entries, getLabel, onReorder) {
  editor.hidden = entries.length === 0;
  list.replaceChildren();
  if (editor.hidden) return;

  entries.forEach((entry, index) => {
    const row = document.createElement('label');
    const name = document.createElement('span');
    const select = document.createElement('select');
    row.className = 'rank-editor-row';
    name.textContent = getLabel(entry);
    select.setAttribute('aria-label', t('pick.rankLabel', { name: name.textContent }));
    entries.forEach((_, rank) => select.add(new Option(t('pick.rank', { rank: rank + 1 }), String(rank))));
    select.value = String(index);
    select.addEventListener('change', () => onReorder(index, Number(select.value)));
    row.append(name, select);
    list.append(row);
  });
}
