import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, X, Share2, Flame, Trophy, Search } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { searchGames } from '../utils/api';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const MAX_ATTEMPTS = 6;

const C = {
  primary: '#3B82F6', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  surface: '#FFFFFF', surface2: '#F1F5F9', border: '#E5E9F0',
  text: '#0F172A', text3: '#64748B',
  green: '#16A34A', greenLight: '#F0FDF4',
  red: '#DC2626', redLight: '#FEF2F2',
};

const COPY = {
  en: {
    title: "Today's Puzzle", sub: 'Guess the game from the emoji clues',
    placeholder: 'Type a game name…', attemptsLeft: n => `${n} guess${n!==1?'es':''} left`,
    won: 'Solved it!', lost: "That's the game", solvedIn: n => `Solved in ${n}/${MAX_ATTEMPTS}`,
    viewGame: 'View game', share: 'Share result', copied: 'Copied!',
    streak: 'Streak', played: 'Played', winRate: 'Win rate',
    alreadyPlayed: "You've already played today's puzzle",
    comeBack: 'Come back tomorrow for a new one!',
    yourGuesses: 'Your guesses',
  },
  ru: {
    title: 'Пазл дня', sub: 'Угадай игру по эмодзи-подсказкам',
    placeholder: 'Введи название игры…', attemptsLeft: n => `Осталось попыток: ${n}`,
    won: 'Угадано!', lost: 'Вот эта игра', solvedIn: n => `Угадано за ${n}/${MAX_ATTEMPTS}`,
    viewGame: 'Смотреть игру', share: 'Поделиться', copied: 'Скопировано!',
    streak: 'Серия', played: 'Сыграно', winRate: '% побед',
    alreadyPlayed: 'Вы уже сыграли сегодняшний пазл',
    comeBack: 'Возвращайтесь завтра за новым!',
    yourGuesses: 'Ваши попытки',
  },
};

function loadStats() {
  try { return JSON.parse(localStorage.getItem('gm_emoji_stats')) || { streak:0, maxStreak:0, played:0, won:0, lastPuzzle:null }; }
  catch { return { streak:0, maxStreak:0, played:0, won:0, lastPuzzle:null }; }
}
function saveStats(s) { try { localStorage.setItem('gm_emoji_stats', JSON.stringify(s)); } catch {} }

function loadPuzzleState(puzzleNumber) {
  try {
    const raw = JSON.parse(localStorage.getItem('gm_emoji_state'));
    if (raw?.puzzleNumber === puzzleNumber) return raw;
  } catch {}
  return null;
}
function savePuzzleState(state) { try { localStorage.setItem('gm_emoji_state', JSON.stringify(state)); } catch {} }

