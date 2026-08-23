import React from 'react';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../context/ThemeContext';

const COPY = {
  en: { free: 'Free to Play' },
  ru: { free: 'Бесплатно' },
};

/**
 * Shows a game's cached Steam price. Renders nothing if there's no
 * price data (game isn't on Steam, or the background warmer hasn't
 * reached it yet) — never shows a broken/loading state on cards.
 *
 * Expects `price` in the shape the server returns:
 *   { isFree, final, initial, discountPercent }
 */
export default function PriceBadge({ price, size = 'sm' }) {
  const { lang } = useLang();
  const { C } = useTheme();
  const copy = lang === 'ru' ? COPY.ru : COPY.en;

  if (!price) return null;

  const fontSize = size === 'lg' ? '0.95rem' : '0.78rem';
  const smallFontSize = size === 'lg' ? '0.78rem' : '0.68rem';

  if (price.isFree) {
    return (
      <span style={{ fontSize, fontWeight: 700, color: C.green }}>
        {copy.free}
      </span>
    );
  }

  if (!price.final) return null;

  const onSale = price.discountPercent > 0 && price.initial;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {onSale && (
        <span style={{
          background: C.green, color: '#fff', fontWeight: 800,
          fontSize: smallFontSize, padding: '1px 6px', borderRadius: 5,
        }}>
          -{price.discountPercent}%
        </span>
      )}
      {onSale && (
        <span style={{ fontSize: smallFontSize, color: C.text4, textDecoration: 'line-through' }}>
          {price.initial}
        </span>
      )}
      <span style={{ fontSize, fontWeight: 700, color: onSale ? C.green : C.text }}>
        {price.final}
      </span>
    </span>
  );
}
