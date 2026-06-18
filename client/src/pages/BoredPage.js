import React, { useState } from 'react';
import { Zap, User, Users, Clock, RefreshCw, Search, ArrowRight } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { fetchBoredGames } from '../utils/api';
import GameCard from '../components/GameCard';

export default function BoredPage({ navigate }) {
  const { t } = useLang();
  const [step,        setStep]       = useState('pick'); // pick | result
  const [withFriends, setWithFriends] = useState(null);
  const [time,        setTime]        = useState(null);
  const [mood,        setMood]        = useState(null);
  const [pcLevel,     setPcLevel]     = useState(() => {
    try { return localStorage.getItem('gm_last_pc') || null; } catch { return null; }
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  usePageTitle(t.bored.title);

  // Auto-submit once all non-pc questions answered and pc remembered
  const tryAutoSubmit = async (wf, ti, mo, pc) => {
    if (wf === null || ti === null || mo === null || !pc) return;
    await doFetch(wf, ti, mo, pc);
  };

  const doFetch = async (wf, ti, mo, pc) => {
    setLoading(true); setError('');
    try {
      try { localStorage.setItem('gm_last_pc', pc); } catch {}
      const games = await fetchBoredGames({ withFriends: wf, timeAvailable: ti, mood: mo, pcLevel: pc });
      setResults(games);
      setStep('result');
    } catch { setError(t.common.error_server); }
    setLoading(false);
  };

  const handleWF = v => { setWithFriends(v); tryAutoSubmit(v, time, mood, pcLevel); };
  const handleTime = v => { setTime(v); tryAutoSubmit(withFriends, v, mood, pcLevel); };
  const handleMood = v => { setMood(v); tryAutoSubmit(withFriends, time, v, pcLevel); };
  const handlePc = async v => { setPcLevel(v); await doFetch(withFriends, time, mood, v); };

  const reset = () => { setStep('pick'); setWithFriends(null); setTime(null); setMood(null); setResults([]); };

  const canPickPc = withFriends !== null && time !== null && mood !== null;

  const timeOpts = [
    { key:'15min', label: t.bored.q2_15 },
    { key:'30min', label: t.bored.q2_30 },
    { key:'1h',    label: t.bored.q2_1h },
    { key:'2h',    label: t.bored.q2_2h },
  ];
  const pcOpts = [
    { key:'low',    label: t.form.pc_low_title },
    { key:'medium', label: t.form.pc_med_title },
    { key:'high',   label: t.form.pc_hi_title  },
  ];

  return (
    <div className="bored-page">
      <div className="bored-icon"><Zap size={26}/></div>
      <h1 className="bored-title">{t.bored.title}</h1>
      <p className="bored-sub">{t.bored.sub}</p>

      {error && <div className="alert alert-error" style={{ marginBottom:'1.5rem' }}>{error}</div>}

      {step === 'pick' && !loading && (
        <>
          {/* Q1: Solo / Friends */}
          <div className="bored-question">
            <div className="bored-q-label">{t.bored.q1_label}</div>
            <div className="bored-options">
              <button className={`bored-option ${withFriends === false ? 'on' : ''}`} onClick={() => handleWF(false)}>
                <User size={15}/> {t.bored.q1_solo}
              </button>
              <button className={`bored-option ${withFriends === true ? 'on' : ''}`} onClick={() => handleWF(true)}>
                <Users size={15}/> {t.bored.q1_friends}
              </button>
            </div>
          </div>

          {/* Q2: Time */}
          <div className="bored-question">
            <div className="bored-q-label">{t.bored.q2_label}</div>
            <div className="bored-time-grid">
              {timeOpts.map(o => (
                <button key={o.key} className={`bored-option ${time === o.key ? 'on' : ''}`} onClick={() => handleTime(o.key)}>
                  <Clock size={14}/> {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Mood */}
          <div className="bored-question">
            <div className="bored-q-label">{t.bored.q3_label}</div>
            <div className="bored-options">
              <button className={`bored-option ${mood === 'familiar' ? 'on' : ''}`} onClick={() => handleMood('familiar')}>
                {t.bored.q3_familiar}
              </button>
              <button className={`bored-option ${mood === 'new' ? 'on' : ''}`} onClick={() => handleMood('new')}>
                {t.bored.q3_new}
              </button>
            </div>
          </div>

          {/* PC level — only shown if needed (not remembered) */}
          {canPickPc && !pcLevel && (
            <div className="bored-question">
              <div className="bored-q-label">{t.bored.pc_label}</div>
              <div className="bored-options" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                {pcOpts.map(o => (
                  <button key={o.key} className={`bored-option ${pcLevel === o.key ? 'on' : ''}`} onClick={() => handlePc(o.key)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual trigger if PC already known */}
          {canPickPc && pcLevel && (
            <button className="btn btn-primary btn-lg btn-full" onClick={() => doFetch(withFriends, time, mood, pcLevel)}>
              {t.bored.find} <Zap size={15}/>
            </button>
          )}
        </>
      )}

      {loading && (
        <div className="loading-wrap" style={{ padding:'3rem 0' }}>
          <div className="spinner"/><div className="loading-text">{t.common.loading}</div>
        </div>
      )}

      {step === 'result' && !loading && (
        <div className="bored-results">
          <div className="bored-results-title">{t.bored.result_title}</div>
          <div className="bored-results-sub">{t.bored.result_sub}</div>
          <div className="bored-grid">
            {results.map(game => (
              <GameCard key={game.id} game={game} animate={false} onClick={() => navigate('game', { id: game.id })}/>
            ))}
          </div>
          <div className="bored-result-actions">
            <button className="btn btn-secondary" onClick={reset}>
              <RefreshCw size={14}/> {t.bored.try_again}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('home')}>
              <Search size={14}/> {t.bored.go_full}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
