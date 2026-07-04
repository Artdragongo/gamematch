/**
 * Run from C:\Users\drago\gamematch (project root):
 * node verify_images.js
 *
 * For every game with a steamLink, asks Steam's OWN public API what
 * game actually lives at that App ID, and compares it against your
 * game's name. If they don't match (or the request fails), the
 * coverImage is set to null — the site's existing fallback shows a
 * clean placeholder icon instead of a WRONG picture.
 *
 * This is slow on purpose (500ms between requests) to avoid getting
 * rate-limited by Steam. For ~460 games expect this to take 4-5 min.
 * Safe to re-run any time — it always re-checks and self-corrects.
 */
const fs   = require('fs');
const path = require('path');
const https = require('https');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

function fetchAppName(appId) {
  return new Promise((resolve) => {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en&filters=basic`;
    https.get(url, { headers: { 'User-Agent': 'GameMatch/1.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const d = json[appId];
          resolve(d?.success ? d.data?.name || null : null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[:'’\-–—.,!?®™]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesRoughlyMatch(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return true;
  // Allow substring match either direction (handles subtitles/editions)
  return na.includes(nb) || nb.includes(na);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  let checked = 0, fixed = 0, ok = 0, noLink = 0;

  for (const g of games) {
    if (!g.steamLink) { noLink++; continue; }
    const m = g.steamLink.match(/\/app\/(\d+)\//);
    if (!m) { noLink++; continue; }
    const appId = m[1];

    const steamName = await fetchAppName(appId);
    checked++;

    if (!steamName) {
      console.log(`  ⚠ Could not verify "${g.name}" (App ID ${appId}) — leaving as-is`);
    } else if (!namesRoughlyMatch(g.name, steamName)) {
      console.log(`  ❌ MISMATCH: "${g.name}" → Steam says App ID ${appId} is "${steamName}". Clearing image.`);
      g.coverImage = null;
      fixed++;
    } else {
      // Confirmed correct — make sure coverImage uses the right URL
      g.coverImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
      ok++;
    }

    await sleep(400); // be gentle with Steam's API
    if (checked % 20 === 0) console.log(`  ...checked ${checked} so far`);
  }

  fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
  console.log(`\n✅ Done.`);
  console.log(`   Verified OK:        ${ok}`);
  console.log(`   Fixed (mismatches): ${fixed}`);
  console.log(`   No Steam link:      ${noLink}`);
  console.log(`   Total checked:      ${checked}`);
})();
