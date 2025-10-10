import useSWR from 'swr';
import { apiGet } from '../services/api';


export function useBottles(pause = false) {
  const { data, error, isLoading, mutate } = useSWR( '/bottles/getBottles', () => apiGet('/bottles/getBottles'), {
      revalidateOnFocus: !pause,
      dedupingInterval: 1000,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      refreshInterval: pause ? 0 : 5000, // auto-refresh, ale ne při editaci
    }
  );

  const availableIngredients = (data ?? [])
    .map(b => b.name || b.bottle)
    .filter(name => name?.trim());

  const isNoIngredient = availableIngredients.length === 0;

  // ✅ Vždy vrať pole – i když data nejsou nebo jsou omylem jiného typu
  const list = Array.isArray(data) ? data : [];

  return { 
    data: list, 
    error, 
    isLoading, 
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),
    availableIngredients, 
    isNoIngredient, 
  };
}
