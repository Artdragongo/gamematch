const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const fetchRecommendations  = (prefs)    => req('/api/recommend', { method: 'POST', body: JSON.stringify(prefs) });
export const fetchBoredGames       = (prefs)    => req('/api/bored',     { method: 'POST', body: JSON.stringify(prefs) });
export const fetchGame             = (id)       => req(`/api/games/${id}`);
export const fetchAllGames         = ()         => req('/api/games');
export const fetchPopularGames     = ()         => req('/api/games/popular');
export const fetchTrendingGames    = ()         => req('/api/games/trending');
export const fetchTopRatedGames    = ()         => req('/api/games/top-rated');
export const fetchRecentGames      = ()         => req('/api/games/recent');
export const fetchGenres           = ()         => req('/api/genres');
export const createRoom            = ()         => req('/api/rooms', { method: 'POST' });
export const fetchRoom             = (id)       => req(`/api/rooms/${id}`);
export const joinRoom              = (id, nick, prefs) => req(`/api/rooms/${id}/join`, { method: 'POST', body: JSON.stringify({ nickname: nick, prefs }) });
export const fetchRoomRecs         = (id)       => req(`/api/rooms/${id}/recommendations`);
export const searchGames         = (q)        => req(`/api/search?q=${encodeURIComponent(q)}`);
export const compareGames        = (a, b)     => req(`/api/compare?a=${a}&b=${b}`);
export const submitFeedback      = (data)     => req('/api/feedback', { method: 'POST', body: JSON.stringify(data) });
