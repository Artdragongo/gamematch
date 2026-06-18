import { useState, useCallback } from 'react';

const STORAGE_KEY = 'gm_game_list';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// status: 'played' | 'want' | 'skip' | null (not in list)
export function useGameList() {
  const [list, setList] = useState(load);

  const setStatus = useCallback((gameId, status) => {
    setList(prev => {
      const next = { ...prev };
      if (!status || next[gameId] === status) {
        delete next[gameId];          // toggle off
      } else {
        next[gameId] = status;
      }
      save(next);
      return next;
    });
  }, []);

  const getStatus = useCallback((gameId) => list[gameId] || null, [list]);

  const getByStatus = useCallback((status) =>
    Object.entries(list)
      .filter(([, s]) => s === status)
      .map(([id]) => id),
  [list]);

  return { list, setStatus, getStatus, getByStatus };
}
