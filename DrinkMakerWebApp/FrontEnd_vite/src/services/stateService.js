import { apiGet, apiPost } from "./api";

export function getState() {
  return apiGet("/state");
}

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

