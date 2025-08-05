from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


from services.uart_service import uart_listener_loop
from services.uart_service import uart_JSON_listener_loop
import asyncio

from api.endpoints import router
from api.UARTTest_Api import router_UART

app = FastAPI(
    title="DrinkMaker API",
    description="Ovládací REST API pro DrinkMaker backend.",
    version="0.0.1",
    openapi_tags=[
        {"name": "Pouring", "description": "Zahájení procesu nalévání drinku"},
        {"name": "Queue", "description": "Správa fronty objednávek"},
        {"name": "UART Tests", "description": "Odesílání zpráv na ESP32 přes UART"},
        {"name": "Bottles", "description": "Správa ingrediencí (láhví) pro drinky"}
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(router_UART)

# Přidání složky se statickými soubory
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(uart_listener_loop())
    #asyncio.create_task(uart_JSON_listener_loop())

@app.get("/")
def read_root():
    return {"message": "DrinkMaker backend běží!"}

@app.get("/favicon.ico")
async def favicon():
    from fastapi.responses import FileResponse
    return FileResponse("static/favicon.ico")