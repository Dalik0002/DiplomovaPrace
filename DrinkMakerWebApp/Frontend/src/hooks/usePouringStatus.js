import useSWR from 'swr';
import { apiGet } from '../services/api';
import { useCallback } from 'react';

export function usePouringStatus() {
  const { data, error, isLoading, mutate } = useSWR('/pour/status', () => apiGet('/pour/status'), {
    refreshInterval: 500,
    revalidateOnFocus: true,
    dedupingInterval: 100,
  });

  console.log("SWR RAW DATA:", data);

  const status = data?.data ? data.data : (data || {});

  const isRunning = !!status.running;
  const stage = status.stage || 'IDLE';
  const message = status.message || '';
  const processError = status.error || '';
  const ok = status.ok ?? null;

  const resultKind = status.result_kind || 'idle';
  const resultText = status.result_text || '';

  const donePositions = status.done_positions || [];
  const failedPositions = status.failed_positions || [];
  const expectedPositions = status.expected_positions || [];
  const failedDetails = status.failed_details || {};

  const isChecking = stage.includes("CHECK");
  const isPouring = isRunning;

  const isDone = resultKind === "success";
  const isPartial = resultKind === "partial";
  const isCancelled = resultKind === "cancelled" || stage === "POURING CANCELLED";
  const isFailed = resultKind === "failed" || stage === "POURING FAILED";
  const isFinished = isDone || isPartial || isFailed || isCancelled;

  const refresh = useCallback((next, shouldRevalidate) => mutate(next, shouldRevalidate), [mutate]);

  return {
    isRunning,
    stage,
    message,
    processError,
    ok,
    resultKind,
    resultText,
    donePositions,
    failedPositions,
    expectedPositions,
    failedDetails,
    isChecking,
    isPouring,
    isDone,
    isPartial,
    isCancelled,
    isFailed,
    isFinished,
    error,
    isLoading,
    refresh,
  };
}