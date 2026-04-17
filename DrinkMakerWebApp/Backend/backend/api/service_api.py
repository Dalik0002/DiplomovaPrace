# soubor: backend/api/service_api.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.uart_service import send_json
from core.all_states import system_state, bottles_state
from models.endpoints_schemas import ESPPosition, ValveID, HeightPlexi
import services.glasses_service as glasses_service

router_service = APIRouter(prefix="/service", tags=["Service Services"])

## Motor Carousel Endpoints
@router_service.post("/motorCarouselRelease")
async def motor_carousel_release():
    payload = system_state.set_state(releaseCarouselMotor=True)
    send_json(payload)
    print("[SERVICE] Uvolnění motoru karuselu")
    return {"status": "ok", "message": "Motor karuselu uvolněn"}

@router_service.post("/motorCarouselBlock")
async def motor_carousel_block():
    payload = system_state.set_state(releaseCarouselMotor=False)
    send_json(payload)
    print("[SERVICE] Zablokování motoru karuselu")
    return {"status": "ok", "message": "Motor karuselu zablokován"}

@router_service.post("/homeCarousel")
async def home_carousel():
    payload = system_state.set_state(homeCarousel=True)
    send_json(payload)
    print("[SERVICE] Homing karuselu")
    return {"status": "ok", "message": "Homing karuselu spuštěn"}

@router_service.post("/moveCarousel")
async def move_carousel():
    payload = system_state.set_state(moveCarousel=True)
    send_json(payload)
    print("[SERVICE] Homing karuselu")
    return {"status": "ok", "message": "Homing karuselu spuštěn"}


## Motor Platform Endpoints
@router_service.post("/motorPlexiRelease")
async def motor_platform_release():
    payload = system_state.set_state(releasePlexiMotor=True)
    send_json(payload)
    print("[SERVICE] Uvolnění motoru platformy")
    return {"status": "ok", "message": "Motor platformy uvolněn"}

@router_service.post("/motorPlexiBlock")
async def motor_platform_block():
    payload = system_state.set_state(releasePlexiMotor=False)
    send_json(payload)
    print("[SERVICE] Zablokování motoru platformy")
    return {"status": "ok", "message": "Motor platformy zablokován"}

@router_service.post("/homePlexi")
async def home_platform():
    payload = system_state.set_state(homePlexi=True)
    send_json(payload)
    print("[SERVICE] Homing pojídzdního patra")
    return {"status": "ok", "message": "Homing pojízdného patra spuštěn"}

@router_service.post("/movePlexi")
async def move_platform(data: HeightPlexi):
    payload = system_state.set_state(movePlexi=True, percentHeight = data.height)
    send_json(payload)
    print("[SERVICE] Posun pojídzdního patra")
    return {"status": "ok", "message": "Posun pojízdného patra spuštěn"}


## Valve Endpoints
@router_service.post("/setValve")
async def set_valve(valve: ValveID):
    if valve.valve_id not in range(6):
        raise HTTPException(status_code=400, detail="Invalid valve ID")
    
    print(f"[SERVICE] Nastavení ventilu {valve.valve_id} na {'otevřený' if valve.open else 'zavřený'}")
    payload = system_state.set_state(**{f"openValve{valve.valve_id}": bool(valve.open)})
    send_json(payload)
    return {"status": "ok", "message": f"Ventil {valve.valve_id} {'otevřen' if valve.open else 'zavřen'}"}

## ESP32 Restart Endpoints
@router_service.post("/restartESP32")
async def restart_esp32():
    payload = system_state.set_state(restartESP32=True)
    send_json(payload)
    print("[SERVICE] Restart ESP32")
    return {"status": "ok", "message": "ESP32 restartováno"}

@router_service.post("/restartCarouselESP")
async def restart_carousel(data: ESPPosition):
    position = data.position # Tady už bude správná hodnota
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position")

    payload = system_state.set_state(**{f"restartESP32C3{position}": True})
    send_json(payload)
    print(f"[SERVICE] Restart ESP na pozici {position}")
    return {"status": "ok", "message": f"ESP na pozici {position} restartováno"}

@router_service.post("/restartAllCarouselESPs")
async def restart_all_carousel_esps():
    payload = system_state.set_state(restartAllESP32C3=True)
    send_json(payload)
    print("[SERVICE] Restart všech ESP32-C3")
    return {"status": "ok", "message": "Všechny ESP32-C3 restartovány"}


## Calibration Endpoints
@router_service.post("/calibratePosition")
async def calibrate_position(data: ESPPosition):
    position = data.position
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for calibration")

    payload = system_state.set_state(**{f"calibratePosition{position}": True})
    send_json(payload)
    print(f"[SERVICE] Kalibrace pozice {position}")
    return {"status": "ok", "message": f"Kalibrace pozice {position} spuštěna"}


## Disable/Enable Bottle Endpoints
@router_service.post("/disableBottle")
async def disable_bottle(data: ESPPosition):
    position = data.position
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for disabling")

    bottles_state.disable_position(position, is_empty=False)
    available_bottles = bottles_state.get_available_bottles()
    deleted_positions = glasses_service.remove_invalid_glasses(available_bottles)
    return {"status": "ok", "message": f"Bottle at position {position} disabled."}


@router_service.post("/enableBottle")
async def enable_bottle(data: ESPPosition):
    position = data.position
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for enabling")

    bottles_state.enable_position(position)
    return {"status": "ok", "message": f"Bottle at position {position} enabled."}


## Disable/Enable Station (fyzické stanoviště)
@router_service.post("/disableStation")
async def disable_station(data: ESPPosition):
    position = data.position
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for disabling station")

    bottles_state.disable_station(position)
    return {"status": "ok", "message": f"Station {position} disabled."}


@router_service.post("/enableStation")
async def enable_station(data: ESPPosition):
    position = data.position
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for enabling station")

    bottles_state.enable_station(position)
    return {"status": "ok", "message": f"Station {position} enabled."}


## Fill Bottle Endpoints
@router_service.post("/markBottleFilled")
async def mark_bottle_filled(data: ESPPosition):
    position = data.position
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for disabling")
    
    bottles_state.enable_position(position)
    return {"status": "ok", "message": f"Bottle at position {position} marked as filled."}
