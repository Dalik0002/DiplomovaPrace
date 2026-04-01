// src/hooks/useStateData.js
import useSWR from 'swr';
import { apiGet } from '../services/api';
import { useCallback } from 'react'

export function useStateStatus() {
  const { data, error, isLoading, mutate } = useSWR('/var/currentModeOnDevice', () => apiGet('/var/currentModeOnDevice'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 10000,
    refreshInterval: 500,
  }); 

  const isStop = !!(data?.data === "STOP");
  const isNone = !!(data?.data === null);
  const isStandBy = !!(data?.data === "STAND BY");
  const isService = !!(data?.data === "SERVIS");
  const isParty = !!(data?.data === "PARTY");

  const refresh = useCallback((next, shouldRevalidate) => mutate(next, shouldRevalidate), [mutate])

  return {
    data,
    error,
    isLoading,
    refresh,
    isStop,
    isNone,
    isStandBy,
    isService,
    isParty,
  };
}

