// src/hooks/useStateData.js
import useSWR from 'swr';
import { apiGet } from '../services/api';

export function useStateStatus() {
  const { data, error, isLoading, mutate } = useSWR('/state', () => apiGet('/state'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    refreshInterval: 5000,
  });

  const isStop = !!(data?.data === "STOP");

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    isStop,
  };
}

