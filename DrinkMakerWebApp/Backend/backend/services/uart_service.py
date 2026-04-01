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

handshake_event = asyncio.Event()

SERIAL_PORT = '/dev/serial0'
BAUDRATE = 115200

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
'''
async def uart_listener_loop():
    if not ser:
        print("[[UART RECEIVING] Není Linux → automatické přijímaní není spuštěno")
        return

    print("[[UART RECEIVING] Přijímání spuštěno")
    while True:
        try:
            if ser.in_waiting:
                data = ser.readline().decode('utf-8', errors='ignore').strip()
                if data:
                    print(f"[[UART RECEIVING] Příchozí data: {data}")
        except Exception as e:
            print(f"[[UART RECEIVING] Chyba při čtení: {e}")
        await asyncio.sleep(0.1)
'''


last_state_time = time.time()

async def uart_JSON_listener_loop():
    global uart_buffer, last_state_time
    if not ser:
        print("[[UART RECEIVING] Není k dispozici UART port")
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
                        print("[UART RECEIVING JSON]", msg)
                        if "mess" in msg and isinstance(msg["mess"], list) and msg["mess"]:
                          data_payload = msg["mess"][0]

                          input_state.update_from_json(data_payload)

                          # --- LOGIKA HANDSHAKU ---
                          # Pokud ESP32 hlásí OK, uvolníme čekající sender_loop
                          if data_payload.get("messOk"):
                              print("[UART] messOk přijat -> uvolňuji odesílání další zprávy")
                              handshake_event.set()

                          # Pokud ESP32 hlásí chybu parsování, sender_loop to zkusí znovu (díky timeoutu)
                          if data_payload.get("messErr"):
                              print("[UART] messErr přijat -> ESP32 hlásí chybu parsování")
                              # Necháme proběhnout timeout v sender_loop, který vyvolá resend

                    except json.JSONDecodeError:
                        payload = system_state.set_state(messErrfromESP32=True)
                        send_json(payload)
                        print("[UART JSON ERROR] Neplatný JSON:", json_str)


                while "<STATE>" in uart_buffer and "</STATE>" in uart_buffer:
                    start = uart_buffer.find("<STATE>") + len("<STATE>")
                    end = uart_buffer.find("</STATE>")
                    json_str = uart_buffer[start:end]
                    uart_buffer = uart_buffer[end + len("</STATE>"):]

                    try:
                        msg = json.loads(json_str)
                        print("[[UART RECEIVING STATE]", msg)
                        input_state.update_mode_from_json(msg)
                        last_state_time = time.time()
                    except Exception:
                        system_state.set_state(messErrfromESP32=True)
                        send_json(system_state.to_info_json())
                        print("[UART STATE ERROR] Neplatný JSON:", json_str)
                
            if time.time() - last_state_time > 10:
                if not input_state.simulation_mode_active:
                    print("[UART STATE TIMEOUT] Žádný STATE >10s")
                    input_state.reset_mode()
                else:
                    print("[UART STATE TIMEOUT] Simulace módu aktivní -> reset_mode přeskočen")
                last_state_time = time.time()

        except Exception as e:
            payload = system_state.set_state(messErrfromESP32=True)
            send_json(payload)
            print(f"[[UART RECEIVING ERROR] Chyba při čtení: {e}")

        await asyncio.sleep(0.1)


#################################################
# Funkce pro odesílání zpráv přes UART
send_queue = asyncio.Queue()

async def uart_sender_loop():
    global last_sent_json, last_sent_raw

    while True:
        data, fut = await send_queue.get()
        
        if not ser:
            print(f"[UART SENDING] Není Linux → odesílání ignorováno")
            if fut and not fut.done():
                fut.set_exception(RuntimeError("UART není dostupný"))
            send_queue.task_done()
            continue
        
        try:
            success = False
            attempts = 0
            max_attempts = 5

            while not success and attempts < max_attempts:

                handshake_event.clear()
                input_state.reset_handshake()

                if data.startswith("<JSON>"):
                    raw = data[len("<JSON>"):data.find("</JSON>")]
                    last_sent_json = json.loads(raw)
                    last_sent_raw = None
                else:
                    last_sent_raw = data.strip()
                    last_sent_json = None
                
                # --- CHUNKOVANÉ ODESÍLÁNÍ ---
                encoded_data = data.encode("utf-8")
                chunk_size = 64 # Posílat po 64 bajtech
                for i in range(0, len(encoded_data), chunk_size):
                    ser.write(encoded_data[i:i+chunk_size])
                    await asyncio.sleep(0.01)

                attempts += 1
                print(f"[UART SENDING] Pokus {attempts}: {data.strip()}")

                try:
                    await asyncio.wait_for(handshake_event.wait(), timeout=2.0)
                    success = True
                    print(f"[UART] Handshake potvrzen po {attempts} pokusu.")
                except asyncio.TimeoutError:
                    print(f"[UART] Timeout čekání na messOk (Pokus {attempts}/{max_attempts})")

            if success:
                if fut and not fut.done():
                    fut.set_result(True)
            else:
                print(f"[UART CRITICAL] Zpráva nebyla potvrzena ani po {max_attempts} pokusech!")
                if fut and not fut.done():
                    fut.set_exception(RuntimeError("UART handshake failed"))

                await asyncio.sleep(0.05) 


        except Exception as e:
            print(f"[UART SENDING ERROR] Chyba při odesílání: {e}")
            if fut and not fut.done():
                fut.set_exception(e)

        finally:
            send_queue.task_done()
            await asyncio.sleep(0.1)  


def send_json(json_obj):
    data = "<JSON>" + json.dumps(json_obj) + "</JSON>\n"
    asyncio.create_task(send_queue.put((data, None)))
    print(f"[UART → QUEUED] {json.dumps(json_obj)}")

async def send_json_and_wait(json_obj):
    data = "<JSON>" + json.dumps(json_obj) + "</JSON>\n"
    loop = asyncio.get_running_loop()
    fut = loop.create_future()

    await send_queue.put((data, fut))
    print(f"[UART → QUEUED+WAIT] {json.dumps(json_obj)}")

    return await fut

def send_uart_command(msg: str):
    asyncio.create_task(send_queue.put((msg + '\n', None)))
    print(f"[UART → QUEUED RAW] {msg}")
