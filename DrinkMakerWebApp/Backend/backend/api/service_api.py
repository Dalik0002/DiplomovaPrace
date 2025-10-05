# soubor: backend/api/service_api.py
from fastapi import APIRouter, HTTPException, BackgroundTasks

router_service = APIRouter(prefix="/service", tags=["Service Services"])

@router_service.post("/motorCarouselRelease")
def motor_carousel_release():
    # Implementace uvolnění motoru karuselu
    print("[SERVICE] Uvolnění motoru karuselu")
    return {"status": "ok", "message": "Motor karuselu uvolněn"}

@router_service.post("/motorPlatformRelease")
def motor_platform_release():
    # Implementace uvolnění motoru platformy
    print("[SERVICE] Uvolnění motoru platformy")
    return {"status": "ok", "message": "Motor platformy uvolněn"}