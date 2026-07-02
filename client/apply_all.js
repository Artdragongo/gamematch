/**
 * Run from C:\Users\drago\gamematch\client:
 * node apply_all.js
 *
 * Adds all missing translation keys and api exports in one shot
 */
const fs   = require('fs');
const path = require('path');

// ── 1. Translations ──────────────────────────────────────────
const tPath = path.join(__dirname, 'src', 'i18n', 'translations.js');
let t = fs.readFileSync(tPath, 'utf8');

const enPatch = `
      daily_pick:'Game of the Day',
      browse_by_genre:'Browse by genre',
      stat_coop:'Co-op games',
      hidden_gems:'Hidden Gems',
      friends_cta_title:'Playing with friends tonight?',
      friends_cta_desc:'Create a room, everyone adds their preferences, and you instantly get games you all agree on.',`;

const ruPatch = `
      daily_pick:'Игра дня',
      browse_by_genre:'Поиск по жанрам',
      stat_coop:'Кооп-игр',
      hidden_gems:'Скрытые жемчужины',
      friends_cta_title:'Играете с друзьями сегодня?',
      friends_cta_desc:'Создайте комнату, каждый добавит предпочтения — и вы сразу получите игры, в которые согласны играть все.',`;

const enAlso = `
      also_played:'People also played',`;
const ruAlso = `
      also_played:'С этим также играют',`;

const shareEN = `
    share: {
      button: 'Share results',
      copied: 'Link copied!',
    },`;
const shareRU = `
    share: {
      button: 'Поделиться',
      copied: 'Ссылка скопирована!',
    },`;

const quickEN = `
    quickmatch: {
      title: 'Quick Match',
      sub: '2 taps to a recommendation',
      full: 'Full search',
      solo_desc: 'Just me, playing alone',
      friends_desc: 'Co-op, multiplayer or local',
    },`;
const quickRU = `
    quickmatch: {
      title: 'Быстрый подбор',
      sub: '2 нажатия — и рекомендация готова',
      full: 'Полный поиск',
      solo_desc: 'Только я, играю один',
      friends_desc: 'Кооп, мультиплеер или локально',
    },`;

const reactionsEN = `
    reactions: {
      title: 'Quick reaction',
      playing: 'Playing',
      finished: 'Finished',
      want: 'Want to play',
      not_for_me: 'Not for me',
    },`;
const reactionsRU = `
    reactions: {
      title: 'Быстрая реакция',
      playing: 'Играю',
      finished: 'Прошёл',
      want: 'Хочу сыграть',
      not_for_me: 'Не моё',
    },`;

// Apply patches only if not already present
function patch(content, marker, insertion) {
  if (content.includes(insertion.trim().slice(0, 20))) {
    console.log(`  Already has: ${insertion.trim().slice(0, 30)}...`);
    return content;
  }
  if (!content.includes(marker)) {
    console.log(`  Marker not found: ${marker}`);
    return content;
  }
  return content.replace(marker, marker + insertion);
}

t = patch(t, "view_all:'View all',",          enPatch);
t = patch(t, "view_all:'Смотреть все',",       ruPatch);
t = patch(t, "coop_mode:'Solo + Co-op',",      enAlso);
t = patch(t, "coop_mode:'Соло + кооп',",       ruAlso);

// Add share, quickmatch, reactions blocks before closing of en object
t = patch(t, "    genres: genres_en,\n  },",   shareEN + quickEN + reactionsEN);
t = patch(t, "    genres: genres_ru,\n  },",   shareRU + quickRU + reactionsRU);

fs.writeFileSync(tPath, t);
console.log('✅ translations.js patched');

// ── 2. api.js ────────────────────────────────────────────────
const aPath = path.join(__dirname, 'src', 'utils', 'api.js');
let a = fs.readFileSync(aPath, 'utf8');

const apiAdditions = [
  ["fetchTopRatedGames",  "export const fetchTopRatedGames  = ()      => req('/api/games/top-rated');\n"],
  ["fetchBoredGames",     "export const fetchBoredGames     = (prefs) => req('/api/bored', { method:'POST', body:JSON.stringify(prefs) });\n"],
  ["fetchHiddenGems",     "export const fetchHiddenGems     = ()      => req('/api/games/hidden-gems');\n"],
];

for (const [name, line] of apiAdditions) {
  if (!a.includes(name)) { a += line; console.log(`  Added: ${name}`); }
  else console.log(`  Already has: ${name}`);
}
fs.writeFileSync(aPath, a);
console.log('✅ api.js patched');

console.log('\n🎉 All done! Now run:');
console.log('   cd ..');
console.log('   git add server/index.js client/src/pages/HomePage.js client/src/pages/GameDetailPage.js client/src/components/QuickMatch.js client/src/components/ShareButton.js client/src/components/GameReactions.js client/src/i18n/translations.js client/src/utils/api.js');
console.log('   git commit -m "Quick Match, Share button, Reactions, Hidden Gems, Also Played"');
console.log('   git push');
