# api/lock_api.py
import asyncio
from fastapi import APIRouter, HTTPException
from models.endpoints_schemas import LockRequest
from core.locks import locks, Lock, LOCK_TTL_SECONDS, _now
from datetime import timedelta

router_lock = APIRouter(prefix="/lock", tags=["Lock"])

@router_lock.get("/status/{name}")
def lock_status(name: str):
    """
    Vrátí aktuální stav locku.
    - exists: false → nikdo lock nedrží
    - exists: true → lock vlastní 'owner' do 'expires_at'
    """
    now = _now()
    lock = locks.get(name)

    # Lock neexistuje
    if lock is None:
        return {"exists": False}

    # Lock existuje, ale expiroval
    if lock.expires_at <= now:
        # Uklidíme expirovaný lock
        del locks[name]
        return {"exists": False}

    # Lock je platný
    remaining = (lock.expires_at - now).total_seconds()
    return {
        "locked": True,
        "owner": lock.owner,
        "expires_at": lock.expires_at.isoformat(),
        "ttl_seconds": int(remaining),
    }

@router_lock.post("/acquire/{name}")
def acquire_lock(name: str, req: LockRequest):
    now = _now()
    lock = locks.get(name)

    # volno / expirováno / znovuzískání stejného klienta
    if lock is None or lock.expires_at <= now or lock.owner == req.client_id:
        new_lock = Lock(
            owner=req.client_id,
            expires_at=now + timedelta(seconds=LOCK_TTL_SECONDS),
        )
        locks[name] = new_lock
        return {
            "ok": True,
            "owner": new_lock.owner,
            "expires_at": new_lock.expires_at.isoformat(),
            "ttl_seconds": LOCK_TTL_SECONDS,
        }

    # už to drží někdo jiný
    return {
        "ok": False,
        "owner": lock.owner,
        "expires_at": lock.expires_at.isoformat(),
    }


@router_lock.post("/heartbeat/{name}")
def heartbeat_lock(name: str, req: LockRequest):
    now = _now()
    lock = locks.get(name)

    if lock is None:
        raise HTTPException(404, detail="no_lock")

    if lock.owner != req.client_id:
        # Někdo jiný drží lock → klient by se měl přepnout na "lost"
        raise HTTPException(403, detail="not_owner")

    if lock.expires_at <= now:
        # Lock mezitím expiroval
        del locks[name]
        raise HTTPException(409, detail="expired")

    # OK – prodloužíme TTL
    lock.expires_at = now + timedelta(seconds=LOCK_TTL_SECONDS)
    locks[name] = lock
    return {
        "ok": True,
        "expires_at": lock.expires_at.isoformat(),
        "ttl_seconds": LOCK_TTL_SECONDS,
    }


@router_lock.post("/release/{name}")
def release_lock(name: str, req: LockRequest):
    lock = locks.get(name)

    if lock is None:
        return {"ok": False, "reason": "no_lock"}

    if lock.owner != req.client_id:
        return {"ok": False, "reason": "not_owner"}

    del locks[name]
    return {"ok": True}

@router_lock.post("/clear_all")
def clear_all_locks():
    count = len(locks)
    locks.clear()
    return {"ok": True, "deleted": count}