import React, { useState, useEffect } from 'react';
import { useLang } from '../i18n/LangContext';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const REACTIONS = [
  { key: 'playing',  emoji: '🔥', labelKey: 'playing'  },
  { key: 'finished', emoji: '✅', labelKey: 'finished'  },
  { key: 'want',     emoji: '❤️',  labelKey: 'want'     },
  { key: 'skip',     emoji: '👎', labelKey: 'not_for_me'},
];

export default function GameReactions({ gameId }) {
  const { t } = useLang();
  const storageKey = `gm_reaction_${gameId}`;
  
  const [counts,  setCounts]  = useState({});
  const [myReact, setMyReact] = useState(() => {
    try { return localStorage.getItem(storageKey) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/games/${gameId}/reactions`)
      .then(r => r.json())
      .then(data => { setCounts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [gameId]);

  const react = async (key) => {
    const prev = myReact;
    const next = prev === key ? null : key;
    
    // Optimistic update
    setMyReact(next);
    setCounts(c => {
      const updated = { ...c };
      if (prev) updated[prev] = Math.max(0, (updated[prev] || 0) - 1);
      if (next) updated[next] = (updated[next] || 0) + 1;
      return updated;
    });

    try { localStorage.setItem(storageKey, next || ''); } catch {}

    try {
      await fetch(`${BASE}/api/games/${gameId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: next, prev }),
      });
    } catch {}
  };

  const labels = {
    en: { playing:'Playing', finished:'Finished', want:'Want to play', not_for_me:'Not for me' },
    ru: { playing:'Играю', finished:'Прошёл', want:'Хочу сыграть', not_for_me:'Не моё' },
  };
  const rl = t.reactions || labels.en;

  return (
    <div style={{ marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:'1px solid var(--border)' }}>
      <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>
        {t.reactions?.title || 'Quick reaction'}
      </div>
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        {REACTIONS.map(r => {
          const active = myReact === r.key;
          const count  = counts[r.key] || 0;
          return (
            <button key={r.key} onClick={() => react(r.key)}
              style={{
                display:'flex', alignItems:'center', gap:'0.4rem',
                padding:'0.45rem 1rem',
                background: active ? 'var(--primary-light)' : 'var(--surface2)',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius:100, cursor:'pointer',
                fontSize:'0.82rem', fontWeight: active ? 700 : 500,
                color: active ? 'var(--primary)' : 'var(--text-2)',
                transition:'all 0.15s', fontFamily:'var(--font-body)',
              }}
            >
              <span>{r.emoji}</span>
              <span>{rl[r.labelKey] || r.labelKey}</span>
              {count > 0 && (
                <span style={{
                  background: active ? 'var(--primary)' : 'var(--surface3)',
                  color: active ? '#fff' : 'var(--text-3)',
                  borderRadius:100, padding:'0 0.4rem',
                  fontSize:'0.7rem', fontWeight:700, minWidth:18, textAlign:'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
