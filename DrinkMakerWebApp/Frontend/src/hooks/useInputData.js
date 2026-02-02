import useSWR from 'swr'
import { apiGet } from '../services/api'

export function useInputData() {
  const { data, error, isLoading, mutate } = useSWR('/var/inputState', () => apiGet('/var/inputState'), {
      revalidateOnFocus: true,
      dedupingInterval: 1000,
      errorRetryCount: 3,
      errorRetryInterval: 10000,
      refreshInterval: 2000,
    }
  )

  const input = data?.data ?? data ?? {}

  // ---- per-position arrays (fallback = 6x false) ----
  const positionCheck = input.position_check ?? Array(6).fill(false)
  const glassDone = input.glass_done ?? Array(6).fill(false)
  const hx711Error = input.HX711_error ?? Array(6).fill(false)
  const emptyBottle = input.empty_bottle ?? Array(6).fill(false)
  const positionDisabled = input.position_disabled ?? Array(6).fill(false)

  // ---- global flags ----
  const pouringDone = !!input.pouring_done
  const messError = !!input.mess_error
  const cannotProcessPosition = !!input.cannot_process_position
  const cannotProcessGlass = !!input.cannot_process_glass
  const cannotSetMode = !!input.cannot_set_mode
  const emergencyStop = !!input.emergency_stop
  const processPouringStarted = !!input.process_pouring_started


  // per-position problems
  const problemsByPos = Array.from({ length: 6 }, (_, i) => ({
    hx711Error: !!hx711Error?.[i],
    emptyBottle: !!emptyBottle?.[i],
    disabled: !!positionDisabled?.[i],
  }))

  // kolik stanovišť má alespoň jeden problém
  const problemPositionsCount = problemsByPos.reduce((acc, p) => {
    const hasProblem = p.hx711Error || p.emptyBottle || p.disabled
    return acc + (hasProblem ? 1 : 0)
  }, 0)

  // kolik problémů celkem (hx + empty + disabled se sčítají)
  const totalProblemsCount = problemsByPos.reduce((acc, p) => {
    return (
      acc +
      (p.hx711Error ? 1 : 0) +
      (p.emptyBottle ? 1 : 0) +
      (p.disabled ? 1 : 0)
    )
  }, 0)

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),

    // arrays
    positionCheck,
    glassDone,
    emptyBottle,
    positionDisabled,
    hx711Error,

    // flags
    pouringDone,
    messError,
    cannotProcessPosition,
    cannotProcessGlass,
    cannotSetMode,
    emergencyStop,
    processPouringStarted,

    // computed problems
    problemsByPos,
    problemPositionsCount,
    totalProblemsCount,
  }
}

export function useInputDataFast() {
  const { data, error, isLoading, mutate } = useSWR('/var/inputState', () => apiGet('/var/inputState'), {
      revalidateOnFocus: true,
      dedupingInterval: 1000,
      errorRetryCount: 3,
      errorRetryInterval: 10000,
      refreshInterval: 1000,
    }
  )

  const input = data?.data ?? data ?? {}

  // ---- per-position arrays (fallback = 6x false) ----
  const positionCheck = input.position_check ?? Array(6).fill(false)
  const glassDone = input.glass_done ?? Array(6).fill(false)
  const hx711Error = input.HX711_error ?? Array(6).fill(false)
  const emptyBottle = input.empty_bottle ?? Array(6).fill(false)
  const positionDisabled = input.position_disabled ?? Array(6).fill(false)
  const tensometerValues = input.tensometer_values ?? Array(6).fill(0)

  // ---- global flags ----
  const pouringDone = !!input.pouring_done
  const messError = !!input.mess_error
  const cannotProcessPosition = !!input.cannot_process_position
  const cannotProcessGlass = !!input.cannot_process_glass
  const cannotSetMode = !!input.cannot_set_mode
  const emergencyStop = !!input.emergency_stop
  const processPouringStarted = !!input.process_pouring_started


  // per-position problems
  const problemsByPos = Array.from({ length: 6 }, (_, i) => ({
    hx711Error: !!hx711Error?.[i],
    emptyBottle: !!emptyBottle?.[i],
    disabled: !!positionDisabled?.[i],
  }))

  // kolik stanovišť má alespoň jeden problém
  const problemPositionsCount = problemsByPos.reduce((acc, p) => {
    const hasProblem = p.hx711Error || p.emptyBottle || p.disabled
    return acc + (hasProblem ? 1 : 0)
  }, 0)

  // kolik problémů celkem (hx + empty + disabled se sčítají)
  const totalProblemsCount = problemsByPos.reduce((acc, p) => {
    return (
      acc +
      (p.hx711Error ? 1 : 0) +
      (p.emptyBottle ? 1 : 0) +
      (p.disabled ? 1 : 0)
    )
  }, 0)

  return {
    data,
    error,
    isLoading,
    refresh: (next, shouldRevalidate) => mutate(next, shouldRevalidate),

    // arrays
    positionCheck,
    glassDone,
    emptyBottle,
    positionDisabled,
    hx711Error,
    tensometerValues,

    // flags
    pouringDone,
    messError,
    cannotProcessPosition,
    cannotProcessGlass,
    cannotSetMode,
    emergencyStop,
    processPouringStarted,

    // computed problems
    problemsByPos,
    problemPositionsCount,
    totalProblemsCount,
  }
}

