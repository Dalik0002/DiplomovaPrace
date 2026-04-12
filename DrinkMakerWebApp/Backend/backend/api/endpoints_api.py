from fastapi import APIRouter
from typing import List

from core.all_states import system_state, input_state, bottles_state

from services.uart_service import send_json
from services.storage_service import get_all_data

from core.storages import DATA_FILE

router = APIRouter(tags=["General"])

# --- POMOCNÁ FUNKCE PRO FRONTEND ---
def build_merged_input_state() -> dict:
    """Spojí data z ESP32 (input_state) a paměti RPI (bottles_state) do formátu pro React."""
    response = input_state.to_dict()
    response.update({
        "position_disabled": bottles_state.disabled,
    })
    return response

# -----------------------------------

@router.get("/health")
def health_check():
    return {"ok": "true"}

@router.get("/getStoredData")
async def get_stored_data():
    data = get_all_data()
    return {
        "file": str(DATA_FILE),
        "content": data
    }

@router.get("/var/currentModeOnDevice")
def get_state():
    print(f"[ENDPOINT] Požadavek na stav zařízení")
    return {"status": "ok", "data": input_state.mode_return()}

@router.get("/var/inputState")
def get_input_state():
    response = input_state.to_dict()
    response.update({
        "position_disabled": bottles_state.disabled,
        "empty_bottle": bottles_state.empty_bottle
        })
    
    return response


@router.post("/var/inputState/simulate")
def simulate_input_state(payload: dict):
    """
    Simuluje příchozí data - chová se stejně jako update z ESP32

    {
      "mode": "POURING",

      "position_check":        [true, true, true, true, true, true],
      "glass_done":            [true, false, true, false, true, false],
      "HX711_error":           [false, false, false, false, false, false],
      "empty_bottle":          [false, true, false, false, true, false],
      "position_disabled":     [false, false, false, true, false, true],

      "pouring_done": true,
      "mess_error": false,
      "cannot_process_position": false,
      "cannot_process_glass": false,
      "cannot_set_mode": false,
      "emergency_stop": false,
      "process_pouring_started": true
    }

    { 
      "empty_bottle": [false, true, false, false, false, true], 

      "HX711_error": [true, true, false, true, false, false],

      "position_disabled": [true, true, false, true, false, true]
    }
    """
    
    if "empty_bottle" in payload:
        for i, is_empty in enumerate(payload["empty_bottle"]):
            if i < 6:
                bottles_state.empty_bottle[i] = is_empty

    if "position_disabled" in payload:
        for i, is_disabled in enumerate(payload["position_disabled"]):
            if i < 6:
                if is_disabled:
                    # is_empty už máme uložené v bottles_state z kroku 1
                    bottles_state.disable_position(i, is_empty=bottles_state.empty_bottle[i])
                else:
                    bottles_state.enable_position(i)

    input_state.simulate(payload)
    
    merged_state = build_merged_input_state()
    
    return {
        "status": "ok",
        "simulated": payload,
        "current_state": merged_state,
        "mode": input_state.mode_return()
    }

@router.post("/var/inputState/reset")
def reset_input_state():
    input_state.reset()
    input_state.reset_mode()
    return {
        "status": "reset",
        "current_state": input_state.to_dict(),
        "mode": input_state.mode_return()
    }

@router.get("/var/systemState")
def get_system_state():
    return system_state.to_info_json()

@router.post("/remote/setService")
async def set_service_mod():
    payload = system_state.set_state(service=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na servisní mód")
    return {"status": "ok", "message": "Servisní mód aktivován"}

@router.post("/remote/resetService")
async def reset_service_mod():
    payload = system_state.set_state(standBy=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na výstup ze servisního módu")
    return {"status": "ok", "message": "Servisní mód deaktivován"}

@router.post("/remote/setStop")
async def set_stop_mod():
    payload = system_state.set_state(stop=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na stop mód")
    return {"status": "ok", "message": "Stop mód aktivován"}

@router.post("/remote/resetStop")
async def reset_stop_mod():
    payload = system_state.set_state(errorAcknowledgment=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na výstup ze stop módu")
    return {"status": "ok", "message": "Stop mód deaktivován"}


@router.post("/remote/setParty")
async def set_party_mod():
    payload = system_state.set_state(party=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na párty mód")
    return {"status": "ok", "message": "Párty mód aktivován"}

@router.post("/remote/resetParty")
async def reset_party_mod():
    payload = system_state.set_state(standBy=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na výstup z párty módu")
    return {"status": "ok", "message": "Párty mód deaktivován"}

@router.post("/remote/setPartySong")
async def set_party_song():
    payload = system_state.set_state(partySong=True)
    send_json(payload)
    print(f"[ENDPOINT] Požadavek na spuštění párty songu")
    return {"status": "ok", "message": "Párty song aktivován"}


## Simulation Endpoints
@router.post("/sim/setStateToStandBy")
def set_state_to_standby():
    input_state.enable_mode_simulation()
    input_state.set_standby_mode()
    print("[ENDPOINT] Nastaven stav zařízení na STANDBY (simulace)")
    return {
        "status": "ok",
        "message": "Simulovaný STAND BY aktivován",
        "mode": input_state.mode_return(),
        "simulation_mode_active": input_state.simulation_mode_active,
    }

@router.post("/sim/setStateToStop")
def set_state_to_stop():
    input_state.enable_mode_simulation()
    input_state.set_stop_mode()
    print("[ENDPOINT] Nastaven stav zařízení na STOP (simulace)")
    return {
        "status": "ok",
        "message": "Simulovaný STOP aktivován",
        "mode": input_state.mode_return(),
        "simulation_mode_active": input_state.simulation_mode_active,
    }

@router.post("/sim/setStateToService")
def set_state_to_service():
    input_state.enable_mode_simulation()
    input_state.set_service_mode()
    print("[ENDPOINT] Nastaven stav zařízení na SERVICE (simulace)")
    return {
        "status": "ok",
        "message": "Simulovaný SERVICE aktivován",
        "mode": input_state.mode_return(),
        "simulation_mode_active": input_state.simulation_mode_active,
    }


@router.post("/sim/resetState")
def reset_state():
    input_state.disable_mode_simulation()
    input_state.reset_mode()
    print("[ENDPOINT] Simulace módu vypnuta, stav vrácen na none")
    return {
        "status": "ok",
        "message": "Simulace módu vypnuta",
        "mode": input_state.mode_return(),
        "simulation_mode_active": input_state.simulation_mode_active,
    }
