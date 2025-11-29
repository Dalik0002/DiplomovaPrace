// src/services/servicesService.js
import { apiPost } from "./api";

export function releaseCarouselMotor() {
  return apiPost('/service/motorCarouselRelease');
}

export function blockCarouselMotor() {
  return apiPost('/service/motorPlexiBlock');
}

export function releasePlexiMotor() {
  return apiPost('/service/motorPlexiRelease');
}

export function blockPlexiMotor() {
  return apiPost('/service/motorPlexiBlock');
}

export function setValve(id, open) {
  return apiPost('/service/setValve', { valve_id: id, open });;
}


export function restartESP32() {
  return apiPost('/service/restartESP32');
}

export function restartESPs() {
  return apiPost('/service/restartCarouselESPs');
}



