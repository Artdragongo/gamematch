import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2, Monitor, Users, ArrowLeft, TrendingUp, Clock,
  Star, ChevronRight, Award, Zap, Search, Calendar,
  Gem, ClipboardList, Sparkles, PartyPopper, User as UserIcon, Check
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

const C = {
  primary: '#3B82F6', primaryHover: '#2563EB', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F1F5F9', border: '#E5E9F0',
  text: '#0F172A', text2: '#334155', text3: '#64748B', text4: '#94A3B8',
  radiusSm: '10px', radius: '16px', radiusLg: '22px',
  shadow: '0 6px 20px rgba(59,130,246,0.09), 0 2px 6px rgba(15,23,42,0.04)',
  shadowLg: '0 24px 56px rgba(59,130,246,0.15), 0 8px 20px rgba(15,23,42,0.07)',
};

const MAX_W = 1400;

const COPY = {
  en: {
    hiwTitle: 'How it works',
    steps: [
      { title: 'Answer questions', desc: 'Tell us your setup, mood, and squad size' },
      { title: 'We find matches',  desc: 'Our engine filters games that actually fit' },
      { title: 'See your picks',   desc: 'Get personalized recommendations instantly' },
      { title: 'Play & enjoy',     desc: 'Find new favorites and share with friends' },
    ],
    qa: [
      { desc: 'Recent releases' }, { desc: 'Play together' },
      { desc: 'Just for you' }, { desc: 'Underrated picks' },
    ],
    gamesReady: 'games ready',
  },
  ru: {
    hiwTitle: 'Как это работает',
    steps: [
      { title: 'Ответь на вопросы', desc: 'Расскажи о своём ПК, настроении и компании' },
      { title: 'Мы подбираем',      desc: 'Алгоритм отбирает игры, которые правда подходят' },
      { title: 'Смотри подборку',   desc: 'Получи персональные рекомендации мгновенно' },
      { title: 'Играй и наслаждайся', desc: 'Находи любимые игры и делись с друзьями' },
    ],
    qa: [
      { desc: 'Недавние релизы' }, { desc: 'Играйте вместе' },
      { desc: 'Только для вас' }, { desc: 'Недооценённые' },
    ],
    gamesReady: 'игр готово',
  },
};

function GlobalAnim() {
  return (
    <style>{`
      @keyframes gmFadeUp { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:translateY(0);} }
      .gm-fade { animation: gmFadeUp 0.55s cubic-bezier(.2,.8,.2,1) both; }
      @keyframes gmFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    `}</style>
  );
}

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

function GameRow({ title, Icon, games, onGame, onViewAll, viewAll, showRanks }) {
  if (!games?.length) return null;
  return (
    <section style={{ marginBottom:'2.75rem' }}>
      <div className="section-header">
        <span className="section-title" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {Icon && <Icon size={17} style={{ color:C.primary, flexShrink:0 }}/>}
          {title}
        </span>
        <button onClick={onViewAll}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.85rem inherit', color:C.primary,
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

/* ── Fanned stack of REAL game covers — replaces the abstract
   controller drawing entirely. Uses actual box art from the catalog. ── */
function CoverStackCard({ src, style }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{
      position: 'absolute', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(15,23,42,0.18), 0 6px 16px rgba(15,23,42,0.08)',
      border: '4px solid #fff', background: C.surface2, ...style,
    }}>
      {!src || failed ? (
        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
          background:`linear-gradient(135deg,${C.primaryLight},${C.surface2})` }}>
          <Gamepad2 size={32} style={{ color:C.primary, opacity:0.3 }}/>
        </div>
      ) : (
        <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={()=>setFailed(true)}/>
      )}
    </div>
  );
}

function GameCoverStack({ games }) {
  const g = games || [];
  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <CoverStackCard src={g[2]?.coverImage} style={{
        width:'58%', aspectRatio:'16/10', top:'2%', left:'4%',
        transform:'rotate(-9deg)', zIndex:1, opacity:0.9,
      }}/>
      <CoverStackCard src={g[1]?.coverImage} style={{
        width:'62%', aspectRatio:'16/10', top:'8%', right:'2%',
        transform:'rotate(7deg)', zIndex:2,
      }}/>
      <CoverStackCard src={g[0]?.coverImage} style={{
        width:'68%', aspectRatio:'16/10', bottom:'6%', left:'16%',
        transform:'rotate(-2deg)', zIndex:3, animation:'gmFloat 4s ease-in-out infinite',
      }}/>
    </div>
  );
}

