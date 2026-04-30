from __future__ import annotations

import os
from pathlib import Path

# Firmware
FIRM_STORE_DIR = Path(os.getenv("FIRMWARE_STORE_DIR", "./firmware_store"))
FIRM_MANIFEST_PATH = FIRM_STORE_DIR / "manifest.json" 

# Data
app_data_dir = os.getenv("APP_DATA_DIR", "/app/data")
DATA_FILE = Path(app_data_dir) / "DrinkMaker_Data.json"
