/**
 * Run from C:\Users\drago\gamematch (project root):
 * node merge_games_2.js
 *
 * Merges new_games_2.json into server/games.json, skipping any
 * duplicates by name so it's safe to run more than once.
 */
const fs = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const newPath   = path.join(__dirname, 'new_games_2.json');

const existing = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
const incoming = JSON.parse(fs.readFileSync(newPath, 'utf8'));

const existingNames = new Set(existing.map(g => g.name));
const toAdd = incoming.filter(g => !existingNames.has(g.name));

const merged = [...existing, ...toAdd];
fs.writeFileSync(gamesPath, JSON.stringify(merged, null, 2));

console.log(`✅ Added ${toAdd.length} new games (${incoming.length - toAdd.length} duplicates skipped)`);
console.log(`   Total games now: ${merged.length}`);
