import useSWR from 'swr';
import { apiGet } from '../services/api';

export function useGlasses() {
  const { data, error, isLoading, mutate } = useSWR('/glasses/glasses', () => apiGet('/glasses/glasses'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  const raw = Array.isArray(data) ? data : [];
  const noGlass = raw.every(g => g == null);

  return {
    data: data || [],
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    noGlass,
  };
}


export function useNumberOfGlasses() {
  const { data, error, isLoading, mutate } = useSWR('/glasses/count', () => apiGet('/glasses/count'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  const drinkCount = (data?.count);

  return {
    data: data || [],
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    drinkCount,
  };
}


export function useFreePosition() {
  const { data, error, isLoading, mutate } = useSWR('/glasses/freePositions', () => apiGet('/glasses/freePositions'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  // Bezpečné vytažení pole; když není data, dej prázdné pole
  const freePositions = Array.isArray(data?.free_positions)
    ? data.free_positions
    : []

  return {
    freePositions,
    isLoading,
    error,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    raw: data,
  }
}
