// src/services/servicesService.js
import { apiPost } from "./api";

//Motor Control
export function releaseCarouselMotor() {
  return apiPost('/service/motorCarouselRelease');
}

export function blockCarouselMotor() {
  return apiPost('/service/motorPlexiBlock');
}

export function homeCarousel() {
  return apiPost('/service/homeCarousel');
}

export function releasePlexiMotor() {
  return apiPost('/service/motorPlexiRelease');
}

export function blockPlexiMotor() {
  return apiPost('/service/motorPlexiBlock');
}

export function homePlexi() {
  return apiPost('/service/homePlexi');
}

//Valve Control
export function setValve(id, open) {
  return apiPost('/service/setValve', { valve_id: id, open });;
}

//Restart ESPs 
export function restartESP32() {
  return apiPost('/service/restartESP32');
}

export function restartESPs() {
  return apiPost('/service/restartAllCarouselESPs');
}

export function restartCarouselESP(position) {
  return apiPost('/service/restartCarouselESP', { position });
}

//Update ESPs
export function updateESP32() {
  return apiPost('/service/updateESP32');
}

export function updateESPs() {
  return apiPost('/service/updateAllCarouselESPs');
}

export function updateCarouselESP(position) {
  return apiPost('/service/updateCarouselESP', { position });
}

//Calibration
export function calibrateLoadCell(position) {
  return apiPost('/service/calibratePosition', { position });
}

//Enable/Disable Stations
export function disableStation(position) {
  return apiPost('/service/disablePosition', { position });
}

export function enableStation(position) {
  return apiPost('/service/enablePosition', { position });
}

//Fill Bottles
export function markBottleFilled(position) {
  return apiPost('/service/markBottleFilled', { position });
}


