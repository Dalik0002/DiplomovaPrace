# locks_service.py
from datetime import datetime, timedelta, timezone
from typing import Dict
from pydantic import BaseModel

LOCK_TTL_SECONDS = 15  # jak dlouho vydrží lock bez heartbeat

class Lock(BaseModel):
    owner: str
    expires_at: datetime

locks: Dict[str, Lock] = {}

def _now() -> datetime:
    return datetime.now(timezone.utc)
