const response = await fetch(new URL('../data/characters.json?v=20261005-1', import.meta.url));
if (!response.ok) throw new Error('캐릭터 데이터를 불러오지 못했습니다.');

const birthdays = (await response.json())
  .filter(({ birthday }) => birthday && birthday !== '00-00')
  .sort((a, b) => a.birthday.localeCompare(b.birthday));

const banner = document.querySelector('.birthday-notice');
const label = document.querySelector('#notice-type');
const text = document.querySelector('#birthday-notice-text');
let birthdayMessage = '';
let showingBirthday = true;

function updateBirthdayMessage() {
  const today = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit',
  }).format(new Date()).replace('/', '-');
  const next = birthdays.find(({ birthday }) => birthday >= today) || birthdays[0];
  if (!next) return;

  const names = birthdays.filter(({ birthday }) => birthday === next.birthday).map(({ name }) => name).join(' · ');
  const [month, day] = next.birthday.split('-').map(Number);
  birthdayMessage = next.birthday === today
    ? `오늘은 ${names}의 생일이에요!`
    : `${month}월 ${day}일은 ${names}의 생일입니다!`;
}

function renderBanner(animate = false) {
  const update = () => {
    label.textContent = showingBirthday ? '생일' : '공지';
    text.textContent = showingBirthday
      ? birthdayMessage
      : '26.10.05. 최애곡 기능이 업데이트 되었습니다!';
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
  showingBirthday = !showingBirthday;
  renderBanner(true);
}, 3000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  updateBirthdayMessage();
  renderBanner();
});
