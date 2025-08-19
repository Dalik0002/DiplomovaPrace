import { apiGet, apiPost } from "./api";

export function getState() {
  return apiGet("/state");
}

