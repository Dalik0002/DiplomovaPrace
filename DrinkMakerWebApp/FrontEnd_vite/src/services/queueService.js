import { apiGet, apiPost } from './api'

export function getQueueList() {
  return apiGet('/queue/queueList')
}

export function deleteQueue() {
  return apiPost('/queue/deleteFullQueue', {})
}

export function addToQueue(drink) {
  return apiPost('/queue/addToQueue', drink)
}