# soubor: backend/api/pouring_api.py
from fastapi import APIRouter, HTTPException
from services.pouring_process_service import PouringProcessService, PourError

router_pouring = APIRouter(tags=["Pouring"])
service = PouringProcessService()

def notify(stage: str, data: dict):
    # nahraď vlastním logem / WS broadcastem
    print(f"[{stage}] {data}")


@router_pouring.post("/pour/start")
async def pour_start():
    try:
        if service.running():
            raise HTTPException(status_code=409, detail="Proces již běží.")
        service.start_bg(notify)
        return {"status": "started"}
    except PourError as e:
        raise HTTPException(status_code=409, detail={
            "stage": e.stage,
            "msg": str(e),
            "snapshot": e.snapshot
        })

@router_pouring.get("/pour/status")
async def get_pour_status():
    snap = service._snapshot()

    expected = getattr(service, "expected_positions", [])
    done_positions = getattr(service, "done_positions", [])
    failed_positions = getattr(service, "failed_positions", [])

    return {
        "running": service.running(),
        "stage": getattr(service, "current_stage", "IDLE"),
        "message": getattr(service, "last_message", ""),
        "error": getattr(service, "last_error", ""),
        "ok": getattr(service, "result_ok", None),
        "result_kind": getattr(service, "result_kind", "idle"),
        "result_text": getattr(service, "result_text", ""),
        "expected_positions": expected,
        "done_positions": done_positions,
        "failed_positions": failed_positions,
        "snapshot": snap,
    } 

@router_pouring.post("/pour/cancel")
async def pour_cancel():
    try:
        await service.stop_and_cancel()
        return {"status": "cancelled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zrušení procesu selhalo: {e}")

@router_pouring.get("/pour/state")
async def pour_state():
    return {"running": service.running()}
