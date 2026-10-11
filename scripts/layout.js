import { applyLanguage, t } from './language.js?v=20261012-1';

const response = await fetch('./shared-layout.html?v=20261012-1');
if (!response.ok) throw new Error(t('layout.loadError'));

const shared = new DOMParser().parseFromString(await response.text(), 'text/html');
for (const part of ['header', 'footer']) {
  const element = shared.querySelector(`#site-${part}`).content.firstElementChild.cloneNode(true);
  document.querySelector(`[data-shared="${part}"]`).replaceWith(element);
}

const current = document.querySelector(`.topbar [data-page="${document.body.dataset.page}"]`);
if (current) {
  current.classList.add('active');
  current.setAttribute('aria-current', 'page');
}
applyLanguage();
