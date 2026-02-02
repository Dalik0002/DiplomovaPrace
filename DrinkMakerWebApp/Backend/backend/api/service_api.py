# soubor: backend/api/service_api.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.uart_service import send_json
from core.all_states import system_state, bottles_state
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

@router_service.post("/homeCarousel")
def home_carousel():
    system_state.set_state(service=True, homeCarousel=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Homing karuselu")
    return {"status": "ok", "message": "Homing karuselu spuštěn"}

"""
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
"""

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

@router_service.post("/homePlexi")
def home_platform():
    system_state.set_state(service=True, homePlexi=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Homing pojídzdního patra")
    return {"status": "ok", "message": "Homing pojízdného patra spuštěn"}

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
    system_state.set_state(restartESP32=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Restart ESP32")
    return {"status": "ok", "message": "ESP32 restartováno"}

@router_service.post("/restartCarouselESP")
def restart_carousel(position: int = 0):
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for ESP restart")

    system_state.set_state(**{f"restartESP32C3{position}": True})
    send_json(system_state.to_info_json())
    print(f"[SERVICE] Restart ESP na pozici {position}")
    return {"status": "ok", "message": f"ESP na pozici {position} restartováno"}

@router_service.post("/restartAllCarouselESPs")
def restart_all_carousel_esps():
    system_state.set_state(restartAllESP32C3=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Restart všech ESP32-C3")
    return {"status": "ok", "message": "Všechny ESP32-C3 restartovány"}

## ESP32 Update Endpoints
@router_service.post("/updateESP32")
def update_esp32():
    system_state.set_state(update=True, updateESP32=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Update ESP32")
    return {"status": "ok", "message": "ESP32 aktualizováno"}

@router_service.post("/updateCarouselESP")
def update_carousel(position: int = 0):
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for ESP update")

    system_state.set_state(update=True, **{f"updateESP32C3{position}": True})
    send_json(system_state.to_info_json())
    print(f"[SERVICE] Update ESP na pozici {position}")
    return {"status": "ok", "message": f"ESP na pozici {position} aktualizováno"}

@router_service.post("/updateAllCarouselESPs")
def update_all_carousel_esps():
    system_state.set_state(update=True, updateAllESP32C3=True)
    send_json(system_state.to_info_json())
    print("[SERVICE] Update všech ESP32-C3")
    return {"status": "ok", "message": "Všechna ESP32-C3 aktualizována"}

## Calibration Endpoints
@router_service.post("/calibratePosition")
def calibrate_position(position: int = 0):
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for calibration")

    system_state.set_state(service=True, **{f"calibratePosition{position}": True})
    send_json(system_state.to_info_json())
    print(f"[SERVICE] Kalibrace pozice {position}")
    return {"status": "ok", "message": f"Kalibrace pozice {position} spuštěna"}


## Disable Positions Endpoints
@router_service.post("/disablePosition")
def disable_position(position: int = 0):
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for disabling")

    system_state.set_state(service=True, **{f"disablePosition{position}": True})
    bottles_state.delete_bottle_at_position(position)
    send_json(system_state.to_info_json())
    print(f"[SERVICE] Deaktivace pozice {position}")
    return {"status": "ok", "message": f"Deaktivace pozice {position} spuštěna"}


## Enable Positions Endpoints
@router_service.post("/enablePosition")
def enable_position(position: int = 0):
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for enabling")

    system_state.set_state(service=True, **{f"disablePosition{position}": False})
    send_json(system_state.to_info_json())
    print(f"[SERVICE] Aktivace pozice {position}")
    return {"status": "ok", "message": f"Aktivace pozice {position} spuštěna"}

## Fill Bottle Endpoints
@router_service.post("/markBottleFilled")
def mark_bottle_filled(position: int = 0):
    if position not in range(6):
        raise HTTPException(status_code=400, detail="Invalid position for marking bottle filled")

    system_state.set_state(service=True, **{f"markBottleFilled{position}": True})
    send_json(system_state.to_info_json())
    print(f"[SERVICE] Označení lahve jako plné na pozici {position}")
    return {"status": "ok", "message": f"Lahve na pozici {position} označena jako plná"}