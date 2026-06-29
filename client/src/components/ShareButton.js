import React, { useState } from 'react';
import { Share2, Check, Link } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

export default function ShareButton({ prefs, results }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    const base = window.location.origin;
    const params = new URLSearchParams();
    if (prefs?.genres?.length)   params.set('genres', prefs.genres.join(','));
    if (prefs?.pcLevel)          params.set('pc', prefs.pcLevel);
    if (prefs?.withFriends)      params.set('coop', '1');
    if (prefs?.players)          params.set('players', prefs.players);
    // Add top 5 game IDs so recipient sees same results
    if (results?.length) params.set('games', results.slice(0,5).map(g=>g.id).join(','));
    return `${base}/?${params.toString()}`;
  };

  const handleShare = async () => {
    const url = buildUrl();
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GameMatch — My game picks',
          text: `Check out these game recommendations I got on GameMatch!`,
          url,
        });
        return;
      } catch {}
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <button className="btn btn-secondary" onClick={handleShare}>
      {copied
        ? <><Check size={14}/> {t.share?.copied || 'Link copied!'}</>
        : <><Share2 size={14}/> {t.share?.button || 'Share results'}</>
      }
    </button>
  );
}
