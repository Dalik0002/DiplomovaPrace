import useSWR from 'swr';
import { apiGet } from '../services/api';


export function useBottles(pause = false) {
  const { data, error, isLoading, mutate } = useSWR( '/bottles/getBottles', () => apiGet('/bottles/getBottles'), {
      revalidateOnFocus: !pause,
      dedupingInterval: 1000,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      refreshInterval: pause ? 0 : 5000,
    }
  );

  const list = Array.isArray(data) ? data : []

  const enabledRows = list.filter(b =>
    !b?.disabled && !b?.empty_bottle && (b?.bottle || b?.name)?.trim()
  )

  const availableIngredients = enabledRows
    .map(b => (b?.name || b?.bottle || '').trim())
    .filter(Boolean)

  const uniqueAvailableIngredients = Array.from(new Set(availableIngredients))

  const isNoIngredient = uniqueAvailableIngredients.length === 0

  const isPosDisabled = (pos) => !!list.find(x => x.position === pos)?.disabled
  const isPosEmptyBottle = (pos) => !!list.find(x => x.position === pos)?.empty_bottle

  return { 
    data: list, 
    error, 
    isLoading, 
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),

    availableIngredients: uniqueAvailableIngredients,
    isNoIngredient, 

    isPosDisabled,
    isPosEmptyBottle,
  };
}
