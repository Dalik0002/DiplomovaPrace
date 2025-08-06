import { apiGet, apiPost } from "./api";

export function sendUARTMessage(message) {
  return apiPost("/uart/sendMess", { mess: message });
}

export function previewInfo() {
  return apiGet("/uart/previewInfo");
}

export function sendInfo() {
  return apiPost("/uart/sendInfo");
}
