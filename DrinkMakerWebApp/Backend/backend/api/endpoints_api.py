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
    # Vracíme JSON obohacený o data pro frontend
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
    
    # 1. Uložíme stav prázdných lahví ROVNOU do bottles_state (hlavní paměť RPI)
    if "empty_bottle" in payload:
        for i, is_empty in enumerate(payload["empty_bottle"]):
            if i < 6:
                bottles_state.empty_bottle[i] = is_empty

    # 2. Pak řešíme position_disabled
    if "position_disabled" in payload:
        for i, is_disabled in enumerate(payload["position_disabled"]):
            if i < 6:
                if is_disabled:
                    # is_empty už máme uložené v bottles_state z kroku 1
                    bottles_state.disable_position(i, is_empty=bottles_state.empty_bottle[i])
                else:
                    bottles_state.enable_position(i)

    # 2. Zbytek nasimulujeme klasicky do input_state (zabezpečeno přes hasattr)
    input_state.simulate(payload)
    
    # 3. Vrátíme spojený výsledek
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



## Simulation Endpoints
@router.post("/sim/setStateToStandBy")
def set_state_to_standby():
    print(f"[ENDPOINT] Nastaven stav zařízení na STANDBY")
    return {"status": "ok", "data": input_state.set_standby_mode()}

@router.post("/sim/setStateToService")
def set_state_to_service():
    print(f"[ENDPOINT] Nastavení servisního módu")
    return {"status": "ok", "data": input_state.set_service_mode()}

@router.post("/sim/resetState")
def reset_state():
    print(f"[ENDPOINT] Restartovan stav zařízení zpět na none")
    return {"status": "ok", "data": input_state.reset_mode()}
