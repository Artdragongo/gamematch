/**
 * Run from C:\Users\drago\gamematch (project root):
 * node merge_games_3.js
 *
 * Merges new_games_3.json into server/games.json using the same
 * normalized-name matching as dedupe_games.js — so even slightly
 * differently formatted duplicates get skipped, not just exact matches.
 */
const fs   = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const newPath   = path.join(__dirname, 'new_games_3.json');

const existing = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
const incoming = JSON.parse(fs.readFileSync(newPath, 'utf8'));

function normalize(name) {
  return name.toLowerCase().replace(/[:'’\-–—.,!?®™]/g, '').replace(/\s+/g, ' ').trim();
}

const existingKeys = new Set(existing.map(g => normalize(g.name)));
const toAdd = incoming.filter(g => !existingKeys.has(normalize(g.name)));
const skipped = incoming.length - toAdd.length;

const merged = [...existing, ...toAdd].map((g, i) => ({ ...g, id: String(i + 1) }));

fs.writeFileSync(gamesPath, JSON.stringify(merged, null, 2));
console.log(`✅ Added ${toAdd.length} new games (${skipped} duplicates skipped)`);
console.log(`   Total games now: ${merged.length}`);
