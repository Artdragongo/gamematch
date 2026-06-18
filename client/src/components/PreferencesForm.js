import React, { useState } from 'react';
import { User, Users, Monitor, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const ALL_GENRES = [
  'Action','Adventure','RPG','FPS','Strategy','Simulation',
  'Puzzle','Platformer','Survival','Horror','Co-op','Party',
  'Roguelike','Sandbox','Indie','Racing','Sports','Card Game',
  'Souls-like','MOBA','Battle Royale','Stealth',
];

export default function PreferencesForm({ onSubmit, initialPrefs, compact }) {
  const { t } = useLang();
  const [players,     setPlayers]     = useState(initialPrefs?.players     || '1');
  const [withFriends, setWithFriends] = useState(initialPrefs?.withFriends ?? false);
  const [genres,      setGenres]      = useState(initialPrefs?.genres      || []);
  const [pcLevel,     setPcLevel]     = useState(initialPrefs?.pcLevel     || '');

  const toggleGenre = g =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleSubmit = () => {
    if (!pcLevel) { alert(t.form.pc_required); return; }
    onSubmit({ players, withFriends, genres, pcLevel });
  };

  const PC_TIERS = [
    { key:'low',    Icon: Monitor, title: t.form.pc_low_title, desc: t.form.pc_low_desc },
    { key:'medium', Icon: Monitor, title: t.form.pc_med_title, desc: t.form.pc_med_desc },
    { key:'high',   Icon: Monitor, title: t.form.pc_hi_title,  desc: t.form.pc_hi_desc  },
  ];

  return (
    <div className={compact ? '' : 'form-wrap'}>

      {/* Players + style */}
      <div className="form-row form-field">
        <div>
          <label className="form-label">
            <Users size={12} />
            {t.form.players_label}
          </label>
          <select className="field-select" value={players} onChange={e => setPlayers(e.target.value)}>
            <option value="1">{t.form.players_1}</option>
            <option value="2">{t.form.players_2}</option>
            <option value="3">{t.form.players_3}</option>
            <option value="4">{t.form.players_4}</option>
            <option value="5">{t.form.players_5}</option>
          </select>
        </div>
        <div>
          <label className="form-label">
            <User size={12} />
            {t.form.style_label}
          </label>
          <div className="segment">
            <button className={`seg-btn ${!withFriends ? 'on' : ''}`} onClick={() => setWithFriends(false)}>
              <User size={13} /> {t.form.style_solo}
            </button>
            <button className={`seg-btn ${withFriends ? 'on' : ''}`} onClick={() => setWithFriends(true)}>
              <Users size={13} /> {t.form.style_friends}
            </button>
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="form-field">
        <label className="form-label">
          <SlidersHorizontal size={12} />
          {t.form.genres_label}
          {genres.length > 0 && (
            <span className="form-label-count">{genres.length} {t.form.genres_selected}</span>
          )}
        </label>
        <div className="genre-wrap">
          {ALL_GENRES.map(g => (
            <button
              key={g}
              className={`genre-chip ${genres.includes(g) ? 'on' : ''}`}
              onClick={() => toggleGenre(g)}
            >
              {(t.genres && t.genres[g]) ? t.genres[g] : g}
            </button>
          ))}
        </div>
      </div>

      {/* PC tier */}
      <div className="form-field">
        <label className="form-label">
          <Monitor size={12} />
          {t.form.pc_label}
        </label>
        <div className="pc-grid">
          {PC_TIERS.map(({ key, Icon, title, desc }) => (
            <button key={key} className={`pc-card ${pcLevel === key ? 'on' : ''}`} onClick={() => setPcLevel(key)}>
              <div className="pc-card-icon"><Icon size={18} /></div>
              <div className="pc-card-title">{title}</div>
              <div className="pc-card-desc">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-footer">
        <span className="form-footer-hint">
          <SlidersHorizontal size={12} />
          {genres.length === 0 ? t.form.genres_hint_none : t.form.genres_hint(genres.length)}
        </span>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
          {t.form.submit} <ChevronDown size={14} style={{transform:'rotate(-90deg)'}} />
        </button>
      </div>
    </div>
  );
}
