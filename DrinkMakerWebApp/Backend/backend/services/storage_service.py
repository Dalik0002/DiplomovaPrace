#services/storage_service.py
import json
import os

from core.storages import DATA_FILE

def _ensure_file_exists():
    os.makedirs(DATA_FILE.parent, exist_ok=True)
    if not DATA_FILE.exists():
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)

def save_data(key: str, value):
    _ensure_file_exists()
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    data[key] = value
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def load_data(key: str, default_value=None):
    _ensure_file_exists()
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return data.get(key, default_value)

def get_all_data() -> dict:

    _ensure_file_exists()
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)