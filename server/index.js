const express = require('express');
const cors    = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*', methods: ['GET','POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

const games = JSON.parse(fs.readFileSync(path.join(__dirname, 'games.json'), 'utf8'));
let rooms = loadJson('rooms.json', {});
const screenshotCache = {};

// ─── Persistence helpers ──────────────────────────────────────
function loadJson(file, def) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')); }
  catch { return def; }
}
function saveJson(file, data) {
  try { fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data)); } catch {}
}

// View tracking
let views     = loadJson('views.json',     {});
let reactions = loadJson('reactions.json', {});

function trackView(gameId) {
  const now = Date.now();
  if (!views[gameId]) views[gameId] = [];
  views[gameId].push(now);
  views[gameId] = views[gameId].filter(t => t > now - 30*24*60*60*1000);
  saveJson('views.json', views);
}

function getTopByViews(days=7, limit=8) {
  const since = Date.now() - days*24*60*60*1000;
  return games
    .map(g => ({ g, score: (views[g.id]||[]).filter(t=>t>since).length }))
    .sort((a,b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.g);
}

// ─── Steam screenshots ────────────────────────────────────────
function fetchSteamScreenshots(appId) {
  return new Promise((resolve) => {
    if (screenshotCache[appId]) return resolve(screenshotCache[appId]);
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=screenshots`;
    https.get(url, { headers: { 'User-Agent': 'GameMatch/1.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const d    = json[appId];
          if (d?.success && d.data?.screenshots) {
            const urls = d.data.screenshots.slice(0,6).map(s => s.path_full.replace('\\/','/'));
            screenshotCache[appId] = urls;
            resolve(urls);
          } else resolve([]);
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

// ─── Scoring ──────────────────────────────────────────────────
function scoreGame(game, prefs) {
  const { players, withFriends, genres, pcLevel } = prefs;
  const pcLevels = { low:1, medium:2, high:3 };
  const gamePc   = pcLevels[game.pcRequirements] || 1;
  const userPc   = pcLevels[pcLevel] || 1;
  if (gamePc > userPc) return -1;
  const count = parseInt(players) || 1;
  if (count > game.maxPlayers) return -1;
  if (count < game.minPlayers) return -1;
  if (withFriends && count > 1 && !game.coop) return -1;
  let score = 0;
  if (withFriends && game.coop)   score += 40;
  if (!withFriends && !game.coop) score += 15;
  if (genres?.length > 0) {
    const matched = genres.filter(g => game.genre.includes(g)).length;
    score += matched * 25;
    if (matched === 0) score -= 5;
  }
  if (gamePc === userPc) score += 8;
  if (gamePc <  userPc)  score += 4;
  score += Math.random() * 3;
  return score;
}

function recommend(prefs, limit=10) {
  return games.map(g=>({g,score:scoreGame(g,prefs)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.g);
}

function intersect(memberPrefs) {
  return games.map(g=>{
    let total=0;
    for(const p of memberPrefs){const s=scoreGame(g,p);if(s<0)return{g,score:-1};total+=s;}
    return{g,score:total};
  }).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score).slice(0,10).map(x=>x.g);
}

// ─── Curated fallbacks ────────────────────────────────────────
const POPULAR  = ['Hades',"Baldur's Gate 3",'Helldivers 2','Deep Rock Galactic','Slay the Spire','Vampire Survivors','Lethal Company','Overcooked! 2'];
const TRENDING = ['Warhammer 40,000: Space Marine 2','Palworld','Balatro','Schedule I','Repo','Split Fiction','Monster Hunter Wilds','Enshrouded'];
const TOP      = ['Elden Ring',"Baldur's Gate 3",'Hollow Knight','Outer Wilds','Disco Elysium','Hades','Red Dead Redemption 2','God of War'];
const HIDDEN   = ['Noita','Loop Hero','Dome Keeper','Wildermyth','We Were Here Together','Barotrauma','Hardspace: Shipbreaker','Return of the Obra Dinn','Norco','Webfishing'];

function byNames(names) { return names.map(n=>games.find(g=>g.name===n)).filter(Boolean); }

// ─── Routes ───────────────────────────────────────────────────
app.get('/api/games', (req,res) => res.json(games));

app.get('/api/games/popular', (req,res) => {
  const dyn = getTopByViews(7,8);
  res.json(dyn.length >= 4 ? dyn : byNames(POPULAR));
});

app.get('/api/games/trending', (req,res) => {
  const dyn    = getTopByViews(1,4);
  const recent = games.filter(g=>g.releaseYear>=2024).sort((a,b)=>b.releaseYear-a.releaseYear).slice(0,4);
  const combined = [...new Map([...dyn,...recent].map(g=>[g.id,g])).values()].slice(0,8);
  res.json(combined.length>=4 ? combined : byNames(TRENDING));
});

app.get('/api/games/top-rated', (req,res) => res.json(byNames(TOP)));

app.get('/api/games/hidden-gems', (req,res) => {
  // Low view count but high recommendation score variety
  const weekAgo = Date.now() - 7*24*60*60*1000;
  const lowViews = games.filter(g => ((views[g.id]||[]).filter(t=>t>weekAgo).length) < 3);
  const gems = byNames(HIDDEN).filter(g => lowViews.find(l=>l.id===g.id));
  res.json(gems.length >= 4 ? gems : byNames(HIDDEN));
});

app.get('/api/games/recent', (req,res) => {
  res.json([...games].filter(g=>g.releaseYear>=2024).sort((a,b)=>b.releaseYear-a.releaseYear||parseInt(b.id)-parseInt(a.id)).slice(0,8));
});

app.get('/api/games/daily', (req,res) => {
  const idx = Math.floor(Date.now()/(24*60*60*1000)) % games.length;
  res.json(games[idx]);
});

app.get('/api/stats', (req,res) => {
  const totalViews = Object.values(views).reduce((s,a)=>s+a.length,0);
  const weekViews  = Object.values(views).reduce((s,a)=>s+a.filter(t=>t>Date.now()-7*24*60*60*1000).length,0);
  const totalReactions = Object.values(reactions).reduce((s,r)=>s+Object.values(r).reduce((a,b)=>a+b,0),0);
  res.json({ totalGames:games.length, totalViews, weekViews, coopGames:games.filter(g=>g.coop).length, totalReactions });
});

app.get('/api/homepage', (req, res) => {
  const dynPopular  = getTopByViews(7, 8);
  const dynTrending  = getTopByViews(1, 4);
  const recent2024   = games.filter(g => g.releaseYear >= 2024).sort((a,b) => b.releaseYear - a.releaseYear).slice(0,4);
  const trendCombined = [...new Map([...dynTrending, ...recent2024].map(g => [g.id, g])).values()].slice(0,8);

  const weekAgo  = Date.now() - 7*24*60*60*1000;
  const lowViews = games.filter(g => ((views[g.id]||[]).filter(t=>t>weekAgo).length) < 3);
  const gems     = byNames(HIDDEN).filter(g => lowViews.find(l=>l.id===g.id));

  const dayIndex = Math.floor(Date.now()/(24*60*60*1000)) % games.length;

  res.json({
    popular:   dynPopular.length  >= 4 ? dynPopular  : byNames(POPULAR),
    trending:  trendCombined.length >= 4 ? trendCombined : byNames(TRENDING),
    topRated:  byNames(TOP),
    recent:    [...games].filter(g=>g.releaseYear>=2024).sort((a,b)=>b.releaseYear-a.releaseYear||parseInt(b.id)-parseInt(a.id)).slice(0,8),
    hiddenGems: gems.length >= 4 ? gems : byNames(HIDDEN),
    daily:     games[dayIndex],
    stats: {
      totalGames: games.length,
      coopGames:  games.filter(g=>g.coop).length,
    },
  });
});

app.get('/api/games/:id', (req,res) => {
  const game = games.find(g=>g.id===req.params.id);
  if(!game) return res.status(404).json({error:'Game not found'});
  trackView(req.params.id);
  const similar = games.filter(g=>g.id!==game.id).map(g=>({g,score:g.genre.filter(genre=>game.genre.includes(genre)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4).map(x=>x.g);
  // "Also played" - games viewed by people who also viewed this game (approximated by genre+mode similarity)
  const alsoPlayed = games
    .filter(g => g.id !== game.id && !similar.find(s=>s.id===g.id))
    .map(g => {
      let score = g.genre.filter(genre=>game.genre.includes(genre)).length * 2;
      if (g.coop === game.coop) score += 1;
      if (g.pcRequirements === game.pcRequirements) score += 1;
      if (Math.abs((g.releaseYear||0)-(game.releaseYear||0)) <= 3) score += 1;
      return {g, score};
    })
    .filter(x=>x.score>2)
    .sort((a,b)=>b.score-a.score)
    .slice(0,4)
    .map(x=>x.g);
  res.json({...game, similar, alsoPlayed});
});

app.get('/api/games/:id/screenshots', async (req,res) => {
  const game = games.find(g=>g.id===req.params.id);
  if(!game?.steamLink) return res.json([]);
  const m = game.steamLink.match(/\/app\/(\d+)\//);
  if(!m) return res.json([]);
  res.json(await fetchSteamScreenshots(m[1]));
});

// Reactions
app.get('/api/games/:id/reactions', (req,res) => {
  res.json(reactions[req.params.id] || {playing:0,finished:0,want:0,skip:0});
});

app.post('/api/games/:id/reactions', (req,res) => {
  const { reaction, prev } = req.body;
  const id = req.params.id;
  if (!reactions[id]) reactions[id] = {playing:0,finished:0,want:0,skip:0};
  if (prev && reactions[id][prev] > 0) reactions[id][prev]--;
  if (reaction) reactions[id][reaction] = (reactions[id][reaction]||0) + 1;
  saveJson('reactions.json', reactions);
  res.json(reactions[id]);
});

app.post('/api/recommend', (req,res) => {
  const { players, withFriends, genres, pcLevel } = req.body;
  if (!pcLevel) return res.status(400).json({error:'pcLevel required'});
  res.json(recommend({players,withFriends,genres,pcLevel}));
});

app.get('/api/genres', (req,res) => {
  const set=new Set(); games.forEach(g=>g.genre.forEach(genre=>set.add(genre))); res.json([...set].sort());
});

app.get('/api/search', (req,res) => {
  const q=(req.query.q||'').toLowerCase().trim();
  if(!q) return res.json([]);
  res.json(games.filter(g=>g.name.toLowerCase().includes(q)||g.genre.some(genre=>genre.toLowerCase().includes(q))).slice(0,8));
});

app.get('/api/compare', (req,res) => {
  const gameA=games.find(g=>g.id===req.query.a);
  const gameB=games.find(g=>g.id===req.query.b);
  if(!gameA||!gameB) return res.status(404).json({error:'Game not found'});
  res.json({a:gameA,b:gameB});
});

app.post('/api/bored', (req,res) => {
  const {withFriends,timeAvailable,mood,pcLevel}=req.body;
  const sm={'15min':['15 min','30 min'],'30min':['30 min','1 hour'],'1h':['30 min','1 hour','2+ hours'],'2h':['1 hour','2+ hours']};
  const allowed=sm[timeAvailable]||['30 min','1 hour'];
  const pcL={low:1,medium:2,high:3};
  const upc=pcL[pcLevel]||2;
  let c=games.filter(g=>(pcL[g.pcRequirements]||1)<=upc&&allowed.includes(g.averageSession)&&(!withFriends||g.coop)&&!(mood==='familiar'&&g.difficulty==='Hard')&&!(mood==='new'&&g.difficulty==='Easy'));
  if(!c.length) c=games.filter(g=>(pcL[g.pcRequirements]||1)<=upc&&(!withFriends||g.coop));
  if(!c.length) c=games;
  res.json(c.sort(()=>Math.random()-0.5).slice(0,4));
});

app.post('/api/feedback', (req,res) => {
  const{message,email}=req.body||{};
  if(!message) return res.status(400).json({error:'message required'});
  console.log(`[FEEDBACK] ${new Date().toISOString()} | ${email||'anonymous'}: ${message}`);
  res.json({ok:true});
});

function saveRooms() { saveJson('rooms.json', rooms); }

function generateRoomCode() {
  let code;
  do { code = uuidv4().slice(0,6).toUpperCase(); } while (rooms[code]);
  return code;
}

app.post('/api/rooms', (req, res) => {
  const { name } = req.body || {};
  const id = generateRoomCode();
  rooms[id] = {
    id,
    name: name?.trim().slice(0,40) || null,
    members: [],
    votes: {},         // { gameId: [nickname, nickname, ...] }
    history: [],        // [{ gameId, gameName, coverImage, decidedAt, votedBy: [] }]
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
  saveRooms();
  res.json({ roomId: id });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

// Rename a room (any member can set the name once)
app.post('/api/rooms/:id/name', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { name } = req.body;
  if (name?.trim()) room.name = name.trim().slice(0,40);
  room.lastActive = Date.now();
  saveRooms();
  res.json(room);
});

app.post('/api/rooms/:id/join', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { nickname, prefs } = req.body;
  if (!nickname || !prefs) return res.status(400).json({ error: 'nickname and prefs required' });
  const idx = room.members.findIndex(m => m.nickname === nickname);
  const member = { nickname, prefs, joinedAt: Date.now() };
  if (idx >= 0) room.members[idx] = member; else room.members.push(member);
  room.lastActive = Date.now();
  saveRooms();
  res.json({ room, recommendations: intersect(room.members.map(m => m.prefs)) });
});

app.get('/api/rooms/:id/recommendations', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.members.length) return res.json([]);
  res.json(intersect(room.members.map(m => m.prefs)));
});

// ── Voting ──────────────────────────────────────────────────
// Toggle a member's vote on a specific game
app.post('/api/rooms/:id/vote', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { gameId, nickname } = req.body;
  if (!gameId || !nickname) return res.status(400).json({ error: 'gameId and nickname required' });

  if (!room.votes[gameId]) room.votes[gameId] = [];
  const already = room.votes[gameId].includes(nickname);

  // Remove this nickname's vote from ALL games first (one vote per person)
  for (const gid in room.votes) {
    room.votes[gid] = room.votes[gid].filter(n => n !== nickname);
  }
  if (!already) room.votes[gameId].push(nickname);

  room.lastActive = Date.now();
  saveRooms();
  res.json({ votes: room.votes });
});

app.get('/api/rooms/:id/votes', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ votes: room.votes });
});

// ── Finalize tonight's pick + log to history ──────────────────
app.post('/api/rooms/:id/finalize', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { gameId, gameName, coverImage } = req.body;
  if (!gameId || !gameName) return res.status(400).json({ error: 'gameId and gameName required' });

  const votedBy = room.votes[gameId] || [];
  room.history.unshift({
    gameId, gameName, coverImage,
    decidedAt: Date.now(),
    votedBy,
  });
  room.history = room.history.slice(0, 50); // cap history length
  room.votes = {}; // reset votes for next session
  room.lastActive = Date.now();
  saveRooms();
  res.json({ history: room.history });
});

app.get('/api/rooms/:id/history', (req, res) => {
  const room = rooms[req.params.id.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room.history || []);
});

// Rooms are now PERMANENT — no more auto-delete after 1 hour.
// Optional light cleanup: purge rooms untouched for 6+ months to keep the file small.
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const id in rooms) {
    if (now - (rooms[id].lastActive || rooms[id].createdAt) > 180*24*60*60*1000) {
      delete rooms[id];
      changed = true;
    }
  }
  if (changed) saveRooms();
}, 24*60*60*1000); // check once a day


app.get('/health',     (req,res)=>res.json({ok:true,games:games.length}));
app.get('/api/health', (req,res)=>res.json({ok:true,games:games.length}));

const PORT=process.env.PORT||3001;
app.listen(PORT,'0.0.0.0',()=>console.log(`\n🎮 GameMatch on port ${PORT} | ${games.length} games\n`));
