from fastapi import APIRouter
from typing import List

from core.all_states import system_state, input_state, bottles_state

from models.endpoints_classes import BottleAssignment
from models.endpoints_classes import ChoosedDrink

from services.uart_service import send_json
import services.queue_service as queue_service
import services.pouring_process_service as PoweringProcessService

router = APIRouter()

@router.post("/startPouring", tags=["General"])
def start_pouring(payload: ChoosedDrink):
    print(f"Požadavek na zahájení nalévání")
    queue_service.choose_item_from_queue(payload.name, payload.position)
    #PoweringProcessService.start()
    return {"status": "ok", "message": "Položka vybrána z fronty a přidána do sklenic zahajuji nalávání"}

@router.get("/state", tags=["General"])
def get_state():
    print(f"Požadavek na stav stroje")
    return {"status": "ok", "data": input_state.mode_return()}

@router.get("/inputState", tags=["General"])
def get_input_state():
    return input_state.to_dict()

@router.get("/systemState", tags=["General"])
def get_system_state():
    return system_state.to_info_json()

@router.post("/remote/setService", tags=["General"])
def set_service_mod():
    system_state.set_state(service=True)
    send_json(system_state.to_info_json())
    print(f"Požadavek na servisní mód")
    return {"status": "ok", "message": "Servisní mód aktivován"}

@router.post("/remote/resetService", tags=["General"])
def reset_service_mod():
    system_state.set_state(standBy=True)
    send_json(system_state.to_info_json())
    print(f"Požadavek na výstup ze servisního módu")
    return {"status": "ok", "message": "Servisní mód deaktivován"}

@router.post("/remote/setStop", tags=["General"])
def set_stop_mod():
    system_state.set_state(stop=True)
    send_json(system_state.to_info_json())
    print(f"Požadavek na stop mód")
    return {"status": "ok", "message": "Stop mód aktivován"}

@router.post("/remote/resetStop", tags=["General"])
def reset_stop_mod():
    system_state.set_state(standBy=True,errorAcknowledgment=True)
    send_json(system_state.to_info_json())
    print(f"Požadavek na výstup ze stop módu")
    return {"status": "ok", "message": "Stop mód deaktivován"}


#bottles
stored_bottles = [""] * 6

@router.post("/bottles/assigBottles", tags=["Bottles"])
def assign_bottles(bottles: List[BottleAssignment]):
    bottles_state.set_bottles(bottles)
    return {"status": "ok", "message": "Bottles assigned"}

@router.get("/bottles/getBottles", response_model=List[BottleAssignment], tags=["Bottles"])
def get_bottles():
    return bottles_state.get_bottle_assignments()