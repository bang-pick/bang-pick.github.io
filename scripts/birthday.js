const response = await fetch(new URL('../data/characters.json?v=20261005-1', import.meta.url));
if (!response.ok) throw new Error('캐릭터 데이터를 불러오지 못했습니다.');

const birthdays = (await response.json())
  .filter(({ birthday }) => birthday && birthday !== '00-00')
  .sort((a, b) => a.birthday.localeCompare(b.birthday));

function renderBirthdayNotice() {
  const today = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit',
  }).format(new Date()).replace('/', '-');
  const next = birthdays.find(({ birthday }) => birthday >= today) || birthdays[0];
  if (!next) return;

  const names = birthdays.filter(({ birthday }) => birthday === next.birthday).map(({ name }) => name).join(' · ');
  const [month, day] = next.birthday.split('-').map(Number);
  document.querySelector('#birthday-notice-text').textContent = next.birthday === today
    ? `오늘은 ${names}의 생일이에요!`
    : `${month}월 ${day}일은 ${names}의 생일입니다!`;
}

renderBirthdayNotice();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) renderBirthdayNotice();
});
