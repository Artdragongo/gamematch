import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2, Globe, ChevronDown, Search, BookMarked, GitCompare } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { searchGames } from '../utils/api';

function GlobalSearch({ navigate }) {
  const { t } = useLang();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = val => {
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try { const r = await searchGames(val); setResults(r); setOpen(true); }
      catch { setResults([]); }
      setLoading(false);
    }, 220);
  };

  const pick = game => {
    navigate('game', { id: game.id });
    setQuery(''); setResults([]); setOpen(false);
  };

  return (
    <div className="nav-search-wrap" ref={wrapRef}>
      <Search size={12} className="nav-search-icon" />
      <input
        className="nav-search-input"
        placeholder={t.search?.placeholder || 'Search…'}
        value={query}
        onChange={e => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <div className="nav-search-dropdown">
          {loading && <div className="nav-search-empty">…</div>}
          {!loading && results.length === 0 && <div className="nav-search-empty">{t.search?.no_results}</div>}
          {results.map(game => (
            <div key={game.id} className="nav-search-item" onClick={() => pick(game)}>
              {game.coverImage
                ? <img src={game.coverImage} alt={game.name} className="nav-search-thumb" onError={e => e.target.style.display='none'} />
                : <div className="nav-search-thumb" style={{ background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>🎮</div>
              }
              <div>
                <div className="nav-search-name">{game.name}</div>
                <div className="nav-search-sub">{game.genre.slice(0,2).join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav({ navigate, activePage }) {
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { key: 'home',         label: t.nav.find    },
    { key: 'browse',       label: t.nav.browse  },
    { key: 'room-landing', label: t.nav.friends },
    { key: 'bored',        label: t.nav.bored   },
    { key: 'compare',      label: t.footer?.compare || 'Compare' },
  ];

  const isRoomActive = activePage === 'room-landing' || activePage === 'room';

  return (
    <nav className="nav">
      <button className="nav-logo" onClick={() => navigate('home')}>
        <div className="nav-logo-mark"><Gamepad2 size={16} color="#fff" /></div>
        <span className="nav-logo-text">GameMatch</span>
      </button>

      <div className="nav-center">
        {links.map(l => (
          <button
            key={l.key}
            className={`nav-link ${(l.key === 'room-landing' ? isRoomActive : activePage === l.key) ? 'active' : ''}`}
            onClick={() => navigate(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="nav-right">
        {/* Global search */}
        <GlobalSearch navigate={navigate} />

        {/* My List */}
        <button
          className={`nav-link ${activePage === 'list' ? 'active' : ''}`}
          onClick={() => navigate('list')}
          title={t.list?.title || 'My List'}
          style={{ padding:'0.4rem 0.55rem' }}
        >
          <BookMarked size={15} />
        </button>

        {/* Language switcher */}
        <div style={{ position:'relative' }} ref={langRef}>
          <button className="nav-lang" onClick={() => setLangOpen(o => !o)}>
            <Globe size={13}/>
            {lang === 'en' ? 'EN' : 'RU'}
            <ChevronDown size={11}/>
          </button>
          {langOpen && (
            <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r)', boxShadow:'var(--sh-lg)', overflow:'hidden', zIndex:400, minWidth:130 }}>
              {[{code:'en',label:'🇬🇧 English'},{code:'ru',label:'🇷🇺 Русский'}].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setLangOpen(false); }}
                  style={{ display:'block', width:'100%', padding:'0.6rem 1rem', background: lang===code ? 'var(--primary-light)' : 'transparent', border:'none', textAlign:'left', fontSize:'0.85rem', fontWeight: lang===code ? 700 : 500, color: lang===code ? 'var(--primary)' : 'var(--text)', cursor:'pointer', fontFamily:'var(--font-body)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="nav-cta" onClick={() => navigate('home')}>{t.nav.find}</button>
      </div>
    </nav>
  );
}
