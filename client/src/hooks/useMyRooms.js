import { useState, useCallback } from 'react';

const KEY = 'gm_my_rooms';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(rooms) {
  try { localStorage.setItem(KEY, JSON.stringify(rooms)); } catch {}
}

/**
 * Remembers rooms this browser has joined, so the homepage/landing
 * page can offer "Jump back into The Squad" instead of starting fresh.
 */
export function useMyRooms() {
  const [rooms, setRooms] = useState(load);

  const remember = useCallback((roomId, name, nickname) => {
    setRooms(prev => {
      const filtered = prev.filter(r => r.roomId !== roomId);
      const updated = [{ roomId, name: name || null, nickname, lastVisited: Date.now() }, ...filtered].slice(0, 8);
      save(updated);
      return updated;
    });
  }, []);

  const forget = useCallback((roomId) => {
    setRooms(prev => {
      const updated = prev.filter(r => r.roomId !== roomId);
      save(updated);
      return updated;
    });
  }, []);

  return { rooms, remember, forget };
}
