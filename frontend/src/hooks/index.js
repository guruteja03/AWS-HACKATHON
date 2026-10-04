import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initialValue : JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      window.dispatchEvent(new CustomEvent('cloudshare:error', { detail: { message: 'Could not save this preference in local storage.' } }));
    }
  }, [key, value]);
  return [value, setValue];
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('cloudshare-theme', 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((current) => current === 'dark' ? 'light' : 'dark'), [setTheme]);
  return useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
}

export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(path);
      setData(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { data, loading, error, refetch };
}
