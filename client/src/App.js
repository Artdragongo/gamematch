import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import BrowsePage from './pages/BrowsePage';
import BoredPage from './pages/BoredPage';
import MyListPage from './pages/MyListPage';
import ComparePage from './pages/ComparePage';
import NotFoundPage from './pages/NotFoundPage';
import { RoomLandingPage, RoomPage } from './pages/RoomPage';
import { useLang } from './i18n/LangContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function useNav() {
  const navigate = useNavigate();
  return (target, params = {}) => {
    const routes = {
      home: '/', browse: '/browse', bored: '/bored',
      'room-landing': '/room', list: '/list', compare: '/compare',
    };
    if (routes[target]) navigate(routes[target]);
    else if (target === 'room'  && params.roomId) navigate(`/room/${params.roomId}`);
    else if (target === 'game'  && params.id)     navigate(`/game/${params.id}`);
    else navigate('/');
  };
}

function GamePageWrapper() {
  const { gameId } = useParams();
  const nav = useNav();
  return <GameDetailPage gameId={gameId} navigate={nav} />;
}

function RoomPageWrapper() {
  const { roomId } = useParams();
  const nav = useNav();
  return <RoomPage roomId={roomId} navigate={nav} />;
}

function AppShell() {
  const { lang }  = useLang();
  const location  = useLocation();
  const nav       = useNav();

  const path = location.pathname;
  const activePage =
    path === '/'              ? 'home'         :
    path === '/browse'        ? 'browse'        :
    path === '/bored'         ? 'bored'         :
    path === '/room'          ? 'room-landing'  :
    path === '/list'          ? 'list'          :
    path === '/compare'       ? 'compare'       :
    path.startsWith('/room/') ? 'room'          :
    path.startsWith('/game/') ? 'game'          : 'home';

  // Don't show footer on game/room detail pages to keep them focused
  const showFooter = !path.startsWith('/game/');

  return (
    <div lang={lang}>
      <ScrollToTop />
      <Nav navigate={nav} activePage={activePage} />
      <main>
        <Routes>
          <Route path="/"             element={<HomePage        navigate={nav} />} />
          <Route path="/browse"       element={<BrowsePage      navigate={nav} />} />
          <Route path="/bored"        element={<BoredPage       navigate={nav} />} />
          <Route path="/room"         element={<RoomLandingPage navigate={nav} />} />
          <Route path="/room/:roomId" element={<RoomPageWrapper />} />
          <Route path="/game/:gameId" element={<GamePageWrapper />} />
          <Route path="/list"         element={<MyListPage      navigate={nav} />} />
          <Route path="/compare"      element={<ComparePage     navigate={nav} />} />
          <Route path="*"             element={<NotFoundPage    navigate={nav} />} />
        </Routes>
      </main>
      {showFooter && <Footer navigate={nav} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
