import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2, Monitor, Users, ArrowLeft, TrendingUp, Clock,
  Star, ChevronRight, Award, Zap, Search, Calendar,
  Gem, ClipboardList, Sparkles, PartyPopper, User as UserIcon
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

/* ── Design tokens (hardcoded — cannot silently fail from a CSS
   patch not applying). Matches the soft-blue premium palette. ── */
const C = {
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryMid: '#BFDBFE',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E5E9F0',
  text: '#0F172A',
  text2: '#334155',
  text3: '#64748B',
  text4: '#94A3B8',
  radiusSm: '10px',
  radius: '14px',
  radiusLg: '20px',
  shadow: '0 4px 16px rgba(59,130,246,0.08), 0 2px 6px rgba(15,23,42,0.04)',
  shadowLg: '0 16px 40px rgba(59,130,246,0.12), 0 4px 12px rgba(15,23,42,0.06)',
};

/* ── Mini card image ── */
function MiniCardImg({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src || failed) return (
    <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${C.primaryLight},${C.surface2})`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Gamepad2 size={28} style={{ opacity:0.25, color:C.primary }}/>
    </div>
  );
  return (
    <>
      {!loaded && <div style={{ position:'absolute', inset:0, background:C.surface2 }}/>}
      <img src={src} alt={alt} loading="lazy"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
          opacity:loaded?1:0, transition:'opacity .2s' }}
        onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/>
    </>
  );
}

const TIER_COLORS = {
  low:    { bg:'#F0FDF4', fg:'#16A34A' },
  medium: { bg:'#FFFBEB', fg:'#D97706' },
  high:   { bg:'#FEF2F2', fg:'#DC2626' },
};

/* ── Mini card — genre + real PC-tier badge ── */
function MiniCard({ game, onClick, rank }) {
  const { t } = useLang();
  const gl = g => t.genres?.[g] || g;
  const tier = TIER_COLORS[game.pcRequirements] || TIER_COLORS.medium;
  return (
    <div className="game-card" onClick={()=>onClick?.(game)} style={{ cursor:'pointer' }}>
      <div className="gc-img" style={{ aspectRatio:'16/7' }}>
        <MiniCardImg src={game.coverImage} alt={game.name}/>
        <div className="gc-img-gradient"/>
        {rank && <div className="gc-rank">{rank}</div>}
      </div>
      <div className="gc-body" style={{ padding:'0.9rem 1rem', gap:'0.4rem' }}>
        <div className="gc-title" style={{ fontSize:'0.875rem' }}>{game.name}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'0.75rem', color:C.text3, fontWeight:500 }}>{gl(game.genre[0])}</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px',
            borderRadius:100, fontSize:'0.7rem', fontWeight:700, background:tier.bg, color:tier.fg }}>
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
          {Icon && <Icon size={16} style={{ color:C.primary, flexShrink:0 }}/>}
          {title}
        </span>
        <button onClick={onViewAll}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.82rem inherit', color:C.primary,
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

/* ── Hero — fully inline, two-column, decorative visual on the right ── */
function Hero({ t, stats }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section style={{
      maxWidth: 1200, margin: '0 auto', padding: isMobile ? '2.5rem 1.25rem 1rem' : '4rem 2rem 2rem',
      display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
      gap: isMobile ? '2rem' : '3rem', alignItems: 'center',
      textAlign: isMobile ? 'center' : 'left',
    }}>
      <div style={{ maxWidth: isMobile ? '100%' : 520, margin: isMobile ? '0 auto' : 0 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px',
          background:C.primaryLight, border:`1px solid ${C.primaryMid}`, borderRadius:100,
          fontSize:'0.78rem', fontWeight:600, color:C.primary, marginBottom:'1.5rem' }}>
          <Gamepad2 size={12}/> {t.hero.badge}
        </div>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:'-0.03em',
          fontSize:'clamp(2.2rem,4.5vw,3.4rem)', lineHeight:1.1, color:C.text, marginBottom:'1.1rem' }}>
          {t.hero.title1} <span style={{ color:C.primary }}>{t.hero.title2}</span>
        </h1>
        <p style={{ fontSize:'1.05rem', color:C.text3, lineHeight:1.7 }}>{t.hero.sub}</p>
      </div>

      {!isMobile && (
        <div style={{ position:'relative', aspectRatio:'1/0.85', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:'8%',
            background:`radial-gradient(circle at 35% 30%, ${C.primaryLight} 0%, ${C.bg} 70%)`,
            borderRadius:'50% 45% 55% 50% / 55% 50% 50% 45%' }}/>
          <div style={{ position:'absolute', width:36, height:36, borderRadius:'50%', top:'6%', left:'10%',
            background:C.primaryLight, border:`1px solid ${C.primaryMid}` }}/>
          <div style={{ position:'absolute', width:20, height:20, borderRadius:'50%', bottom:'18%', left:'2%',
            background:C.primaryLight, border:`1px solid ${C.primaryMid}` }}/>
          <div style={{ position:'relative', width:'62%', aspectRatio:1,
            background:`linear-gradient(145deg, #fff, ${C.primaryLight})`,
            borderRadius:C.radiusLg, display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:C.shadowLg, border:`1px solid ${C.primaryMid}` }}>
            <Gamepad2 size={92} style={{ color:C.primary, opacity:0.85 }} strokeWidth={1.3}/>
          </div>
          <div style={{ position:'absolute', bottom:'8%', right:'4%', background:'#fff',
            borderRadius:C.radius, padding:'0.7rem 1.1rem', boxShadow:C.shadowLg,
            display:'flex', alignItems:'center', gap:'0.6rem', border:`1px solid ${C.border}` }}>
            <div style={{ width:34, height:34, borderRadius:10, background:C.primaryLight,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={16} style={{ color:C.primary }}/>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.15rem', fontWeight:800, color:C.text }}>
                {stats?.totalGames || '600+'}
              </div>
              <div style={{ fontSize:'0.68rem', color:C.text3, fontWeight:600 }}>games ready</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── How It Works — fully inline ── */
function HowItWorks({ t }) {
  const hiw = t.hero || {};
  const steps = [
    { Icon: ClipboardList, title: hiw.hiw1_title || 'Answer questions', desc: hiw.hiw1_desc || 'Tell us your setup, mood, and squad size' },
    { Icon: Sparkles,      title: hiw.hiw2_title || 'We find matches',  desc: hiw.hiw2_desc || 'Our engine filters games that actually fit' },
    { Icon: Gamepad2,      title: hiw.hiw3_title || 'See your picks',   desc: hiw.hiw3_desc || 'Get personalized recommendations instantly' },
    { Icon: PartyPopper,   title: hiw.hiw4_title || 'Play & enjoy',     desc: hiw.hiw4_desc || 'Find new favorites and share with friends' },
  ];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ maxWidth:1000, margin:'0 auto 3rem', padding: isMobile ? '2rem 1.25rem' : '2.5rem 2rem',
      background:C.surface, borderRadius:C.radiusLg, border:`1px solid ${C.border}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontFamily:'var(--font-heading)',
        fontSize:'1.15rem', fontWeight:800, color:C.text, marginBottom:'1.75rem' }}>
        <Gamepad2 size={18} style={{ color:C.primary }}/>
        {hiw.hiw_title || 'How it works'}
      </div>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap:'1.75rem' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ textAlign:'left' }}>
            <div style={{ position:'relative', width:44, height:44, borderRadius:14,
              background:C.primaryLight, display:'flex', alignItems:'center', justifyContent:'center',
              color:C.primary, marginBottom:'0.85rem' }}>
              <s.Icon size={20}/>
              <div style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%',
                background:C.primary, color:'#fff', fontSize:'0.65rem', fontWeight:800,
                display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${C.surface}` }}>
                {i+1}
              </div>
            </div>
            <div style={{ fontWeight:700, fontSize:'0.88rem', color:C.text, marginBottom:'0.25rem' }}>{s.title}</div>
            <div style={{ fontSize:'0.78rem', color:C.text3, lineHeight:1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats tiles — fully inline ── */
function StatsTiles({ stats, t }) {
  const tiles = [
    { Icon: Gamepad2, num: stats?.totalGames || '600+', label: t.hero.stat_games },
    { Icon: Users,    num: stats?.coopGames ? `${stats.coopGames}+` : '250+', label: t.hero.stat_coop || 'Co-op games' },
    { Icon: Zap,      num: '<20s', label: t.hero.stat_time },
    { Icon: Award,    num: '100%', label: t.hero.stat_free },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.85rem',
      maxWidth:1000, margin:'0 auto 3rem', padding:'0 2rem' }}>
      {tiles.map((tile, i) => (
        <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:C.radius, padding:'1.1rem 0.6rem', textAlign:'center' }}>
          <div style={{ width:32, height:32, borderRadius:10, background:C.primaryLight, color:C.primary,
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.6rem' }}>
            <tile.Icon size={16}/>
          </div>
          <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.1rem', fontWeight:800, color:C.text, marginBottom:2 }}>
            {tile.num}
          </div>
          <div style={{ fontSize:'0.7rem', color:C.text3, fontWeight:500 }}>{tile.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Quick access chips — fully inline ── */
function QuickAccessGrid({ navigate, t }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const items = [
    { Icon: Clock,    title: t.hero.recent_title, desc: t.quickaccess?.recent_desc || 'Recent releases' },
    { Icon: Users,    title: t.hero.feat2_title,  desc: t.quickaccess?.coop_desc   || 'Play together' },
    { Icon: UserIcon, title: t.form.style_solo,   desc: t.quickaccess?.solo_desc   || 'Just for you' },
    { Icon: Gem,      title: t.hero.hidden_gems || 'Hidden Gems', desc: t.quickaccess?.gems_desc || 'Underrated picks' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap:'0.75rem', maxWidth:1200, margin:'0 auto 2.5rem', padding:'0 2rem' }}>
      {items.map((item, i) => (
        <div key={i} onClick={() => navigate('browse')}
          style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem 1.1rem',
            background:C.surface, border:`1px solid ${C.border}`, borderRadius:C.radius,
            cursor:'pointer', transition:'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.primaryMid; e.currentTarget.style.boxShadow = C.shadow; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width:38, height:38, borderRadius:12, background:C.primaryLight, color:C.primary,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <item.Icon size={17}/>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.85rem', color:C.text }}>{item.title}</div>
            <div style={{ fontSize:'0.72rem', color:C.text3 }}>{item.desc}</div>
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
      <Hero t={t} stats={hp?.stats}/>

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
          <div style={{ background:`linear-gradient(135deg, ${C.primaryLight}, ${C.surface})`,
            border:`1px solid ${C.primaryMid}`, borderRadius:C.radiusLg, padding:'2rem 2.5rem',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:'1.5rem' }}>
            <div>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.2rem', fontWeight:800,
                color:C.text, letterSpacing:'-0.02em', marginBottom:'0.35rem' }}>
                {t.hero.friends_cta_title || 'Playing with friends tonight?'}
              </div>
              <p style={{ fontSize:'0.875rem', color:C.text3, maxWidth:480 }}>
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
