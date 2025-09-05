import { apiPost } from './api'

export function startPouring(name, position) {
  return apiPost('/startPouring', {name, position})
}
