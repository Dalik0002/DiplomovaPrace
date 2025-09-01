const BASE_URL = (() => {
  const local = import.meta.env.VITE_API_URL;
  const remote = import.meta.env.VITE_API_URL_REMOTE || local;

  const host = window.location.hostname;          // např. 192.168.1.111 nebo 100.115.134.119
  const isTailscale = /^100\./.test(host);        // jednoduchá detekce VPN (Tailscale IP)

  return isTailscale ? remote : local;
})();

export async function apiGet(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  return await res.json();
}

export async function apiPost(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`[API POST ${endpoint}] Chyba:`, res.status, errorText)
    throw new Error(`API ${endpoint} failed: ${res.status}`)
  }

  return await res.json()
}