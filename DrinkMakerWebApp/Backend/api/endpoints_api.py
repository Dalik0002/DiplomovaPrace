from fastapi import APIRouter
from typing import List

from core.all_states import system_state, input_state, bottles_state

from services.uart_service import send_json


router = APIRouter(tags=["General"])

@router.get("/getMode")
def get_state():
    #print(f"[ENDPOINT] Požadavek na stav zařízení")
    return {"status": "ok", "data": input_state.mode_return()}

@router.get("/var/inputState")
def get_input_state():
    return input_state.to_dict()

@router.get("/var/systemState")
def get_system_state():
    return system_state.to_info_json()

@router.post("/remote/setService")
def set_service_mod():
    system_state.set_state(service=True)
    send_json(system_state.to_info_json())
    print(f"[ENDPOINT] Požadavek na servisní mód")
    return {"status": "ok", "message": "Servisní mód aktivován"}

@router.post("/remote/resetService")
def reset_service_mod():
    system_state.set_state(standBy=True)
    send_json(system_state.to_info_json())
    print(f"[ENDPOINT] Požadavek na výstup ze servisního módu")
    return {"status": "ok", "message": "Servisní mód deaktivován"}

@router.post("/remote/setStop")
def set_stop_mod():
    system_state.set_state(stop=True)
    send_json(system_state.to_info_json())
    print(f"[ENDPOINT] Požadavek na stop mód")
    return {"status": "ok", "message": "Stop mód aktivován"}

@router.post("/remote/resetStop")
def reset_stop_mod():
    system_state.set_state(standBy=True,errorAcknowledgment=True)
    send_json(system_state.to_info_json())
    print(f"[ENDPOINT] Požadavek na výstup ze stop módu")
    return {"status": "ok", "message": "Stop mód deaktivován"}

## Simulation Endpoints
@router.post("/sim/setStateToStandBy")
def set_state():
    print(f"[ENDPOINT] Nastaven stav zařízení na STANDBY")
    return {"status": "ok", "data": input_state.set_standby_mode()}

@router.post("/sim/resetState")
def reset_state():
    print(f"[ENDPOINT] Restartovan stav zařízení zpět na none")
    return {"status": "ok", "data": input_state.reset_mode()}