import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Users, Clock, Zap, ExternalLink,
         Search, Calendar, Code2, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchGame } from '../utils/api';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import GameReactions from '../components/GameReactions';

const BASE      = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const PC_CLASS  = { low:'tag-pc-low', medium:'tag-pc-med', high:'tag-pc-hi' };

/* ── Cover image ── */
function CoverImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src || failed) return (
    <div style={{ width:'100%', aspectRatio:'16/6', background:'linear-gradient(135deg,#EEF2FF,#E0E7FF)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--r-lg)', marginBottom:'1.5rem', fontSize:'3rem', color:'#C7D2FE' }}>🎮</div>
  );
  return (
    <div style={{ width:'100%', aspectRatio:'16/6', borderRadius:'var(--r-lg)', overflow:'hidden', marginBottom:'1.5rem', background:'var(--surface2)', position:'relative' }}>
      {!loaded && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner"/></div>}
      <img src={src} alt={alt} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:loaded?1:0, transition:'opacity 0.3s' }} onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/>
    </div>
  );
}

/* ── Screenshots slider ── */
function Screenshots({ gameId }) {
  const [shots,    setShots]    = useState([]);
  const [current,  setCurrent]  = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/api/games/${gameId}/screenshots`)
      .then(r => r.json())
      .then(data => { setShots(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [gameId]);

  if (loading) return (
    <div style={{ marginTop:'1.5rem' }}>
      <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>Screenshots</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
        {[1,2,3].map(i=><div key={i} style={{ aspectRatio:'16/9', background:'var(--surface2)', borderRadius:'var(--r-sm)' }}/>)}
      </div>
    </div>
  );
  if (!shots.length) return null;

  return (
    <div style={{ marginTop:'1.5rem' }}>
      <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>Screenshots</div>

      {/* Main */}
      <div style={{ position:'relative', aspectRatio:'16/9', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--surface2)', marginBottom:'0.5rem', cursor:'pointer' }} onClick={()=>setLightbox(current)}>
        <img src={shots[current]} alt={`Screenshot ${current+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
        {shots.length > 1 && <>
          <button onClick={e=>{e.stopPropagation();setCurrent(c=>(c-1+shots.length)%shots.length);}}
            style={{ position:'absolute', left:'0.5rem', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <ChevronLeft size={18}/>
          </button>
          <button onClick={e=>{e.stopPropagation();setCurrent(c=>(c+1)%shots.length);}}
            style={{ position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <ChevronRight size={18}/>
          </button>
        </>}
        <div style={{ position:'absolute', bottom:'0.5rem', right:'0.75rem', background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:'0.7rem', padding:'0.2rem 0.5rem', borderRadius:4 }}>
          {current+1}/{shots.length}
        </div>
      </div>

      {/* Thumbs */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(shots.length,6)},1fr)`, gap:'0.4rem' }}>
        {shots.map((src,i)=>(
          <div key={i} onClick={()=>setCurrent(i)} style={{ aspectRatio:'16/9', borderRadius:'var(--r-sm)', overflow:'hidden', cursor:'pointer', border:i===current?'2px solid var(--primary)':'2px solid transparent', opacity:i===current?1:0.6, transition:'all 0.15s' }}>
            <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.parentElement.style.display='none'}/>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.93)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }} onClick={()=>setLightbox(null)}>
          <button onClick={e=>{e.stopPropagation();setLightbox(l=>(l-1+shots.length)%shots.length);}}
            style={{ position:'fixed', left:'1rem', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <ChevronLeft size={24}/>
          </button>
          <img src={shots[lightbox]} alt="" style={{ maxWidth:'90vw', maxHeight:'85vh', objectFit:'contain', borderRadius:'var(--r)' }} onClick={e=>e.stopPropagation()}/>
          <button onClick={e=>{e.stopPropagation();setLightbox(l=>(l+1)%shots.length);}}
            style={{ position:'fixed', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <ChevronRight size={24}/>
          </button>
          <button onClick={()=>setLightbox(null)} style={{ position:'fixed', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:'1.2rem' }}>✕</button>
        </div>
      )}
    </div>
  );
}

/* ── Also Played row ── */
function AlsoPlayed({ games, navigate, t }) {
  if (!games?.length) return null;
  const gl = g => t.genres?.[g] || g;
  return (
    <div style={{ gridColumn:'1/-1', marginTop:'0.5rem' }}>
      <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.05rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'0.85rem', color:'var(--text)' }}>
        {t.detail.also_played || 'People also played'}
      </div>
      <div className="similar-grid">
        {games.map(sg=>(
          <div key={sg.id} className="similar-card" onClick={()=>navigate('game',{id:sg.id})}>
            {sg.coverImage && <img src={sg.coverImage} alt={sg.name} style={{ width:'100%', aspectRatio:'16/7', objectFit:'cover', borderRadius:'var(--r-sm)', marginBottom:'0.6rem' }} onError={e=>e.target.style.display='none'}/>}
            <div className="similar-card-name">{sg.name}</div>
            <div className="similar-card-sub">{sg.genre.slice(0,2).map(g=>gl(g)).join(', ')}</div>
            <div style={{ marginTop:'0.4rem' }}>
              <span className={`tag ${PC_CLASS[sg.pcRequirements]}`} style={{ fontSize:'0.65rem' }}>
                {{low:t.card.pc_low,medium:t.card.pc_med,high:t.card.pc_hi}[sg.pcRequirements]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function GameDetailPage({ gameId, navigate }) {
  const { t, lang } = useLang();
  const routerNav   = useNavigate();
  const [game,    setGame]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    fetchGame(gameId)
      .then(g  => { setGame(g); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [gameId]);

  usePageTitle(game ? game.name : null);
  const goBack = () => routerNav(-1);

  if (loading) return <div className="loading-wrap"><div className="spinner"/><div className="loading-text">{t.common.loading}</div></div>;
  if (error)   return <div className="detail-page"><div className="alert alert-error">{error}</div><button className="btn btn-secondary" style={{marginTop:'1rem'}} onClick={goBack}>{t.common.back}</button></div>;
  if (!game)   return null;

  const pcLabel    = {low:t.card.pc_low,medium:t.card.pc_med,high:t.card.pc_hi}[game.pcRequirements];
  const diffClass  = {Easy:'tag-diff-easy',Medium:'tag-diff-med',Hard:'tag-diff-hard'}[game.difficulty]||'tag-diff-med';
  const diffLabel  = {Easy:t.card.easy,Medium:t.card.medium,Hard:t.card.hard}[game.difficulty]||game.difficulty;
  const sessLabel  = {'15 min':t.card.session_15,'30 min':t.card.session_30,'1 hour':t.card.session_1h,'2+ hours':t.card.session_2h}[game.averageSession]||game.averageSession;
  const playerStr  = game.minPlayers===game.maxPlayers ? t.card.players_single(game.minPlayers) : t.card.players_range(game.minPlayers,game.maxPlayers);
  const description= lang==='ru'&&game.shortDescriptionRu ? game.shortDescriptionRu : game.shortDescription;
  const gl         = g => t.genres?.[g]||g;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={goBack}><ArrowLeft size={14}/> {t.common.back}</button>

      <CoverImage src={game.coverImage} alt={game.name}/>

      <h1 className="detail-title">{game.name}</h1>
      <div className="detail-meta">
        {game.genre.map(g=><span key={g} className="tag tag-genre">{gl(g)}</span>)}
        <span className={`tag ${PC_CLASS[game.pcRequirements]}`}>{pcLabel}</span>
        <span className={`tag ${game.coop?'tag-coop':'tag-solo'}`}>{game.coop?t.card.coop:t.card.solo}</span>
        {game.difficulty && <span className={`tag ${diffClass}`}>{diffLabel}</span>}
      </div>

      <div className="detail-body">
        {/* Main */}
        <div>
          <div className="detail-card" style={{marginBottom:'1rem'}}>
            <div className="detail-section-label">{t.detail.about}</div>
            <p className="detail-desc">{description}</p>
            <div className="detail-actions">
              {game.steamLink
                ? <a href={game.steamLink} target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-primary btn-lg"><ExternalLink size={14}/> {t.detail.open_steam}</button>
                  </a>
                : <span style={{fontSize:'0.85rem',color:'var(--text-3)',padding:'0.5rem 0'}}>{t.detail.not_on_steam}</span>
              }
              <button className="btn btn-secondary btn-lg" onClick={()=>navigate('browse')}>
                <Search size={14}/> {t.detail.find_similar}
              </button>
            </div>

            {/* Reactions */}
            <GameReactions gameId={game.id}/>

            {/* Screenshots */}
            {game.steamLink && <Screenshots gameId={game.id}/>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-card" style={{alignSelf:'start'}}>
          <div className="detail-section-label">{t.detail.details}</div>
          {[
            [<Users size={13}/>,    t.detail.players,    playerStr],
            [<Users size={13}/>,    t.detail.mode,       game.coop?t.detail.coop_mode:t.detail.solo_mode],
            [<Monitor size={13}/>,  t.detail.pc,         pcLabel],
            [<Zap size={13}/>,      t.detail.difficulty, diffLabel],
            [<Clock size={13}/>,    t.detail.session,    sessLabel],
            [<Code2 size={13}/>,    t.detail.developer,  game.developer],
            [<Calendar size={13}/>, t.detail.year,       game.releaseYear],
          ].filter(([,,v])=>v).map(([icon,label,value])=>(
            <div key={label} className="info-row">
              <span className="info-row-label">{icon}{label}</span>
              <span className="info-row-value">{value}</span>
            </div>
          ))}
          <div className="info-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'0.4rem'}}>
            <span className="info-row-label"><Search size={13}/>{t.detail.genres}</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
              {game.genre.map(g=><span key={g} className="tag tag-genre">{gl(g)}</span>)}
            </div>
          </div>
        </div>

        {/* Similar games */}
        {game.similar?.length > 0 && (
          <div className="similar-section">
            <div className="similar-section-title">{t.detail.similar}</div>
            <div className="similar-grid">
              {game.similar.map(sg=>(
                <div key={sg.id} className="similar-card" onClick={()=>navigate('game',{id:sg.id})}>
                  {sg.coverImage && <img src={sg.coverImage} alt={sg.name} style={{width:'100%',aspectRatio:'16/7',objectFit:'cover',borderRadius:'var(--r-sm)',marginBottom:'0.6rem'}} onError={e=>e.target.style.display='none'}/>}
                  <div className="similar-card-name">{sg.name}</div>
                  <div className="similar-card-sub">{sg.genre.slice(0,2).map(g=>gl(g)).join(', ')}</div>
                  <div style={{marginTop:'0.4rem'}}>
                    <span className={`tag ${PC_CLASS[sg.pcRequirements]}`} style={{fontSize:'0.65rem'}}>
                      {{low:t.card.pc_low,medium:t.card.pc_med,high:t.card.pc_hi}[sg.pcRequirements]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Also played */}
        {game.alsoPlayed?.length > 0 && (
          <AlsoPlayed games={game.alsoPlayed} navigate={navigate} t={t}/>
        )}
      </div>
    </div>
  );
}
