import React, { useState } from 'react';
import { Zap, User, Users, Monitor, SlidersHorizontal, ArrowLeft, Cpu } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { fetchRecommendations } from '../utils/api';

const C = {
  primary: '#3B82F6', primaryHover: '#2563EB', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  indigo: '#6366F1', indigoLight: '#EEF2FF',
  surface: '#FFFFFF', surface2: '#F1F5F9', border: '#E5E9F0',
  text: '#0F172A', text3: '#64748B',
  shadow: '0 6px 20px rgba(59,130,246,0.09), 0 2px 6px rgba(15,23,42,0.04)',
};

/* Hardcoded bilingual copy — does not depend on translations.js
   ever containing a t.quickmatch key, so it can never silently
   fall back to English again. */
const QM_COPY = {
  en: {
    title: 'Quick Match', sub: '2 taps to a recommendation', full: 'Full search',
    solo: 'How do you want to play tonight?', pc: "What's your PC like?",
    soloDesc: 'Just me', friendsDesc: 'With friends',
  },
  ru: {
    title: 'Быстрый подбор', sub: '2 нажатия — и рекомендация готова', full: 'Полный поиск',
    solo: 'Как хотите играть сегодня?', pc: 'Какой у вас ПК?',
    soloDesc: 'Только я', friendsDesc: 'С друзьями',
  },
};

/* ── Segmented pill toggle — ONE continuous rounded shape with an
   animated sliding highlight, not separate bordered boxes. This is
   the same interaction pattern as an iOS switch / macOS segmented
   control, deliberately not a grid of cards. ── */
function SegmentedToggle({ options, onSelect }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <div style={{
      display: 'flex', width: '100%', background: C.surface2,
      borderRadius: 999, padding: 6, gap: 4, position: 'relative',
    }}>
      {options.map((opt, i) => {
        const isHover = hoverIdx === i;
        return (
          <button
            key={i}
            onClick={() => onSelect(opt.value)}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 6, padding: window.innerWidth < 480 ? '0.85rem 0.5rem' : '1.15rem 0.75rem',
              border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              background: isHover ? '#fff' : 'transparent',
              boxShadow: isHover ? '0 6px 18px rgba(15,23,42,0.1)' : 'none',
              transform: isHover ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              width: window.innerWidth < 480 ? 32 : 40, height: window.innerWidth < 480 ? 32 : 40, borderRadius: '50%',
              background: isHover ? opt.accentLight : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: opt.accentFg, transition: 'all 0.2s', flexShrink: 0,
            }}>
              {opt.icon}
            </span>
            <span style={{ fontWeight: 700, fontSize: window.innerWidth < 480 ? '0.8rem' : '0.92rem', color: C.text, textAlign:'center' }}>
              {opt.label}
            </span>
            {opt.desc && (
              <span style={{ fontSize: '0.72rem', color: C.text3, textAlign: 'center' }}>
                {opt.desc}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function QuickMatch({ onResults, onFullSearch }) {
  const { t, lang } = useLang();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  const qc = lang === 'ru' ? QM_COPY.ru : QM_COPY.en;

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const modeOptions = [
    { value: false, icon: <User size={19}/>,  label: t.form.style_solo,    desc: qc.soloDesc,
      accentFg: C.primary, accentLight: C.primaryLight },
    { value: true,  icon: <Users size={19}/>, label: t.form.style_friends, desc: qc.friendsDesc,
      accentFg: C.indigo, accentLight: C.indigoLight },
  ];

  const pcOptions = [
    { value: 'low',    icon: <Monitor size={17}/>, label: t.form.pc_low_title, accentFg: C.primary, accentLight: C.primaryLight },
    { value: 'medium', icon: <Cpu size={17}/>,      label: t.form.pc_med_title, accentFg: C.primary, accentLight: C.primaryLight },
    { value: 'high',   icon: <Zap size={17}/>,      label: t.form.pc_hi_title,  accentFg: C.primary, accentLight: C.primaryLight },
  ];

  return (
    <div className="gm-fade" style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: isMobile ? '18px' : '24px', padding: isMobile ? '1.25rem 1.1rem' : '1.75rem 2rem',
      maxWidth: 640, margin: '0 auto', boxShadow: C.shadow,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:C.primaryLight,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={18} style={{ color:C.primary }}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.1rem', fontWeight:800,
              color:C.text, lineHeight:1.2 }}>
              {qc.title}
            </div>
            <div style={{ fontSize:'0.8rem', color:C.text3 }}>
              {qc.sub}
            </div>
          </div>
        </div>
        <button onClick={onFullSearch}
          style={{ display:'flex', alignItems:'center', gap:'0.35rem',
            font:'600 0.82rem inherit', color:C.primary,
            background:C.primaryLight, border:'none',
            borderRadius:100, padding:'0.45rem 0.9rem', cursor:'pointer' }}>
          <SlidersHorizontal size={13}/> {qc.full}
        </button>
      </div>

      {step === 0 && (
        <div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:C.text, marginBottom:'1rem', textAlign:'center' }}>
            {qc.solo}
          </div>
          <SegmentedToggle options={modeOptions} onSelect={handleMode}/>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:C.text, marginBottom:'1rem', textAlign:'center' }}>
            {qc.pc}
          </div>
          <SegmentedToggle options={pcOptions} onSelect={handlePc}/>
          <button onClick={reset}
            style={{ display:'flex', alignItems:'center', gap:5, font:'500 0.82rem inherit', color:C.text3,
              background:'none', border:'none', cursor:'pointer', marginTop:'0.9rem' }}>
            <ArrowLeft size={13}/> {t.common.back}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
          <div className="spinner" style={{ margin:'0 auto 0.7rem' }}/>
          <div style={{ fontSize:'0.88rem', color:C.text3 }}>{t.common.loading}</div>
        </div>
      )}
    </div>
  );
}
