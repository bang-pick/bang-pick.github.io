const messages = {
  ko: {
    'meta.homeTitle': '방픽!', 'meta.pickTitle': '최애캐 | 방픽!', 'meta.songsTitle': '최애곡 | 방픽!',
    'home.description': '최애캐와 최애곡을 자랑해보세요!',
    'meta.homeDescription': 'BanG Dream! 최애캐와 최애곡을 자랑해보세요!',
    'meta.pickDescription': 'BanG Dream! 최애캐를 자랑해보세요!', 'meta.songsDescription': 'BanG Dream! 최애곡을 자랑해보세요!',
    'layout.loadError': '공통 화면을 불러오지 못했습니다.', 'data.loadError': '데이터를 불러오지 못했습니다: {file}',
    'birthday.loadError': '캐릭터 데이터를 불러오지 못했습니다.',
    'export.imageError': '이미지 파일을 불러오지 못했습니다.', 'export.fontFileError': '글꼴 파일을 불러오지 못했습니다.', 'export.fontUrlError': 'Pretendard JP Variable 폰트 주소를 찾지 못했습니다.',
    'export.fontLoadError': 'Pretendard JP Variable 폰트 정보를 불러오지 못했습니다.', 'export.fontFaceError': 'Pretendard JP Variable 폰트 정의를 찾지 못했습니다.',
    'export.previewError': '이미지 미리보기를 찾지 못했습니다. 선택 항목을 확인해 주세요.',
    'export.canvasError': '이미지 캔버스를 만들 수 없습니다.', 'export.pngError': 'PNG 이미지를 만들 수 없습니다.',
    'nav.home': '홈', 'nav.characters': '최애캐', 'nav.songs': '최애곡',
    'nav.menu': '주 메뉴', 'nav.homeLabel': '방픽 홈', 'common.backToTop': '맨 위로 가기', 'common.bandLogo': '{name} 로고', 'language.toJapanese': '일본어로 전환', 'language.toKorean': '한국어로 전환',
    'footer.copyright': '©BanG Dream! Project. 본 사이트는 BanG Dream! 공식과 관련이 없는 비공식・비영리 팬 사이트입니다.',
    'footer.source': '이미지 출처', 'footer.feedback': '건의 및 오류 제보',
    'home.characterTitle': '최애캐',
    'home.characterDescription': '베스트 9 · 밴드별 최애캐 · 최애 커플', 'home.characterAction': '최애표 만들기',
    'home.songTitle': '최애곡', 'home.songDescription': '베스트 9 · 밴드별 최애곡', 'home.songAction': '최애곡표 만들기',
    'birthday.label': '생일', 'notice.label': '공지',
    'birthday.today': '오늘은 {names}의 생일이에요!', 'birthday.next': '{month}월 {day}일은 {names}의 생일입니다!',
    'notice.songUpdate': '26.10.05. 최애곡 기능이 업데이트 되었습니다!',
    'pick.selectedHeading': '내가 고른 캐릭터', 'common.clear': '전체 삭제', 'common.nickname': '내 닉네임',
    'common.nicknamePlaceholder': '닉네임 입력', 'pick.couplesHeading': '선택한 커플링', 'pick.rankHeading': '순위 조정',
    'pick.posterLabel': '선택한 캐릭터 최애표 미리보기',
    'common.saveImage': '이미지 저장', 'pick.chooseHeading': '최애캐 고르기', 'pick.types': '최애표 종류',
    'pick.bestTab': '베스트 9', 'pick.bandTab': '밴드별 최애캐', 'pick.coupleTab': '최애 커플',
    'pick.filters': '캐릭터 필터', 'pick.searchPlaceholder': '이름으로 찾기', 'filter.bandLabel': '밴드 필터',
    'filter.allBands': '전체 밴드', 'filter.others': '그 외', 'pick.rosterAll': '모든 캐릭터', 'pick.bestSubtitle': '최애 9명을 골라보세요. (현재 {count}/9명 선택됨)',
    'pick.bandSubtitle': '선택한 밴드 안에서 최애를 골라보세요.',
    'pick.coupleSubtitle': '두 캐릭터를 순서대로 선택하세요. (현재 {count}/{limit}쌍 선택됨){pending}',
    'pick.pending': ' · 한 명 선택됨', 'pick.noResults': '찾는 캐릭터가 없어요.', 'pick.tryAnother': '다른 이름으로 검색해 보세요.',
    'pick.deleteConfirm': '선택한 최애를 모두 지울까요?', 'pick.bestLimit': '베스트 9은 최대 9명까지 선택할 수 있어요.',
    'pick.coupleRemove': '삭제', 'pick.rankLabel': '{name} 순위', 'pick.rank': '{rank}위',
    'pick.selection': '선택', 'pick.selected': '선택됨', 'pick.saveError': '이미지를 저장하지 못했습니다.',
    'poster.defaultOwner': '신입 스태프', 'poster.allTitle': '의 베스트 9', 'poster.bandTitle': '의 밴드별 최애',
    'poster.coupleTitle': '의 최애커플', 'poster.footer': '비공식 팬사이트 방픽!에서 생성되었습니다.',
    'poster.rank': '{rank}위',
    'songs.selectedHeading': '내가 고른 곡', 'songs.posterLabel': '선택한 최애곡표 미리보기',
    'songs.chooseHeading': '최애곡 고르기',
    'songs.types': '최애곡표 종류', 'songs.bestTab': '베스트 9', 'songs.bandTab': '밴드별 최애곡',
    'songs.filters': '곡 필터', 'songs.searchPlaceholder': '곡 제목 또는 밴드 검색', 'songs.rosterAll': '전체',
    'songs.noResults': '검색 결과가 없습니다.', 'songs.count': '{count}곡', 'songs.deleteConfirm': '선택한 최애곡을 모두 지울까요?',
    'songs.bestLimit': '최애곡은 최대 9곡까지 선택할 수 있어요.', 'songs.rankLabel': '{name} 순위',
    'songs.bestTitle': '의 최애곡 베스트 9', 'songs.bandTitle': '의 밴드별 최애곡',
    'songs.saveError': '이미지를 저장하지 못했습니다.', 'songs.empty': '미선택',
  },
  ja: {
    'meta.homeTitle': '방픽!', 'meta.pickTitle': '推しキャラ | 방픽!', 'meta.songsTitle': '推し曲 | 방픽!',
    'home.description': '推しキャラと推し曲を自慢しよう！',
    'meta.homeDescription': 'BanG Dream!の推しキャラと推し曲を自慢しよう！',
    'meta.pickDescription': 'BanG Dream!の推しキャラを選んで共有しよう！', 'meta.songsDescription': 'BanG Dream!の推し曲を選んで共有しよう！',
    'layout.loadError': '共通レイアウトを読み込めませんでした。', 'data.loadError': 'データを読み込めませんでした：{file}',
    'birthday.loadError': 'キャラクターデータを読み込めませんでした。',
    'export.imageError': '画像ファイルを読み込めませんでした。', 'export.fontFileError': 'フォントファイルを読み込めませんでした。', 'export.fontUrlError': 'Pretendard JP VariableのフォントURLが見つかりません。',
    'export.fontLoadError': 'Pretendard JP Variableのフォント情報を読み込めませんでした。', 'export.fontFaceError': 'Pretendard JP Variableのフォント定義が見つかりません。',
    'export.previewError': 'プレビュー画像が見つかりません。選択内容を確認してください。',
    'export.canvasError': '画像キャンバスを作成できません。', 'export.pngError': 'PNG画像を作成できません。',
    'nav.home': 'ホーム', 'nav.characters': '推しキャラ', 'nav.songs': '推し曲',
    'nav.menu': 'メインメニュー', 'nav.homeLabel': 'BanG Pick! ホーム', 'common.backToTop': 'ページの先頭へ', 'common.bandLogo': '{name}のロゴ', 'language.toJapanese': '日本語に切り替える', 'language.toKorean': '韓国語に切り替える',
    'footer.copyright': '©BanG Dream! Project. 本サイトはBanG Dream!公式とは関係のない、非公式・非営利のファンサイトです。',
    'footer.source': '画像出典', 'footer.feedback': 'ご意見・不具合の報告',
    'home.characterTitle': '推しキャラ',
    'home.characterDescription': 'ベスト9・バンド別推しキャラ・推しカプ', 'home.characterAction': '推しキャラ表を作る',
    'home.songTitle': '推し曲', 'home.songDescription': 'ベスト9・バンド別推し曲', 'home.songAction': '推し曲表を作る',
    'birthday.label': '誕生日', 'notice.label': 'お知らせ',
    'birthday.today': '今日は{names}の誕生日です！', 'birthday.next': '{month}月{day}日は{names}の誕生日です！',
    'notice.songUpdate': '26.10.05. 推し曲機能を追加しました！',
    'pick.selectedHeading': '選んだキャラクター', 'common.clear': 'すべて削除', 'common.nickname': 'ニックネーム',
    'common.nicknamePlaceholder': 'ニックネームを入力', 'pick.couplesHeading': '選んだカップリング', 'pick.rankHeading': '順位を調整',
    'pick.posterLabel': '選んだキャラクター表のプレビュー',
    'common.saveImage': '画像を保存', 'pick.chooseHeading': 'キャラクターを選ぶ', 'pick.types': '表の種類',
    'pick.bestTab': 'ベスト9', 'pick.bandTab': 'バンド別推しキャラ', 'pick.coupleTab': '推しカプ',
    'pick.filters': 'キャラクター検索', 'pick.searchPlaceholder': '名前で検索', 'filter.bandLabel': 'バンドで絞り込む',
    'filter.allBands': 'すべてのバンド', 'filter.others': 'その他', 'pick.rosterAll': '全キャラクター', 'pick.bestSubtitle': '推しを9人選んでください（現在 {count}/9人選択中）',
    'pick.bandSubtitle': '選んだバンドから推しを選んでください',
    'pick.coupleSubtitle': 'キャラクターを2人、順番に選んでください（現在 {count}/{limit}組）{pending}',
    'pick.pending': ' · 1人選択済み', 'pick.noResults': 'キャラクターが見つかりません。', 'pick.tryAnother': '別の名前で検索してください。',
    'pick.deleteConfirm': '選択したキャラクターをすべて削除しますか？', 'pick.bestLimit': 'ベスト9は9人まで選択できます。',
    'pick.coupleRemove': '削除', 'pick.rankLabel': '{name}の順位', 'pick.rank': '{rank}位',
    'pick.selection': '選択', 'pick.selected': '選択済み', 'pick.saveError': '画像を保存できませんでした。',
    'poster.defaultOwner': '新人スタッフ', 'poster.allTitle': 'のベスト9', 'poster.bandTitle': 'のバンド別推しキャラ',
    'poster.coupleTitle': 'の推しカプ', 'poster.footer': '非公式ファンサイト「BanG Pick!」で作成しました。',
    'poster.rank': '{rank}位',
    'songs.selectedHeading': '選んだ曲', 'songs.posterLabel': '選んだ推し曲表のプレビュー',
    'songs.chooseHeading': '曲を選ぶ',
    'songs.types': '推し曲表の種類', 'songs.bestTab': 'ベスト9', 'songs.bandTab': 'バンド別推し曲',
    'songs.filters': '曲を検索', 'songs.searchPlaceholder': '曲名またはバンド名で検索', 'songs.rosterAll': 'すべて',
    'songs.noResults': '検索結果がありません。', 'songs.count': '{count}曲', 'songs.deleteConfirm': '選択した曲をすべて削除しますか？',
    'songs.bestLimit': '推し曲は9曲まで選択できます。', 'songs.rankLabel': '{name}の順位',
    'songs.bestTitle': 'の推し曲ベスト9', 'songs.bandTitle': 'のバンド別推し曲',
    'songs.saveError': '画像を保存できませんでした。', 'songs.empty': '未選択',
  },
};

