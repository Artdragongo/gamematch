/**
 * Run from C:\Users\drago\gamematch (project root):
 * node verify_images.js
 *
 * v2 — fixes two problems from the first version:
 *
 * 1. RATE LIMITING: Steam blocks rapid sequential requests. This version
 *    waits 1.5s between requests (vs 400ms before) and retries up to
 *    3 times with backoff if a request fails, instead of giving up
 *    immediately and marking hundreds of genuinely-fine games as
 *    "unverifiable."
 *
 * 2. FALSE POSITIVES: handles Steam's own renames/reformats
 *    (e.g. "Hitman 3" -> "HITMAN World of Assassination") and Roman
 *    numeral vs digit differences (e.g. "2" vs "II") so correct games
 *    don't get their images wrongly cleared.
 *
 * Expect this to take 10-15 minutes for a ~630 game catalog. That's
 * intentional — going slower is what makes the results trustworthy.
 */
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const gamesPath = path.join(__dirname, 'server', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

// Known Steam-side renames that would otherwise look like mismatches
const KNOWN_RENAMES = {
  "hitman 3": "hitman world of assassination",
  "gta v online": "grand theft auto v legacy",
  "grand theft auto v online": "grand theft auto v legacy",
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchAppName(appId, attempt = 1) {
  return new Promise((resolve) => {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en&filters=basic`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 GameMatch/2.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', async () => {
        try {
          const json = JSON.parse(data);
          const d = json[appId];
          if (d?.success) return resolve(d.data?.name || null);
          // success:false could be rate-limiting OR a genuinely delisted app.
          // Retry a couple times before giving up.
          if (attempt < 3) {
            await sleep(2000 * attempt);
            return resolve(await fetchAppName(appId, attempt + 1));
          }
          resolve(null);
        } catch {
          if (attempt < 3) {
            await sleep(2000 * attempt);
            return resolve(await fetchAppName(appId, attempt + 1));
          }
          resolve(null);
        }
      });
    }).on('error', async () => {
      if (attempt < 3) {
        await sleep(2000 * attempt);
        return resolve(await fetchAppName(appId, attempt + 1));
      }
      resolve(null);
    });
  });
}

// Roman numeral <-> digit normalization for the common small ones
const ROMAN_MAP = { ' ii': ' 2', ' iii': ' 3', ' iv': ' 4', ' v': ' 5', ' vi': ' 6' };

function normalize(s) {
  let n = (s || '')
    .toLowerCase()
    .replace(/[:'’\-–—.,!?®™]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  for (const [roman, digit] of Object.entries(ROMAN_MAP)) {
    if (n.endsWith(roman.trim())) n = n.slice(0, -roman.trim().length).trim() + digit;
  }
  return n;
}

function namesMatch(gameName, steamName) {
  const ng = normalize(gameName);
  const ns = normalize(steamName);
  if (ng === ns) return true;
  if (ng.includes(ns) || ns.includes(ng)) return true;
  if (KNOWN_RENAMES[ng] === ns || KNOWN_RENAMES[ns] === ng) return true;
  return false;
}

(async () => {
  let checked = 0, fixed = 0, ok = 0, noLink = 0, uncertain = 0;

  for (const g of games) {
    if (!g.steamLink) { noLink++; continue; }
    const m = g.steamLink.match(/\/app\/(\d+)\//);
    if (!m) { noLink++; continue; }
    const appId = m[1];

    const steamName = await fetchAppName(appId);
    checked++;

    if (!steamName) {
      uncertain++;
      console.log(`  ⚠ Still unverifiable after retries: "${g.name}" (App ID ${appId}) — left untouched`);
    } else if (!namesMatch(g.name, steamName)) {
      console.log(`  ❌ MISMATCH: "${g.name}" → App ID ${appId} is actually "${steamName}". Clearing image.`);
      g.coverImage = null;
      fixed++;
    } else {
      g.coverImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
      ok++;
    }

    await sleep(1500); // slow and polite — this is what fixes the rate-limit problem
    if (checked % 20 === 0) console.log(`  ...checked ${checked}/${games.length} so far`);
  }

  fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
  console.log(`\n✅ Done.`);
  console.log(`   Verified OK:          ${ok}`);
  console.log(`   Fixed (real mismatch): ${fixed}`);
  console.log(`   Still uncertain:      ${uncertain}  (left as-is, safe to re-run later)`);
  console.log(`   No Steam link:        ${noLink}`);
})();
