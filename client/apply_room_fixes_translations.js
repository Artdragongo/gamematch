/**
 * Run from C:\Users\drago\gamematch\client:
 * node apply_room_fixes_translations.js
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
  "delete_room:'Delete room',",
  "delete_confirm:'Delete',",
  "delete_confirm_title:'Delete this room?',",
  "delete_confirm_desc: name => `\"${name}\" and its game night history will be permanently deleted for everyone.`,",
  "edit_prefs:'Edit my picks',",
];
const ruAdditions = [
  "delete_room:'Удалить комнату',",
  "delete_confirm:'Удалить',",
  "delete_confirm_title:'Удалить эту комнату?',",
  "delete_confirm_desc: name => `«${name}» и история игровых вечеров будут удалены безвозвратно для всех.`,",
  "edit_prefs:'Изменить мой выбор',",
];

for (const line of enAdditions) t = ensureKey(t, "have_fun:'Have fun! 🎮',", line);
for (const line of ruAdditions) t = ensureKey(t, "have_fun:'Приятной игры! 🎮',", line);

fs.writeFileSync(tPath, t);
console.log('✅ Patched');
console.log('\nNow push:');
console.log('cd ..');
console.log('git add -A');
console.log('git commit -m "Fix room rejoin, add delete room, edit prefs, stop reshuffle"');
console.log('git push');
