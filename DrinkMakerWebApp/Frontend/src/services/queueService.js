import { apiPost } from './api'

export function deleteQueue() {
  return apiPost('/queue/deleteFullQueue', {})
}

export function addToQueue(drink) {
  return apiPost('/queue/addToQueue', drink)
}

export function deleteItemFromQueue(name) {
  return apiPost('/queue/deleteItemFromQueue', { name });
}

export function chooseItemFromQueue(name){
  return apiPost('/queue/chooseItemFromQueue', { name })
}