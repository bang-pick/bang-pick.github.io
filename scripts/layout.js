const response = await fetch('./shared-layout.html?v=20261005-4');
if (!response.ok) throw new Error('공통 화면을 불러오지 못했습니다.');

const shared = new DOMParser().parseFromString(await response.text(), 'text/html');
for (const part of ['header', 'footer']) {
  const element = shared.querySelector(`#site-${part}`).content.firstElementChild.cloneNode(true);
  document.querySelector(`[data-shared="${part}"]`).replaceWith(element);
}

const current = document.querySelector(`.topbar [data-page="${document.body.dataset.page}"]`);
current.classList.add('active');
current.setAttribute('aria-current', 'page');