/* ── Hero — real game-cover stack instead of an illustration ── */
function Hero({ t, lang, stats, previewGames }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const trustChips = [t.hero.feat1_title, t.hero.feat2_title, t.hero.feat3_title].filter(Boolean);

  return (
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute', inset:0, top:-40, height:560, zIndex:0,
        background:'radial-gradient(ellipse 900px 500px at 75% 10%, #EFF6FF 0%, transparent 65%), radial-gradient(ellipse 700px 400px at 10% 40%, #F5F9FF 0%, transparent 60%)' }}/>

      <section className="gm-fade" style={{
        position:'relative', zIndex:1, maxWidth: MAX_W, margin: '0 auto',
        padding: isMobile ? '2.5rem 1.25rem 0' : '4rem 2rem 0',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
        gap: isMobile ? '2rem' : '3rem', alignItems: 'center',
        textAlign: isMobile ? 'center' : 'left',
      }}>
        <div style={{ maxWidth: isMobile ? '100%' : 620, margin: isMobile ? '0 auto' : 0 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px',
            background:C.primaryLight, border:`1px solid ${C.primaryMid}`, borderRadius:100,
            fontSize:'0.82rem', fontWeight:600, color:C.primary, marginBottom:'1.5rem' }}>
            <Gamepad2 size={13}/> {t.hero.badge}
          </div>
          <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:'-0.03em',
            fontSize:'clamp(2.4rem,4.8vw,3.8rem)', lineHeight:1.1, color:C.text, marginBottom:'1.2rem' }}>
            {t.hero.title1} <span style={{ color:C.primary }}>{t.hero.title2}</span>
          </h1>
          <p style={{ fontSize:'1.12rem', color:C.text3, lineHeight:1.7, marginBottom:'1.6rem' }}>{t.hero.sub}</p>

          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.6rem', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            {trustChips.map((label, i) => (
              <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:7,
                fontSize:'0.85rem', fontWeight:600, color:C.text2,
                background:C.surface, border:`1px solid ${C.border}`, borderRadius:100, padding:'0.5rem 1rem',
                boxShadow:'0 2px 6px rgba(15,23,42,0.03)' }}>
                <span style={{ width:20, height:20, borderRadius:'50%', background:C.primaryLight,
                  display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check size={11} style={{ color:C.primary }}/>
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div style={{ position:'relative', height:360 }}>
            <GameCoverStack games={previewGames}/>
            <div style={{ position:'absolute', bottom:'2%', right:'0%', background:'#fff',
              borderRadius:C.radius, padding:'0.85rem 1.25rem', boxShadow:C.shadowLg,
              display:'flex', alignItems:'center', gap:'0.7rem', border:`1px solid ${C.border}`, zIndex:4 }}>
              <div style={{ width:40, height:40, borderRadius:11, background:C.primaryLight,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Sparkles size={19} style={{ color:C.primary }}/>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.3rem', fontWeight:800, color:C.text, lineHeight:1 }}>
                  {stats?.totalGames || '600+'}
                </div>
                <div style={{ fontSize:'0.7rem', color:C.text3, fontWeight:600 }}>
                  {(lang === 'ru' ? COPY.ru : COPY.en).gamesReady}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function HowItWorks({ lang }) {
  const copy = lang === 'ru' ? COPY.ru : COPY.en;
  const icons = [ClipboardList, Sparkles, Gamepad2, PartyPopper];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="gm-fade" style={{ maxWidth: MAX_W, margin:'0 auto 3rem', padding: isMobile ? '2.25rem 1.25rem' : '3rem 2.5rem',
      background:`linear-gradient(180deg, #fff 0%, ${C.bg} 100%)`, borderRadius:C.radiusLg, border:`1px solid ${C.border}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', fontFamily:'var(--font-heading)',
        fontSize:'1.4rem', fontWeight:800, color:C.text, marginBottom:'2.25rem' }}>
        <Gamepad2 size={22} style={{ color:C.primary }}/>
        {copy.hiwTitle}
      </div>
      <div style={{ position:'relative', display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap:'2rem' }}>
        {!isMobile && (
          <div style={{ position:'absolute', top:28, left:'12%', right:'12%', height:2,
            background:`linear-gradient(90deg, transparent, ${C.primaryMid} 15%, ${C.primaryMid} 85%, transparent)`, zIndex:0 }}/>
        )}
        {copy.steps.map((s, i) => {
          const Icon = icons[i];
          return (
            <div key={i} style={{ textAlign:'left', position:'relative', zIndex:1 }}>
              <div style={{ position:'relative', width:56, height:56, borderRadius:16,
                background:'#fff', border:`1px solid ${C.primaryMid}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:C.primary, marginBottom:'1.1rem', boxShadow:'0 4px 12px rgba(59,130,246,0.1)' }}>
                <Icon size={25}/>
                <div style={{ position:'absolute', top:-8, right:-8, width:24, height:24, borderRadius:'50%',
                  background:C.primary, color:'#fff', fontSize:'0.72rem', fontWeight:800,
                  display:'flex', alignItems:'center', justifyContent:'center', border:`3px solid ${C.surface}` }}>
                  {i+1}
                </div>
              </div>
              <div style={{ fontWeight:700, fontSize:'1rem', color:C.text, marginBottom:'0.35rem' }}>{s.title}</div>
              <div style={{ fontSize:'0.84rem', color:C.text3, lineHeight:1.55 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STAT_ACCENTS = [
  { bg:'#EFF6FF', fg:'#3B82F6' }, { bg:'#F3E8FF', fg:'#9333EA' },
  { bg:'#FFF7ED', fg:'#EA580C' }, { bg:'#F0FDF4', fg:'#16A34A' },
];

function StatsTiles({ stats, t }) {
  const tiles = [
    { Icon: Gamepad2, num: stats?.totalGames || '600+', label: t.hero.stat_games },
    { Icon: Users,    num: stats?.coopGames ? `${stats.coopGames}+` : '250+', label: t.hero.stat_coop || 'Co-op games' },
    { Icon: Zap,      num: '<20s', label: t.hero.stat_time },
    { Icon: Award,    num: '100%', label: t.hero.stat_free },
  ];
  return (
    <div className="gm-fade" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.1rem',
      maxWidth: MAX_W, margin:'0 auto 3rem', padding:'0 2rem' }}>
      {tiles.map((tile, i) => {
        const acc = STAT_ACCENTS[i];
        return (
          <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:C.radius, padding:'1.6rem 1rem', textAlign:'center', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width:48, height:48, borderRadius:14, background:acc.bg, color:acc.fg,
              display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.85rem' }}>
              <tile.Icon size={22}/>
            </div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.6rem', fontWeight:800, color:C.text, marginBottom:3 }}>
              {tile.num}
            </div>
            <div style={{ fontSize:'0.8rem', color:C.text3, fontWeight:500 }}>{tile.label}</div>
          </div>
        );
      })}
    </div>
  );
}

const QA_ACCENTS = [
  { bg:'#EFF6FF', fg:'#3B82F6' }, { bg:'#F0FDF4', fg:'#16A34A' },
  { bg:'#FFF7ED', fg:'#EA580C' }, { bg:'#F3E8FF', fg:'#9333EA' },
];

function QuickAccessGrid({ navigate, t, lang }) {
  const copy = lang === 'ru' ? COPY.ru : COPY.en;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const items = [
    { Icon: Clock,    title: t.hero.recent_title, desc: copy.qa[0].desc },
    { Icon: Users,    title: t.hero.feat2_title,  desc: copy.qa[1].desc },
    { Icon: UserIcon, title: t.form.style_solo,   desc: copy.qa[2].desc },
    { Icon: Gem,      title: t.hero.hidden_gems || 'Hidden Gems', desc: copy.qa[3].desc },
  ];
  return (
    <div className="gm-fade" style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap:'1rem', maxWidth: MAX_W, margin:'0 auto 3rem', padding:'0 2rem' }}>
      {items.map((item, i) => {
        const acc = QA_ACCENTS[i];
        return (
          <div key={i} onClick={() => navigate('browse')}
            style={{ position:'relative', overflow:'hidden', display:'flex', alignItems:'center', gap:'1rem',
              padding:'1.4rem 1.3rem', background:C.surface, border:`1px solid ${C.border}`, borderRadius:C.radius,
              cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = acc.fg; e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform='translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform='none'; }}
          >
            <item.Icon size={64} style={{ position:'absolute', right:-14, bottom:-14, color:acc.fg, opacity:0.06 }}/>
            <div style={{ width:48, height:48, borderRadius:14, background:acc.bg, color:acc.fg,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
              <item.Icon size={22}/>
            </div>
            <div style={{ zIndex:1 }}>
              <div style={{ fontWeight:700, fontSize:'0.95rem', color:C.text, marginBottom:2 }}>{item.title}</div>
              <div style={{ fontSize:'0.78rem', color:C.text3 }}>{item.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function HomePage({ navigate }) {
  const { t, lang } = useLang();
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

  if (step === 'hero') return (
    <>
      <GlobalAnim/>
      <Hero t={t} lang={lang} stats={hp?.stats} previewGames={hp?.popular}/>

      <div style={{ maxWidth: MAX_W, margin:'0 auto', padding:'2rem 2rem 1.5rem' }}>
        <QuickMatch
          onResults={(res, p) => { setResults(res); setPrefs(p); setStep('results'); }}
          onFullSearch={() => setStep('form')}
        />
        <div style={{ textAlign:'center', marginTop:'1.1rem' }}>
          <button className="btn btn-muted" onClick={() => navigate('bored')}>
            <Zap size={13}/> {t.hero.cta_bored}
          </button>
        </div>
      </div>

      <div style={{ paddingTop:'1.75rem' }}>
        {showSkeleton ? <GameRowSkeleton/> : (
          <GameRow title={t.hero.popular_title} Icon={Star} games={hp?.popular}
            onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all} showRanks/>
        )}

        <QuickAccessGrid navigate={navigate} t={t} lang={lang}/>

        {!showSkeleton && (
          <>
            <GameRow title={t.hero.trending_title}  Icon={TrendingUp} games={hp?.trending}   onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all}/>
            <GameRow title={t.hero.top_rated_title} Icon={Award}      games={hp?.topRated}   onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all} showRanks/>
            <GameRow title={t.hero.recent_title}    Icon={Clock}      games={hp?.recent}     onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all}/>
            <GameRow title={t.hero.hidden_gems||'Hidden Gems'} Icon={Gem} games={hp?.hiddenGems} onGame={goGame} onViewAll={()=>navigate('browse')} viewAll={t.hero.view_all}/>
          </>
        )}

        <HowItWorks lang={lang}/>
        <StatsTiles stats={hp?.stats} t={t}/>

        <div className="gm-fade" style={{ padding:'0 2rem', maxWidth: MAX_W, margin:'0 auto 3rem' }}>
          <div style={{ background:`linear-gradient(135deg, ${C.primaryLight}, ${C.surface})`,
            border:`1px solid ${C.primaryMid}`, borderRadius:C.radiusLg, padding:'2.5rem 3rem',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:'1.5rem' }}>
            <div>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.4rem', fontWeight:800,
                color:C.text, letterSpacing:'-0.02em', marginBottom:'0.4rem' }}>
                {t.hero.friends_cta_title || 'Playing with friends tonight?'}
              </div>
              <p style={{ fontSize:'0.95rem', color:C.text3, maxWidth:520 }}>
                {t.hero.friends_cta_desc || 'Create a room, everyone adds their preferences, and you get games you all agree on.'}
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={()=>navigate('room-landing')}>
              <Users size={16}/> {t.nav.friends}
            </button>
          </div>
        </div>
      </div>
    </>
  );

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

  if (step === 'loading') return (
    <div className="loading-wrap">
      <div className="spinner"/>
      <div className="loading-text">{t.common.loading}</div>
    </div>
  );

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
