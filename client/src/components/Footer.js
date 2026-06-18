import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

export default function Footer({ navigate }) {
  const { t } = useLang();
  const ft = t.footer || {};

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="footer-brand-logo">
            <div style={{ width:24, height:24, background:'var(--primary)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Gamepad2 size={13} color="#fff" />
            </div>
            <span className="footer-brand-name">GameMatch</span>
          </div>
          <p className="footer-tagline">{ft.tagline}</p>
        </div>

        {/* Navigation */}
        <div>
          <div className="footer-col-title">{ft.nav_title}</div>
          {[
            ['home',    ft.find],
            ['browse',  ft.browse],
            ['bored',   ft.bored],
            ['list',    ft.list],
          ].map(([key, label]) => label && (
            <button key={key} className="footer-link" onClick={() => navigate(key)}>{label}</button>
          ))}
        </div>

        {/* Features */}
        <div>
          <div className="footer-col-title">{ft.links_title}</div>
          {[
            ['room-landing', ft.friends],
            ['compare',      ft.compare],
          ].map(([key, label]) => label && (
            <button key={key} className="footer-link" onClick={() => navigate(key)}>{label}</button>
          ))}
        </div>

        {/* About */}
        <div>
          <div className="footer-col-title">{ft.about_title}</div>
          <div className="footer-link">
            <a href="mailto:feedback@gamematch.app">{ft.feedback}</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-rights">{ft.rights}</span>
        <span className="footer-built">{ft.built}</span>
      </div>
    </footer>
  );
}
