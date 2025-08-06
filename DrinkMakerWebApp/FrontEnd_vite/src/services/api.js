const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiGet(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  return await res.json();
}

export async function apiPost(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}
