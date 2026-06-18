import React, { useEffect, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { fetchAllGames } from '../utils/api';
import GameCard from '../components/GameCard';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

const GENRES = [
  'Action','Adventure','RPG','FPS','Strategy','Simulation','Puzzle',
  'Platformer','Survival','Horror','Co-op','Party','Roguelike','Sandbox',
  'Indie','Racing','Sports','Card Game','Souls-like','MOBA','Battle Royale',
];

export default function BrowsePage({ navigate }) {
  const { t } = useLang();
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [genre,   setGenre]   = useState('');
  const [pc,      setPc]      = useState('');
  const [coop,    setCoop]    = useState('');
  const [diff,    setDiff]    = useState('');

  useEffect(() => {
    fetchAllGames()
      .then(g => { setGames(g); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => games.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (genre && !g.genre.includes(genre)) return false;
    if (pc && g.pcRequirements !== pc) return false;
    if (diff && g.difficulty !== diff) return false;
    if (coop === 'coop' && !g.coop) return false;
    if (coop === 'solo' && g.coop) return false;
    return true;
  }), [games, search, genre, pc, coop, diff]);

  const hasFilters = search || genre || pc || coop || diff;
  const clearAll   = () => { setSearch(''); setGenre(''); setPc(''); setCoop(''); setDiff(''); };

  usePageTitle(t.browse.title);
  const genreLabel = g => (t.genres && t.genres[g]) ? t.genres[g] : g;

  return (
    <div>
      <div className="browse-header">
        <h2 className="browse-title">{t.browse.title}</h2>
        <p style={{color:'var(--text-3)',fontSize:'0.875rem'}}>
          {t.browse.sub(filtered.length, games.length)}
        </p>
      </div>

      <div className="browse-filters">
        <div className="filter-search">
          <Search size={13} style={{position:'absolute',left:'0.7rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',pointerEvents:'none'}}/>
          <input
            type="text"
            className="filter-input"
            placeholder={t.browse.search_ph}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">{t.browse.all_genres}</option>
          {GENRES.map(g => <option key={g} value={g}>{genreLabel(g)}</option>)}
        </select>

        <select className="filter-select" value={pc} onChange={e => setPc(e.target.value)}>
          <option value="">{t.browse.any_pc}</option>
          <option value="low">{t.form.pc_low_title}</option>
          <option value="medium">{t.form.pc_med_title}</option>
          <option value="high">{t.form.pc_hi_title}</option>
        </select>

        <select className="filter-select" value={diff} onChange={e => setDiff(e.target.value)}>
          <option value="">{t.browse.all_diff}</option>
          <option value="Easy">{t.browse.diff_easy}</option>
          <option value="Medium">{t.browse.diff_med}</option>
          <option value="Hard">{t.browse.diff_hard}</option>
        </select>

        <select className="filter-select" value={coop} onChange={e => setCoop(e.target.value)}>
          <option value="">{t.browse.any_mode}</option>
          <option value="coop">{t.browse.coop_only}</option>
          <option value="solo">{t.browse.solo_only}</option>
        </select>

        {hasFilters && (
          <button className="btn btn-muted btn-sm" onClick={clearAll} style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
            <X size={12}/> {t.browse.clear}
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner"/><div className="loading-text">{t.common.loading}</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Search size={32}/></div>
          <p className="empty-text">{t.browse.no_results}</p>
          <button className="btn btn-secondary" onClick={clearAll}>{t.browse.clear}</button>
        </div>
      ) : (
        <div className="results-grid">
          {filtered.map(game => (
            <GameCard
              key={game.id}
              game={game}
              animate={false}
              onClick={() => navigate('game',{id:game.id})}
            />
          ))}
        </div>
      )}
    </div>
  );
}
