import React, { useState } from 'react';
import { Zap, User, Users, Monitor, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

const C = {
  primary: '#3B82F6',
  primaryLight: '#EFF6FF',
  primaryMid: '#BFDBFE',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  border: '#E5E9F0',
  text: '#0F172A',
  text3: '#64748B',
  shadow: '0 4px 16px rgba(59,130,246,0.08), 0 2px 6px rgba(15,23,42,0.04)',
  shadowHover: '0 10px 28px rgba(59,130,246,0.16), 0 4px 10px rgba(15,23,42,0.06)',
};

/* A single choice tile — icon centered on top, title, subtitle below.
   Grid-card style rather than a wide horizontal bar. */
function ChoiceTile({ icon, title, desc, onClick, compact }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: compact ? '0.5rem' : '0.65rem',
        padding: compact ? '1.1rem 0.75rem' : '1.5rem 1rem',
        border: `1.5px solid ${hover ? C.primary : C.border}`,
        borderRadius: '16px',
        cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
        background: hover ? C.primaryLight : C.surface,
        boxShadow: hover ? C.shadowHover : 'none',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s',
        width: '100%',
      }}
    >
      <div style={{
        width: compact ? 40 : 48, height: compact ? 40 : 48, borderRadius: '50%',
        background: hover ? '#fff' : C.primaryLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.primary, flexShrink: 0, transition: 'all 0.18s',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: compact ? '0.85rem' : '0.95rem', color: C.text, marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ fontSize: compact ? '0.7rem' : '0.76rem', color: C.text3, lineHeight: 1.4 }}>
          {desc}
        </div>
      </div>
    </button>
  );
}

export default function QuickMatch({ onResults, onFullSearch }) {
  const { t } = useLang();
  const [step, setStep] = useState(0); // 0=mode 1=pc 2=loading
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

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: '20px', padding: '1.4rem 1.6rem',
      maxWidth: 600, margin: '0 auto', boxShadow: C.shadow,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
          <div style={{ width:30, height:30, borderRadius:9, background:C.primaryLight,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={14} style={{ color:C.primary }}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.94rem', fontWeight:800,
              color:C.text, lineHeight:1.2 }}>
              {qm.title || 'Quick Match'}
            </div>
            <div style={{ fontSize:'0.72rem', color:C.text3 }}>
              {qm.sub || '2 taps to a recommendation'}
            </div>
          </div>
        </div>
        <button onClick={onFullSearch}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.76rem inherit', color:C.primary,
            background:C.primaryLight, border:'none',
            borderRadius:100, padding:'0.35rem 0.75rem', cursor:'pointer' }}>
          <SlidersHorizontal size={11}/> {qm.full || 'Full search'}
        </button>
      </div>

      {/* Step 0 — Solo or Friends, side-by-side choice tiles */}
      {step === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          <ChoiceTile
            icon={<User size={21}/>}
            title={t.form.style_solo}
            desc={qm.solo_desc || 'Just me, playing alone'}
            onClick={() => handleMode(false)}
          />
          <ChoiceTile
            icon={<Users size={21}/>}
            title={t.form.style_friends}
            desc={qm.friends_desc || 'Co-op, multiplayer or local'}
            onClick={() => handleMode(true)}
          />
        </div>
      )}

      {/* Step 1 — PC level, three-up choice tiles */}
      {step === 1 && (
        <div>
          <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.06em',
            textTransform:'uppercase', color:C.text3, marginBottom:'0.6rem' }}>
            {t.form.pc_label}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.6rem', marginBottom:'0.75rem' }}>
            {[
              { key:'low',    label:t.form.pc_low_title },
              { key:'medium', label:t.form.pc_med_title },
              { key:'high',   label:t.form.pc_hi_title  },
            ].map(opt => (
              <ChoiceTile
                key={opt.key}
                compact
                icon={<Monitor size={17}/>}
                title={opt.label}
                desc=""
                onClick={() => handlePc(opt.key)}
              />
            ))}
          </div>
          <button onClick={reset}
            style={{ display:'flex', alignItems:'center', gap:4, font:'500 0.76rem inherit', color:C.text3,
              background:'none', border:'none', cursor:'pointer' }}>
            <ArrowLeft size={12}/> {t.common.back}
          </button>
        </div>
      )}

      {/* Step 2 — Loading */}
      {step === 2 && (
        <div style={{ textAlign:'center', padding:'1.1rem 0' }}>
          <div className="spinner" style={{ margin:'0 auto 0.6rem' }}/>
          <div style={{ fontSize:'0.82rem', color:C.text3 }}>{t.common.loading}</div>
        </div>
      )}
    </div>
  );
}
