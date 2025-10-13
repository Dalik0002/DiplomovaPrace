import useSWR from 'swr';
import { apiGet } from '../services/api';

export function useQueueList() {
  const { data, error, isLoading, mutate } = useSWR('/queue/queueList', () => apiGet('/queue/queueList'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
  };
}

export function useQueueListofSome() {
  const { data, error, isLoading, mutate } = useSWR('/queue/queueList4', () => apiGet('/queue/queueList4'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
  };
}

export function useNumberOfDrinks() {
  const { data, error, isLoading, mutate } = useSWR('/queue/numberOfDrinks', () => apiGet('/queue/numberOfDrinks'), {
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  const drinkCount = (data?.count);

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    drinkCount,
  };
}
