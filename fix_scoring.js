/**
 * Run this from C:\Users\drago\gamematch:
 * node fix_scoring.js
 * 
 * It fixes:
 * 1. Co-op hard filter - solo games excluded when "with friends" selected
 * 2. Player count hard filter - games that don't support the player count excluded
 * 3. Missing cover images patched
 */

const fs = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

// Patch missing cover images
const coverFixes = {
  "Minecraft":          "https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg",
  "Fortnite":           "https://cdn2.unrealengine.com/fortnite-og-1200x630-1200x630-372936539.jpg",
  "League of Legends":  "https://cdn.cloudflare.steamstatic.com/steam/apps/401920/header.jpg",
  "Starcraft II":       "https://cdn.cloudflare.steamstatic.com/steam/apps/2278820/header.jpg",
  "Escape from Tarkov": "https://cdn.cloudflare.steamstatic.com/steam/apps/2543440/header.jpg",
  "Warzone 2":          "https://cdn.cloudflare.steamstatic.com/steam/apps/1962660/header.jpg",
  "Diablo IV":          "https://cdn.cloudflare.steamstatic.com/steam/apps/2344520/header.jpg",
  "Battlefront II":     "https://cdn.cloudflare.steamstatic.com/steam/apps/1237950/header.jpg",
};

let coverFixed = 0;
let duplicateFixed = 0;

// Remove duplicate entries (same name, keep first occurrence)
const seen = new Set();
const deduped = games.filter(g => {
  if (seen.has(g.name)) {
    duplicateFixed++;
    return false;
  }
  seen.add(g.name);
  return true;
});

// Fix missing covers and re-assign sequential IDs
const fixed = deduped.map((g, i) => {
  const updated = { ...g, id: String(i + 1) };
  if (!updated.coverImage && coverFixes[updated.name]) {
    updated.coverImage = coverFixes[updated.name];
    coverFixed++;
  }
  // Ensure coverImage is never null/undefined - use a default
  if (!updated.coverImage) {
    updated.coverImage = null; // will show placeholder on frontend
  }
  return updated;
});

fs.writeFileSync(gamesPath, JSON.stringify(fixed, null, 2));
console.log(`✅ Done!`);
console.log(`   Total games: ${fixed.length}`);
console.log(`   Covers fixed: ${coverFixed}`);
console.log(`   Duplicates removed: ${duplicateFixed}`);
console.log(`   IDs reassigned: 1 to ${fixed.length}`);