/* ── Autocomplete guess input — reuses the existing search endpoint ── */
function GuessInput({ onSubmit, disabled, placeholder }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = val => {
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try { const r = await searchGames(val); setResults(r); setOpen(true); } catch {}
    }, 200);
  };

  const submit = (name) => {
    onSubmit(name);
    setQuery(''); setResults([]); setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <div style={{ position:'relative' }}>
        <Search size={15} style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:C.text3 }}/>
        <input
          value={query} disabled={disabled}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && query.trim() && submit(query)}
          placeholder={placeholder}
          style={{ width:'100%', padding:'0.85rem 1rem 0.85rem 2.6rem', fontSize:'0.95rem',
            border:`1.5px solid ${C.border}`, borderRadius:14, outline:'none',
            fontFamily:'inherit', opacity: disabled ? 0.5 : 1 }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
          background:'#fff', border:`1px solid ${C.border}`, borderRadius:14,
          boxShadow:'0 12px 32px rgba(15,23,42,0.12)', overflow:'hidden', zIndex:20 }}>
          {results.map(g => (
            <div key={g.id} onClick={() => submit(g.name)}
              style={{ padding:'0.7rem 1rem', cursor:'pointer', fontSize:'0.88rem', fontWeight:600, color:C.text,
                borderBottom:`1px solid ${C.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.surface2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {g.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmojiPuzzlePage({ navigate }) {
  const { lang } = useLang();
  const copy = lang === 'ru' ? COPY.ru : COPY.en;
  usePageTitle(copy.title);

  const [puzzleNumber, setPuzzleNumber] = useState(null);
  const [emojis,       setEmojis]       = useState([]);
  const [guesses,      setGuesses]      = useState([]); // [{ text, correct }]
  const [completed,    setCompleted]    = useState(false);
  const [won,          setWon]          = useState(false);
  const [revealedGame, setRevealedGame] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [stats,        setStats]        = useState(loadStats);

  useEffect(() => {
    fetch(`${BASE}/api/emoji-puzzle/today`)
      .then(r => r.json())
      .then(data => {
        setPuzzleNumber(data.puzzleNumber);
        setEmojis(data.emojis || []);
        const saved = loadPuzzleState(data.puzzleNumber);
        if (saved) {
          setGuesses(saved.guesses || []);
          setCompleted(saved.completed || false);
          setWon(saved.won || false);
          setRevealedGame(saved.revealedGame || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const persist = (next) => {
    savePuzzleState({ puzzleNumber, guesses: next.guesses, completed: next.completed, won: next.won, revealedGame: next.revealedGame });
  };

  const updateStatsOnFinish = (didWin) => {
    setStats(prev => {
      const next = { ...prev };
      const isConsecutive = prev.lastPuzzle === puzzleNumber - 1;
      next.streak = didWin ? (isConsecutive ? prev.streak + 1 : 1) : 0;
      next.maxStreak = Math.max(next.streak, prev.maxStreak || 0);
      next.played = (prev.played || 0) + 1;
      next.won = (prev.won || 0) + (didWin ? 1 : 0);
      next.lastPuzzle = puzzleNumber;
      saveStats(next);
      return next;
    });
  };

  const handleGuess = async (text) => {
    if (submitting || completed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/emoji-puzzle/guess`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: text, attemptsUsed: guesses.length }),
      });
      const data = await res.json();
      const newGuesses = [...guesses, { text, correct: data.correct }];
      setGuesses(newGuesses);

      if (data.revealed) {
        setCompleted(true);
        setWon(data.correct);
        setRevealedGame(data.game);
        persist({ guesses: newGuesses, completed: true, won: data.correct, revealedGame: data.game });
        updateStatsOnFinish(data.correct);
      } else {
        persist({ guesses: newGuesses, completed: false, won: false, revealedGame: null });
      }
    } catch {}
    setSubmitting(false);
  };

  const handleShare = () => {
    const squares = guesses.map(g => g.correct ? '🟩' : '🟥').join('');
    const text = `GameMatch Daily #${puzzleNumber}\n${emojis.join(' ')}\n${squares}\n${window.location.origin}/emoji`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const attemptsLeft = MAX_ATTEMPTS - guesses.length;
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'5rem 2rem' }}>
      <div className="spinner"/>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin:'0 auto', padding:'2.5rem 1.5rem 4rem' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px',
          background:C.primaryLight, border:`1px solid ${C.primaryMid}`, borderRadius:100,
          fontSize:'0.78rem', fontWeight:700, color:C.primary, marginBottom:'1rem' }}>
          <Sparkles size={12}/> #{puzzleNumber}
        </div>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'1.9rem', fontWeight:800,
          color:C.text, letterSpacing:'-0.02em', marginBottom:'0.4rem' }}>
          {copy.title}
        </h1>
        <p style={{ color:C.text3, fontSize:'0.95rem' }}>{copy.sub}</p>
      </div>

      {/* Emoji display */}
      <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:20,
        padding:'2.5rem 1.5rem', textAlign:'center', marginBottom:'1.25rem', boxShadow:'0 6px 20px rgba(59,130,246,0.08)' }}>
        <div style={{ fontSize:'3.2rem', letterSpacing:'0.3rem' }}>
          {emojis.join(' ')}
        </div>
      </div>

      {/* Guess history */}
      {guesses.length > 0 && (
        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
            color:C.text3, marginBottom:'0.6rem' }}>
            {copy.yourGuesses}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {guesses.map((g, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.7rem',
                padding:'0.65rem 0.9rem', borderRadius:12,
                background: g.correct ? C.greenLight : C.redLight,
                border:`1px solid ${g.correct ? '#BBF7D0' : '#FECACA'}` }}>
                {g.correct ? <Check size={16} style={{ color:C.green }}/> : <X size={16} style={{ color:C.red }}/>}
                <span style={{ fontSize:'0.88rem', fontWeight:600, color:C.text }}>{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guess input or result */}
      {!completed ? (
        <>
          <GuessInput onSubmit={handleGuess} disabled={submitting} placeholder={copy.placeholder}/>
          <div style={{ textAlign:'center', marginTop:'0.75rem', fontSize:'0.82rem', color:C.text3, fontWeight:600 }}>
            {copy.attemptsLeft(attemptsLeft)}
          </div>
        </>
      ) : (
        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:20, padding:'1.75rem',
          textAlign:'center', boxShadow:'0 10px 28px rgba(15,23,42,0.08)' }}>
          {won ? <Trophy size={32} style={{ color:'#F59E0B', margin:'0 auto 0.75rem' }}/>
               : <X size={32} style={{ color:C.red, margin:'0 auto 0.75rem' }}/>}
          <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.15rem', fontWeight:800, color:C.text, marginBottom:'0.3rem' }}>
            {won ? copy.won : copy.lost}
          </div>
          {won && <div style={{ fontSize:'0.85rem', color:C.text3, marginBottom:'1.25rem' }}>{copy.solvedIn(guesses.length)}</div>}

          {revealedGame && (
            <div style={{ display:'flex', alignItems:'center', gap:'0.9rem', textAlign:'left',
              background:C.surface2, borderRadius:14, padding:'0.9rem', marginBottom:'1.25rem' }}>
              {revealedGame.coverImage
                ? <img src={revealedGame.coverImage} alt={revealedGame.name}
                    style={{ width:80, aspectRatio:'16/9', objectFit:'cover', borderRadius:8, flexShrink:0 }}
                    onError={e => e.target.style.display='none'}/>
                : null}
              <div>
                <div style={{ fontWeight:700, fontSize:'0.95rem', color:C.text }}>{revealedGame.name}</div>
                <div style={{ fontSize:'0.78rem', color:C.text3 }}>{revealedGame.genre?.slice(0,2).join(', ')}</div>
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:'0.6rem' }}>
            <button onClick={handleShare}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                padding:'0.75rem', borderRadius:12, border:`1px solid ${C.border}`, background:'#fff',
                fontWeight:700, fontSize:'0.85rem', color:C.text, cursor:'pointer' }}>
              {copied ? <Check size={15}/> : <Share2 size={15}/>} {copied ? copy.copied : copy.share}
            </button>
            {revealedGame && (
              <button onClick={() => navigate('game', { id: revealedGame.id })}
                style={{ flex:1, padding:'0.75rem', borderRadius:12, border:'none', background:C.primary,
                  fontWeight:700, fontSize:'0.85rem', color:'#fff', cursor:'pointer' }}>
                {copy.viewGame}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.75rem', marginTop:'2rem' }}>
        {[
          { Icon: Flame,   num: stats.streak || 0, label: copy.streak },
          { Icon: Sparkles,num: stats.played || 0, label: copy.played },
          { Icon: Trophy,  num: `${winRate}%`,     label: copy.winRate },
        ].map(({ Icon, num, label }, i) => (
          <div key={i} style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:14,
            padding:'1rem 0.5rem', textAlign:'center' }}>
            <Icon size={16} style={{ color:C.primary, margin:'0 auto 0.4rem' }}/>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.2rem', fontWeight:800, color:C.text }}>{num}</div>
            <div style={{ fontSize:'0.68rem', color:C.text3, fontWeight:600 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
