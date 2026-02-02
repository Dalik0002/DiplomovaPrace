#services/uart_service.py
import serial
import asyncio
import platform
import json
import time

from core.all_states import input_state, system_state

# Bufr pro vstup
uart_buffer = ""

last_sent_json = None
last_sent_raw = None


# Nastavení UART portu (na Raspberry Pi obvykle /dev/serial0)
SERIAL_PORT = '/dev/serial0'
BAUDRATE = 9600

IS_LINUX = platform.system() == "Linux"
ser = None

if IS_LINUX:
    try:
        ser = serial.Serial(
            port=SERIAL_PORT,
            baudrate=BAUDRATE,
            timeout=1
        )
        print("[UART] UART inicializován (/dev/serial0)")
    except Exception as e:
        print(f"[UART] Chyba při inicializaci: {e}")
        ser = None
else:
    print("[UART] Není Linux → UART ignorován")


#################################################
# Asynchronní smyčka pro čtení dat z UART
async def uart_listener_loop():
    if not ser:
        print("[UART ←] Není Linux → automatické přijímaní není spuštěno")
        return

    print("[UART ←] Přijímání spuštěno")
    while True:
        try:
            if ser.in_waiting:
                data = ser.readline().decode('utf-8', errors='ignore').strip()
                if data:
                    print(f"[UART ←] Příchozí data: {data}")
        except Exception as e:
            print(f"[UART ←] Chyba při čtení: {e}")
        await asyncio.sleep(0.1)



last_state_time = time.time()

async def uart_JSON_listener_loop():
    global uart_buffer, last_state_time
    if not ser:
        print("[UART ←] Není k dispozici UART port")
        return

    print("[UART] Přijímání spuštěno")
    while True:
        try:
            if ser.in_waiting:
                chunk = ser.read(ser.in_waiting).decode("utf-8", errors="ignore")
                uart_buffer += chunk

                while "<JSON>" in uart_buffer and "</JSON>" in uart_buffer:
                    start = uart_buffer.find("<JSON>") + len("<JSON>")
                    end = uart_buffer.find("</JSON>")
                    json_str = uart_buffer[start:end]
                    uart_buffer = uart_buffer[end + len("</JSON>"):]

                    try:
                        msg = json.loads(json_str)
                        print("[UART ← JSON]", msg)
                        input_state.update_from_json(msg)
                        # po update_from_json(msg)
                        if input_state.mess_error_rising_edge():
                            print("[UART] messErr=true → resend last JSON")
                            if last_sent_json is not None:
                                send_json(last_sent_json)
                            elif last_sent_raw is not None:
                                send_uart_command(last_sent_raw)
                            else:
                                print("[UART] messErr, ale není co poslat (cache prázdná)")

                    except json.JSONDecodeError:
                        system_state.set_state(messErrfromESP32=True)
                        send_json(system_state.to_info_json())
                        print("[UART JSON ERROR] Neplatný JSON:", json_str)


                while "<STATE>" in uart_buffer and "</STATE>" in uart_buffer:
                    start = uart_buffer.find("<STATE>") + len("<STATE>")
                    end = uart_buffer.find("</STATE>")
                    json_str = uart_buffer[start:end]
                    uart_buffer = uart_buffer[end + len("</STATE>"):]

                    try:
                        msg = json.loads(json_str)
                        print("[UART ← STATE]", msg)
                        input_state.update_mode_from_json(msg)
                        last_state_time = time.time()
                    except Exception:
                        system_state.set_state(messErrfromESP32=True)
                        send_json(system_state.to_info_json())
                        print("[UART STATE ERROR] Neplatný JSON:", json_str)

            if time.time() - last_state_time > 5:
                print("[UART STATE TIMEOUT] Žádný STATE >5s")
                input_state.reset_mode()
                last_state_time = time.time()

        except Exception as e:
            system_state.set_state(messErrfromESP32=True)
            send_json(system_state.to_info_json())
            print(f"[UART ← ERROR] Chyba při čtení: {e}")

        await asyncio.sleep(0.1)



#################################################
# Funkce pro odesílání zpráv přes UART
def send_uart_command(msg: str):
    global last_sent_raw
    if ser:
        try:
            last_sent_raw = msg
            msg = msg + '\n'
            ser.write(msg.encode('utf-8'))
            print(f"[UART →] Odesláno: {msg}")
        except Exception as e:
            print(f"[UART → ERROR] Chyba při odesílání: {e}")
    else:
        print(f"[UART →] Není Linux → odesílání ignorováno")
        

def send_json(json_obj):
    global last_sent_json
    if ser:
        try:
            last_sent_json = json_obj
            data = "<JSON>" + json.dumps(json_obj) + "</JSON>"
            ser.write(data.encode("utf-8"))
            print(f"[UART →] Odesláno", data.strip())
        except Exception as e:
            print(f"[UART → ERROR] Chyba při odesílání: {e}")
    else:
        print(f"[UART →] Není Linux → odesílání ignorováno")