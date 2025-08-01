from fastapi import APIRouter
from models.drink import Drink
# from services.uart_service import send_uart_command

router = APIRouter()

@router.post("/start-drink")
def start_drink(drink: Drink):
    print(f"Požadavek na drink: {drink}")
    # send_uart_command(drink)  # poslat přes UART do ESP32
    return {"status": "ok", "message": "Drink zahájen"}