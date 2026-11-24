const messages = {
  ko: {
    'live.festival': '페스티벌',
    'live.solo': '단독 공연',
    'layout.loadError': '공통 화면을 불러오지 못했습니다.',
    'data.loadError': '데이터를 불러오지 못했습니다: {file}',
    'birthday.loadError': '캐릭터 데이터를 불러오지 못했습니다.',
    'export.imageError': '이미지 파일을 불러오지 못했습니다.',
    'export.fontFileError': '글꼴 파일을 불러오지 못했습니다.',
    'export.fontUrlError': 'Pretendard JP Variable 폰트 주소를 찾지 못했습니다.',
    'export.fontLoadError': 'Pretendard JP Variable 폰트 정보를 불러오지 못했습니다.',
    'export.fontFaceError': 'Pretendard JP Variable 폰트 정의를 찾지 못했습니다.',
    'export.previewError': '이미지 미리보기를 찾지 못했습니다. 선택 항목을 확인해 주세요.',
    'export.canvasError': '이미지 캔버스를 만들 수 없습니다.',
    'export.pngError': 'PNG 이미지를 만들 수 없습니다.',
    'common.bandLogo': '{name} 로고',
    'language.toJapanese': '일본어로 전환',
    'language.toKorean': '한국어로 전환',
    'birthday.label': '생일',
    'notice.label': '공지',
    'birthday.today': '오늘은 {names}의 생일이에요!',
    'birthday.next': '{month}월 {day}일은 {names}의 생일입니다!',
    'notice.profileUpdate': '26.11.23. 내한 공연 목록이 추가되었습니다!',
    'filter.allBands': '전체 밴드',
    'filter.others': '그 외',
    'pick.rosterAll': '모든 캐릭터',
    'pick.bestSubtitle': '최애 9명을 골라보세요. (현재 {count}/9명 선택됨)',
    'pick.bandSubtitle': '선택한 밴드 안에서 최애를 골라보세요.',
    'pick.coupleSubtitle': '두 캐릭터를 순서대로 선택하세요. (현재 {count}/{limit}쌍 선택됨){pending}',
    'pick.pending': ' · 한 명 선택됨',
    'pick.deleteConfirm': '선택한 최애를 모두 지울까요?',
    'pick.bestLimit': '베스트 9은 최대 9명까지 선택할 수 있어요.',
    'pick.coupleRemove': '삭제',
    'pick.rankLabel': '{name} 순위',
    'pick.rank': '{rank}위',
    'pick.selection': '선택',
    'pick.selected': '선택됨',
    'pick.saveError': '이미지를 저장하지 못했습니다.',
    'poster.defaultOwner': '신입 스태프',
    'poster.allTitle': '의 베스트 9',
    'poster.bandTitle': '의 밴드별 최애',
    'poster.coupleTitle': '의 최애커플',
    'poster.footer': '비공식 팬사이트 방픽!에서 생성되었습니다.',
    'poster.rank': '{rank}위',
    'songs.rosterAll': '전체',
    'songs.count': '{count}곡',
    'songs.deleteConfirm': '선택한 최애곡을 모두 지울까요?',
    'songs.bestLimit': '최애곡은 최대 9곡까지 선택할 수 있어요.',
    'songs.bestTitle': '의 최애곡 베스트 9',
    'songs.bandTitle': '의 밴드별 최애곡',
    'songs.saveError': '이미지를 저장하지 못했습니다.',
    'songs.empty': '미선택',
    'profile.defaultName': '나',
    'profile.saveError': '프로필 이미지를 저장하지 못했습니다.',
  },
  ja: {
    'live.bands': 'バンド別韓国公演状況',
    'home.liveTitle': '韓国公演', 'home.liveDescription': 'BanG Dream! 韓国公演', 'home.liveAction': '公演一覧を見る',
    'live.title': '韓国公演', 'live.description': '韓国で開催された BanG Dream! バンドのライブを集めました。', 'live.list': '韓国公演一覧', 'live.source': '公式案内を見る ↗', 'live.festival': 'フェス出演', 'live.solo': '単独公演',

    'meta.homeTitle': '방픽!', 'meta.pickTitle': '推しキャラ | 방픽!', 'meta.songsTitle': '推し曲 | 방픽!', 'meta.profileTitle': 'プロフィールカード | 방픽!', 'meta.profileDescription': 'BanG Dream!のプロフィールカードを作ろう！',
    'home.description': '推しキャラと推し曲を自慢しよう！',
    'meta.homeDescription': 'BanG Dream!の推しキャラと推し曲を自慢しよう！',
    'meta.pickDescription': 'BanG Dream!の推しキャラを選んで共有しよう！', 'meta.songsDescription': 'BanG Dream!の推し曲を選んで共有しよう！',
    'layout.loadError': '共通レイアウトを読み込めませんでした。', 'data.loadError': 'データを読み込めませんでした：{file}',
    'birthday.loadError': 'キャラクターデータを読み込めませんでした。',
    'export.imageError': '画像ファイルを読み込めませんでした。', 'export.fontFileError': 'フォントファイルを読み込めませんでした。', 'export.fontUrlError': 'Pretendard JP VariableのフォントURLが見つかりません。',
    'export.fontLoadError': 'Pretendard JP Variableのフォント情報を読み込めませんでした。', 'export.fontFaceError': 'Pretendard JP Variableのフォント定義が見つかりません。',
    'export.previewError': 'プレビュー画像が見つかりません。選択内容を確認してください。',
    'export.canvasError': '画像キャンバスを作成できません。', 'export.pngError': 'PNG画像を作成できません。',
    'nav.home': 'ホーム', 'nav.characters': '推しキャラ', 'nav.songs': '推し曲', 'nav.profile': 'プロフィールカード',
    'nav.menu': 'メインメニュー', 'nav.homeLabel': 'BanG Pick! ホーム', 'common.backToTop': 'ページの先頭へ', 'common.bandLogo': '{name}のロゴ', 'language.toJapanese': '日本語に切り替える', 'language.toKorean': '韓国語に切り替える',
    'footer.copyright': '©BanG Dream! Project. 本サイトはBanG Dream!公式とは関係のない、非公式・非営利のファンサイトです。全ての画像の権利は原作者にあります。',
    'footer.source': '画像出典', 'footer.feedback': 'ご意見・不具合の報告',
    'home.characterTitle': '推しキャラ',
    'home.characterDescription': 'ベスト9・バンド別推しキャラ・推しカプ', 'home.characterAction': '推しキャラ表を作る',
    'home.songTitle': '推し曲', 'home.songDescription': 'ベスト9・バンド別推し曲', 'home.songAction': '推し曲表を作る',
    'home.profileTitle': 'プロフィールカード', 'home.profileDescription': 'バンドリの趣味や好きなものを共有しよう！', 'home.profileAction': 'プロフィールカードを作る',
    'birthday.label': '誕生日', 'notice.label': 'お知らせ',
    'birthday.today': '今日は{names}の誕生日です！', 'birthday.next': '{month}月{day}日は{names}の誕生日です！',
    'notice.profileUpdate': '26.11.23. 韓国公演情報が追加されました！',
    'pick.selectedHeading': '選んだキャラクター', 'common.clear': 'すべて削除', 'common.nickname': 'ニックネーム',
    'common.nicknamePlaceholder': 'ニックネームを入力', 'pick.couplesHeading': '選んだカップリング', 'pick.rankHeading': '順位を調整',
    'pick.posterLabel': '選んだキャラクター表のプレビュー', 'pick.posterEmpty': 'キャラクターを選ぶと、ここに推しキャラ表が表示されます。',
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
    'songs.posterEmpty': '曲を選ぶと、ここに推し曲表が表示されます。',
    'songs.chooseHeading': '曲を選ぶ',
    'songs.types': '推し曲表の種類', 'songs.bestTab': 'ベスト9', 'songs.bandTab': 'バンド別推し曲',
    'songs.filters': '曲を検索', 'songs.searchPlaceholder': '曲名またはバンド名で検索', 'songs.rosterAll': 'すべて',
    'songs.noResults': '検索結果がありません。', 'songs.count': '{count}曲', 'songs.deleteConfirm': '選択した曲をすべて削除しますか？',
    'songs.bestLimit': '推し曲は9曲まで選択できます。',
    'songs.bestTitle': 'の推し曲ベスト9', 'songs.bandTitle': 'のバンド別推し曲',
    'songs.saveError': '画像を保存できませんでした。', 'songs.empty': '未選択',
    'profile.previewHeading': 'プロフィールカードのプレビュー', 'profile.previewLabel': 'プロフィールカードのプレビュー', 'profile.editHeading': 'プロフィールを作成',
    'profile.favoriteBand': '推しバンド',
    'profile.saveFormat': '保存形式', 'profile.cardOnly': 'カードのみ', 'profile.withBackground': '背景あり',
    'profile.pickData': '推しキャラ・カップリング・推し曲', 'profile.pickHint': '推しキャラ・推し曲ベスト9の1位と、最初のカップリングが自動的に表示されます。',
    'profile.editPicks': '推しキャラ・カップリングを設定する →', 'profile.editSongs': '推し曲を設定する →',
    'profile.since': 'バンドリを好きになった年', 'profile.sincePlaceholder': '例: 2020',
    'profile.defaultName': 'わたし', 'profile.saveError': 'プロフィール画像を保存できませんでした。',
  },
};

