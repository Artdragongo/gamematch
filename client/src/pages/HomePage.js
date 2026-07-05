import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2, Monitor, Users, ArrowLeft, TrendingUp, Clock,
  Star, ChevronRight, Award, Zap, Search, Calendar,
  Gem, Swords, Map, Headphones, Brain, Target,
  Cog, TreePine, Package, Trophy, Puzzle, Joystick,
  ClipboardList, Sparkles, PartyPopper, User as UserIcon
} from 'lucide-react';
import PreferencesForm from '../components/PreferencesForm';
import GameCard from '../components/GameCard';
import QuickMatch from '../components/QuickMatch';
import ShareButton from '../components/ShareButton';
import GameRowSkeleton from '../components/GameRowSkeleton';
import { fetchRecommendations } from '../utils/api';
import { useHomepageData } from '../hooks/useHomepageData';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

/* ── Mini card image ── */
function MiniCardImg({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src || failed) return (
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,var(--primary-light),var(--surface2))',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Gamepad2 size={28} style={{ opacity:0.2, color:'var(--primary)' }}/>
    </div>
  );
  return (
    <>
      {!loaded && <div style={{ position:'absolute', inset:0, background:'var(--surface2)' }}/>}
      <img src={src} alt={alt} loading="lazy"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
          opacity:loaded?1:0, transition:'opacity .2s' }}
        onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/>
    </>
  );
}

/* ── Mini card — genre + real PC-tier badge (no fabricated ratings) ── */
function MiniCard({ game, onClick, rank }) {
  const { t } = useLang();
  const gl = g => t.genres?.[g] || g;
  return (
    <div className="game-card" onClick={()=>onClick?.(game)} style={{ cursor:'pointer' }}>
      <div className="gc-img" style={{ aspectRatio:'16/7' }}>
        <MiniCardImg src={game.coverImage} alt={game.name}/>
        <div className="gc-img-gradient"/>
        {rank && <div className="gc-rank">{rank}</div>}
      </div>
      <div className="gc-body" style={{ padding:'0.9rem 1rem', gap:'0.4rem' }}>
        <div className="gc-title" style={{ fontSize:'0.875rem' }}>{game.name}</div>
        <div className="gc-badge-row">
          <span style={{ fontSize:'0.75rem', color:'var(--text-3)', fontWeight:500 }}>
            {gl(game.genre[0])}
          </span>
          <span className={`gc-tier-badge ${game.pcRequirements}`}>
            <Monitor size={10}/> {game.pcRequirements}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Section row ── */
function GameRow({ title, Icon, games, onGame, onViewAll, viewAll, showRanks }) {
  if (!games?.length) return null;
  return (
    <section style={{ marginBottom:'2.5rem' }}>
      <div className="section-header">
        <span className="section-title" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {Icon && <Icon size={16} style={{ color:'var(--primary)', flexShrink:0 }}/>}
          {title}
        </span>
        <button onClick={onViewAll}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.82rem var(--font-body)', color:'var(--primary)',
            background:'none', border:'none', cursor:'pointer' }}>
          {viewAll} <ChevronRight size={13}/>
        </button>
      </div>
      <div className="card-row">
        {games.slice(0,4).map((g,i) => (
          <MiniCard key={g.id} game={g} onClick={onGame} rank={showRanks ? i+1 : null}/>
        ))}
      </div>
    </section>
  );
}

