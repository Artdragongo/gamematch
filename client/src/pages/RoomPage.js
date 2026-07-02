import React, { useState, useEffect, useCallback } from 'react';
import { Users, Copy, Check, ArrowRight, Wifi, Link2, Trophy, Heart,
         Clock, Sparkles, Edit2, ChevronRight, PartyPopper } from 'lucide-react';
import { createRoom, fetchRoom, joinRoom, fetchRoomRecs } from '../utils/api';
import PreferencesForm from '../components/PreferencesForm';
import GameCard from '../components/GameCard';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMyRooms } from '../hooks/useMyRooms';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/* ── Landing ──────────────────────────────────────────────── */
export function RoomLandingPage({ navigate }) {
  const { t } = useLang();
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState('');
  const { rooms: myRooms, forget } = useMyRooms();

  usePageTitle(t.room.landing_title);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${BASE}/api/rooms`, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ name: roomName.trim() || null }),
      });
      const { roomId } = await res.json();
      navigate('room', { roomId });
    } catch {
      setError(t.room.error_create);
      setCreating(false);
    }
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

      {/* My Rooms — remembered rooms for quick return */}
      {myRooms.length > 0 && (
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em',
            textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>
            {t.room.my_rooms || 'Your Rooms'}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {myRooms.map(r => (
              <div key={r.roomId}
                onClick={() => navigate('room', { roomId: r.roomId })}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'0.85rem 1.1rem', background:'var(--surface)',
                  border:'1px solid var(--border)', borderRadius:'var(--r)',
                  cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';}}
              >
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)' }}>
                    {r.name || r.roomId}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
                    {r.name && <span style={{ fontFamily:'var(--font-heading)', letterSpacing:'0.06em', marginRight:'0.5rem' }}>{r.roomId}</span>}
                    {t.room.as || 'as'} {r.nickname}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color:'var(--text-4)' }}/>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="split-panels" style={{marginBottom:'2.5rem'}}>
        <div className="panel">
          <div className="panel-eyebrow">{t.room.create_label}</div>
          <div className="panel-title">{t.room.create_title}</div>
          <p className="panel-desc">{t.room.create_desc}</p>
          <input
            type="text" className="field-input"
            placeholder={t.room.name_ph || 'Room name (optional) — e.g. "Friday Squad"'}
            maxLength={40} value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
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
              type="text" className="code-input"
              placeholder={t.room.join_ph} maxLength={6}
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
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

/* ── Vote button on a game card ── */
function VoteBadge({ count, active, onVote }) {
  return (
    <button onClick={onVote}
      style={{ display:'flex', alignItems:'center', gap:'0.3rem',
        padding:'0.3rem 0.7rem', borderRadius:100,
        border:`1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        background: active ? 'var(--primary-light)' : 'var(--surface)',
        color: active ? 'var(--primary)' : 'var(--text-3)',
        fontSize:'0.75rem', fontWeight:700, cursor:'pointer',
        transition:'all 0.15s', fontFamily:'var(--font-body)' }}>
      <Heart size={11} fill={active ? 'var(--primary)' : 'none'}/>
      {count}
    </button>
  );
}

