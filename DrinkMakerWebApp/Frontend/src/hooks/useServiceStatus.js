// src/hooks/useServiceStatus.js
import useSWR from 'swr';
import { useCallback } from 'react';
import { apiGet } from '../services/api';

export function useServiceStatus() {
  const { data, error, isLoading, mutate } = useSWR('/lock/status/service', () => apiGet('/lock/status/service'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 10000,
    refreshInterval: 5000,
  });

  const isBusy = !!data?.locked;

  const refresh = useCallback((next, shouldRevalidate) => mutate(next, shouldRevalidate), [mutate])

  return {
    data,
    error,
    isLoading,
    refresh,
    isBusy,
  };
}
