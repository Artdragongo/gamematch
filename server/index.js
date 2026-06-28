const express = require('express');
const cors    = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs   = require('fs');
const path = require('path');
const https = require('https');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

const games = JSON.parse(fs.readFileSync(path.join(__dirname, 'games.json'), 'utf8'));
const rooms = {};
const screenshotCache = {}; // in-memory cache

// ─── Steam screenshot fetcher ──────────────────────────────────────────────────

function fetchSteamScreenshots(appId) {
  return new Promise((resolve) => {
    if (screenshotCache[appId]) return resolve(screenshotCache[appId]);
    
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=screenshots`;
    
    https.get(url, { headers: { 'User-Agent': 'GameMatch/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const appData = json[appId];
          if (appData?.success && appData.data?.screenshots) {
            const urls = appData.data.screenshots
              .slice(0, 6)
              .map(s => s.path_full.replace('\\/', '/'));
            screenshotCache[appId] = urls;
            resolve(urls);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreGame(game, prefs) {
  const { players, withFriends, genres, pcLevel } = prefs;
  const pcLevels = { low: 1, medium: 2, high: 3 };
  const gamePc   = pcLevels[game.pcRequirements] || 1;
  const userPc   = pcLevels[pcLevel] || 1;

  // Hard filters
  if (gamePc > userPc) return -1;
  const count = parseInt(players) || 1;
  if (count > game.maxPlayers) return -1;
  if (count < game.minPlayers) return -1;
  if (withFriends && count > 1 && !game.coop) return -1;

  // Scoring
  let score = 0;
  if (withFriends && game.coop)   score += 40;
  if (!withFriends && !game.coop) score += 15;

  if (genres && genres.length > 0) {
    const matched = genres.filter(g => game.genre.includes(g)).length;
    score += matched * 25;
    if (matched === 0) score -= 5;
  }

  if (gamePc === userPc) score += 8;
  if (gamePc < userPc)   score += 4;
  score += Math.random() * 3;
  return score;
}

function recommend(prefs, limit = 10) {
  return games
    .map(g => ({ g, score: scoreGame(g, prefs) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ g }) => g);
}

function intersect(memberPrefs) {
  return games
    .map(g => {
      let total = 0;
      for (const prefs of memberPrefs) {
        const s = scoreGame(g, prefs);
        if (s < 0) return { g, score: -1 };
        total += s;
      }
      return { g, score: total };
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ g }) => g);
}

// ─── Game Routes ──────────────────────────────────────────────────────────────

app.get('/api/games', (req, res) => res.json(games));

app.get('/api/games/popular', (req, res) => {
  const names = ['Hades', "Baldur's Gate 3", 'Helldivers 2', 'Deep Rock Galactic',
                 'Slay the Spire', 'Vampire Survivors', 'Lethal Company', 'Overcooked! 2'];
  res.json(names.map(n => games.find(g => g.name === n)).filter(Boolean));
});

app.get('/api/games/trending', (req, res) => {
  const names = ['Warhammer 40,000: Space Marine 2', 'Palworld', 'Enshrouded',
                 'Manor Lords', 'Balatro', 'Schedule I', 'Repo', 'Split Fiction'];
  res.json(names.map(n => games.find(g => g.name === n)).filter(Boolean));
});

app.get('/api/games/top-rated', (req, res) => {
  const names = ['Elden Ring', "Baldur's Gate 3", 'Hollow Knight', 'Outer Wilds',
                 'Disco Elysium', 'Hades', 'Red Dead Redemption 2', 'God of War'];
  res.json(names.map(n => games.find(g => g.name === n)).filter(Boolean));
});

app.get('/api/games/recent', (req, res) => {
  const recent = [...games]
    .filter(g => g.releaseYear >= 2024)
    .sort((a, b) => b.releaseYear - a.releaseYear || parseInt(b.id) - parseInt(a.id))
    .slice(0, 8);
  res.json(recent);
});

app.get('/api/games/:id', async (req, res) => {
  const game = games.find(g => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  
  const similar = games
    .filter(g => g.id !== game.id)
    .map(g => ({ g, score: g.genre.filter(genre => game.genre.includes(genre)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ g }) => g);

  res.json({ ...game, similar });
});

// Screenshots endpoint - fetches live from Steam
app.get('/api/games/:id/screenshots', async (req, res) => {
  const game = games.find(g => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  
  if (!game.steamLink) return res.json([]);
  
  const match = game.steamLink.match(/\/app\/(\d+)\//);
  if (!match) return res.json([]);
  
  const appId = match[1];
  const screenshots = await fetchSteamScreenshots(appId);
  res.json(screenshots);
});

app.post('/api/recommend', (req, res) => {
  const { players, withFriends, genres, pcLevel } = req.body;
  if (!pcLevel) return res.status(400).json({ error: 'pcLevel required' });
  res.json(recommend({ players, withFriends, genres, pcLevel }));
});

app.get('/api/genres', (req, res) => {
  const set = new Set();
  games.forEach(g => g.genre.forEach(genre => set.add(genre)));
  res.json([...set].sort());
});

app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json([]);
  res.json(games.filter(g =>
    g.name.toLowerCase().includes(q) ||
    g.genre.some(genre => genre.toLowerCase().includes(q))
  ).slice(0, 8));
});

app.get('/api/compare', (req, res) => {
  const { a, b } = req.query;
  const gameA = games.find(g => g.id === a);
  const gameB = games.find(g => g.id === b);
  if (!gameA || !gameB) return res.status(404).json({ error: 'Game not found' });
  res.json({ a: gameA, b: gameB });
});

app.post('/api/bored', (req, res) => {
  const { withFriends, timeAvailable, mood, pcLevel } = req.body;
  const sessionMap = { '15min':['15 min','30 min'], '30min':['30 min','1 hour'], '1h':['30 min','1 hour','2+ hours'], '2h':['1 hour','2+ hours'] };
  const allowed  = sessionMap[timeAvailable] || ['30 min','1 hour'];
  const pcLevels = { low:1, medium:2, high:3 };
  const userPc   = pcLevels[pcLevel] || 2;

  let candidates = games.filter(g => {
    if ((pcLevels[g.pcRequirements]||1) > userPc) return false;
    if (!allowed.includes(g.averageSession)) return false;
    if (withFriends && !g.coop) return false;
    if (mood==='familiar' && g.difficulty==='Hard') return false;
    if (mood==='new' && g.difficulty==='Easy') return false;
    return true;
  });
  if (!candidates.length) candidates = games.filter(g => (pcLevels[g.pcRequirements]||1) <= userPc && (!withFriends || g.coop));
  if (!candidates.length) candidates = games;
  res.json(candidates.sort(() => Math.random()-0.5).slice(0,4));
});

app.post('/api/feedback', (req, res) => {
  const { message, email } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  console.log(`[FEEDBACK] ${new Date().toISOString()} | ${email||'anonymous'}: ${message}`);
  res.json({ ok: true });
});

app.post('/api/rooms', (req, res) => {
  const id = uuidv4().slice(0,6).toUpperCase();
  rooms[id] = { id, members:[], createdAt:Date.now() };
  res.json({ roomId: id });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

app.post('/api/rooms/:id/join', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { nickname, prefs } = req.body;
  if (!nickname || !prefs) return res.status(400).json({ error: 'nickname and prefs required' });
  const idx = room.members.findIndex(m => m.nickname === nickname);
  const member = { nickname, prefs, joinedAt:Date.now() };
  if (idx >= 0) room.members[idx] = member;
  else room.members.push(member);
  res.json({ room, recommendations: intersect(room.members.map(m => m.prefs)) });
});

app.get('/api/rooms/:id/recommendations', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.members.length) return res.json([]);
  res.json(intersect(room.members.map(m => m.prefs)));
});

setInterval(() => {
  const now = Date.now();
  for (const id in rooms) if (now - rooms[id].createdAt > 3600000) delete rooms[id];
}, 3600000);

app.get('/health',     (req, res) => res.json({ ok:true, games:games.length }));
app.get('/api/health', (req, res) => res.json({ ok:true, games:games.length }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮 GameMatch API running on port ${PORT}`);
  console.log(`📦 ${games.length} games loaded\n`);
});
