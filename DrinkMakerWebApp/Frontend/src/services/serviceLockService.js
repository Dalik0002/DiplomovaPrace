// src/services/serviceLockService.js
import { apiPostRaw } from './api';
import { getClientId } from './clientId';

function headers() {
  return { 'X-Client-Id': getClientId() };
}

export function acquireService() {
  return apiPostRaw('/service/acquire', headers());
}
export function heartbeatService() {
  return apiPostRaw('/service/heartbeat', headers());
}
export function releaseService() {
  return apiPostRaw('/service/release', headers());
}
