# api/service_api.py
from fastapi import APIRouter, Header, HTTPException
from core.service_lock import acquire, release, heartbeat, get_status

router_serviceLock = APIRouter(prefix="/service", tags=["Service Lock"])

def _client_id_or_400(client_id: str | None) -> str:
    if not client_id:
        raise HTTPException(status_code=400, detail="Missing ClientId header")
    return client_id

@router_serviceLock.get("/status")
def service_status():
    return get_status()

@router_serviceLock.post("/acquire")
def service_acquire(client_id: str = Header(..., alias="X-Client-Id")):
    client_id = _client_id_or_400(client_id)
    res = acquire(client_id)
    if not res["ok"]:
        raise HTTPException(status_code=423, detail=res.get("reason","occupied"))
    return res

@router_serviceLock.post("/heartbeat")
def service_heartbeat(client_id: str = Header(..., alias="X-Client-Id")):
    client_id = _client_id_or_400(client_id)
    res = heartbeat(client_id)
    if not res["ok"]:
        raise HTTPException(status_code=409, detail=res.get("reason","heartbeat_not_owner"))
    return res

@router_serviceLock.post("/release")
def service_release(client_id: str = Header(..., alias="X-Client-Id")):
    client_id = _client_id_or_400(client_id)
    res = release(client_id)
    if not res["ok"]:
        raise HTTPException(status_code=409, detail=res.get("reason","release_not_owner"))
    return res
