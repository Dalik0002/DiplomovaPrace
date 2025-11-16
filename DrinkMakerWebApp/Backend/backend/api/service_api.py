# soubor: backend/api/service_api.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.uart_service import send_json
from core.all_states import system_state
from models.endpoints_schemas import ValveID

router_service = APIRouter(prefix="/service", tags=["Service Services"])

## Motor Carousel Endpoints
@router_service.post("/motorCarouselRelease")
def motor_carousel_release():
    system_state.set_state(service=True, releaseCarouselMotor=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Uvolnění motoru karuselu")
    return {"status": "ok", "message": "Motor karuselu uvolněn"}

@router_service.post("/motorCarouselBlock")
def motor_carousel_block():
    system_state.set_state(service=True, releaseCarouselMotor=False)
    send_json(system_state.to_info_json())
    print("[SERVICE] Zablokování motoru karuselu")
    return {"status": "ok", "message": "Motor karuselu zablokován"}

@router_service.post("/rotateCarouselByOnePosition")
def rotate_carousel_by_one_position():
    system_state.set_state(service=True, rotateCarouselByOnePosition=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Otočení karuselu o jednu pozici")
    return {"status": "ok", "message": "Karusel otočen o jednu pozici"}

@router_service.post("/rotateCarouselFullRotation")
def rotate_carousel_full_rotation():
    system_state.set_state(service=True, rotateCarouselFullRotation=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Otočení karuselu o plnou rotaci")
    return {"status": "ok", "message": "Karusel otočen o plnou rotaci"}

@router_service.post("/startRotateCarouselContinuous")
def start_rotate_carousel_continuous():
    system_state.set_state(service=True, startRotateCarouselContinuous=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Spuštění kontinuálního otáčení karuselu")
    return {"status": "ok", "message": "Kontinuální otáčení karuselu spuštěno"}

## Motor Platform Endpoints
@router_service.post("/motorPlexiRelease")
def motor_platform_release():
    system_state.set_state(service=True, releasePlexiMotor=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Uvolnění motoru platformy")
    return {"status": "ok", "message": "Motor platformy uvolněn"}

@router_service.post("/motorPlexiBlock")
def motor_platform_block():
    system_state.set_state(service=True, releasePlexiMotor=False)
    send_json(system_state.to_info_json())
    print("[SERVICE] Zablokování motoru platformy")
    return {"status": "ok", "message": "Motor platformy zablokován"}

## Valve Endpoints
@router_service.post("/setValve")
def set_valve(valve: ValveID):
    if valve.valve_id not in range(6):
        raise HTTPException(status_code=400, detail="Invalid valve ID")
    
    print(f"[SERVICE] Nastavení ventilu {valve.valve_id} na {'otevřený' if valve.open else 'zavřený'}")
    system_state.set_state(service=True, **{f"openValve{valve.valve_id}": bool(valve.open)})
    send_json(system_state.to_info_json())
    return {"status": "ok", "message": f"Ventil {valve.valve_id} {'otevřen' if valve.open else 'zavřen'}"}

## ESP32 Restart Endpoints
@router_service.post("/restartESP32")
def restart_esp32():
    system_state.set_state(service=True, restartESP32=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Restart ESP32")
    return {"status": "ok", "message": "ESP32 restartováno"}

@router_service.post("/restartCarouselESPs")
def restart_carousel():
    system_state.set_state(service=True, restartESPs=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Restart ESP32")
    return {"status": "ok", "message": f"ESP32s restartovány"}