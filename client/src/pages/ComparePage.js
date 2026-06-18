import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, Award } from 'lucide-react';
import { searchGames } from '../utils/api';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

const PC_ORDER = { low: 1, medium: 2, high: 3 };
const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 };
const SESSION_ORDER = { '15 min': 1, '30 min': 2, '1 hour': 3, '2+ hours': 4 };

function GamePicker({ label, selected, onSelect, onClear, t }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try { const r = await searchGames(val); setResults(r); setOpen(true); }
      catch { setResults([]); }
      setLoading(false);
    }, 250);
  };

  const pick = (game) => {
    onSelect(game);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  if (selected) {
    return (
      <div>
        <div className="compare-picker-label">{label}</div>
        <div className="compare-selected-card">
          {selected.coverImage
            ? <img src={selected.coverImage} alt={selected.name} className="compare-selected-img" onError={e => e.target.style.display='none'} />
            : <div style={{ width:'100%', aspectRatio:'16/7', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'var(--text-4)' }}>🎮</div>
          }
          <div className="compare-selected-body">
            <div className="compare-selected-name">{selected.name}</div>
            <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', marginBottom:'0.65rem' }}>
              {selected.genre.slice(0,2).map(g => <span key={g} className="tag tag-genre">{g}</span>)}
            </div>
            <button className="btn btn-muted btn-sm" onClick={onClear} style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
              <X size={11} /> {t.compare.clear}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef}>
      <div className="compare-picker-label">{label}</div>
      <div className="compare-search-wrap">
        <Search size={13} style={{ position:'absolute', left:'0.65rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' }} />
        <input
          className="compare-search-input"
          placeholder={t.compare.search_ph}
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {open && (
          <div className="compare-dropdown">
            {loading && <div className="nav-search-empty">…</div>}
            {!loading && results.length === 0 && <div className="nav-search-empty">{t.search?.no_results}</div>}
            {results.map(game => (
              <div key={game.id} className="compare-dropdown-item" onClick={() => pick(game)}>
                {game.coverImage
                  ? <img src={game.coverImage} alt={game.name} className="compare-dropdown-thumb" onError={e => e.target.style.display='none'} />
                  : <div className="compare-dropdown-thumb" style={{ background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🎮</div>
                }
                <div>
                  <div className="compare-dropdown-name">{game.name}</div>
                  <div className="compare-dropdown-sub">{game.genre.slice(0,2).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontSize:'0.75rem', color:'var(--text-4)', marginTop:'0.4rem' }}>{t.compare.tip}</p>
    </div>
  );
}

function CompareRow({ label, valA, valB, betterFn }) {
  const better = betterFn ? betterFn(valA, valB) : null; // 'a' | 'b' | 'tie' | null

  return (
    <tr>
      <td>{label}</td>
      <td className={better === 'a' ? 'winner' : better === 'b' ? 'loser' : ''}>
        {better === 'a' && <span style={{ marginRight:'0.35rem' }}>★</span>}
        {Array.isArray(valA) ? valA.join(', ') : valA ?? '—'}
      </td>
      <td className={better === 'b' ? 'winner' : better === 'a' ? 'loser' : ''}>
        {better === 'b' && <span style={{ marginRight:'0.35rem' }}>★</span>}
        {Array.isArray(valB) ? valB.join(', ') : valB ?? '—'}
      </td>
    </tr>
  );
}

export default function ComparePage({ navigate }) {
  const { t, lang } = useLang();
  const [gameA, setGameA] = useState(null);
  const [gameB, setGameB] = useState(null);

  usePageTitle(t.compare?.title || 'Compare');

  const pcLabel   = g => g ? ({ low: t.card.pc_low, medium: t.card.pc_med, high: t.card.pc_hi }[g.pcRequirements] || g.pcRequirements) : null;
  const diffLabel = g => g ? ({ Easy: t.card.easy, Medium: t.card.medium, Hard: t.card.hard }[g.difficulty] || g.difficulty) : null;
  const sessLabel = g => g ? ({ '15 min': t.card.session_15, '30 min': t.card.session_30, '1 hour': t.card.session_1h, '2+ hours': t.card.session_2h }[g.averageSession] || g.averageSession) : null;
  const genreLabel = g => (t.genres?.[g]) ? t.genres[g] : g;
  const modeLabel  = g => g ? (g.coop ? t.compare.coop : t.compare.solo) : null;
  const playerStr  = g => {
    if (!g) return null;
    return g.minPlayers === g.maxPlayers ? t.card.players_single(g.minPlayers) : t.card.players_range(g.minPlayers, g.maxPlayers);
  };
  const desc = g => (lang === 'ru' && g?.shortDescriptionRu) ? g.shortDescriptionRu : g?.shortDescription;

  const lower = (a, b) => {
    if (a == null || b == null) return null;
    return a < b ? 'a' : b < a ? 'b' : 'tie';
  };
  const higher = (a, b) => {
    if (a == null || b == null) return null;
    return a > b ? 'a' : b > a ? 'b' : 'tie';
  };

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1 className="compare-title">{t.compare?.title}</h1>
        <p className="compare-sub">{t.compare?.sub}</p>
      </div>

      {/* Pickers */}
      <div className="compare-pickers">
        <GamePicker label={t.compare?.pick_a} selected={gameA} onSelect={setGameA} onClear={() => setGameA(null)} t={t} />
        <div className="compare-vs">
          <div className="compare-vs-badge">{t.compare?.vs}</div>
        </div>
        <GamePicker label={t.compare?.pick_b} selected={gameB} onSelect={setGameB} onClear={() => setGameB(null)} t={t} />
      </div>

      {/* Comparison table */}
      {gameA && gameB && (
        <div>
          {/* Descriptions */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {[gameA, gameB].map((g, i) => (
              <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1rem 1.1rem' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-3)', marginBottom:'0.4rem' }}>{g.name}</div>
                <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.6 }}>{desc(g)}</p>
              </div>
            ))}
          </div>

          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ width:'30%' }}></th>
                <th>
                  {gameA.name}
                  {gameA.steamLink && (
                    <a href={gameA.steamLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft:'0.5rem', fontSize:'0.68rem', color:'var(--primary)', textDecoration:'none' }}>
                      {t.compare.open_steam}
                    </a>
                  )}
                </th>
                <th>
                  {gameB.name}
                  {gameB.steamLink && (
                    <a href={gameB.steamLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft:'0.5rem', fontSize:'0.68rem', color:'var(--primary)', textDecoration:'none' }}>
                      {t.compare.open_steam}
                    </a>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              <CompareRow label={t.compare.players}    valA={playerStr(gameA)} valB={playerStr(gameB)} />
              <CompareRow label={t.compare.mode}       valA={modeLabel(gameA)} valB={modeLabel(gameB)}
                betterFn={(a, b) => a === t.compare.coop && b !== t.compare.coop ? 'a' : b === t.compare.coop && a !== t.compare.coop ? 'b' : null} />
              <CompareRow label={t.compare.pc}         valA={pcLabel(gameA)}   valB={pcLabel(gameB)}
                betterFn={() => lower(PC_ORDER[gameA.pcRequirements], PC_ORDER[gameB.pcRequirements])} />
              <CompareRow label={t.compare.difficulty} valA={diffLabel(gameA)} valB={diffLabel(gameB)} />
              <CompareRow label={t.compare.session}    valA={sessLabel(gameA)} valB={sessLabel(gameB)} />
              <CompareRow label={t.compare.developer}  valA={gameA.developer}  valB={gameB.developer} />
              <CompareRow label={t.compare.year}       valA={gameA.releaseYear} valB={gameB.releaseYear}
                betterFn={() => higher(gameA.releaseYear, gameB.releaseYear)} />
              <CompareRow
                label={t.compare.genres}
                valA={gameA.genre.map(genreLabel)}
                valB={gameB.genre.map(genreLabel)}
              />
            </tbody>
          </table>

          {/* CTAs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1.5rem' }}>
            {[gameA, gameB].map((g, i) => (
              <button key={i} className="btn btn-secondary" onClick={() => navigate('game', { id: g.id })} style={{ justifyContent:'center' }}>
                {t.compare.go_detail}: {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {(!gameA || !gameB) && (
        <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text-4)', fontSize:'0.9rem' }}>
          {!gameA && !gameB ? t.compare.tip : `${t.compare.tip}…`}
        </div>
      )}
    </div>
  );
}
