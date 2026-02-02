// src/hooks/useStateData.js
import useSWR from 'swr';
import { apiGet } from '../services/api';

export function useStateStatus() {
  const { data, error, isLoading, mutate } = useSWR('/var/currentModeOnDevice', () => apiGet('/var/currentModeOnDevice'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 10000,
    refreshInterval: 2500,
  }); 

  const isStop = !!(data?.data === "STOP");
  const isNone = !!(data?.data === null);
  const isStandBy = !!(data?.data === "STAND BY");

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    isStop,
    isNone,
    isStandBy,
  };
}

