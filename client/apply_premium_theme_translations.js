/**
 * Run from C:\Users\drago\gamematch\client:
 * node apply_premium_theme_translations.js
 */
const fs   = require('fs');
const path = require('path');

const tPath = path.join(__dirname, 'src', 'i18n', 'translations.js');
let t = fs.readFileSync(tPath, 'utf8');

function ensureKey(content, afterMarker, keyLine) {
  const keyName = keyLine.trim().split(':')[0].trim();
  if (content.includes(keyName + ':')) return content;
  if (!content.includes(afterMarker)) { console.log(`  ⚠ marker not found for ${keyName}`); return content; }
  return content.replace(afterMarker, afterMarker + '\n      ' + keyLine);
}

const enAdditions = [
  "hiw_title:'How it works',",
  "hiw1_title:'Answer questions',",
  "hiw1_desc:'Tell us your setup, mood, and squad size',",
  "hiw2_title:'We find matches',",
  "hiw2_desc:'Our engine filters games that actually fit',",
  "hiw3_title:'See your picks',",
  "hiw3_desc:'Get personalized recommendations instantly',",
  "hiw4_title:'Play & enjoy',",
  "hiw4_desc:'Find new favorites and share with friends',",
];
const ruAdditions = [
  "hiw_title:'Как это работает',",
  "hiw1_title:'Ответь на вопросы',",
  "hiw1_desc:'Расскажи о своём ПК, настроении и компании',",
  "hiw2_title:'Мы подбираем',",
  "hiw2_desc:'Алгоритм фильтрует игры, которые действительно подходят',",
  "hiw3_title:'Смотри подборку',",
  "hiw3_desc:'Получай персональные рекомендации мгновенно',",
  "hiw4_title:'Играй и наслаждайся',",
  "hiw4_desc:'Находи новые любимые игры и делись с друзьями',",
];

for (const line of enAdditions) t = ensureKey(t, "hidden_gems:'Hidden Gems',", line);
for (const line of ruAdditions) t = ensureKey(t, "hidden_gems:'Скрытые жемчужины',", line);

// New quickaccess block
if (!t.includes('quickaccess:')) {
  t = t.replace(
    "    quickmatch: {",
    `    quickaccess: {
      recent_desc: 'Recent releases',
      coop_desc: 'Play together',
      solo_desc: 'Just for you',
      gems_desc: 'Underrated picks',
    },
    quickmatch: {`
  );
}

fs.writeFileSync(tPath, t);
console.log('✅ Patched');
console.log('\nNow push:');
console.log('cd ..');
console.log('git add -A');
console.log('git commit -m "Premium SaaS homepage redesign: soft-blue theme, hero visual, how it works"');
console.log('git push');
