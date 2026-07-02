/**
 * Run from C:\Users\drago\gamematch:
 * node fix_covers.js
 * 
 * Fixes cover images by deriving correct URL from steamLink app ID
 */
const fs = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

let fixed = 0;

const updated = games.map(g => {
  if (!g.steamLink) return g;
  
  const match = g.steamLink.match(/\/app\/(\d+)\//);
  if (!match) return g;
  
  const appId = match[1];
  const correctCover = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
  
  if (g.coverImage !== correctCover) {
    fixed++;
    console.log(`Fixed: ${g.name}`);
    console.log(`  Was: ${g.coverImage}`);
    console.log(`  Now: ${correctCover}`);
    return { ...g, coverImage: correctCover };
  }
  return g;
});

fs.writeFileSync(gamesPath, JSON.stringify(updated, null, 2));
console.log(`\n✅ Fixed ${fixed} cover images`);