/* ── Active Room ──────────────────────────────────────────── */
export function RoomPage({ roomId, navigate }) {
  const { t } = useLang();
  const [room,       setRoom]       = useState(null);
  const [step,       setStep]       = useState('nickname');
  const [nickname,   setNickname]   = useState('');
  const [recs,       setRecs]       = useState([]);
  const [votes,      setVotes]      = useState({});
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [copied,     setCopied]     = useState(false);
  const [isInvite,   setIsInvite]   = useState(false);
  const [finalized,  setFinalized]  = useState(null);
  const [editingName,setEditingName]= useState(false);
  const [nameInput,  setNameInput]  = useState('');
  const { remember } = useMyRooms();

  usePageTitle(room?.name ? room.name : `${t.room.landing_title} · ${roomId}`);

  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const loadRoom = useCallback(async () => {
    try {
      const r = await fetchRoom(roomId);
      setRoom(r);
      setVotes(r.votes || {});
      setHistory(r.history || []);
    } catch { setError(t.room.not_found); }
  }, [roomId, t]);

  useEffect(() => {
    loadRoom();
    if (document.referrer === '' || !document.referrer.includes(window.location.hostname)) {
      setIsInvite(true);
    }
  }, [loadRoom]);

  // Poll while on results
  useEffect(() => {
    if (step !== 'results') return;
    const id = setInterval(async () => {
      const r = await fetchRoomRecs(roomId).catch(() => []);
      setRecs(r);
      loadRoom();
    }, 5000);
    return () => clearInterval(id);
  }, [step, roomId, loadRoom]);

  const handleSubmitPrefs = async (prefs) => {
    setLoading(true);
    try {
      const result = await joinRoom(roomId, nickname, prefs);
      setRoom(result.room);
      setRecs(result.recommendations);
      setVotes(result.room.votes || {});
      setStep('results');
      remember(roomId, result.room.name, nickname);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleVote = async (gameId) => {
    try {
      const res = await fetch(`${BASE}/api/rooms/${roomId}/vote`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ gameId, nickname }),
      });
      const data = await res.json();
      setVotes(data.votes);
    } catch {}
  };

  const handleFinalize = async (game) => {
    try {
      const res = await fetch(`${BASE}/api/rooms/${roomId}/finalize`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ gameId: game.id, gameName: game.name, coverImage: game.coverImage }),
      });
      const data = await res.json();
      setHistory(data.history);
      setVotes({});
      setFinalized(game);
    } catch {}
  };

  const saveRoomName = async () => {
    if (!nameInput.trim()) { setEditingName(false); return; }
    try {
      const res = await fetch(`${BASE}/api/rooms/${roomId}/name`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const updated = await res.json();
      setRoom(updated);
      setEditingName(false);
    } catch { setEditingName(false); }
  };

  if (error) return (
    <div className="room-page">
      <div className="alert alert-error" style={{marginBottom:'1.25rem'}}>{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('room-landing')}>{t.common.back}</button>
    </div>
  );
  if (!room) return <div className="loading-wrap"><div className="spinner"/><div className="loading-text">{t.common.loading}</div></div>;

  // Vote leader (for showing crown on results)
  const topVoteCount = Math.max(0, ...Object.values(votes).map(v => v.length));
  const topVotedId = Object.entries(votes).find(([,v]) => v.length === topVoteCount && topVoteCount > 0)?.[0];

  return (
    <div className="room-page">
      {/* Finalized celebration overlay */}
      {finalized && (
        <div onClick={() => setFinalized(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000,
            display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', padding:'2.5rem',
              maxWidth:420, textAlign:'center', boxShadow:'var(--sh-lg)' }}>
            <PartyPopper size={40} style={{ color:'var(--primary)', margin:'0 auto 1rem' }}/>
            <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em',
              textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.5rem' }}>
              {t.room.tonights_pick || "Tonight's Pick"}
            </div>
            {finalized.coverImage && (
              <img src={finalized.coverImage} alt={finalized.name}
                style={{ width:'100%', borderRadius:'var(--r)', marginBottom:'1rem' }}
                onError={e=>e.target.style.display='none'}/>
            )}
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.4rem', fontWeight:800,
              color:'var(--text)', marginBottom:'1.25rem' }}>
              {finalized.name}
            </div>
            <button className="btn btn-primary btn-full" onClick={() => setFinalized(null)}>
              {t.room.have_fun || 'Have fun! 🎮'}
            </button>
          </div>
        </div>
      )}

      {/* Invite banner */}
      {isInvite && step === 'nickname' && (
        <div className="room-invite-banner">
          <div className="room-invite-icon"><Link2 size={18} color="#fff"/></div>
          <div>
            <div className="room-invite-title">
              {room.name
                ? (t.room.invited_named ? t.room.invited_named(room.name) : `You've been invited to "${room.name}"`)
                : (t.room.invited ? t.room.invited(roomId) : `You've been invited to room ${roomId}`)}
            </div>
            <div className="room-invite-sub">{t.room.invite_sub || "Enter your nickname and add your preferences — together you'll find something to play."}</div>
          </div>
        </div>
      )}

      {/* Room header — name + code */}
      <div className="room-code-box">
        <div style={{ flex:1, minWidth:0 }}>
          {editingName ? (
            <div style={{ display:'flex', gap:'0.4rem' }}>
              <input autoFocus value={nameInput} onChange={e=>setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveRoomName()}
                placeholder={t.room.name_ph || 'Room name'}
                className="field-input" style={{ margin:0 }} maxLength={40}/>
              <button className="btn btn-primary btn-sm" onClick={saveRoomName}>{t.common.save || 'Save'}</button>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <div>
                <div className="room-code-label">{room.name ? t.room.room_name || 'Room' : t.room.code_label}</div>
                <div className="room-code-value" style={{ fontSize: room.name ? '1.5rem' : '2rem' }}>
                  {room.name || roomId}
                </div>
                {room.name && (
                  <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.85rem',
                    letterSpacing:'0.1em', color:'var(--text-3)', marginTop:'0.15rem' }}>
                    {roomId}
                  </div>
                )}
              </div>
              <button onClick={() => { setNameInput(room.name || ''); setEditingName(true); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-4)', padding:'0.25rem' }}
                title={t.room.rename || 'Rename room'}>
                <Edit2 size={14}/>
              </button>
            </div>
          )}
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

      {/* Game Night history */}
      {history.length > 0 && (
        <div className="room-members-box" style={{ marginBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.7rem' }}>
            <Clock size={12} style={{ color:'var(--text-3)' }}/>
            <div className="room-members-label" style={{ marginBottom:0 }}>
              {t.room.game_nights ? t.room.game_nights(history.length) : `${history.length} Game Night${history.length!==1?'s':''}`}
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', overflowX:'auto', paddingBottom:'0.25rem' }}>
            {history.slice(0,10).map((h,i) => (
              <div key={i} onClick={() => navigate('game', { id: h.gameId })}
                style={{ flexShrink:0, width:110, cursor:'pointer' }}>
                {h.coverImage ? (
                  <img src={h.coverImage} alt={h.gameName}
                    style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover',
                      borderRadius:'var(--r-sm)', marginBottom:'0.35rem' }}
                    onError={e=>e.target.style.display='none'}/>
                ) : (
                  <div style={{ width:'100%', aspectRatio:'16/9', background:'var(--surface2)',
                    borderRadius:'var(--r-sm)', marginBottom:'0.35rem' }}/>
                )}
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text)',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {h.gameName}
                </div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-4)' }}>
                  {new Date(h.decidedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          {loading ? (
            <div className="loading-wrap" style={{padding:'3rem 0'}}>
              <div className="spinner"/><div className="loading-text">{t.room.submitting}</div>
            </div>
          ) : (
            <PreferencesForm onSubmit={handleSubmitPrefs} compact/>
          )}
        </div>
      )}

      {/* Step: Results + Voting */}
      {step === 'results' && (
        <div>
          <div className="room-results-header">
            <div>
              <div className="room-results-title">{t.room.results_title}</div>
              <div className="room-results-sub">
                {t.room.vote_hint || 'Vote for your favorite — most votes wins tonight'}
              </div>
            </div>
            <div className="live-badge"><div className="live-dot"/><Wifi size={11}/> {t.room.live}</div>
          </div>

          {recs.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Users size={32}/></div>
              <p className="empty-text">{t.room.no_recs}<br/>{t.room.no_recs_hint}</p>
            </div>
          ) : (
            <div className="room-results-grid">
              {recs.map((game, i) => {
                const gameVotes = votes[game.id] || [];
                const isTop = game.id === topVotedId && topVoteCount > 0;
                return (
                  <div key={game.id} style={{ position:'relative' }}>
                    {isTop && (
                      <div style={{ position:'absolute', top:-10, left:12, zIndex:5,
                        display:'flex', alignItems:'center', gap:'0.3rem',
                        background:'var(--primary)', color:'#fff', padding:'0.25rem 0.65rem',
                        borderRadius:100, fontSize:'0.68rem', fontWeight:700 }}>
                        <Trophy size={10}/> {t.room.leading || 'Leading'}
                      </div>
                    )}
                    <GameCard game={game} rank={i+1} animate={false}
                      onClick={() => navigate('game',{id:game.id})}/>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      marginTop:'0.5rem', gap:'0.5rem' }}>
                      <VoteBadge count={gameVotes.length} active={gameVotes.includes(nickname)}
                        onVote={() => handleVote(game.id)}/>
                      {gameVotes.length > 0 && (
                        <button onClick={() => handleFinalize(game)}
                          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                            gap:'0.35rem', padding:'0.3rem 0.6rem', background:'var(--surface2)',
                            border:'1px solid var(--border)', borderRadius:'var(--r-sm)',
                            fontSize:'0.72rem', fontWeight:700, color:'var(--text-2)',
                            cursor:'pointer', fontFamily:'var(--font-body)' }}>
                          <Sparkles size={11}/> {t.room.lock_in || 'Lock it in'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
