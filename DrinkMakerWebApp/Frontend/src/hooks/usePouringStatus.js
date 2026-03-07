import useSWR from 'swr';
import { apiGet } from '../services/api';
import { useCallback } from 'react';

export function usePouringStatus() {
  const { data, error, isLoading, mutate } = useSWR('/pour/status', () => apiGet('/pour/status'), {
    refreshInterval: 500,
    revalidateOnFocus: true,
    dedupingInterval: 100,
  });

  // LOG pro ladění přímo v hooku - uvidíš, co SWR reálně dostává
  console.log("SWR RAW DATA:", data);

  // Pokud apiGet vrací přímo objekt {running, stage...}, použij 'data'
  // Pokud apiGet vrací Axios response nebo obal, použij 'data.data'
  const status = data?.data ? data.data : (data || {}); 

  const isRunning = !!status.running;
  const stage = status.stage || 'IDLE'; // Tady vzniká to IDLE, pokud je status prázdný
  const message = status.message || '';

  // Pomocné checky pro UI
  const isChecking = stage === "POURING CHECK";
  const isPouring = stage === "POURING UART" || stage === "POURING WAIT" || stage.includes("pour");
  const isDone = stage === "POURING DONE";

  const refresh = useCallback((next, shouldRevalidate) => mutate(next, shouldRevalidate), [mutate]);

  return {
    isRunning,
    stage,
    message,
    isChecking,
    isPouring,
    isDone,
    error,
    isLoading,
    refresh,
  };
}