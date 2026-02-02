from __future__ import annotations

import hashlib
import json
import os
from enum import Enum
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse

firmware_router = APIRouter(prefix="/fw", tags=["Firmware"] )

# ---------- Swagger dropdown (Enum) ----------
class FirmwareTarget(str, Enum):
    esp32 = "esp32"
    esp32c3 = "esp32c3"

# ---------- Storage ----------
STORE_DIR = Path(os.getenv("FIRMWARE_STORE_DIR", "./firmware_store"))
MANIFEST_PATH = STORE_DIR / "manifest.json"

def _ensure_store() -> None:
    STORE_DIR.mkdir(parents=True, exist_ok=True)
    if not MANIFEST_PATH.exists():
        MANIFEST_PATH.write_text(json.dumps({"esp32": {}, "esp32c3": {}}, indent=2), encoding="utf-8")

def _load_manifest() -> Dict[str, Any]:
    _ensure_store()
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

def _save_manifest(m: Dict[str, Any]) -> None:
    tmp = MANIFEST_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(m, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, MANIFEST_PATH)

def _bin_path(target: FirmwareTarget) -> Path:
    # one file per target
    return STORE_DIR / f"{target.value}.bin"

def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

# ---------- Endpoints ----------

@firmware_router.post("/upload")
async def upload_firmware(
    target: FirmwareTarget = Query(..., description="Select firmware target"),
    version: str = Query(..., description="Firmware version e.g., 'Vx_28_01_2026'"),
    file: UploadFile = File(..., description="Compiled firmware .bin"),
):
    """
    Upload firmware for ESP32 or ESP32C3. 
    
    """
    _ensure_store()

    tmp = STORE_DIR / f"{target.value}.bin.uploading"
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
    """
    Optional: ESP reports OTA result.
    """
    _ensure_store()
    reports_path = STORE_DIR / "reports.jsonl"
    with reports_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    return {"ok": True}
