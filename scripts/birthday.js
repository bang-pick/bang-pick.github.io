import { characterName, getLanguage, t } from './language.js?v=20261012-1';

const response = await fetch(new URL('../data/characters.json?v=20261006-1', import.meta.url));
if (!response.ok) throw new Error(t('birthday.loadError'));

const birthdays = (await response.json())
  .filter(({ birthday }) => birthday && birthday !== '00-00')
  .sort((a, b) => a.birthday.localeCompare(b.birthday));

const banner = document.querySelector('.birthday-notice');
const label = document.querySelector('#notice-type');
const text = document.querySelector('#birthday-notice-text');
let birthdayMessage = '';
const noticeKeys = ['notice.profileUpdate'];
let bannerIndex = 0;

function updateBirthdayMessage() {
  const today = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit',
  }).format(new Date()).replace('/', '-');
  const next = birthdays.find(({ birthday }) => birthday >= today) || birthdays[0];
  if (!next) return;

  const names = birthdays.filter(({ birthday }) => birthday === next.birthday).map(characterName).join(getLanguage() === 'ja' ? '・' : ' · ');
  const [month, day] = next.birthday.split('-').map(Number);
  birthdayMessage = t(next.birthday === today ? 'birthday.today' : 'birthday.next', { names, month, day });
}

function renderBanner(animate = false) {
  const update = () => {
    const showingBirthday = bannerIndex === 0;
    label.textContent = t(showingBirthday ? 'birthday.label' : 'notice.label');
    text.textContent = showingBirthday
      ? birthdayMessage
      : t(noticeKeys[bannerIndex - 1]);
    banner.classList.remove('is-changing');
  };

  if (animate) {
    banner.classList.add('is-changing');
    window.setTimeout(update, 180);
  } else {
    update();
  }
}

updateBirthdayMessage();
renderBanner();
window.setInterval(() => {
  bannerIndex = (bannerIndex + 1) % (noticeKeys.length + 1);
  renderBanner(true);
}, 3000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  updateBirthdayMessage();
  renderBanner();
});

document.addEventListener('app-language-change', () => {
  updateBirthdayMessage();
  renderBanner();
});
