import React from 'react';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../context/ThemeContext';
import { usePageTitle } from '../hooks/usePageTitle';

const COPY = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: August 2026',
    sections: [
      { h: 'What we collect', p: 'We use Google Analytics and Microsoft Clarity to understand how visitors use the site — pages viewed, general location (country/city level), device type, and session recordings of on-page interaction (mouse movement, clicks, scrolling). We do not collect names, emails, or payment information unless you voluntarily provide them (for example, an optional email address on the feedback form).' },
      { h: 'Friends Room data', p: "If you create or join a Friends Room, your chosen nickname, game preferences, and any votes you cast are stored on our server so the room can function and so returning members can see game night history. This data isn't linked to your real identity — only to the nickname you chose. We can't guarantee two people won't pick the same nickname in the same room." },
      { h: 'Local storage', p: 'Your language setting, dark/light theme, My List entries, and daily puzzle progress are stored only in your browser (localStorage) and never sent to our server. Clearing your browser data will reset these.' },
      { h: 'Cookies', p: 'Analytics providers may set cookies or similar identifiers to distinguish visitors. You can block these using your browser settings or an ad-blocker without affecting core site functionality.' },
      { h: 'Third-party links', p: "We link out to Steam for purchasing and viewing games. We don't control Steam's own data practices — see Steam's privacy policy for details on what happens once you leave our site." },
      { h: 'Data retention', p: 'Friends Rooms and their history are retained until inactive for 6 months, after which they are automatically deleted. Analytics data is retained according to Google Analytics and Microsoft Clarity\'s own retention policies.' },
      { h: 'Your choices', p: 'You can delete a Friends Room at any time from within the room. You can clear your local list, theme, and puzzle progress by clearing your browser\'s site data for this domain.' },
      { h: 'Contact', p: 'Questions about this policy can be sent through the feedback form linked in the site footer.' },
      { h: 'Changes', p: 'We may update this policy as the site changes. Material changes will be reflected by updating the date at the top of this page.' },
    ],
    disclaimer: 'This page is provided for transparency and is not a substitute for formal legal advice.',
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Обновлено: август 2026',
    sections: [
      { h: 'Что мы собираем', p: 'Мы используем Google Analytics и Microsoft Clarity, чтобы понимать, как посетители используют сайт — просмотренные страницы, примерное местоположение (страна/город), тип устройства и записи сессий взаимодействия со страницей (движения мыши, клики, прокрутка). Мы не собираем имена, email или платёжные данные, если вы не предоставили их добровольно (например, необязательный email в форме обратной связи).' },
      { h: 'Данные комнат друзей', p: 'Если вы создаёте или присоединяетесь к комнате друзей, ваш никнейм, игровые предпочтения и голоса сохраняются на сервере, чтобы комната работала и участники могли видеть историю игровых вечеров. Эти данные не привязаны к вашей настоящей личности — только к выбранному никнейму.' },
      { h: 'Локальное хранилище', p: 'Настройки языка, тёмной/светлой темы, ваш список игр и прогресс ежедневного пазла хранятся только в браузере (localStorage) и никогда не отправляются на сервер. Очистка данных браузера сбросит эти настройки.' },
      { h: 'Cookies', p: 'Аналитические сервисы могут устанавливать cookies или похожие идентификаторы. Вы можете заблокировать их в настройках браузера или с помощью блокировщика рекламы без влияния на работу сайта.' },
      { h: 'Ссылки на сторонние сервисы', p: 'Мы ссылаемся на Steam для покупки и просмотра игр. Мы не контролируем политику данных Steam — подробности смотрите в их собственной политике конфиденциальности.' },
      { h: 'Хранение данных', p: 'Комнаты друзей и их история хранятся до 6 месяцев неактивности, после чего удаляются автоматически. Данные аналитики хранятся согласно собственным политикам Google Analytics и Microsoft Clarity.' },
      { h: 'Ваш выбор', p: 'Вы можете удалить комнату друзей в любой момент прямо из неё. Вы можете очистить свой список, тему и прогресс пазла, очистив данные сайта в браузере.' },
      { h: 'Контакты', p: 'Вопросы по этой политике можно направить через форму обратной связи в подвале сайта.' },
      { h: 'Изменения', p: 'Мы можем обновлять эту политику по мере изменения сайта. Существенные изменения будут отражены обновлением даты в начале страницы.' },
    ],
    disclaimer: 'Эта страница предоставлена для прозрачности и не заменяет формальную юридическую консультацию.',
  },
};

export default function PrivacyPage() {
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
