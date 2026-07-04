/**
 * Run from C:\Users\drago\gamematch (project root):
 * node dedupe_games.js
 *
 * Removes near-duplicate games — same title with different
 * punctuation, spacing, or capitalization (e.g. "Human Fall Flat"
 * vs "Human: Fall Flat"). Keeps the FIRST occurrence, re-numbers
 * IDs sequentially afterward so nothing breaks.
 */
const fs   = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[:'’\-–—.,!?]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim();
}

const seen = new Map(); // normalized name -> first game
const kept = [];
let removed = 0;

for (const g of games) {
  const key = normalize(g.name);
  if (seen.has(key)) {
    removed++;
    console.log(`  🗑 Removing duplicate: "${g.name}" (kept "${seen.get(key).name}")`);
    continue;
  }
  seen.set(key, g);
  kept.push(g);
}

// Re-number IDs sequentially
const renumbered = kept.map((g, i) => ({ ...g, id: String(i + 1) }));

fs.writeFileSync(gamesPath, JSON.stringify(renumbered, null, 2));
console.log(`\n✅ Removed ${removed} near-duplicates`);
console.log(`   Total games now: ${renumbered.length}`);
