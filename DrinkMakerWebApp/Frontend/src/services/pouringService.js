import { apiPost } from './api'

export async function startPouring() {
  return apiPost('/pour/start', {})
}

export async function cancelPouring() {
  return apiPost('/pour/cancel', {})
}