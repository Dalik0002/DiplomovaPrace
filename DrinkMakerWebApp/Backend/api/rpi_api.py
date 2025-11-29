from fastapi import APIRouter
import subprocess
import platform
import psutil

router_rpi = APIRouter(prefix="/system", tags=["RPI"])

def get_cpu_temperature() -> float:
    try:
        output = subprocess.check_output(["vcgencmd", "measure_temp"]).decode("utf-8")
        return float(output.replace("temp=", "").replace("'C", "").strip())
    except Exception:
        with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
            temp_str = f.read().strip()
            return float(temp_str) / 1000.0

@router_rpi.get("/temperature")
def read_temperature():
    temp_c = get_cpu_temperature()
    return {"cpu_temperature_c": temp_c}


@router_rpi.get("/info")
def get_system_info():
    return {
        "hostname": platform.node(),
        "os": platform.platform(),
        "kernel": platform.release(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "uptime_seconds": psutil.boot_time(), 
    }

@router_rpi.get("/disk")
def get_disk_usage():
    usage = psutil.disk_usage("/")
    return {
        "total_gb": usage.total / (1024 ** 3),
        "used_gb": usage.used / (1024 ** 3),
        "free_gb": usage.free / (1024 ** 3),
        "percent": usage.percent,
    }