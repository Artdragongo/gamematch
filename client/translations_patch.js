/**
 * Run from C:\Users\drago\gamematch\client:
 * node translations_patch.js
 * 
 * Adds missing translation keys for new homepage features
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'i18n', 'translations.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add missing keys to English hero section
content = content.replace(
  "view_all:'View all',",
  `view_all:'View all',
      daily_pick:'Game of the Day',
      browse_by_genre:'Browse by genre',
      stat_coop:'Co-op games',
      friends_cta_title:'Playing with friends tonight?',
      friends_cta_desc:'Create a room, everyone adds their preferences, and you instantly get games you all agree on.',`
);

// Add missing keys to Russian hero section
content = content.replace(
  "view_all:'Смотреть все',",
  `view_all:'Смотреть все',
      daily_pick:'Игра дня',
      browse_by_genre:'Поиск по жанрам',
      stat_coop:'Кооп-игр',
      friends_cta_title:'Играете с друзьями сегодня?',
      friends_cta_desc:'Создайте комнату, каждый добавит предпочтения — и вы сразу получите игры, в которые согласны играть все.',`
);

fs.writeFileSync(filePath, content);
console.log('✅ Translation keys added');
