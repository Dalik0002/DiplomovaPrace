const BASE_URL = import.meta.env.VITE_API_URL;

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