let language = localStorage.getItem('bandori-language') === 'ja' ? 'ja' : 'ko';

export const getLanguage = () => language;
export const t = (key, values = {}) => (messages[language][key] || messages.ko[key] || key)
  .replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
export const bandName = (band) => language === 'ja' ? band.nameJa || band.name : band.name;
export const characterName = (character) => language === 'ja' ? character.japanese || character.name : character.name;
export const otherCharacterName = (character) => language === 'ja' ? character.name : character.japanese;

// 정적인 한국어는 HTML을 기준으로 보관하고, 동적으로 생성되는 문구는 t()를 사용한다.
const koreanDefaults = new WeakMap();

export function applyLanguage() {
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-content]')) {
    if (!koreanDefaults.has(element)) {
      koreanDefaults.set(element, {
        text: element.textContent,
        placeholder: element.getAttribute('placeholder'),
        aria: element.getAttribute('aria-label'),
        content: element.getAttribute('content'),
      });
    }
    const defaults = koreanDefaults.get(element);
    const translated = (key, original) => language === 'ja' ? messages.ja[key] ?? original : original;
    if (element.dataset.i18n) element.textContent = translated(element.dataset.i18n, defaults.text);
    for (const [datasetKey, attribute, original] of [
      ['i18nPlaceholder', 'placeholder', defaults.placeholder],
      ['i18nAria', 'aria-label', defaults.aria],
      ['i18nContent', 'content', defaults.content],
    ]) {
      if (!element.dataset[datasetKey]) continue;
      const value = translated(element.dataset[datasetKey], original);
      if (value === null) element.removeAttribute(attribute);
      else element.setAttribute(attribute, value);
    }
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
