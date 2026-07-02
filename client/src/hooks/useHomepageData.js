import { useState, useEffect, useCallback } from 'react';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const CACHE_KEY = 'gm_homepage_cache_v1';
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 min — after that, treat as stale but still show while refetching

/**
 * Stale-while-revalidate hook for homepage data.
 * - On first render: instantly paints last-known cached data (if any) from localStorage
 * - In background: fetches fresh data from the server (which may be cold-starting)
 * - Once fresh data arrives: updates state + cache silently, no flash/reload
 * - If there's no cache at all (very first visit ever): isLoading stays true until data arrives
 */
export function useHomepageData() {
  const [data, setData]       = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const loadFromCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const age = Date.now() - parsed.savedAt;
      return { ...parsed, isFresh: age < CACHE_MAX_AGE };
    } catch { return null; }
  }, []);

  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setData(cached.payload);
      setIsStale(!cached.isFresh);
      setLoading(false); // paint immediately, don't block on network
    }

    fetch(`${BASE}/api/homepage`)
      .then(r => r.json())
      .then(fresh => {
        setData(fresh);
        setIsStale(false);
        setLoading(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ payload: fresh, savedAt: Date.now() }));
        } catch {}
      })
      .catch(() => {
        // Network/cold-start failure — if we already showed cache, just leave it.
        // If we had nothing, stop the spinner so the rest of the page still renders.
        setLoading(false);
      });
  }, [loadFromCache]);

  return { data, isLoading, isStale };
}
