import React, { useState } from 'react';
import { Zap, User, Users, Monitor, ChevronRight } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

export default function QuickMatch({ onResults, onFullSearch }) {
  const { t } = useLang();
  const [step, setStep]     = useState(0); // 0=mode, 1=pc, 2=loading
  const [mode, setMode]     = useState(null);
  const [pc,   setPc]       = useState(null);

  const handleMode = async (withFriends) => {
    setMode(withFriends);
    // Check if PC level remembered
    const savedPc = localStorage.getItem('gm_last_pc');
    if (savedPc) {
      setStep(2);
      await submit(withFriends, savedPc);
    } else {
      setStep(1);
    }
  };

  const handlePc = async (pcLevel) => {
    setPc(pcLevel);
    localStorage.setItem('gm_last_pc', pcLevel);
    setStep(2);
    await submit(mode, pcLevel);
  };

  const submit = async (withFriends, pcLevel) => {
    try {
      const results = await fetchRecommendations({
        players: withFriends ? '2' : '1',
        withFriends,
        genres: [],
        pcLevel,
      });
      onResults(results, { withFriends, pcLevel });
    } catch {
      setStep(0);
    }
  };

  const pcOpts = [
    { key:'low',    label: t.form.pc_low_title, icon:'💻', desc: t.form.pc_low_desc },
    { key:'medium', label: t.form.pc_med_title, icon:'🖥️', desc: t.form.pc_med_desc },
    { key:'high',   label: t.form.pc_hi_title,  icon:'⚡', desc: t.form.pc_hi_desc  },
  ];

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '1.75rem 2rem',
      maxWidth: 680, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
        <div style={{ width:28, height:28, background:'var(--primary)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Zap size={14} color="#fff"/>
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:800, color:'var(--text)', letterSpacing:'-0.01em' }}>
            {t.quickmatch?.title || 'Quick Match'}
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
            {t.quickmatch?.sub || '2 taps to a recommendation'}
          </div>
        </div>
        <button
          onClick={onFullSearch}
          style={{ marginLeft:'auto', font:'600 0.78rem var(--font-body)', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.25rem' }}
        >
          {t.quickmatch?.full || 'Full search'} <ChevronRight size={12}/>
        </button>
      </div>

      {/* Step 0: Solo or Friends */}
      {step === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          <button
            onClick={() => handleMode(false)}
            style={{
              padding:'1.25rem', borderRadius:'var(--r)', border:'1.5px solid var(--border)',
              background:'var(--surface2)', cursor:'pointer', textAlign:'left',
              transition:'all 0.15s', fontFamily:'var(--font-body)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; }}
          >
            <User size={22} style={{ color:'var(--primary)', marginBottom:'0.6rem', display:'block' }}/>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:800, color:'var(--text)', marginBottom:'0.2rem' }}>
              {t.form.style_solo}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
              {t.quickmatch?.solo_desc || 'Just me, playing alone'}
            </div>
          </button>
          <button
            onClick={() => handleMode(true)}
            style={{
              padding:'1.25rem', borderRadius:'var(--r)', border:'1.5px solid var(--border)',
              background:'var(--surface2)', cursor:'pointer', textAlign:'left',
              transition:'all 0.15s', fontFamily:'var(--font-body)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; }}
          >
            <Users size={22} style={{ color:'var(--primary)', marginBottom:'0.6rem', display:'block' }}/>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:800, color:'var(--text)', marginBottom:'0.2rem' }}>
              {t.form.style_friends}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
              {t.quickmatch?.friends_desc || 'Co-op, multiplayer or local'}
            </div>
          </button>
        </div>
      )}

      {/* Step 1: PC Level */}
      {step === 1 && (
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>
            {t.form.pc_label}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.65rem' }}>
            {pcOpts.map(opt => (
              <button key={opt.key} onClick={() => handlePc(opt.key)}
                style={{
                  padding:'1rem 0.75rem', borderRadius:'var(--r)', border:'1.5px solid var(--border)',
                  background:'var(--surface2)', cursor:'pointer', textAlign:'left',
                  transition:'all 0.15s', fontFamily:'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; }}
              >
                <div style={{ fontSize:'1.4rem', marginBottom:'0.4rem' }}>{opt.icon}</div>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.875rem', fontWeight:800, color:'var(--text)', marginBottom:'0.15rem' }}>{opt.label}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-3)', lineHeight:1.4 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(0)} style={{ marginTop:'0.85rem', font:'500 0.8rem var(--font-body)', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>
            ← {t.common.back}
          </button>
        </div>
      )}

      {/* Step 2: Loading */}
      {step === 2 && (
        <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
          <div className="spinner" style={{ margin:'0 auto 0.75rem' }}/>
          <div style={{ fontSize:'0.875rem', color:'var(--text-3)' }}>{t.common.loading}</div>
        </div>
      )}
    </div>
  );
}
