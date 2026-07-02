/**
 * Run from C:\Users\drago\gamematch\client:
 * node apply_room_translations.js
 *
 * Adds all new room-related translation keys (voting, history, naming).
 * Safe to run multiple times.
 */
const fs   = require('fs');
const path = require('path');

const tPath = path.join(__dirname, 'src', 'i18n', 'translations.js');
let t = fs.readFileSync(tPath, 'utf8');

function ensureKey(content, afterMarker, keyLine) {
  const keyName = keyLine.trim().split(':')[0].trim();
  if (content.includes(keyName + ':')) return content;
  if (!content.includes(afterMarker)) {
    console.log(`  ⚠ marker not found for ${keyName}`);
    return content;
  }
  return content.replace(afterMarker, afterMarker + '\n      ' + keyLine);
}

// Insert after invalid_code (EN) and invalid_code (RU) — last line of the room block in each lang
const enRoomAdditions = [
  "my_rooms:'Your Rooms',",
  "as:'as',",
  "name_ph:'Room name (optional) — e.g. \"Friday Squad\"',",
  "room_name:'Room',",
  "rename:'Rename room',",
  "invited: id => `You've been invited to room ${id}`,",
  "invited_named: name => `You've been invited to \"${name}\"`,",
  "invite_sub:'Enter your nickname and add your preferences — together you\\'ll find something to play.',",
  "vote_hint:'Vote for your favorite — most votes wins tonight',",
  "leading:'Leading',",
  "lock_in:'Lock it in',",
  "tonights_pick:'Tonight\\'s Pick',",
  "have_fun:'Have fun! 🎮',",
  "game_nights: n => `${n} Game Night${n!==1?'s':''}`,",
];

const ruRoomAdditions = [
  "my_rooms:'Ваши комнаты',",
  "as:'как',",
  "name_ph:'Название комнаты (необязательно) — напр. «Пятничная тусовка»',",
  "room_name:'Комната',",
  "rename:'Переименовать комнату',",
  "invited: id => `Вас пригласили в комнату ${id}`,",
  "invited_named: name => `Вас пригласили в «${name}»`,",
  "invite_sub:'Введите никнейм и добавьте свои предпочтения — вместе найдёте, во что поиграть.',",
  "vote_hint:'Голосуйте за любимую игру — больше всего голосов побеждает',",
  "leading:'Лидирует',",
  "lock_in:'Выбрать эту',",
  "tonights_pick:'Выбор на сегодня',",
  "have_fun:'Приятной игры! 🎮',",
  "game_nights: n => `${n} игровых вечер${n===1?'':n<5?'а':'ов'}`,",
];

for (const line of enRoomAdditions) t = ensureKey(t, "invalid_code:'Enter a valid room code.',", line);
for (const line of ruRoomAdditions) t = ensureKey(t, "invalid_code:'Введите корректный код.',", line);

// common.save (EN/RU)
t = ensureKey(t, "you:'you',", "save:'Save',");
t = ensureKey(t, "you:'вы',",  "save:'Сохранить',");

fs.writeFileSync(tPath, t);
console.log('✅ Room translations patched');
console.log('\nNow push:');
console.log('cd ..');
console.log('git add -A');
console.log('git commit -m "Friends Room: voting, persistent named rooms, game night history"');
console.log('git push');
