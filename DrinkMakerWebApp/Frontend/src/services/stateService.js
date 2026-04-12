// src/services/stateService.js
import { apiPost } from "./api";

export function setService() {
  return apiPost('/remote/setService');
}

export function resetService() {
  return apiPost('/remote/resetService');
}

export function setStop() {
  return apiPost('/remote/setStop');
}

export function resetStop() {
  return apiPost('/remote/resetStop');
}

export function setParty() {
  return apiPost('/remote/setParty');
}

export function resetParty() {
  return apiPost('/remote/resetParty');
}

export function setPartySong() {
  return apiPost('/remote/setPartySong');
}

