import { apiPost } from './api'

export function assignBottles(bottles) {
  return apiPost('/bottles/assignBottles', bottles)
}
