import React, { useState } from 'react';
import { Zap, User, Users, Monitor, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

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
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '1.5rem 1.75rem',
      maxWidth: 620, margin: '0 auto', boxShadow: 'var(--sh)',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{ width:32, height:32, borderRadius:10, background:'var(--primary-light)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={15} style={{ color:'var(--primary)' }}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.98rem', fontWeight:800,
              color:'var(--text)', lineHeight:1.2 }}>
              {qm.title || 'Quick Match'}
            </div>
            <div style={{ fontSize:'0.74rem', color:'var(--text-3)' }}>
              {qm.sub || '2 taps to a recommendation'}
            </div>
          </div>
        </div>
        <button onClick={onFullSearch}
          style={{ display:'flex', alignItems:'center', gap:'0.3rem',
            font:'600 0.8rem var(--font-body)', color:'var(--primary)',
            background:'var(--primary-light)', border:'none',
            borderRadius:100, padding:'0.4rem 0.85rem', cursor:'pointer' }}>
          <SlidersHorizontal size={12}/> {qm.full || 'Full search'}
        </button>
      </div>

      {/* Step 0 — Solo or Friends, row style */}
      {step === 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          <button className="qm-row" onClick={() => handleMode(false)}>
            <div className="qm-row-icon"><User size={19}/></div>
            <div className="qm-row-body">
              <div className="qm-row-title">{t.form.style_solo}</div>
              <div className="qm-row-desc">{qm.solo_desc || 'Just me, playing alone'}</div>
            </div>
            <ArrowRight size={17} className="qm-row-arrow"/>
          </button>
          <button className="qm-row" onClick={() => handleMode(true)}>
            <div className="qm-row-icon"><Users size={19}/></div>
            <div className="qm-row-body">
              <div className="qm-row-title">{t.form.style_friends}</div>
              <div className="qm-row-desc">{qm.friends_desc || 'Co-op, multiplayer or local'}</div>
            </div>
            <ArrowRight size={17} className="qm-row-arrow"/>
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
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'0.75rem' }}>
            {[
              { key:'low',    label:t.form.pc_low_title, desc:t.form.pc_low_desc },
              { key:'medium', label:t.form.pc_med_title, desc:t.form.pc_med_desc },
              { key:'high',   label:t.form.pc_hi_title,  desc:t.form.pc_hi_desc  },
            ].map(opt => (
              <button key={opt.key} className="qm-row" onClick={() => handlePc(opt.key)}>
                <div className="qm-row-icon"><Monitor size={17}/></div>
                <div className="qm-row-body">
                  <div className="qm-row-title">{opt.label}</div>
                  <div className="qm-row-desc">{opt.desc}</div>
                </div>
                <ArrowRight size={17} className="qm-row-arrow"/>
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
