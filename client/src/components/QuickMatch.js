import React, { useState } from 'react';
import { Zap, User, Users, Monitor, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

const C = {
  primary: '#3B82F6', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  indigo: '#6366F1', indigoLight: '#EEF2FF', indigoMid: '#C7D2FE',
  surface: '#FFFFFF', border: '#E5E9F0', text: '#0F172A', text3: '#64748B',
  shadow: '0 6px 20px rgba(59,130,246,0.09), 0 2px 6px rgba(15,23,42,0.04)',
  shadowHover: '0 14px 34px rgba(59,130,246,0.18), 0 6px 14px rgba(15,23,42,0.07)',
};

// Same semantic colors as the pcRequirements badges elsewhere on the site,
// so "low/medium/high" reads the same way here as it does on game cards.
const TIERS = {
  low:    { fg: '#16A34A', bg: '#F0FDF4', mid: '#BBF7D0', grad: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  medium: { fg: '#D97706', bg: '#FFFBEB', mid: '#FDE68A', grad: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  high:   { fg: '#DC2626', bg: '#FEF2F2', mid: '#FECACA', grad: 'linear-gradient(135deg,#F87171,#DC2626)' },
};

/* Big, unmistakable "pick a path" card — not a form row. */
function ModeCard({ icon, title, desc, onClick, gradient }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        padding: '1.6rem 1.5rem', minHeight: 152,
        border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
        background: gradient,
        boxShadow: hover ? '0 18px 38px rgba(15,23,42,0.16)' : '0 6px 16px rgba(15,23,42,0.08)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(.2,.8,.2,1)',
        width: '100%',
      }}
    >
      {/* oversized watermark icon for texture, purely decorative */}
      <div aria-hidden style={{
        position: 'absolute', right: -18, bottom: -22, color: '#fff',
        opacity: 0.14, transform: hover ? 'rotate(-6deg) scale(1.08)' : 'rotate(-10deg)',
        transition: 'all 0.3s', pointerEvents: 'none',
      }}>
        {React.cloneElement(icon, { size: 108, strokeWidth: 1.5 })}
      </div>

      <div style={{
        width: 44, height: 44, borderRadius: 13, background: 'rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>
          {title}
        </div>
        {desc && (
          <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.86)', lineHeight: 1.5 }}>
            {desc}
          </div>
        )}
      </div>

      <div style={{
        position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.78rem', fontWeight: 700, color: '#fff', marginTop: 'auto',
        opacity: hover ? 1 : 0.8, transform: hover ? 'translateX(3px)' : 'none', transition: 'all 0.2s',
      }}>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

/* Compact tile for the PC-tier step, color-coded like the rest of the site. */
function TierTile({ icon, title, onClick, tier }) {
  const [hover, setHover] = useState(false);
  const c = TIERS[tier];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
        padding: '1.2rem 0.75rem',
        border: `1.5px solid ${hover ? c.mid : C.border}`,
        borderRadius: 16, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
        background: hover ? c.bg : C.surface,
        boxShadow: hover ? '0 10px 24px rgba(15,23,42,0.08)' : 'none',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s', width: '100%',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: hover ? c.grad : c.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hover ? '#fff' : c.fg, transition: 'all 0.2s',
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>{title}</div>
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
          <ModeCard
            icon={<User size={22}/>}
            title={t.form.style_solo}
            desc={qm.solo_desc || 'Just me, playing alone'}
            onClick={() => handleMode(false)}
            gradient={`linear-gradient(135deg, ${C.primary}, #2563EB)`}
          />
          <ModeCard
            icon={<Users size={22}/>}
            title={t.form.style_friends}
            desc={qm.friends_desc || 'Co-op, multiplayer or local'}
            onClick={() => handleMode(true)}
            gradient={`linear-gradient(135deg, ${C.indigo}, #4F46E5)`}
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
              <TierTile
                key={opt.key}
                tier={opt.key}
                icon={<Monitor size={19}/>}
                title={opt.label}
                onClick={() => handlePc(opt.key)}
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