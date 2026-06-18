import React, { useState, useEffect } from 'react';
import { Gamepad2, Monitor, Users, ArrowRight, ArrowLeft, TrendingUp, Clock, Star, ChevronRight, Award } from 'lucide-react';
import PreferencesForm from '../components/PreferencesForm';
import GameCard from '../components/GameCard';
import { fetchRecommendations, fetchPopularGames, fetchTrendingGames, fetchRecentGames, fetchTopRatedGames } from '../utils/api';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

/* ── Mini card with real cover image + fallback ── */
function MiniCardImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#EEF2FF 0%,#F3F4F6 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'1.6rem', opacity:0.3 }}>🎮</span>
      </div>
    );
  }
  return (
    <>
      {!loaded && <div style={{ position:'absolute', inset:0, background:'var(--surface2)' }} />}
      <img src={src} alt={alt} loading="lazy"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: loaded ? 1 : 0, transition:'opacity .25s' }}
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      />
    </>
  );
}

function MiniCard({ game, onClick }) {
  const { t } = useLang();
  const pcClass = { low:'tag-pc-low', medium:'tag-pc-med', high:'tag-pc-hi' }[game.pcRequirements] || 'tag-pc-med';
  const genreLabel = g => (t.genres && t.genres[g]) ? t.genres[g] : g;
  return (
    <div className="game-card" onClick={() => onClick?.(game)} style={{ cursor: 'pointer' }}>
      <div className="gc-img" style={{ aspectRatio:'16/7' }}>
        <MiniCardImage src={game.coverImage} alt={game.name} />
        <div className="gc-img-gradient"/>
      </div>
      <div className="gc-body" style={{ padding:'0.85rem 1rem', gap:'0.4rem' }}>
        <div className="gc-title" style={{ fontSize:'0.85rem' }}>{game.name}</div>
        <div className="gc-tags">
          {game.genre.slice(0,1).map(g=><span key={g} className="tag tag-genre">{genreLabel(g)}</span>)}
          <span className={`tag ${pcClass}`} style={{fontSize:'0.65rem'}}>
            {{low:t.card.pc_low,medium:t.card.pc_med,high:t.card.pc_hi}[game.pcRequirements]}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Section row ── */
function GameRow({ title, games, onGame, onViewAll, viewAllLabel }) {
  if (!games?.length) return null;
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div className="section-header">
        <span className="section-title">{title}</span>
        <button
          onClick={onViewAll}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem', font:'600 0.8rem var(--font-body)', color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}
        >
          {viewAllLabel} <ChevronRight size={13}/>
        </button>
      </div>
      <div className="card-row">
        {games.slice(0,4).map(g => <MiniCard key={g.id} game={g} onClick={onGame} />)}
      </div>
    </section>
  );
}

export default function HomePage({ navigate }) {
  const { t } = useLang();
  const [step,    setStep]    = useState('hero');
  usePageTitle(step === 'results' ? t.results.title : null);
  const [results, setResults] = useState([]);
  const [prefs,   setPrefs]   = useState(null);
  const [error,   setError]   = useState('');

  const [popular,  setPopular]  = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    fetchPopularGames().then(setPopular).catch(()=>{});
    fetchTrendingGames().then(setTrending).catch(()=>{});
    fetchRecentGames().then(setRecent).catch(()=>{});
    fetchTopRatedGames().then(setTopRated).catch(()=>{});
  }, []);

  const handleSubmit = async (formPrefs) => {
    setPrefs(formPrefs);
    setStep('loading');
    setError('');
    try {
      const games = await fetchRecommendations(formPrefs);
      setResults(games);
      setStep('results');
    } catch {
      setError(t.common.error_server);
      setStep('form');
    }
  };

  /* ── Hero ── */
  if (step === 'hero') return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">
          <Gamepad2 size={12}/> {t.hero.badge}
        </div>
        <h1>
          {t.hero.title1} <span className="accent">{t.hero.title2}</span>
        </h1>
        <p className="hero-sub">{t.hero.sub}</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setStep('form')}>
            <Gamepad2 size={15}/> {t.hero.cta_find}
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('browse')}>
            <ArrowRight size={15}/> {t.hero.cta_browse}
          </button>
          <button className="btn btn-muted btn-lg" onClick={() => navigate('bored')}>
            {t.hero.cta_bored}
          </button>
        </div>
        <div className="hero-stats">
          {[
            [150,          t.hero.stat_games],
            ['<20s',       t.hero.stat_time],
            [t.hero.stat_free, ''],
          ].map(([n,l]) => (
            <div key={l || n}>
              <div className="hero-stat-n">{n}</div>
              {l && <div className="hero-stat-l">{l}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Feature bar */}
      <div className="feature-bar">
        <div className="feature-bar-inner">
          {[
            [Monitor, t.hero.feat1_title, t.hero.feat1_desc],
            [Users,   t.hero.feat2_title, t.hero.feat2_desc],
            [Gamepad2,t.hero.feat3_title, t.hero.feat3_desc],
          ].map(([Icon, title, desc]) => (
            <div className="feature-item" key={title}>
              <div className="feature-icon"><Icon size={16}/></div>
              <div>
                <div className="feature-title">{title}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homepage game rows */}
      <div style={{ paddingTop:'1rem', paddingBottom:'2rem' }}>
        <GameRow
          title={<><Star size={15} style={{marginRight:'0.4rem',verticalAlign:'middle'}}/>{t.hero.popular_title}</>}
          games={popular} onGame={g => navigate('game',{id:g.id})}
          onViewAll={() => navigate('browse')} viewAllLabel={t.hero.view_all}
        />
        <GameRow
          title={<><TrendingUp size={15} style={{marginRight:'0.4rem',verticalAlign:'middle'}}/>{t.hero.trending_title}</>}
          games={trending} onGame={g => navigate('game',{id:g.id})}
          onViewAll={() => navigate('browse')} viewAllLabel={t.hero.view_all}
        />
        <GameRow
          title={<><Award size={15} style={{marginRight:'0.4rem',verticalAlign:'middle'}}/>{t.hero.top_rated_title}</>}
          games={topRated} onGame={g => navigate('game',{id:g.id})}
          onViewAll={() => navigate('browse')} viewAllLabel={t.hero.view_all}
        />
        <GameRow
          title={<><Clock size={15} style={{marginRight:'0.4rem',verticalAlign:'middle'}}/>{t.hero.recent_title}</>}
          games={recent} onGame={g => navigate('game',{id:g.id})}
          onViewAll={() => navigate('browse')} viewAllLabel={t.hero.view_all}
        />
      </div>
    </>
  );

  /* ── Form ── */
  if (step === 'form') return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={() => setStep('hero')}>
          <ArrowLeft size={14}/> {t.common.back}
        </button>
        <h2 className="form-page-title">{t.form.title}</h2>
        <p className="form-page-sub">{t.form.sub}</p>
        {error && <div className="alert alert-error" style={{marginTop:'1rem'}}>{error}</div>}
      </div>
      <PreferencesForm onSubmit={handleSubmit} />
    </div>
  );

  /* ── Loading ── */
  if (step === 'loading') return (
    <div className="loading-wrap">
      <div className="spinner"/>
      <div className="loading-text">{t.common.loading}</div>
    </div>
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
          <span className="result-chip">
            {prefs?.withFriends ? <Users size={11}/> : <Monitor size={11}/>}
            {prefs?.withFriends ? `${prefs.players}p` : t.form.style_solo}
          </span>
          <span className="result-chip">
            <Monitor size={11}/> {prefs?.pcLevel}
          </span>
          {prefs?.genres?.length > 0 && (
            <span className="result-chip">
              {prefs.genres.slice(0,2).map(g => (t.genres?.[g] || g)).join(', ')}{prefs.genres.length>2 ? ` +${prefs.genres.length-2}` : ''}
            </span>
          )}
          <button className="btn btn-muted btn-sm" onClick={() => setStep('form')}>
            {t.results.adjust}
          </button>
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
            {results.map((game, i) => (
              <GameCard key={game.id} game={game} rank={i+1} onClick={() => navigate('game',{id:game.id})}/>
            ))}
          </div>
          <div className="results-actions">
            <button className="btn btn-secondary" onClick={() => setStep('form')}>
              <ArrowLeft size={14}/> {t.results.adjust}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('room-landing')}>
              <Users size={14}/> {t.results.group_cta}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return null;
}
