// file: src/api/client.ts
import Constants from 'expo-constants';


const API_URL: string = (Constants?.expoConfig?.extra?.apiUrl as string) || 'http://192.168.1.111:8000';


export async function apiGet<T = any>(endpoint: string): Promise<T> {
const res = await fetch(`${API_URL}${endpoint}`);
if (!res.ok) {
const text = await res.text();
throw new Error(`[GET ${endpoint}] ${res.status}: ${text}`);
}
return res.json();
}


export async function apiPost<T = any>(endpoint: string, body: any): Promise<T> {
const res = await fetch(`${API_URL}${endpoint}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body),
});
if (!res.ok) {
const text = await res.text();
throw new Error(`[POST ${endpoint}] ${res.status}: ${text}`);
}
return res.json();
}


export { API_URL };