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

