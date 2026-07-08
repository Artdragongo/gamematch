import React, { useState } from 'react';
import { Zap, User, Users, Monitor, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

const C = {
  primary: '#3B82F6', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  indigo: '#6366F1', indigoLight: '#EEF2FF', indigoMid: '#C7D2FE',
  surface: '#FFFFFF', border: '#E5E9F0', text: '#0F172A', text3: '#64748B',
  shadow: '0 6px 20px rgba(59,130,246,0.09), 0 2px 6px rgba(15,23,42,0.04)',
  shadowHover: '0 14px 34px rgba(59,130,246,0.18), 0 6px 14px rgba(15,23,42,0.07)',
};

function ChoiceTile({ icon, title, desc, onClick, compact, accent }) {
  const [hover, setHover] = useState(false);
  const a = accent || { fg: C.primary, light: C.primaryLight, mid: C.primaryMid };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: compact ? '0.6rem' : '0.8rem',
        padding: compact ? '1.3rem 0.85rem' : '1.9rem 1.25rem',
        border: `1.5px solid ${hover ? a.mid : C.border}`,
        borderRadius: '18px',
        cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
        background: hover ? a.light : C.surface,
        boxShadow: hover ? C.shadowHover : 'none',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s',
        width: '100%',
      }}
    >
      <div style={{
        width: compact ? 46 : 56, height: compact ? 46 : 56, borderRadius: '50%',
        background: hover ? '#fff' : a.light,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: a.fg, flexShrink: 0, transition: 'all 0.2s',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: compact ? '0.92rem' : '1.05rem', color: C.text, marginBottom: 3 }}>
          {title}
        </div>
        {desc && (
          <div style={{ fontSize: compact ? '0.74rem' : '0.82rem', color: C.text3, lineHeight: 1.45 }}>
            {desc}
          </div>
        )}
      </div>
    </button>
  );
}

export default function QuickMatch({ onResults, onFullSearch }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const qm = t.quickmatch || {};

  const handleMode = async (withFriends) => {
    setMode(withFriends);
    const savedPc = localStorage.getItem('gm_last_pc');
    if (savedPc) { setStep(2); await submit(withFriends, savedPc); }
    else setStep(1);
  };

  const handlePc = async (pcLevel) => {
    localStorage.setItem('gm_last_pc', pcLevel);
    setStep(2);
    await submit(mode, pcLevel);
  };

  const submit = async (withFriends, pcLevel) => {
    try {
      const results = await fetchRecommendations({
        players: withFriends ? '2' : '1', withFriends, genres: [], pcLevel,
      });
      onResults(results, { withFriends, pcLevel, players: withFriends ? '2' : '1', genres: [] });
    } catch { setStep(0); }
  };

  const reset = () => { setStep(0); setMode(null); };

  const blueAccent   = { fg: C.primary, light: C.primaryLight, mid: C.primaryMid };
  const indigoAccent = { fg: C.indigo,  light: C.indigoLight,  mid: C.indigoMid  };

  return (
    <div className="gm-fade" style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: '24px', padding: '1.75rem 2rem',
      maxWidth: 780, margin: '0 auto', boxShadow: C.shadow,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.4rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:C.primaryLight,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={18} style={{ color:C.primary }}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.1rem', fontWeight:800,
              color:C.text, lineHeight:1.2 }}>
              {qm.title || 'Quick Match'}
            </div>
            <div style={{ fontSize:'0.8rem', color:C.text3 }}>
              {qm.sub || '2 taps to a recommendation'}
            </div>
          </div>
        </div>
        <button onClick={onFullSearch}
          style={{ display:'flex', alignItems:'center', gap:'0.35rem',
            font:'600 0.82rem inherit', color:C.primary,
            background:C.primaryLight, border:'none',
            borderRadius:100, padding:'0.45rem 0.9rem', cursor:'pointer' }}>
          <SlidersHorizontal size={13}/> {qm.full || 'Full search'}
        </button>
      </div>

      {step === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <ChoiceTile
            icon={<User size={24}/>}
            title={t.form.style_solo}
            desc={qm.solo_desc || 'Just me, playing alone'}
            onClick={() => handleMode(false)}
            accent={blueAccent}
          />
          <ChoiceTile
            icon={<Users size={24}/>}
            title={t.form.style_friends}
            desc={qm.friends_desc || 'Co-op, multiplayer or local'}
            onClick={() => handleMode(true)}
            accent={indigoAccent}
          />
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontSize:'0.74rem', fontWeight:700, letterSpacing:'0.06em',
            textTransform:'uppercase', color:C.text3, marginBottom:'0.75rem' }}>
            {t.form.pc_label}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.75rem', marginBottom:'0.9rem' }}>
            {[
              { key:'low',    label:t.form.pc_low_title },
              { key:'medium', label:t.form.pc_med_title },
              { key:'high',   label:t.form.pc_hi_title  },
            ].map(opt => (
              <ChoiceTile
                key={opt.key}
                compact
                icon={<Monitor size={19}/>}
                title={opt.label}
                onClick={() => handlePc(opt.key)}
                accent={blueAccent}
              />
            ))}
          </div>
          <button onClick={reset}
            style={{ display:'flex', alignItems:'center', gap:5, font:'500 0.82rem inherit', color:C.text3,
              background:'none', border:'none', cursor:'pointer' }}>
            <ArrowLeft size={13}/> {t.common.back}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign:'center', padding:'1.3rem 0' }}>
          <div className="spinner" style={{ margin:'0 auto 0.7rem' }}/>
          <div style={{ fontSize:'0.88rem', color:C.text3 }}>{t.common.loading}</div>
        </div>
      )}
    </div>
  );
}
