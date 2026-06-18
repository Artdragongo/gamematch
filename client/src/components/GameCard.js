import React, { useState } from 'react';
import { Monitor, Users, Clock, Zap, ExternalLink, ArrowRight, BookOpen, Heart, ThumbsDown } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useGameList } from '../hooks/useGameList';

function getMatchScore(rank) {
  if (!rank) return null;
  const base = [99,97,95,93,90,87,84,81,78,75];
  return base[rank - 1] ?? Math.max(60, 75 - (rank - 10) * 3);
}

function matchColor(score) {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#84cc16';
  if (score >= 70) return '#f59e0b';
  return '#94a3b8';
}

function CoverImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#EEF2FF 0%,#F3F4F6 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'2rem', opacity:0.25 }}>🎮</span>
      </div>
    );
  }
  return (
    <>
      {!loaded && <div style={{ position:'absolute', inset:0, background:'var(--surface2)' }} />}
      <img
        src={src} alt={alt} loading="lazy"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: loaded ? 1 : 0, transition:'opacity .25s' }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}

export default function GameCard({ game, rank, onClick, animate = true, showListActions = true }) {
  const { t, lang }             = useLang();
  const { getStatus, setStatus } = useGameList();
  const score = getMatchScore(rank);
  const status = getStatus(game.id);

  const description = lang === 'ru' && game.shortDescriptionRu ? game.shortDescriptionRu : game.shortDescription;
  const pcClass     = { low:'tag-pc-low', medium:'tag-pc-med', high:'tag-pc-hi' }[game.pcRequirements] || 'tag-pc-med';
  const pcLabel     = { low: t.card.pc_low, medium: t.card.pc_med, high: t.card.pc_hi }[game.pcRequirements];
  const diffLabel   = { Easy: t.card.easy, Medium: t.card.medium, Hard: t.card.hard }[game.difficulty] || game.difficulty;
  const sessionLabel = { '15 min': t.card.session_15, '30 min': t.card.session_30, '1 hour': t.card.session_1h, '2+ hours': t.card.session_2h }[game.averageSession] || game.averageSession;
  const genreLabel  = g => (t.genres?.[g]) ? t.genres[g] : g;
  const playerStr   = game.minPlayers === game.maxPlayers ? t.card.players_single(game.minPlayers) : t.card.players_range(game.minPlayers, game.maxPlayers);

  const handleSteam = (e) => {
    e.stopPropagation();
    if (game.steamLink) window.open(game.steamLink, '_blank', 'noopener');
  };

  const handleList = (e, s) => {
    e.stopPropagation();
    setStatus(game.id, s);
  };

  return (
    <div
      className={`game-card${animate ? ' animate' : ''}`}
      onClick={() => onClick?.(game)}
      style={animate && rank ? { animationDelay: `${(rank - 1) * 0.04}s` } : {}}
    >
      {/* Image */}
      <div className="gc-img">
        <CoverImage src={game.coverImage} alt={game.name} />
        <div className="gc-img-gradient" />
        {rank && <div className="gc-rank">{rank}</div>}
      </div>

      {/* Match score bar */}
      {score && (
        <div style={{ padding:'0 1.1rem', paddingTop:'0.65rem', paddingBottom:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.3rem' }}>
            <span style={{ fontSize:'0.68rem', fontWeight:700, color: matchColor(score) }}>
              <Zap size={9} style={{ marginRight:2, verticalAlign:'middle' }} />{score}% {t.results.match}
            </span>
          </div>
          <div className="gc-match-bar-wrap">
            <div className="gc-match-bar" style={{ width:`${score}%`, background: matchColor(score) }} />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="gc-body">
        <div className="gc-title">{game.name}</div>
        <div className="gc-desc">{description}</div>

        <div className="gc-tags">
          {game.genre.slice(0, 2).map(g => (
            <span key={g} className="tag tag-genre">{genreLabel(g)}</span>
          ))}
          <span className={`tag ${pcClass}`}>{pcLabel}</span>
          <span className={`tag ${game.coop ? 'tag-coop' : 'tag-solo'}`}>
            {game.coop ? t.card.coop : t.card.solo}
          </span>
        </div>

        <div className="gc-meta">
          {game.difficulty && <span className="gc-meta-item"><Zap size={11}/>{diffLabel}</span>}
          {game.averageSession && <span className="gc-meta-item"><Clock size={11}/>{sessionLabel}</span>}
          <span className="gc-meta-item"><Monitor size={11}/>{pcLabel}</span>
        </div>

        <div className="gc-footer">
          <span className="gc-footer-players"><Users size={11}/>{playerStr}</span>
          <div className="gc-footer-actions">
            {game.steamLink && (
              <button className="gc-steam" onClick={handleSteam}>
                <ExternalLink size={10}/>{t.card.steam}
              </button>
            )}
            <button className="gc-details">
              {t.card.details} <ArrowRight size={11}/>
            </button>
          </div>
        </div>
      </div>

      {/* List actions */}
      {showListActions && (
        <div className="gc-list-actions" onClick={e => e.stopPropagation()}>
          <button
            className={`gc-list-btn ${status === 'played' ? 'played' : ''}`}
            onClick={e => handleList(e, 'played')}
            title={t.card.add_played}
          >
            <BookOpen size={10}/>
            {status === 'played' ? t.card.status_played : t.card.add_played?.split(' ')[0]}
          </button>
          <button
            className={`gc-list-btn ${status === 'want' ? 'want' : ''}`}
            onClick={e => handleList(e, 'want')}
            title={t.card.add_want}
          >
            <Heart size={10}/>
            {status === 'want' ? '♥' : '+'}
          </button>
          <button
            className={`gc-list-btn ${status === 'skip' ? 'skip' : ''}`}
            onClick={e => handleList(e, 'skip')}
            title={t.card.add_skip}
          >
            <ThumbsDown size={10}/>
          </button>
        </div>
      )}
    </div>
  );
}
