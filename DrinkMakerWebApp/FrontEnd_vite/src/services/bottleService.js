import { apiGet, apiPost } from './api'

export function assignBottles(bottles) {
  return apiPost('/bottles/assigBottles', bottles)
}

export function getBottles() {
  return apiGet('/bottles/getBottles')
}
