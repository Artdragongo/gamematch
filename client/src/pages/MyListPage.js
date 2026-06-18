import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ThumbsDown, Gamepad2 } from 'lucide-react';
import { useGameList } from '../hooks/useGameList';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { fetchAllGames } from '../utils/api';
import GameCard from '../components/GameCard';

const TABS = [
  { key: 'played', icon: <BookOpen size={13} />, labelKey: 'played' },
  { key: 'want',   icon: <Heart size={13} />,    labelKey: 'want'   },
  { key: 'skip',   icon: <ThumbsDown size={13}/>, labelKey: 'skip'  },
];

export default function MyListPage({ navigate }) {
  const { t } = useLang();
  const { list, getByStatus } = useGameList();
  const [activeTab, setActiveTab] = useState('played');
  const [allGames, setAllGames]   = useState([]);
  const [loading, setLoading]     = useState(true);

  usePageTitle(t.list?.title || 'My Games');

  useEffect(() => {
    fetchAllGames().then(g => { setAllGames(g); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const counts = {
    played: getByStatus('played').length,
    want:   getByStatus('want').length,
    skip:   getByStatus('skip').length,
  };

  const total = counts.played + counts.want + counts.skip;

  const gamesForTab = () => {
    const ids = getByStatus(activeTab);
    return allGames.filter(g => ids.includes(g.id));
  };

  const emptyMessages = {
    played: t.list?.empty_played || '',
    want:   t.list?.empty_want   || '',
    skip:   t.list?.empty_skip   || '',
  };

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1 className="list-page-title">{t.list?.title || 'My Games'}</h1>
        <p className="list-page-sub">{t.list?.sub || ''}</p>
      </div>

      {!loading && total === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Gamepad2 size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-4)' }} />
          <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {t.list?.all_empty || ''}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('browse')}>
            {t.list?.go_browse || 'Browse Games'}
          </button>
        </div>
      ) : (
        <>
          <div className="list-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`list-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {' '}{t.list?.[tab.labelKey] || tab.labelKey}
                <span className="list-tab-count">{counts[tab.key]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /><div className="loading-text">{t.common.loading}</div></div>
          ) : gamesForTab().length === 0 ? (
            <div className="list-empty">{emptyMessages[activeTab]}</div>
          ) : (
            <div className="results-grid">
              {gamesForTab().map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  animate={false}
                  onClick={() => navigate('game', { id: game.id })}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
