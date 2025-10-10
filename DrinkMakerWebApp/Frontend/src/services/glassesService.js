import { apiPost } from './api'

export function deleteGlasses() {
  return apiPost('/glasses/deleteAllGlasses', {})
}

export function addGlass(glass) {
  return apiPost('/glasses/addGlassToPosition', glass)
}

export function deleteGlass(position) {
  return apiPost('/glasses/deleteGlassOnPosition', position );
}