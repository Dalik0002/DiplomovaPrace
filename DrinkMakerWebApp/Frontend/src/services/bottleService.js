import { apiPost } from './api'

export function assignBottles(bottles) {
  return apiPost('/bottles/assigBottles', bottles)
}
