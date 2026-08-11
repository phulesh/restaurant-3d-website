import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (path, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api(path, options);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [api]);

  return { request, loading, error, setError };
}

export function useNotifications() {
  const { api } = useAuth();

  const getNotifications = useCallback(async () => {
    return api('/notifications');
  }, [api]);

  const markRead = useCallback(async (id) => {
    return api(`/notifications/${id}/read`, { method: 'PUT' });
  }, [api]);

  const markAllRead = useCallback(async () => {
    return api('/notifications/read-all', { method: 'PUT' });
  }, [api]);

  return { getNotifications, markRead, markAllRead };
}
