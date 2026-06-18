import React from 'react';
import { useLang } from '../i18n/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage({ navigate }) {
  const { t } = useLang();
  const nf = t.notfound || {};
  usePageTitle(nf.sub || '404');

  return (
    <div className="notfound-page">
      <div className="notfound-code">{nf.title || '404'}</div>
      <div className="notfound-title">{nf.sub}</div>
      <p className="notfound-hint">{nf.hint}</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('home')}>
        {nf.home}
      </button>
    </div>
  );
}
