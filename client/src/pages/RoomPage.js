import React, { useState, useEffect, useCallback } from 'react';
import { Users, Copy, Check, ArrowRight, Wifi, Link2 } from 'lucide-react';
import { createRoom, fetchRoom, joinRoom, fetchRoomRecs } from '../utils/api';
import PreferencesForm from '../components/PreferencesForm';
import GameCard from '../components/GameCard';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

/* ── Landing ──────────────────────────────────────────────── */
export function RoomLandingPage({ navigate }) {
  const { t } = useLang();
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState('');
  usePageTitle(t.room.landing_title);

  const handleCreate = async () => {
    setCreating(true);
    try { const { roomId } = await createRoom(); navigate('room', { roomId }); }
    catch { setError(t.room.error_create); setCreating(false); }
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { setError(t.room.invalid_code); return; }
    navigate('room', { roomId: code });
  };

  return (
    <div className="room-page">
      <h1 className="room-page-title">{t.room.landing_title}</h1>
      <p className="room-page-sub">{t.room.landing_sub}</p>
      {error && <div className="alert alert-error" style={{marginBottom:'1.25rem'}}>{error}</div>}

      <div className="split-panels" style={{marginBottom:'2.5rem'}}>
        <div className="panel">
          <div className="panel-eyebrow">{t.room.create_label}</div>
          <div className="panel-title">{t.room.create_title}</div>
          <p className="panel-desc">{t.room.create_desc}</p>
          <button className="btn btn-primary btn-full" disabled={creating} onClick={handleCreate}>
            {creating ? t.room.creating : <>{t.room.create_btn} <ArrowRight size={14}/></>}
          </button>
        </div>
        <div className="panel">
          <div className="panel-eyebrow">{t.room.join_label}</div>
          <div className="panel-title">{t.room.join_title}</div>
          <p className="panel-desc">{t.room.join_desc}</p>
          <div className="code-row">
            <input
              type="text" className="code-input" placeholder={t.room.join_ph} maxLength={6}
              value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleJoin}>
            {t.room.join_btn} <ArrowRight size={14}/>
          </button>
        </div>
      </div>

      <div style={{borderTop:'1px solid var(--border)',paddingTop:'2rem'}}>
        <div style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:'1.25rem'}}>
          {t.room.how_title}
        </div>
        <div className="how-list">
          {[[t.room.how_1_title,t.room.how_1_desc],[t.room.how_2_title,t.room.how_2_desc],[t.room.how_3_title,t.room.how_3_desc],[t.room.how_4_title,t.room.how_4_desc]].map(([title,desc],i)=>(
            <div key={i} className="how-item">
              <div className="how-num">{i+1}</div>
              <div><div className="how-title">{title}</div><div className="how-desc">{desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Active Room ──────────────────────────────────────────── */
export function RoomPage({ roomId, navigate }) {
  const { t, lang } = useLang();
  const [room,     setRoom]     = useState(null);
  const [step,     setStep]     = useState('nickname');
  const [nickname, setNickname] = useState('');
  const [recs,     setRecs]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState(false);
  // Detect if user arrived via a shared link (no prior navigation state)
  const [isInvite, setIsInvite] = useState(false);

  usePageTitle(`${t.room.landing_title} · ${roomId}`);

  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const loadRoom = useCallback(async () => {
    try { setRoom(await fetchRoom(roomId)); }
    catch { setError(t.room.not_found); }
  }, [roomId, t]);

  useEffect(() => {
    loadRoom();
    // If navigated directly (e.g. from a shared link), show invite banner
    if (document.referrer === '' || !document.referrer.includes(window.location.hostname)) {
      setIsInvite(true);
    }
  }, [loadRoom]);

  useEffect(() => {
    if (step !== 'results') return;
    const id = setInterval(async () => {
      const r = await fetchRoomRecs(roomId).catch(() => []);
      setRecs(r); loadRoom();
    }, 5000);
    return () => clearInterval(id);
  }, [step, roomId, loadRoom]);

  const handleSubmitPrefs = async (prefs) => {
    setLoading(true);
    try {
      const result = await joinRoom(roomId, nickname, prefs);
      setRoom(result.room); setRecs(result.recommendations); setStep('results');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (error) return (
    <div className="room-page">
      <div className="alert alert-error" style={{marginBottom:'1.25rem'}}>{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('room-landing')}>{t.common.back}</button>
    </div>
  );
  if (!room) return <div className="loading-wrap"><div className="spinner"/><div className="loading-text">{t.common.loading}</div></div>;

  return (
    <div className="room-page">
      {/* Invite welcome banner — shown when arriving via shared link */}
      {isInvite && step === 'nickname' && (
        <div className="room-invite-banner">
          <div className="room-invite-icon"><Link2 size={18} color="#fff"/></div>
          <div>
            <div className="room-invite-title">
              {lang === 'ru'
                ? `Вас пригласили в комнату ${roomId}`
                : `You've been invited to room ${roomId}`}
            </div>
            <div className="room-invite-sub">
              {lang === 'ru'
                ? 'Введите никнейм и добавьте свои предпочтения — вместе найдёте, во что поиграть.'
                : "Enter your nickname and add your preferences — together you'll find something to play."}
            </div>
          </div>
        </div>
      )}

      {/* Room code */}
      <div className="room-code-box">
        <div>
          <div className="room-code-label">{t.room.code_label}</div>
          <div className="room-code-value">{roomId}</div>
        </div>
        <div className="room-code-right">
          <button className="btn btn-secondary btn-sm" onClick={copyLink}>
            {copied ? <><Check size={12}/> {t.room.copied}</> : <><Copy size={12}/> {t.room.copy_link}</>}
          </button>
          {room.members.length > 0 && (
            <div className="live-badge">
              <div className="live-dot"/>
              {t.room.live_members(room.members.length)}
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      {room.members.length > 0 && (
        <div className="room-members-box">
          <div className="room-members-label">{t.room.members_label}</div>
          <div className="member-chips">
            {room.members.map(m => (
              <span key={m.nickname} className={`member-chip ${m.nickname === nickname ? 'you' : ''}`}>
                <span className="member-dot"/>
                {m.nickname}{m.nickname === nickname ? ` (${t.common.you})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step: Nickname */}
      {step === 'nickname' && (
        <div className="room-step-box">
          <div className="room-step-eyebrow">{t.room.nickname_label}</div>
          <div className="room-step-title">{t.room.nickname_title}</div>
          <p className="room-step-desc">{t.room.nickname_desc}</p>
          <input
            type="text" className="field-input" placeholder={t.room.nickname_ph}
            maxLength={20} value={nickname} onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nickname.trim() && setStep('prefs')} autoFocus
          />
          <button className="btn btn-primary btn-full" disabled={!nickname.trim()} onClick={() => setStep('prefs')}>
            {t.room.continue} <ArrowRight size={14}/>
          </button>
        </div>
      )}

      {/* Step: Preferences */}
      {step === 'prefs' && (
        <div>
          <div style={{marginBottom:'1.75rem'}}>
            <div style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:'0.3rem'}}>
              {t.room.prefs_step}
            </div>
            <h2 style={{fontFamily:'var(--font-heading)',fontSize:'1.4rem',fontWeight:800,letterSpacing:'-0.02em',marginBottom:'0.3rem'}}>
              {t.room.prefs_title(nickname)}
            </h2>
            <p style={{color:'var(--text-3)',fontSize:'0.875rem'}}>{t.room.prefs_desc}</p>
          </div>
          {loading
            ? <div className="loading-wrap" style={{padding:'3rem 0'}}><div className="spinner"/><div className="loading-text">{t.room.submitting}</div></div>
            : <PreferencesForm onSubmit={handleSubmitPrefs} compact/>
          }
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <div>
          <div className="room-results-header">
            <div>
              <div className="room-results-title">{t.room.results_title}</div>
              <div className="room-results-sub">{t.room.results_sub(room.members.length)}</div>
            </div>
            <div className="live-badge"><div className="live-dot"/><Wifi size={11}/> {t.room.live}</div>
          </div>

          {recs.length === 0
            ? <div className="empty"><div className="empty-icon"><Users size={32}/></div><p className="empty-text">{t.room.no_recs}<br/>{t.room.no_recs_hint}</p></div>
            : <div className="room-results-grid">{recs.map((game,i) => <GameCard key={game.id} game={game} rank={i+1} animate={false} onClick={() => navigate('game',{id:game.id})}/>)}</div>
          }

          <div className="room-share-bar">
            <p className="room-share-hint">
              {t.room.waiting} <strong style={{color:'var(--primary)'}}>{t.room.share_code}</strong>{' '}
              <span style={{fontFamily:'var(--font-heading)',fontWeight:800,letterSpacing:'0.1em',color:'var(--primary)'}}>{roomId}</span>
            </p>
            <button className="btn btn-secondary btn-sm" onClick={copyLink}>
              {copied ? <><Check size={12}/> {t.room.copied}</> : <><Copy size={12}/> {t.room.copy_link}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