let language = localStorage.getItem('bandori-language') === 'ja' ? 'ja' : 'ko';

export const getLanguage = () => language;
export const t = (key, values = {}) => (messages[language][key] || messages.ko[key] || key)
  .replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
export const bandName = (band) => language === 'ja' ? band.nameJa || band.name : band.name;
export const characterName = (character) => language === 'ja' ? character.japanese || character.name : character.name;
export const otherCharacterName = (character) => language === 'ja' ? character.name : character.japanese;

export function applyLanguage() {
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-content]')) {
    if (element.dataset.i18n) element.textContent = t(element.dataset.i18n);
    if (element.dataset.i18nPlaceholder) element.placeholder = t(element.dataset.i18nPlaceholder);
    if (element.dataset.i18nAria) element.setAttribute('aria-label', t(element.dataset.i18nAria));
    if (element.dataset.i18nContent) element.content = t(element.dataset.i18nContent);
  }
  const toggle = document.querySelector('#language-toggle');
  if (toggle) {
    toggle.textContent = language === 'ko' ? '日本語' : '한국어';
    toggle.setAttribute('aria-label', t(language === 'ko' ? 'language.toJapanese' : 'language.toKorean'));
  }
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('#language-toggle')) return;
  language = language === 'ko' ? 'ja' : 'ko';
  localStorage.setItem('bandori-language', language);
  applyLanguage();
  document.dispatchEvent(new Event('app-language-change'));
});

applyLanguage();
