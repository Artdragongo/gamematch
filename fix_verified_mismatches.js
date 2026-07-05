/**
 * Run from C:\Users\drago\gamematch (project root):
 * node fix_verified_mismatches.js
 *
 * Applies manually-verified corrections (checked against Steam's real
 * store pages via web search, not guessed) for games that were either
 * wrongly cleared (false positives from the matcher) or genuinely
 * pointing at the wrong App ID.
 */
const fs   = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

// ── Genuinely wrong App IDs — verified correct IDs below ──────
const CORRECTIONS = {
  "Neon Abyss":                              "788100",
  "Biomutant":                               "597820",
  "Street Fighter 6":                        "1364780",
  "NBA 2K24":                                "2338770",   // Note: delisted from Steam sale as of Oct 2025 — page still exists
  "Stranded Alien Dawn":                     "1324130",
  "Stranded: Alien Dawn":                    "1324130",
  "Atlas Fallen":                            "1230530",
  "We Were Here Together":                   "865360",
  "Against the Storm":                       "1336490",
  "Avowed":                                  "2457220",
  "Split Fiction":                           "2001120",
  "Schedule I":                              "3164500",
  "Pentiment":                               "1205520",
  "Expeditions: A MudRunner Game":           "2477340",
  "Vampire: The Masquerade — Swansong":      "1299510",
  "Vampire: The Masquerade - Swansong":      "1299510",
  "Vampire: The Masquerade Swansong":        "1299510",
};

// ── False positives — verify_images.js wrongly cleared these.
// They ARE correct, just Steam renamed/reformatted the product name. ──
const RESTORE_AS_IS = [
  "Hitman 3",                    // Steam renamed this to "HITMAN World of Assassination" — same app
  "GTA V Online",                // Steam renamed to "Grand Theft Auto V Legacy" — same app
  "Grand Theft Auto V Online",
  "Darkest Dungeon 2",           // Steam lists as "Darkest Dungeon® II" — Roman numeral, same app
];

let fixed = 0, restored = 0, notFound = [];

const updated = games.map(g => {
  if (CORRECTIONS[g.name]) {
    const appId = CORRECTIONS[g.name];
    fixed++;
    console.log(`✅ Fixed: ${g.name} → App ID ${appId}`);
    return {
      ...g,
      coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
      steamLink: `https://store.steampowered.com/app/${appId}/`,
    };
  }
  if (RESTORE_AS_IS.includes(g.name) && !g.coverImage && g.steamLink) {
    const m = g.steamLink.match(/\/app\/(\d+)\//);
    if (m) {
      restored++;
      console.log(`♻️  Restored: ${g.name} (was a false-positive clear)`);
      return { ...g, coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${m[1]}/header.jpg` };
    }
  }
  return g;
});

fs.writeFileSync(gamesPath, JSON.stringify(updated, null, 2));
console.log(`\n✅ Done!`);
console.log(`   Fixed with verified correct App IDs: ${fixed}`);
console.log(`   Restored false-positive clears:       ${restored}`);
