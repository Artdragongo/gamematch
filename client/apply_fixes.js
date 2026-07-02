/**
 * Run from C:\Users\drago\gamematch\client:
 * node apply_fixes.js
 *
 * Adds all missing translation keys (Russian + English) in one pass.
 * Safe to run multiple times — skips keys that already exist.
 */
const fs   = require('fs');
const path = require('path');

const tPath = path.join(__dirname, 'src', 'i18n', 'translations.js');
let t = fs.readFileSync(tPath, 'utf8');

function ensureKey(content, afterMarker, keyLine) {
  const keyName = keyLine.trim().split(':')[0].trim();
  if (content.includes(keyName + ':')) return content; // already present
  if (!content.includes(afterMarker)) {
    console.log(`  ⚠ marker not found for ${keyName}: "${afterMarker.slice(0,40)}..."`);
    return content;
  }
  return content.replace(afterMarker, afterMarker + '\n      ' + keyLine);
}

// ── hero (EN) ──
t = ensureKey(t, "view_all:'View all',", "daily_pick:'Game of the Day',");
t = ensureKey(t, "view_all:'View all',", "browse_by_genre:'Browse by genre',");
t = ensureKey(t, "view_all:'View all',", "stat_coop:'Co-op games',");
t = ensureKey(t, "view_all:'View all',", "hidden_gems:'Hidden Gems',");
t = ensureKey(t, "view_all:'View all',", "friends_cta_title:'Playing with friends tonight?',");
t = ensureKey(t, "view_all:'View all',", "friends_cta_desc:'Create a room, everyone adds their preferences, and you instantly get games you all agree on.',");

// ── hero (RU) ──
t = ensureKey(t, "view_all:'Смотреть все',", "daily_pick:'Игра дня',");
t = ensureKey(t, "view_all:'Смотреть все',", "browse_by_genre:'Поиск по жанрам',");
t = ensureKey(t, "view_all:'Смотреть все',", "stat_coop:'Кооп-игр',");
t = ensureKey(t, "view_all:'Смотреть все',", "hidden_gems:'Скрытые жемчужины',");
t = ensureKey(t, "view_all:'Смотреть все',", "friends_cta_title:'Играете с друзьями сегодня?',");
t = ensureKey(t, "view_all:'Смотреть все',", "friends_cta_desc:'Создайте комнату, каждый добавит предпочтения — и вы сразу получите игры, в которые согласны играть все.',");

// ── detail (EN/RU) also_played + my_status ──
t = ensureKey(t, "coop_mode:'Solo + Co-op',", "also_played:'People also played',");
t = ensureKey(t, "coop_mode:'Solo + Co-op',", "my_status:'My status',");
t = ensureKey(t, "coop_mode:'Соло + кооп',",  "also_played:'С этим также играют',");
t = ensureKey(t, "coop_mode:'Соло + кооп',",  "my_status:'Мой статус',");

// ── quickmatch block (add if missing) ──
if (!t.includes('quickmatch:')) {
  t = t.replace(
    "    genres: genres_en,\n  },",
    `    quickmatch: {
      title: 'Quick Match',
      sub: '2 taps to a recommendation',
      full: 'Full search',
      solo_desc: 'Just me, playing alone',
      friends_desc: 'Co-op, multiplayer or local',
    },
    genres: genres_en,
  },`
  );
  t = t.replace(
    "    genres: genres_ru,\n  },",
    `    quickmatch: {
      title: 'Быстрый подбор',
      sub: '2 нажатия — и рекомендация готова',
      full: 'Полный поиск',
      solo_desc: 'Только я, играю один',
      friends_desc: 'Кооп, мультиплеер или локально',
    },
    genres: genres_ru,
  },`
  );
  console.log('  ✅ quickmatch block added');
} else {
  console.log('  quickmatch already exists');
}

// ── share block (add if missing) ──
if (!t.includes('share:')) {
  t = t.replace(
    "    quickmatch: {",
    `    share: {
      button: 'Share results',
      copied: 'Link copied!',
    },
    quickmatch: {`
  );
  console.log('  ✅ share block added (EN)');
}

fs.writeFileSync(tPath, t);
console.log('\n✅ translations.js fully patched');

// ── api.js additions ──
const aPath = path.join(__dirname, 'src', 'utils', 'api.js');
let a = fs.readFileSync(aPath, 'utf8');
const additions = [
  ['fetchTopRatedGames', "export const fetchTopRatedGames = () => req('/api/games/top-rated');\n"],
  ['fetchBoredGames',    "export const fetchBoredGames = (prefs) => req('/api/bored', { method:'POST', body:JSON.stringify(prefs) });\n"],
  ['fetchHiddenGems',    "export const fetchHiddenGems = () => req('/api/games/hidden-gems');\n"],
];
for (const [name, line] of additions) {
  if (!a.includes(name)) { a += line; console.log(`  ✅ api.js: added ${name}`); }
}
fs.writeFileSync(aPath, a);

console.log('\n🎉 Done! Now push:');
console.log('cd ..');
console.log('git add -A');
console.log('git commit -m "Fix genre nav, remove duplicate reactions, fix icons, complete translations"');
console.log('git push');
