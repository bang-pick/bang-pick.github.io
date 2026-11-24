import { getLanguage, t } from './language.js?v=20261012-1';

const events = [
  {
    date: '2027-01-23',
    image: 'kimchikura27.webp',
    bands: ['yumemita', 'raise-a-suilen'],
    type: 'festival',
    title: { ko: 'KIMCHIKURA×ANISAMA SEOUL 2027', ja: 'KIMCHIKURA×ANISAMA SEOUL 2027' },
    detail: { ko: '무한대 뮤타입, RAISE A SUILEN', ja: '夢限大みゅーたいぷ, RAISE A SUILEN' },
    venue: { ko: '블루스퀘어 우리 WON 뱅킹홀', ja: 'BLUESQUARE Woori WON Banking Hall' },
    url: 'https://bang-dream.com/events/kimuchikura-anisama-seoul-2027/',
  },
  {
    date: '2026-11-21',
    image: 'wonderlivet26.webp',
    bands: ['mygo', 'roselia'],
    type: 'festival',
    title: { ko: 'WONDERLIVET 2026', ja: 'WONDERLIVET 2026' },
    detail: { ko: 'MyGO!!!!!, Roselia', ja: 'MyGO!!!!!・Roselia' },
    venue: { ko: '킨텍스 제2전시장 7·8·9·10홀', ja: 'KINTEX 第2展示場 7・8・9・10ホール' },
    url: 'https://bang-dream.com/events/wonderlivet-2026/',
  },
  {
    date: '2026-08-08',
    image: 'kimchikura26.webp',
    bands: ['morfonica'],
    type: 'festival',
    title: { ko: 'KIMCHIKURA Fes 26', ja: 'KIMCHIKURA Fes 26' },
    detail: { ko: 'Morfonica, 센고쿠 유노', ja: 'Morfonica・千石 ユノ' },
    venue: { ko: '경희대학교 평화의 전당', ja: 'KYUNG HEE UNIV. Grand Peace Palace' },
    url: 'https://bang-dream.com/events/kimchikura-fes-26/',
  },
  {
    date: '2025-12-24',
    image: 'roselia25.webp',
    bands: ['roselia'],
    type: 'solo',
    title: { ko: 'Roselia ASIA TOUR 「Neuweltfahrt」', ja: 'Roselia ASIA TOUR「Neuweltfahrt」' },
    detail: { ko: 'Roselia', ja: 'Roselia' },
    venue: { ko: '고려대학교 화정체육관', ja: 'KOREA UNIV. TIGER DOME' },
    url: 'https://bang-dream.com/neuweltfahrt-seoul/',
  },
];

const response = await fetch('./data/bands.json?v=20261006-1');
if (!response.ok) throw new Error(t('data.loadError', { file: 'bands.json' }));
const bands = (await response.json()).filter((band) => band.id !== 'others');

function renderBands() {
  const language = getLanguage();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const performed = new Set(events.filter((event) => event.date < today).flatMap((event) => event.bands));
  const upcoming = new Set(events.filter((event) => event.date >= today).flatMap((event) => event.bands));
  const groups = [
    { label: { ko: '내한한 밴드', ja: '韓国公演を行ったバンド' }, bands: bands.filter((band) => performed.has(band.id)) },
    { label: { ko: '내한 예정 밴드', ja: '韓国公演予定のバンド' }, bands: bands.filter((band) => !performed.has(band.id) && upcoming.has(band.id)) },
    { label: { ko: '아직 내한하지 않은 밴드', ja: 'まだ韓国公演を行っていないバンド' }, bands: bands.filter((band) => !performed.has(band.id) && !upcoming.has(band.id)), unvisited: true },
  ];
  const container = document.querySelector('#live-bands');
  container.replaceChildren(...groups.filter((group) => group.bands.length).map((group) => {
    const section = document.createElement('section');
    section.className = 'live-band-group';
    if (group.unvisited) section.classList.add('is-unvisited');
    const heading = document.createElement('h3');
    heading.textContent = group.label[language];
    const list = document.createElement('ul');
    list.className = 'live-band-grid';
    for (const band of group.bands) {
      const item = document.createElement('li');
      const logo = document.createElement('img');
      logo.src = `./assets/images/bands_big/${band.logo}`;
      logo.alt = language === 'ja' ? band.nameJa : band.name;
      item.append(logo);
      list.append(item);
    }
    section.append(heading, list);
    return section;
  }));
}

function renderEvents() {
  const language = getLanguage();
  const list = document.querySelector('#live-events');
  list.replaceChildren(...events.map((event) => {
    const link = document.createElement('a');
    link.className = 'live-event';
    link.href = event.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const imageWrap = document.createElement('div');
    imageWrap.className = 'live-event-image-wrap';
    const image = document.createElement('img');
    image.className = 'live-event-image';
    image.src = `./assets/images/live/${event.image}`;
    image.alt = '';
    image.loading = 'lazy';
    imageWrap.append(image);
    const time = document.createElement('time');
    time.dateTime = event.date;
    time.textContent = event.date.replaceAll('-', '.');

    const info = document.createElement('div');
    info.className = 'live-event-info';
    const tag = document.createElement('span');
    tag.className = 'live-tag';
    tag.textContent = t(`live.${event.type}`);
    const title = document.createElement('h3');
    title.textContent = event.title[language];
    const detail = document.createElement('p');
    detail.textContent = event.detail[language];
    const venue = document.createElement('p');
    venue.textContent = event.venue[language];
    info.append(tag, title, time, detail, venue);
    link.append(imageWrap, info);
    return link;
  }));
}

renderEvents();
renderBands();
document.addEventListener('app-language-change', () => { renderEvents(); renderBands(); });
