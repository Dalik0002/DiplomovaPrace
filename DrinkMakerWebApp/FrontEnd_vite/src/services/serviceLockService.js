// src/services/serviceLockService.js
import { getClientId } from '../services/clientId'
import { apiGet} from '../services/api'

const BASE_URL = import.meta.env.VITE_API_URL;

function headers() {
  return { 'X-Client-Id': getClientId() }
}

export async function getServiceStatus() {
  return apiGet('/service/status')
}

export async function acquireService() {
  const res = await fetch(`${BASE_URL}/service/acquire`, { method: 'POST', headers: headers() })
  if (!res.ok) throw new Error('Service busy')
  return res.json()
}

export async function heartbeatService() {
  const res = await fetch(`${BASE_URL}/service/heartbeat`, { method: 'POST', headers: headers() })
  if (!res.ok) throw new Error('Heartbeat failed')
  return res.json()
}

export async function releaseService() {
  const res = await fetch(`${BASE_URL}/service/release`, { method: 'POST', headers: headers() })
  if (!res.ok) throw new Error('Release failed')
  return res.json()
}
