import { apiGet, apiPost } from "./api";

export function sendUARTMessage(message) {
  return apiPost("/uart/sendMess", { mess: message });
}

export function sendInfo() {
  return apiPost("/uart/sendInfo");
}
export function previewInfo() {
  return apiGet("/uart/previewInfo");
}

export function sendGlasses() {
  return apiPost("/uart/sendGlasses");
}
export function previewGlasses() {
  return apiGet("/uart/previewGlasses");
}

export function sendBottles() {
  return apiPost("/uart/sendBottles");
}
export function previewBottles() {
  return apiGet("/uart/previewBottles");
}

export function getInputState() {
  return apiGet("/uart/inputState");
}




