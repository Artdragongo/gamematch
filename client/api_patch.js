/**
 * Run from C:\Users\drago\gamematch\client:
 * node api_patch.js
 * 
 * Adds fetchTopRatedGames export to utils/api.js if missing
 */
const fs   = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'utils', 'api.js');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('fetchTopRatedGames')) {
  content += `\nexport const fetchTopRatedGames = () => req('/api/games/top-rated');\n`;
  fs.writeFileSync(filePath, content);
  console.log('✅ fetchTopRatedGames added to api.js');
} else {
  console.log('✅ fetchTopRatedGames already exists');
}

if (!content.includes('fetchBoredGames')) {
  content += `export const fetchBoredGames = (prefs) => req('/api/bored', { method:'POST', body:JSON.stringify(prefs) });\n`;
  fs.writeFileSync(filePath, content);
  console.log('✅ fetchBoredGames added to api.js');
} else {
  console.log('✅ fetchBoredGames already exists');
}
