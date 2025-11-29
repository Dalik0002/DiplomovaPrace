from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse
from fastapi.openapi.docs import get_swagger_ui_html

from services.uart_service import uart_listener_loop
from services.uart_service import uart_JSON_listener_loop
import asyncio

from api.endpoints_api import router
from api.uart_test_api import router_UART
from api.queue_api import router_queue
from api.service_api import router_service
from api.glasses_api import router_glasses
from api.pouring_api import router_pouring
from api.rpi_api import router_rpi
from api.bottles_api import router_bottles
from api.locks_api import router_lock

app = FastAPI(
    title="DrinkMaker API",
    description="Ovládací REST API pro DrinkMaker backend.",
    version="0.0.1",
    openapi_tags=[
        {"name": "General", "description": "Obecná funkce API"},
        {"name": "Bottle Management", "description": "Správa láhví s ingrediencemi"},
        #{"name": "Queue", "description": "Správa fronty objednávek"},
        {"name": "Glasses", "description": "Správa sklenic"},
        {"name": "UART Tests", "description": "Odesílání zpráv na ESP32 přes UART"},
        #{"name": "Service Lock", "description": "Správa zámku služby (service lock)"},
        {"name": "Service Services", "description": "Služby pro správu stavu služby"},
        {"name": "Pouring", "description": "Řízení procesu nalévání drinků"},
        {"name": "RPI", "description": "Specifické funkce pro Raspberry Pi"},
        {"name": "Lock", "description": "Distributed lock management API"},
    ],
    docs_url=None, 
    redoc_url=None,
)

# Povolené originy
origins = [
    "http://localhost:5173",         # vývojové prostředí
    "http://192.168.1.111:5173",     # produkční frontend na RPi
    "http://127.0.0.1:5173",         # alternativa pro vývoj
    "http://100.115.134.119:5173",       # produkční frontend vzdálený přístup
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # seznam povolených originů
    allow_credentials=True,
    allow_methods=["*"],            # povol všechny metody (GET, POST, atd.)
    allow_headers=["*"],            # povol všechny hlavičky
)

app.include_router(router)
app.include_router(router_UART)
#app.include_router(router_queue)
app.include_router(router_service)
#app.include_router(router_serviceLock)
app.include_router(router_glasses)
app.include_router(router_pouring)
app.include_router(router_rpi)
app.include_router(router_bottles)
app.include_router(router_lock)

# Přidání složky se statickými soubory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="DrinkMaker API - Docs",
        swagger_js_url="/static/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui.css",     
        swagger_favicon_url="/static/piano.ico",      
    )

@app.on_event("startup")
async def startup_event():
    #asyncio.create_task(uart_listener_loop())
    asyncio.create_task(uart_JSON_listener_loop())

@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")

@app.get("/favicon.ico")
async def favicon():
    from fastapi.responses import FileResponse
    return FileResponse("static/logo_small.ico")