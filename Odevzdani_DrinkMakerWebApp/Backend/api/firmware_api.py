from __future__ import annotations

import hashlib
import json
import os
from enum import Enum
from pathlib import Path
from typing import Any, Dict, Optional
from services.uart_service import send_json
from core.all_states import system_state
from models.endpoints_schemas import ESPPosition

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse

from core.storages import FIRM_STORE_DIR, FIRM_MANIFEST_PATH

firmware_router = APIRouter(prefix="/fw", tags=["Firmware"] )

class FirmwareTarget(str, Enum):
    esp32 = "esp32"
    esp32c3 = "esp32c3"

def _ensure_store() -> None:
    FIRM_STORE_DIR.mkdir(parents=True, exist_ok=True)
    if not FIRM_MANIFEST_PATH.exists():
        FIRM_MANIFEST_PATH.write_text(json.dumps({"esp32": {}, "esp32c3": {}}, indent=2), encoding="utf-8")

def _load_manifest() -> Dict[str, Any]:
    _ensure_store()
    return json.loads(FIRM_MANIFEST_PATH.read_text(encoding="utf-8"))

def _save_manifest(m: Dict[str, Any]) -> None:
    tmp = FIRM_MANIFEST_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(m, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, FIRM_MANIFEST_PATH)

def _bin_path(target: FirmwareTarget) -> Path:
    # one file per target
    return FIRM_STORE_DIR / f"{target.value}.bin"

def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

# ---------- Endpoints ----------
@firmware_router.post("/updateESP32")
async def update_esp32():
    payload = system_state.set_state(update=True, updateESP32=True)
    send_json(payload)
    print("[SERVICE] Update ESP32")
    return {"status": "ok", "message": "ESP32 aktualizováno"}


@firmware_router.post("/updateCarouselESP")
async def update_carousel(position: int = Query(..., ge=1, le=6)):
    # převedeme 1–6 → 0–5 (tvůj interní index)
    index = position - 1

    payload = system_state.set_state(
        update=True,
        **{f"updateESP32C3{index}": True}
    )

    send_json(payload)

    print(f"[SERVICE] Update ESP na pozici {position}")

    return {
        "status": "ok",
        "message": f"ESP na pozici {position} aktualizováno"
    }


@firmware_router.post("/updateAllCarouselESPs")
async def update_all_carousel_esps():
    payload = system_state.set_state(update=True, updateAllESP32C3=True)
    send_json(payload)
    print("[SERVICE] Update všech ESP32-C3")
    return {"status": "ok", "message": "Všechna ESP32-C3 aktualizována"}


@firmware_router.post("/upload")
async def upload_firmware(
    target: FirmwareTarget = Query(..., description="Select firmware target"),
    version: str = Query(..., description="Firmware version e.g., 'vX_28_01_2026'"),
    file: UploadFile = File(..., description="Compiled firmware .bin"),
):
    """
    Upload firmware for ESP32 or ESP32C3. 
    
    """
    _ensure_store()

    tmp = FIRM_STORE_DIR / f"{target.value}.bin.uploading"
    final = _bin_path(target)

    # save upload
    try:
        with tmp.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
    finally:
        await file.close()

    size = tmp.stat().st_size
    if size < 16 * 1024:
        tmp.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Firmware too small ({size} bytes). Wrong file?")

    sha = _sha256(tmp)
    os.replace(tmp, final)

    m = _load_manifest()
    m[target.value] = {
        "version": version,
        "sha256": sha,
        "size": size,
        "path": f"/fw/bin?target={target.value}",
    }
    _save_manifest(m)

    return {
        "ok": True,
        "target": target.value,
        "version": version,
        "sha256": sha,
        "size": size,
        "bin_path": str(final),
        "download_path": m[target.value]["path"],
    }

@firmware_router.get("/manifest")
def get_manifest(
    target: FirmwareTarget = Query(..., description="Select firmware target"),
):
    """
    ESP calls this to get version + URL to binary + checksum.
    """
    m = _load_manifest()
    info = m.get(target.value) or {}
    if not info:
        raise HTTPException(status_code=404, detail=f"No firmware uploaded for {target.value}")
    return {"target": target.value, **info}

@firmware_router.get("/bin")
def download_bin(
    target: FirmwareTarget = Query(..., description="Select firmware target"),
):
    """
    ESP OTA binary download endpoint.
    """
    p = _bin_path(target)
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"No firmware uploaded for {target.value}")
    return FileResponse(
        path=str(p),
        media_type="application/octet-stream",
        filename=f"{target.value}.bin",
    )

@firmware_router.post("/report")
def report(payload: Dict[str, Any]):
    _ensure_store()
    reports_path = FIRM_STORE_DIR / "reports.jsonl"

    with reports_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

    return {"ok": True}


@firmware_router.get("/reports")
def get_reports():
    reports_path = FIRM_STORE_DIR / "reports.jsonl"

    if not reports_path.exists():
        return {"reports": []}

    reports = []
    with reports_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                reports.append(json.loads(line))

    return {"reports": reports}


@firmware_router.get("/reports/show")
def get_reports_show():
    reports_path = FIRM_STORE_DIR / "reports.jsonl"

    if not reports_path.exists():
        raise HTTPException(status_code=404, detail="Zatím žádné reporty.")

    return FileResponse(
        path=str(reports_path),
        media_type="text/plain; charset=utf-8",
        filename="reports.jsonl",
    )

@firmware_router.post("/reports/clear")
def clear_reports():
    reports_path = FIRM_STORE_DIR / "reports.jsonl"

    reports_path.parent.mkdir(parents=True, exist_ok=True)
    reports_path.write_text("", encoding="utf-8")

    return {"ok": True, "message": "Reporty vymazány (soubor zachován)"}