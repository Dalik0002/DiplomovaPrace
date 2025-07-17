from fastapi import FastAPI
from pydantic import BaseModel
from .serial_comm import send_uart_command

app = FastAPI()

class DrinkRequest(BaseModel):
    drink: str

@app.get("/")
def root():
    return {"message": "DrinkMaker backend běží"}

@app.post("/api/order")
def order_drink(req: DrinkRequest):
    send_uart_command(f"ORDER:{req.drink}")
    return {"status": "OK", "sent": req.drink"}
