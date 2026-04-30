from fastapi import APIRouter

from services.uart_service import send_json
from services.uart_service import send_uart_command

from core.all_states import system_state, glasses_state, bottles_state

router_UART = APIRouter(prefix="/uart", tags=["UART Tests"])

@router_UART.post("/sendMess")
def send_command(mess: str):
    send_uart_command(mess)
    return {"status": "ok"}

@router_UART.get("/previewInfo")
def preview_info():
    msg = system_state.to_info_json()
    return msg

@router_UART.get("/previewGlasses")
def preview_glasses():
    msg = glasses_state.to_glasses_json()
    return msg

@router_UART.get("/previewBottles")
def preview_bottles():
    msg = bottles_state.to_position_json()
    return msg