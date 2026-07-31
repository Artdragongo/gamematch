import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2, Search, Users, Zap, Globe, ChevronDown, BookMarked,
         Menu, X, Home, Grid3x3, GitCompare } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { searchGames } from '../utils/api';

const C = {
  primary: '#3B82F6', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  surface: '#FFFFFF', border: '#E5E9F0', text: '#0F172A', text3: '#64748B',
};

function GlobalSearch({ navigate, onNavigate }) {
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
    onNavigate?.();
  };

  return (
    <div className="nav-search-wrap" ref={wrapRef} style={{ position:'relative' }}>
      <Search size={13} className="nav-search-icon"/>
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
                ? <img src={game.coverImage} alt={game.name} className="nav-search-thumb" onError={e => e.target.style.display='none'}/>
                : <div className="nav-search-thumb" style={{ background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Gamepad2 size={14} style={{ color:'var(--text-4)' }}/>
                  </div>
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

/* ── Full-screen mobile menu — big tappable rows, real navigation
   restored for phones (previously everything just vanished below
   700px with no replacement). ── */
function MobileMenu({ open, onClose, navigate, activePage, lang, setLang, t }) {
  if (!open) return null;

  const links = [
    { key:'home',         label: t.nav.find,    Icon: Home },
    { key:'browse',       label: t.nav.browse,  Icon: Grid3x3 },
    { key:'room-landing', label: t.nav.friends, Icon: Users },
    { key:'bored',        label: t.nav.bored,   Icon: Zap },
    { key:'compare',      label: t.footer?.compare || (lang==='ru'?'Сравнение':'Compare'), Icon: GitCompare },
    { key:'list',         label: t.list?.title || (lang==='ru'?'Мой список':'My List'), Icon: BookMarked },
  ];
  const isRoomActive = activePage === 'room-landing' || activePage === 'room';

  const go = (key) => { navigate(key); onClose(); };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500, background:'#fff',
      display:'flex', flexDirection:'column', animation:'gmSlideDown 0.22s ease',
    }}>
      <style>{`@keyframes gmSlideDown { from { opacity:0; transform:translateY(-8px);} to { opacity:1; transform:translateY(0);} }`}</style>

      <div style={{ height:58, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 1.25rem', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.primary,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Gamepad2 size={16} color="#fff"/>
          </div>
          <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1rem', color:C.text }}>
            GameMatch
          </span>
        </div>
        <button onClick={onClose} style={{ background:C.primaryLight, border:'none', borderRadius:10,
          width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <X size={20} style={{ color:C.primary }}/>
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'1.25rem' }}>
        <div style={{ marginBottom:'1.5rem' }}>
          <GlobalSearch navigate={navigate} onNavigate={onClose}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'1.5rem' }}>
          {links.map(l => {
            const active = l.key === 'room-landing' ? isRoomActive : activePage === l.key;
            return (
              <button key={l.key} onClick={() => go(l.key)}
                style={{ display:'flex', alignItems:'center', gap:'0.9rem', width:'100%',
                  padding:'0.9rem 1rem', borderRadius:14, border:'none', textAlign:'left',
                  background: active ? C.primaryLight : 'transparent',
                  cursor:'pointer', fontFamily:'inherit' }}>
                <div style={{ width:38, height:38, borderRadius:10,
                  background: active ? '#fff' : 'var(--surface2)',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <l.Icon size={18} style={{ color: active ? C.primary : C.text3 }}/>
                </div>
                <span style={{ fontSize:'1rem', fontWeight:700, color: active ? C.primary : C.text }}>
                  {l.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
            color:C.text3, marginBottom:'0.6rem', paddingLeft:'0.25rem' }}>
            {t.nav.language || 'Language'}
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {[{ code:'en', label:'🇬🇧 English' }, { code:'ru', label:'🇷🇺 Русский' }].map(({ code, label }) => (
              <button key={code} onClick={() => setLang(code)}
                style={{ flex:1, padding:'0.75rem', borderRadius:12,
                  border:`1.5px solid ${lang === code ? C.primary : C.border}`,
                  background: lang === code ? C.primaryLight : '#fff',
                  color: lang === code ? C.primary : C.text,
                  fontWeight: lang === code ? 700 : 500, fontSize:'0.9rem',
                  cursor:'pointer', fontFamily:'inherit' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'1rem 1.25rem', borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
        <button onClick={() => go('home')}
          style={{ width:'100%', padding:'0.95rem', borderRadius:14, border:'none',
            background:C.primary, color:'#fff', fontWeight:700, fontSize:'0.95rem', cursor:'pointer' }}>
          {t.nav.find}
        </button>
      </div>
    </div>
  );
}

export default function Nav({ navigate, activePage }) {
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 900);
  const langRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handler = e => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (!isMobile) setMobileOpen(false); }, [isMobile]);

  const links = [
    { key:'home',         label: t.nav.find    },
    { key:'browse',       label: t.nav.browse  },
    { key:'room-landing', label: t.nav.friends },
    { key:'bored',        label: t.nav.bored   },
    { key:'compare',      label: t.footer?.compare || (lang==='ru'?'Сравнение':'Compare') },
  ];
  const isRoomActive = activePage === 'room-landing' || activePage === 'room';

  return (
    <>
      <nav className="nav">
        <button className="nav-logo" onClick={() => navigate('home')} type="button">
          <div className="nav-logo-mark">
            <Gamepad2 size={16} color="#fff"/>
          </div>
          <span className="nav-logo-text">GameMatch</span>
        </button>

        {!isMobile && (
          <div className="nav-center">
            {links.map(l => (
              <button
                key={l.key}
                type="button"
                className={`nav-link ${(l.key === 'room-landing' ? isRoomActive : activePage === l.key) ? 'active' : ''}`}
                onClick={() => navigate(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        <div className="nav-right" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {!isMobile && (
            <>
              <GlobalSearch navigate={navigate}/>

              <button
                type="button"
                className={`nav-link ${activePage === 'list' ? 'active' : ''}`}
                onClick={() => navigate('list')}
                title={t.list?.title || 'My List'}
                style={{ padding:'0.4rem 0.55rem' }}
              >
                <BookMarked size={15}/>
              </button>

              <div style={{ position:'relative' }} ref={langRef}>
                <button type="button" className="nav-lang" onClick={() => setLangOpen(o => !o)}>
                  <Globe size={13}/>
                  {lang === 'en' ? 'EN' : 'RU'}
                  <ChevronDown size={11}/>
                </button>
                {langOpen && (
                  <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0,
                    background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius:'var(--r)', boxShadow:'var(--sh-lg)',
                    overflow:'hidden', zIndex:400, minWidth:130 }}>
                    {[{code:'en',label:'🇬🇧 English'},{code:'ru',label:'🇷🇺 Русский'}].map(({code,label}) => (
                      <button key={code} type="button"
                        onClick={() => { setLang(code); setLangOpen(false); }}
                        style={{ display:'block', width:'100%', padding:'0.6rem 1rem',
                          background: lang===code ? 'var(--primary-light)' : 'transparent',
                          border:'none', textAlign:'left', fontSize:'0.85rem',
                          fontWeight: lang===code ? 700 : 500,
                          color: lang===code ? 'var(--primary)' : 'var(--text)',
                          cursor:'pointer', fontFamily:'var(--font-body)' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="button" className="nav-cta" onClick={() => navigate('home')}>
                {t.nav.find}
              </button>
            </>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              style={{ width:40, height:40, borderRadius:10, border:`1px solid ${C.border}`,
                background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
            >
              <Menu size={19} style={{ color:C.text }}/>
            </button>
          )}
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navigate={navigate}
        activePage={activePage}
        lang={lang}
        setLang={setLang}
        t={t}
      />
    </>
  );
}
