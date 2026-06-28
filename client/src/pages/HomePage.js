import React, { useState, useEffect } from 'react';
import { Gamepad2, Monitor, Users, ArrowRight, ArrowLeft, TrendingUp, Clock,
         Star, ChevronRight, Award, Zap, Search, Calendar } from 'lucide-react';
import PreferencesForm from '../components/PreferencesForm';
import GameCard from '../components/GameCard';
import { fetchRecommendations, fetchPopularGames, fetchTrendingGames,
         fetchRecentGames, fetchTopRatedGames } from '../utils/api';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/* ── Mini card image ── */
function MiniCardImg({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src || failed) return (
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#EEF2FF,#F3F4F6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:'1.6rem', opacity:0.25 }}>🎮</span>
    </div>
  );
  return (
    <>
      {!loaded && <div style={{ position:'absolute', inset:0, background:'var(--surface2)' }}/>}
      <img src={src} alt={alt} loading="lazy"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:loaded?1:0, transition:'opacity .2s' }}
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/>
    </>
  );
}

/* ── Mini card ── */
function MiniCard({ game, onClick, showRank, rank }) {
  const { t } = useLang();
  const pcClass = { low:'tag-pc-low', medium:'tag-pc-med', high:'tag-pc-hi' }[game.pcRequirements] || 'tag-pc-med';
  const genreLabel = g => t.genres?.[g] || g;
  return (
    <div className="game-card" onClick={() => onClick?.(game)} style={{ cursor:'pointer' }}>
      <div className="gc-img" style={{ aspectRatio:'16/7' }}>
        <MiniCardImg src={game.coverImage} alt={game.name}/>
        <div className="gc-img-gradient"/>
        {showRank && <div className="gc-rank">{rank}</div>}
      </div>
      <div className="gc-body" style={{ padding:'0.85rem 1rem', gap:'0.4rem' }}>
        <div className="gc-title" style={{ fontSize:'0.875rem' }}>{game.name}</div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginBottom:'0.2rem' }}>
          {game.developer} · {game.releaseYear}
        </div>
        <div className="gc-tags">
          {game.genre.slice(0,1).map(g => <span key={g} className="tag tag-genre">{genreLabel(g)}</span>)}
          <span className={`tag ${pcClass}`} style={{ fontSize:'0.65rem' }}>
            {{ low:t.card.pc_low, medium:t.card.pc_med, high:t.card.pc_hi }[game.pcRequirements]}
          </span>
          <span className={`tag ${game.coop?'tag-coop':'tag-solo'}`} style={{ fontSize:'0.65rem' }}>
            {game.coop ? t.card.coop : t.card.solo}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Daily pick card ── */
function DailyPick({ game, onClick, t }) {
  if (!game) return null;
  const genreLabel = g => t.genres?.[g] || g;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
      borderRadius: 'var(--r-lg)', overflow:'hidden', cursor:'pointer',
      display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:220,
      boxShadow:'var(--sh-lg)', marginBottom:'0.5rem',
    }} onClick={() => onClick(game)}>
      {/* Left: info */}
      <div style={{ padding:'2rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.15)', borderRadius:100, padding:'0.25rem 0.75rem', fontSize:'0.7rem', fontWeight:700, color:'#fff', letterSpacing:'0.06em', marginBottom:'1rem' }}>
            <Star size={10}/> {t.hero.daily_pick || 'GAME OF THE DAY'}
          </div>
          <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(1.3rem,2.5vw,2rem)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:'0.5rem', lineHeight:1.2 }}>
            {game.name}
          </h2>
          <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.65)', lineHeight:1.6, marginBottom:'1rem' }}>
            {game.shortDescription}
          </p>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {game.genre.slice(0,2).map(g => (
              <span key={g} style={{ background:'rgba(255,255,255,0.15)', color:'#fff', padding:'0.2rem 0.6rem', borderRadius:100, fontSize:'0.7rem', fontWeight:600 }}>
                {genreLabel(g)}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'1.25rem' }}>
          {game.steamLink && (
            <a href={game.steamLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <button style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'0.45rem 1rem', borderRadius:'var(--r-sm)', fontSize:'0.8rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                Steam ↗
              </button>
            </a>
          )}
          <button onClick={() => onClick(game)} style={{ background:'#fff', border:'none', color:'#1e3a5f', padding:'0.45rem 1rem', borderRadius:'var(--r-sm)', fontSize:'0.8rem', fontWeight:700, cursor:'pointer' }}>
            Details →
          </button>
        </div>
      </div>
      {/* Right: cover image */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        {game.coverImage
          ? <img src={game.coverImage} alt={game.name} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.7 }} onError={e => e.target.style.opacity=0}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem', opacity:0.3 }}>🎮</div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, #1e3a5f 0%, transparent 50%)' }}/>
      </div>
    </div>
  );
}

