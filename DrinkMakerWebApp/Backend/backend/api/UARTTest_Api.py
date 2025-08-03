from fastapi import APIRouter
from models.endpointsClasses import Order

from services.uart_service import send_json
from services.uart_service import send_uart_command

from services.system_state import SystemState
from services.glasses_state import GlassesState
from services.position_state import PositionState
from services.input_state import InputState

system = SystemState()
glasses = GlassesState()
position = PositionState()
input_state = InputState()

router_UART = APIRouter()

#UART Tests
@router_UART.post("/uart/sendMess", tags=["UART Tests"])
def sendCommand(mess: str):
    send_uart_command(mess)
    return {"status": "ok"}

@router_UART.post("/uart/sendInfo", tags=["UART Tests"])
def sendInfo():
    system.set_state(start=True, openValve3=True, pouringHeight=150)
    send_json(system.to_info_json())
    return {"status": "ok", "message": "Informace odeslána přes UART"}

@router_UART.get("/uart/previewInfo", tags=["UART Tests"])
def previewInfo():
    msg = system.to_info_json()
    return msg


@router_UART.post("/uart/sendGlasses", tags=["UART Tests"])
def sendGlasses():
    glasses.set_glass(pos=1, index=0, name="Rum", volume=100)
    glasses.set_glass(pos=2, index=1, name="Cola", volume=150)
    send_json(glasses.to_glasses_json())
    return {"status": "ok", "message": "Stav sklenic odeslán přes UART"}

@router_UART.get("/uart/previewGlasses", tags=["UART Tests"])
def previewGlasses():
    msg = glasses.to_glasses_json()
    return msg


@router_UART.post("/uart/sendPosition", tags=["UART Tests"])
def sendPosition():
    position.set_bottle(pos=1, name="Vodka")
    position.set_bottle(pos=2, name="Rum")
    send_json(position.to_position_json())
    return {"status": "ok", "message": "Stav pozic odeslán přes UART"}

@router_UART.get("/uart/previewPosition", tags=["UART Tests"])
def previewPosition():
    msg = position.to_position_json()
    return msg

@router_UART.get("/uart/inputState", tags=["UART Tests"])
def getInputState():
    return input_state.to_dict()
