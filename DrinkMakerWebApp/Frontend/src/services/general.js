import { apiPost } from './api'

export async function startPouring() {
  return apiPost('/startPouring', {})
}