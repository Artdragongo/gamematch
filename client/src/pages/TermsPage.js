import React from 'react';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../context/ThemeContext';
import { usePageTitle } from '../hooks/usePageTitle';

const COPY = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: August 2026',
    sections: [
      { h: 'What GameDive is', p: 'GameDive is a free game discovery tool. We recommend games based on preferences you provide, host a collaborative "Friends Room" for group decisions, and link out to Steam for purchasing. We are not a game store and do not process payments.' },
      { h: 'No account required', p: 'There are no user accounts, passwords, or sign-ups. Friends Rooms are identified by a room code and your chosen nickname, not a verified identity.' },
      { h: 'Acceptable use', p: "Don't use Friends Room nicknames, room names, or the feedback form to post content that is abusive, illegal, or infringes on others' rights. We reserve the right to delete rooms or content that violates this." },
      { h: 'Third-party content', p: 'Game names, cover art, screenshots, and pricing are sourced from the Steam public API and belong to their respective publishers/developers. We display them for identification and discovery purposes.' },
      { h: 'No warranty', p: 'Recommendations, prices, and availability are provided "as is" and may be inaccurate or out of date — always confirm pricing and availability on Steam directly before purchasing.' },
      { h: 'Service availability', p: 'We may modify, suspend, or discontinue any part of the service at any time without notice. Friends Rooms inactive for 6 months are automatically deleted.' },
      { h: 'Limitation of liability', p: "GameDive is provided free of charge and 'as is.' We aren't liable for any losses arising from your use of the site, including reliance on recommendations or lost Friends Room data." },
      { h: 'Changes to these terms', p: 'We may update these terms as the site evolves. Continued use after changes means you accept the updated terms.' },
      { h: 'Contact', p: 'Questions can be sent through the feedback form linked in the site footer.' },
    ],
    disclaimer: 'This page is provided for transparency and is not a substitute for formal legal advice.',
  },
  ru: {
    title: 'Условия использования',
    updated: 'Обновлено: август 2026',
    sections: [
      { h: 'Что такое GameDive', p: 'GameDive — бесплатный инструмент для поиска игр. Мы рекомендуем игры на основе указанных вами предпочтений, предоставляем совместную «Комнату друзей» для групповых решений и ссылаемся на Steam для покупки. Мы не являемся магазином игр и не обрабатываем платежи.' },
      { h: 'Аккаунт не требуется', p: 'На сайте нет учётных записей, паролей или регистрации. Комнаты друзей определяются кодом комнаты и выбранным никнеймом, а не подтверждённой личностью.' },
      { h: 'Правила использования', p: 'Не используйте никнеймы, названия комнат или форму обратной связи для публикации оскорбительного, незаконного контента или контента, нарушающего права других. Мы оставляем за собой право удалять комнаты или контент, нарушающий это правило.' },
      { h: 'Контент третьих лиц', p: 'Названия игр, обложки, скриншоты и цены получены через публичный API Steam и принадлежат соответствующим издателям/разработчикам. Мы отображаем их для целей идентификации и поиска.' },
      { h: 'Отсутствие гарантий', p: 'Рекомендации, цены и доступность предоставляются «как есть» и могут быть неточными или устаревшими — всегда проверяйте цену и доступность непосредственно в Steam перед покупкой.' },
      { h: 'Доступность сервиса', p: 'Мы можем изменять, приостанавливать или прекращать работу любой части сервиса в любое время без уведомления. Комнаты друзей, неактивные более 6 месяцев, удаляются автоматически.' },
      { h: 'Ограничение ответственности', p: 'GameDive предоставляется бесплатно и «как есть». Мы не несём ответственности за убытки, связанные с использованием сайта, включая использование рекомендаций или потерю данных комнаты друзей.' },
      { h: 'Изменения условий', p: 'Мы можем обновлять эти условия по мере развития сайта. Продолжение использования после изменений означает согласие с обновлёнными условиями.' },
      { h: 'Контакты', p: 'Вопросы можно направить через форму обратной связи в подвале сайта.' },
    ],
    disclaimer: 'Эта страница предоставлена для прозрачности и не заменяет формальную юридическую консультацию.',
  },
};

export default function TermsPage() {
  const { lang } = useLang();
  const { C } = useTheme();
  const copy = lang === 'ru' ? COPY.ru : COPY.en;
  usePageTitle(copy.title);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'2rem', fontWeight:800, color:C.text, marginBottom:'0.4rem' }}>
        {copy.title}
      </h1>
      <p style={{ color:C.text3, fontSize:'0.85rem', marginBottom:'2.5rem' }}>{copy.updated}</p>

      {copy.sections.map((s, i) => (
        <div key={i} style={{ marginBottom:'1.75rem' }}>
          <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1.1rem', fontWeight:700, color:C.text, marginBottom:'0.5rem' }}>
            {s.h}
          </h2>
          <p style={{ color:C.text2, fontSize:'0.92rem', lineHeight:1.7 }}>{s.p}</p>
        </div>
      ))}

      <div style={{ marginTop:'2.5rem', padding:'1rem 1.25rem', background:C.surface2, borderRadius:12,
        fontSize:'0.8rem', color:C.text3, fontStyle:'italic' }}>
        {copy.disclaimer}
      </div>
    </div>
  );
}
