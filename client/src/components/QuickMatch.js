import React, { useState } from 'react';
import { Zap, User, Users, Monitor, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

const C = {
  primary: '#3B82F6',
  primaryLight: '#EFF6FF',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E5E9F0',
  text: '#0F172A',
  text3: '#64748B',
  radius: '14px',
  shadow: '0 4px 16px rgba(59,130,246,0.08), 0 2px 6px rgba(15,23,42,0.04)',
};

/* A single row option — fully inline, hover handled via onMouseEnter/Leave
   so it can never depend on an external CSS class being present. */
function OptionRow({ icon, title, desc, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
        padding: '1rem 1.1rem', border: 'none', borderRadius: C.radius,
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        background: hover ? C.primaryLight : C.surface2,
        transform: hover ? 'translateX(2px)' : 'none',
        transition: 'all 0.18s',
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.primaryLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: C.text, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: '0.76rem', color: C.text3 }}>{desc}</div>
      </div>
      <ArrowRight size={17} style={{ color: hover ? C.primary : '#94A3B8',
        transform: hover ? 'translateX(3px)' : 'none', transition: 'all 0.18s', flexShrink: 0 }}/>
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
      borderRadius: '20px', padding: '1.5rem 1.75rem',
      maxWidth: 620, margin: '0 auto', boxShadow: C.shadow,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{ width:32, height:32, borderRadius:10, background:C.primaryLight,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={15} style={{ color:C.primary }}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.98rem', fontWeight:800,
              color:C.text, lineHeight:1.2 }}>
              {qm.title || 'Quick Match'}
            </div>
            <div style={{ fontSize:'0.74rem', color:C.text3 }}>
              {qm.sub || '2 taps to a recommendation'}
            </div>
          </div>
        </div>
        <button onClick={onFullSearch}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.8rem inherit', color:C.primary,
            background:C.primaryLight, border:'none',
            borderRadius:100, padding:'0.4rem 0.85rem', cursor:'pointer' }}>
          <SlidersHorizontal size={12}/> {qm.full || 'Full search'}
        </button>
      </div>

      {/* Step 0 — Solo or Friends */}
      {step === 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          <OptionRow
            icon={<User size={19}/>}
            title={t.form.style_solo}
            desc={qm.solo_desc || 'Just me, playing alone'}
            onClick={() => handleMode(false)}
          />
          <OptionRow
            icon={<Users size={19}/>}
            title={t.form.style_friends}
            desc={qm.friends_desc || 'Co-op, multiplayer or local'}
            onClick={() => handleMode(true)}
          />
        </div>
      )}

      {/* Step 1 — PC level */}
      {step === 1 && (
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em',
            textTransform:'uppercase', color:C.text3, marginBottom:'0.65rem' }}>
            {t.form.pc_label}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'0.75rem' }}>
            {[
              { key:'low',    label:t.form.pc_low_title, desc:t.form.pc_low_desc },
              { key:'medium', label:t.form.pc_med_title, desc:t.form.pc_med_desc },
              { key:'high',   label:t.form.pc_hi_title,  desc:t.form.pc_hi_desc  },
            ].map(opt => (
              <OptionRow
                key={opt.key}
                icon={<Monitor size={17}/>}
                title={opt.label}
                desc={opt.desc}
                onClick={() => handlePc(opt.key)}
              />
            ))}
          </div>
          <button onClick={reset}
            style={{ font:'500 0.78rem inherit', color:C.text3,
              background:'none', border:'none', cursor:'pointer' }}>
            ← {t.common.back}
          </button>
        </div>
      )}

      {/* Step 2 — Loading */}
      {step === 2 && (
        <div style={{ textAlign:'center', padding:'1.25rem 0' }}>
          <div className="spinner" style={{ margin:'0 auto 0.65rem' }}/>
          <div style={{ fontSize:'0.85rem', color:C.text3 }}>{t.common.loading}</div>
        </div>
      )}
    </div>
  );
}