/* ── Section row ── */
function GameRow({ title, icon, games, onGame, onViewAll, viewAllLabel, showRanks }) {
  if (!games?.length) return null;
  return (
    <section style={{ marginBottom:'2.5rem' }}>
      <div className="section-header">
        <span className="section-title" style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
          {icon}{title}
        </span>
        <button onClick={onViewAll} style={{ display:'flex', alignItems:'center', gap:'0.3rem', font:'600 0.8rem var(--font-body)', color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}>
          {viewAllLabel} <ChevronRight size={13}/>
        </button>
      </div>
      <div className="card-row">
        {games.slice(0,4).map((g, i) => (
          <MiniCard key={g.id} game={g} onClick={onGame} showRank={showRanks} rank={i+1}/>
        ))}
      </div>
    </section>
  );
}

/* ── Genre quick-filter strip ── */
function GenreStrip({ onGenre, t }) {
  const genres = [
    { key:'Action', icon:'⚔️' }, { key:'RPG', icon:'🧙' }, { key:'Co-op', icon:'👥' },
    { key:'Horror', icon:'👻' }, { key:'Strategy', icon:'♟️' }, { key:'Roguelike', icon:'🎲' },
    { key:'Simulation', icon:'🏗️' }, { key:'Survival', icon:'🏕️' }, { key:'Indie', icon:'💎' },
    { key:'FPS', icon:'🎯' }, { key:'Puzzle', icon:'🧩' }, { key:'Platformer', icon:'🕹️' },
  ];
  return (
    <div style={{ padding:'0 2rem', maxWidth:1400, margin:'0 auto 2rem' }}>
      <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.85rem' }}>
        {t.hero.browse_by_genre || 'Browse by genre'}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
        {genres.map(({ key, icon }) => (
          <button key={key} onClick={() => onGenre(key)}
            style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.45rem 1rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:100, fontSize:'0.82rem', fontWeight:600, color:'var(--text-2)', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; e.currentTarget.style.background='var(--surface)'; }}
          >
            <span>{icon}</span> {t.genres?.[key] || key}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Stats bar ── */
function StatsBar({ t }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${BASE}/api/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const items = [
    { n: stats?.totalGames || '220+', l: t.hero.stat_games },
    { n: '<20s',                       l: t.hero.stat_time  },
    { n: stats?.coopGames ? `${stats.coopGames}+` : '120+', l: t.hero.stat_coop || 'Co-op games' },
    { n: t.hero.stat_free,             l: '' },
  ];

  return (
    <div className="hero-stats">
      {items.map((item, i) => (
        <div key={i}>
          <div className="hero-stat-n">{item.n}</div>
          {item.l && <div className="hero-stat-l">{item.l}</div>}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function HomePage({ navigate }) {
  const { t } = useLang();
  const [step,    setStep]    = useState('hero');
  const [results, setResults] = useState([]);
  const [prefs,   setPrefs]   = useState(null);
  const [error,   setError]   = useState('');
  const [filterGenre, setFilterGenre] = useState(null);

  const [popular,   setPopular]   = useState([]);
  const [trending,  setTrending]  = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [topRated,  setTopRated]  = useState([]);
  const [dailyGame, setDailyGame] = useState(null);

  usePageTitle(step === 'results' ? t.results.title : null);

  useEffect(() => {
    fetchPopularGames().then(setPopular).catch(()=>{});
    fetchTrendingGames().then(setTrending).catch(()=>{});
    fetchRecentGames().then(setRecent).catch(()=>{});
    fetchTopRatedGames().then(setTopRated).catch(()=>{});
    fetch(`${BASE}/api/games/daily`).then(r=>r.json()).then(setDailyGame).catch(()=>{});
  }, []);

  const handleSubmit = async (formPrefs) => {
    setPrefs(formPrefs); setStep('loading'); setError('');
    try { setResults(await fetchRecommendations(formPrefs)); setStep('results'); }
    catch { setError(t.common.error_server); setStep('form'); }
  };

  const handleGenre = (genre) => {
    setFilterGenre(genre);
    navigate('browse');
  };

  /* ── Hero ── */
  if (step === 'hero') return (
    <>
      <section className="hero">
        <div className="hero-eyebrow"><Gamepad2 size={12}/> {t.hero.badge}</div>
        <h1>{t.hero.title1} <span className="accent">{t.hero.title2}</span></h1>
        <p className="hero-sub">{t.hero.sub}</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setStep('form')}>
            <Gamepad2 size={15}/> {t.hero.cta_find}
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('browse')}>
            <Search size={15}/> {t.hero.cta_browse}
          </button>
          <button className="btn btn-muted btn-lg" onClick={() => navigate('bored')}>
            <Zap size={15}/> {t.hero.cta_bored}
          </button>
        </div>
        <StatsBar t={t}/>
      </section>

      {/* Feature bar */}
      <div className="feature-bar">
        <div className="feature-bar-inner">
          {[[Monitor,t.hero.feat1_title,t.hero.feat1_desc],[Users,t.hero.feat2_title,t.hero.feat2_desc],[Gamepad2,t.hero.feat3_title,t.hero.feat3_desc]].map(([Icon,title,desc]) => (
            <div className="feature-item" key={title}>
              <div className="feature-icon"><Icon size={16}/></div>
              <div><div className="feature-title">{title}</div><div className="feature-desc">{desc}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingTop:'2rem' }}>
        {/* Daily Pick */}
        {dailyGame && (
          <div style={{ padding:'0 2rem', maxWidth:1400, margin:'0 auto 2.5rem' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.85rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <Calendar size={12}/> {t.hero.daily_pick || 'Game of the Day'}
            </div>
            <DailyPick game={dailyGame} onClick={g => navigate('game',{id:g.id})} t={t}/>
          </div>
        )}

        {/* Genre strip */}
        <GenreStrip onGenre={handleGenre} t={t}/>

        {/* Game rows */}
        <GameRow title={t.hero.popular_title}  icon={<Star size={14}/>}       games={popular}  onGame={g=>navigate('game',{id:g.id})} onViewAll={()=>navigate('browse')} viewAllLabel={t.hero.view_all} showRanks/>
        <GameRow title={t.hero.trending_title} icon={<TrendingUp size={14}/>} games={trending} onGame={g=>navigate('game',{id:g.id})} onViewAll={()=>navigate('browse')} viewAllLabel={t.hero.view_all}/>
        <GameRow title={t.hero.top_rated_title}icon={<Award size={14}/>}      games={topRated} onGame={g=>navigate('game',{id:g.id})} onViewAll={()=>navigate('browse')} viewAllLabel={t.hero.view_all} showRanks/>
        <GameRow title={t.hero.recent_title}   icon={<Clock size={14}/>}      games={recent}   onGame={g=>navigate('game',{id:g.id})} onViewAll={()=>navigate('browse')} viewAllLabel={t.hero.view_all}/>

        {/* CTA banner */}
        <div style={{ padding:'0 2rem', maxWidth:1400, margin:'0 auto 3rem' }}>
          <div style={{ background:'var(--primary-light)', border:'1px solid var(--primary-mid)', borderRadius:'var(--r-lg)', padding:'2rem 2.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
            <div>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.2rem', fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:'0.35rem' }}>
                {t.hero.friends_cta_title || 'Playing with friends tonight?'}
              </div>
              <p style={{ fontSize:'0.875rem', color:'var(--text-3)', maxWidth:480 }}>
                {t.hero.friends_cta_desc || 'Create a room, everyone adds their preferences, and you instantly get games you all agree on.'}
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('room-landing')}>
              <Users size={15}/> {t.nav.friends}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Form ── */
  if (step === 'form') return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={() => setStep('hero')}><ArrowLeft size={14}/> {t.common.back}</button>
        <h2 className="form-page-title">{t.form.title}</h2>
        <p className="form-page-sub">{t.form.sub}</p>
        {error && <div className="alert alert-error" style={{marginTop:'1rem'}}>{error}</div>}
      </div>
      <PreferencesForm onSubmit={handleSubmit}/>
    </div>
  );

  /* ── Loading ── */
  if (step === 'loading') return (
    <div className="loading-wrap"><div className="spinner"/><div className="loading-text">{t.common.loading}</div></div>
  );

  /* ── Results ── */
  if (step === 'results') return (
    <div>
      <div className="results-header">
        <div>
          <div className="results-header-title">{t.results.title}</div>
          <div className="results-header-sub">{t.results.sub(results.length)}</div>
        </div>
        <div className="results-chips">
          <span className="result-chip">{prefs?.withFriends?<Users size={11}/>:<Monitor size={11}/>}{prefs?.withFriends?`${prefs.players}p`:t.form.style_solo}</span>
          <span className="result-chip"><Monitor size={11}/> {prefs?.pcLevel}</span>
          {prefs?.genres?.length > 0 && <span className="result-chip">{prefs.genres.slice(0,2).map(g=>t.genres?.[g]||g).join(', ')}{prefs.genres.length>2?` +${prefs.genres.length-2}`:''}</span>}
          <button className="btn btn-muted btn-sm" onClick={() => setStep('form')}>{t.results.adjust}</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Gamepad2 size={36}/></div>
          <p className="empty-text">{t.results.no_results}<br/>{t.results.no_results_hint}</p>
          <button className="btn btn-secondary" onClick={() => setStep('form')}>{t.results.adjust}</button>
        </div>
      ) : (
        <>
          <div className="results-grid">
            {results.map((game,i) => <GameCard key={game.id} game={game} rank={i+1} onClick={() => navigate('game',{id:game.id})}/>)}
          </div>
          <div className="results-actions">
            <button className="btn btn-secondary" onClick={() => setStep('form')}><ArrowLeft size={14}/> {t.results.adjust}</button>
            <button className="btn btn-primary" onClick={() => navigate('room-landing')}><Users size={14}/> {t.results.group_cta}</button>
          </div>
        </>
      )}
    </div>
  );

  return null;
}
