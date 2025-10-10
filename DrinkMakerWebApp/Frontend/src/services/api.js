//api.js
const BASE_URL = (() => {
  /*const local = import.meta.env.VITE_API_URL;
  const remote = import.meta.env.VITE_API_URL_REMOTE || local;

  const host = window.location.hostname;          // např. 192.168.1.111 nebo 100.115.134.119
  const isTailscale = /^100\./.test(host);        // jednoduchá detekce VPN (Tailscale IP)

  return isTailscale ? remote : local;*/
  const API = import.meta.env.VITE_API_URL;
  return API;
})();


// Pomocná funkce pro jednotné chyby
async function parseOrThrow(res) {
  const text = await res.text();
  if (!res.ok) {
    // zkus JSON → jinak pošli raw text
    try {
      const j = JSON.parse(text);
      throw new Error(j.message || JSON.stringify(j));
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return text ? JSON.parse(text) : null;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: 'include' });
  return parseOrThrow(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  return parseOrThrow(res);
}

export async function apiPostRaw(path, headers = {}) {
  // pro acquire/heartbeat/release s vlastními headery (X-Client-Id)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  return parseOrThrow(res);
}
