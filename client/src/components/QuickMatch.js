import React, { useState } from 'react';
import { Zap, User, Users, Monitor, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

export default function QuickMatch({ onResults, onFullSearch }) {
  const { t } = useLang();
  const [step,    setStep]    = useState(0); // 0=mode 1=pc 2=loading
  const [mode,    setMode]    = useState(null);

  const handleMode = async (withFriends) => {
    setMode(withFriends);
    const savedPc = localStorage.getItem('gm_last_pc');
    if (savedPc) {
      setStep(2);
      await submit(withFriends, savedPc);
    } else {
      setStep(1);
    }
  };

  const handlePc = async (pcLevel) => {
    localStorage.setItem('gm_last_pc', pcLevel);
    setStep(2);
    await submit(mode, pcLevel);
  };

  const submit = async (withFriends, pcLevel) => {
    try {
      const results = await fetchRecommendations({
        players: withFriends ? '2' : '1',
        withFriends, genres: [], pcLevel,
      });
      onResults(results, { withFriends, pcLevel, players: withFriends ? '2' : '1', genres: [] });
    } catch {
      setStep(0);
    }
  };

  const reset = () => { setStep(0); setMode(null); };

  const qm = t.quickmatch || {};

  const pcOpts = [
    { key:'low',    label: t.form.pc_low_title, Icon: Monitor, desc: t.form.pc_low_desc },
    { key:'medium', label: t.form.pc_med_title, Icon: Monitor, desc: t.form.pc_med_desc },
    { key:'high',   label: Monitor,              Icon: Zap,     desc: t.form.pc_hi_desc  },
  ];

  const btnStyle = (active) => ({
    padding:'1.1rem 1rem', borderRadius:'var(--r)', textAlign:'left',
    border:`1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    background: active ? 'var(--primary-light)' : 'var(--surface2)',
    cursor:'pointer', transition:'all 0.15s', fontFamily:'var(--font-body)',
    width:'100%',
  });

  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:'var(--r-lg)', padding:'1.5rem 1.75rem',
      maxWidth:680, margin:'0 auto',
    }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{ width:26, height:26, background:'var(--primary)', borderRadius:6,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={13} color="#fff"/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.95rem', fontWeight:800,
              color:'var(--text)', letterSpacing:'-0.01em', lineHeight:1.2 }}>
              {qm.title || 'Quick Match'}
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>
              {qm.sub || '2 taps to a recommendation'}
            </div>
          </div>
        </div>
        <button onClick={onFullSearch}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.8rem var(--font-body)', color:'var(--text-3)',
            background:'var(--surface2)', border:'1px solid var(--border)',
            borderRadius:'var(--r-sm)', padding:'0.35rem 0.75rem',
            cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--primary)'; e.currentTarget.style.borderColor='var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.borderColor='var(--border)'; }}
        >
          <SlidersHorizontal size={12}/>
          {qm.full || 'Full search'}
        </button>
      </div>

      {/* Step 0 — Solo or Friends */}
      {step === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>
          <button style={btnStyle(false)} onClick={() => handleMode(false)}>
            <User size={20} style={{ color:'var(--primary)', marginBottom:'0.5rem', display:'block' }}/>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.95rem', fontWeight:800,
              color:'var(--text)', marginBottom:'0.15rem' }}>
              {t.form.style_solo}
            </div>
            <div style={{ fontSize:'0.73rem', color:'var(--text-3)' }}>
              {qm.solo_desc || 'Just me, playing alone'}
            </div>
          </button>
          <button style={btnStyle(false)} onClick={() => handleMode(true)}>
            <Users size={20} style={{ color:'var(--primary)', marginBottom:'0.5rem', display:'block' }}/>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.95rem', fontWeight:800,
              color:'var(--text)', marginBottom:'0.15rem' }}>
              {t.form.style_friends}
            </div>
            <div style={{ fontSize:'0.73rem', color:'var(--text-3)' }}>
              {qm.friends_desc || 'Co-op, multiplayer or local'}
            </div>
          </button>
        </div>
      )}

      {/* Step 1 — PC level */}
      {step === 1 && (
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em',
            textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.65rem' }}>
            {t.form.pc_label}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.6rem', marginBottom:'0.75rem' }}>
            {[
              { key:'low',    label:t.form.pc_low_title, desc:t.form.pc_low_desc },
              { key:'medium', label:t.form.pc_med_title, desc:t.form.pc_med_desc },
              { key:'high',   label:t.form.pc_hi_title,  desc:t.form.pc_hi_desc  },
            ].map(opt => (
              <button key={opt.key} onClick={() => handlePc(opt.key)}
                style={{ padding:'0.85rem 0.65rem', borderRadius:'var(--r)', textAlign:'left',
                  border:'1.5px solid var(--border)', background:'var(--surface2)',
                  cursor:'pointer', transition:'all 0.15s', fontFamily:'var(--font-body)',
                  width:'100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; }}
              >
                <Monitor size={16} style={{ color:'var(--primary)', marginBottom:'0.4rem', display:'block' }}/>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.82rem', fontWeight:800, color:'var(--text)', marginBottom:'0.1rem' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize:'0.68rem', color:'var(--text-3)', lineHeight:1.35 }}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
          <button onClick={reset}
            style={{ font:'500 0.78rem var(--font-body)', color:'var(--text-3)',
              background:'none', border:'none', cursor:'pointer' }}>
            ← {t.common.back}
          </button>
        </div>
      )}

      {/* Step 2 — Loading */}
      {step === 2 && (
        <div style={{ textAlign:'center', padding:'1.25rem 0' }}>
          <div className="spinner" style={{ margin:'0 auto 0.65rem' }}/>
          <div style={{ fontSize:'0.85rem', color:'var(--text-3)' }}>{t.common.loading}</div>
        </div>
      )}
    </div>
  );
}