/* ── Decorative hero visual (pure CSS/SVG, no external image) ── */
function HeroVisual({ stats }) {
  return (
    <div className="hero-visual">
      <div className="hero-visual-blob"/>
      <div className="hero-visual-shape" style={{ width:36, height:36, top:'6%', left:'10%' }}/>
      <div className="hero-visual-shape" style={{ width:22, height:22, bottom:'18%', left:'2%' }}/>
      <div className="hero-visual-shape" style={{ width:16, height:16, top:'20%', right:'6%' }}/>
      <div className="hero-visual-icon-wrap">
        <Gamepad2 size={92} style={{ color:'var(--primary)', opacity:0.85 }} strokeWidth={1.3}/>
      </div>
      <div className="hero-badge-float">
        <div style={{ width:34, height:34, borderRadius:10, background:'var(--primary-light)',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Sparkles size={16} style={{ color:'var(--primary)' }}/>
        </div>
        <div>
          <div className="hero-badge-float-num">{stats?.totalGames || '600+'}</div>
          <div className="hero-badge-float-label">games ready</div>
        </div>
      </div>
    </div>
  );
}

/* ── How It Works ── */
function HowItWorks({ t }) {
  const hiw = t.hero || {};
  const steps = [
    { Icon: ClipboardList, title: hiw.hiw1_title || 'Answer questions', desc: hiw.hiw1_desc || 'Tell us your setup, mood, and squad size' },
    { Icon: Sparkles,      title: hiw.hiw2_title || 'We find matches',  desc: hiw.hiw2_desc || 'Our engine filters games that actually fit' },
    { Icon: Gamepad2,      title: hiw.hiw3_title || 'See your picks',   desc: hiw.hiw3_desc || 'Get personalized recommendations instantly' },
    { Icon: PartyPopper,   title: hiw.hiw4_title || 'Play & enjoy',     desc: hiw.hiw4_desc || 'Find new favorites and share with friends' },
  ];
  return (
    <div className="how-it-works">
      <div className="how-it-works-title">
        <Gamepad2 size={18} style={{ color:'var(--primary)' }}/>
        {hiw.hiw_title || 'How it works'}
      </div>
      <div className="hiw-steps">
        {steps.map((s, i) => (
          <div className="hiw-step" key={i}>
            <div className="hiw-step-icon">
              <s.Icon size={20}/>
              <div className="hiw-step-num">{i+1}</div>
            </div>
            <div className="hiw-step-title">{s.title}</div>
            <div className="hiw-step-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats tiles ── */
function StatsTiles({ stats, t }) {
  const tiles = [
    { Icon: Gamepad2, num: stats?.totalGames || '600+', label: t.hero.stat_games },
    { Icon: Users,    num: stats?.coopGames ? `${stats.coopGames}+` : '250+', label: t.hero.stat_coop || 'Co-op games' },
    { Icon: Zap,      num: '<20s', label: t.hero.stat_time },
    { Icon: Award,    num: '100%', label: t.hero.stat_free },
  ];
  return (
    <div className="stats-tiles">
      {tiles.map((tile, i) => (
        <div className="stats-tile" key={i}>
          <div className="stats-tile-icon"><tile.Icon size={16}/></div>
          <div className="stats-tile-num">{tile.num}</div>
          <div className="stats-tile-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Quick access chips (real sections, not fabricated) ─────── */
function QuickAccessGrid({ navigate, t }) {
  const items = [
    { Icon: Clock,   title: t.hero.recent_title,    desc: t.quickaccess?.recent_desc || 'Recent releases', action: () => navigate('browse') },
    { Icon: Users,   title: t.hero.feat2_title,     desc: t.quickaccess?.coop_desc   || 'Play together',   action: () => navigate('browse') },
    { Icon: UserIcon,title: t.form.style_solo,      desc: t.quickaccess?.solo_desc   || 'Just for you',    action: () => navigate('browse') },
    { Icon: Gem,     title: t.hero.hidden_gems || 'Hidden Gems', desc: t.quickaccess?.gems_desc || 'Underrated picks', action: () => navigate('browse') },
  ];
  return (
    <div className="quick-access-grid">
      {items.map((item, i) => (
        <div className="quick-access-card" key={i} onClick={item.action}>
          <div className="quick-access-icon"><item.Icon size={17}/></div>
          <div>
            <div className="quick-access-title">{item.title}</div>
            <div className="quick-access-desc">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function HomePage({ navigate }) {
  const { t } = useLang();
  const [step,    setStep]    = useState('hero');
  const [results, setResults] = useState([]);
  const [prefs,   setPrefs]   = useState(null);
  const [error,   setError]   = useState('');
  const sharedHandled = useRef(false);

  const { data: hp, isLoading } = useHomepageData();

  usePageTitle(step === 'results' ? t.results.title : null);

  useEffect(() => {
    if (sharedHandled.current) return;
    const params  = new URLSearchParams(window.location.search);
    const pc      = params.get('pc');
    const genres  = params.get('genres')?.split(',').filter(Boolean) || [];
    const coop    = params.get('coop') === '1';
    const players = params.get('players') || '1';
    if (pc) {
      sharedHandled.current = true;
      window.history.replaceState({}, '', '/');
      handleSubmit({ players, withFriends: coop, genres, pcLevel: pc });
    }
  });

  const handleSubmit = async (formPrefs) => {
    setPrefs(formPrefs); setStep('loading'); setError('');
    try { setResults(await fetchRecommendations(formPrefs)); setStep('results'); }
    catch { setError(t.common.error_server); setStep('form'); }
  };

  const goGame = g => navigate('game', { id: g.id });
  const showSkeleton = isLoading && !hp;

  /* ── Hero ── */
  if (step === 'hero') return (
    <>
      <section className="hero-premium">
        <div className="hero-premium-text">
          <div className="hero-eyebrow">
            <Gamepad2 size={12}/> {t.hero.badge}
          </div>
          <h1>{t.hero.title1} <span className="accent">{t.hero.title2}</span></h1>
          <p className="hero-sub">{t.hero.sub}</p>
        </div>
        <HeroVisual stats={hp?.stats}/>
      </section>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2rem 1.5rem' }}>
        <QuickMatch
          onResults={(res, p) => { setResults(res); setPrefs(p); setStep('results'); }}
          onFullSearch={() => setStep('form')}
        />
        <div style={{ textAlign:'center', marginTop:'1rem' }}>
          <button className="btn btn-muted" onClick={() => navigate('bored')}>
            <Zap size={13}/> {t.hero.cta_bored}
          </button>
        </div>
      </div>

      <div style={{ paddingTop:'1rem' }}>
        {showSkeleton ? <GameRowSkeleton/> : (
          <GameRow title={t.hero.popular_title} Icon={Star} games={hp?.popular}
            onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all} showRanks/>
        )}

        <QuickAccessGrid navigate={navigate} t={t}/>

        {!showSkeleton && (
          <>
            <GameRow title={t.hero.trending_title}  Icon={TrendingUp} games={hp?.trending}   onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all}/>
            <GameRow title={t.hero.top_rated_title} Icon={Award}      games={hp?.topRated}   onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all} showRanks/>
            <GameRow title={t.hero.recent_title}    Icon={Clock}      games={hp?.recent}     onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all}/>
            <GameRow title={t.hero.hidden_gems||'Hidden Gems'} Icon={Gem} games={hp?.hiddenGems} onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all}/>
          </>
        )}

        <HowItWorks t={t}/>
        <StatsTiles stats={hp?.stats} t={t}/>

        {/* Friends CTA */}
        <div style={{ padding:'0 2rem', maxWidth:1000, margin:'0 auto 3rem' }}>
          <div style={{ background:'linear-gradient(135deg, var(--primary-light), var(--surface))',
            border:'1px solid var(--primary-mid)', borderRadius:'var(--r-lg)', padding:'2rem 2.5rem',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:'1.5rem' }}>
            <div>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.2rem', fontWeight:800,
                color:'var(--text)', letterSpacing:'-0.02em', marginBottom:'0.35rem' }}>
                {t.hero.friends_cta_title || 'Playing with friends tonight?'}
              </div>
              <p style={{ fontSize:'0.875rem', color:'var(--text-3)', maxWidth:480 }}>
                {t.hero.friends_cta_desc || 'Create a room, everyone adds their preferences, and you get games you all agree on.'}
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={()=>navigate('room-landing')}>
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
        <button className="back-btn" onClick={()=>setStep('hero')}>
          <ArrowLeft size={14}/> {t.common.back}
        </button>
        <h2 className="form-page-title">{t.form.title}</h2>
        <p className="form-page-sub">{t.form.sub}</p>
        {error && <div className="alert alert-error" style={{marginTop:'1rem'}}>{error}</div>}
      </div>
      <PreferencesForm onSubmit={handleSubmit}/>
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
              {prefs.genres.slice(0,2).map(g=>t.genres?.[g]||g).join(', ')}
              {prefs.genres.length>2 ? ` +${prefs.genres.length-2}` : ''}
            </span>
          )}
          <button className="btn btn-muted btn-sm" onClick={()=>setStep('form')}>
            {t.results.adjust}
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Gamepad2 size={36}/></div>
          <p className="empty-text">{t.results.no_results}<br/>{t.results.no_results_hint}</p>
          <button className="btn btn-secondary" onClick={()=>setStep('form')}>{t.results.adjust}</button>
        </div>
      ) : (
        <>
          <div className="results-grid">
            {results.map((game,i) => (
              <GameCard key={game.id} game={game} rank={i+1}
                onClick={()=>navigate('game',{id:game.id})}/>
            ))}
          </div>
          <div className="results-actions">
            <button className="btn btn-secondary" onClick={()=>setStep('form')}>
              <ArrowLeft size={14}/> {t.results.adjust}
            </button>
            <ShareButton prefs={prefs} results={results}/>
            <button className="btn btn-primary" onClick={()=>navigate('room-landing')}>
              <Users size={14}/> {t.results.group_cta}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return null;
}
