// file: src/hooks/useQueueData.ts
import useSWR from 'swr';
import { apiGet } from '../api/client';


type QueueItem = { name: string; ingredients: string[]; volumes: number[] };


export function useQueueList() {
const { data, error, isLoading, mutate } = useSWR<QueueItem[]>(
'/queue/queueList',
(url) => apiGet(url),
{ revalidateOnFocus: true, dedupingInterval: 1000 }
);
return { data: data ?? [], error, isLoading, refresh: () => mutate() };
}


export function useNumberOfDrinks() {
const { data, error, isLoading, mutate } = useSWR<{ count: number }>(
'/queue/numberOfDrinks',
(url) => apiGet(url),
{ revalidateOnFocus: true, dedupingInterval: 1000 }
);
return { data, error, isLoading, refresh: () => mutate(), drinkCount: data?.count ?? 0 };
}