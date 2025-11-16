// services/lockService.js
import { apiPost } from './api'

function getClientId() {
  const key = "client_id";
  if (typeof window === "undefined") return "server";

  let cid = localStorage.getItem(key);
  if (!cid) {
    cid = crypto?.randomUUID?.() || String(Date.now() + Math.random());
    localStorage.setItem(key, cid);
  }
  return cid;
}

/**
 * Pokusí se získat lock jménem "service".
 * 
 * Vrací:
 *   { ok: true }  → lock získán
 *   { ok: false } → obsazeno
 * 
 * Vyhazuje error při síťové chybě.
 */
export async function requestServiceLock() {
  const clientId = getClientId();

  const res = await apiPost("/lock/acquire/service", {
    client_id: clientId,
  });

  // Backend vrací res.ok = true/false
  return res;
}

// Heartbeat pro "service" – voláno periodicky v ServiceMain
export async function heartbeatService() {
  const clientId = getClientId();

  const res = await apiPost("/lock/heartbeat/service", {
    client_id: clientId,
  });

  return res;
}

// Uvolnění locku pro "service"
export async function releaseService() {
  const clientId = getClientId();

  const res = await apiPost("/lock/release/service", {
    client_id: clientId,
  });

  return res;
}
