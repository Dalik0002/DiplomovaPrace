// src/hooks/useServiceStatus.js
import useSWR from 'swr';
import { apiGet } from '../services/api';

export function useServiceStatus() {
  const { data, error, isLoading, mutate } = useSWR('/service/status', () => apiGet('/service/status'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 10000,
    refreshInterval: 5000,
  });

  const isBusy = !!data?.locked;

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    isBusy,
  };
}
