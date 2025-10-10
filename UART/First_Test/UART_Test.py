import serial
import time

# Nastavení UART portu (na Raspberry Pi obvykle /dev/serial0)
SERIAL_PORT = '/dev/serial0'
BAUDRATE = 9600

# Inicializace sériové linky
ser = serial.Serial(
    port=SERIAL_PORT,
    baudrate=BAUDRATE,
    timeout=1        # timeout pro čtení v sekundách
)

# Funkce pro odeslání zprávy
def send_message(msg: str):
    if ser.is_open:
        data = msg.encode('utf-8')
        ser.write(data)
        ser.flush()
        print(f"[SEND] {msg}")
    else:
        print("Port není otevřen")

# Funkce pro příjem dat
def receive_message():
    if ser.is_open:
        incoming = ser.readline().decode('utf-8', errors='ignore').strip()
        if incoming:
            print(f"[RECV] {incoming}")
    else:
        print("Port není otevřen")

# Hlavní cyklus: nejprve odeslat, pak přijmout, pauza
try:
    print("Spouštím cyklické odesílání a příjem po UARTu...")
    while True:
        # Připravte si svoji zprávu
        message = "Ahoj z Raspberry Pi\n"

        # Odeslání
        send_message(message)

        # Krátká pauza před příjmem
        time.sleep(0.1)

        # Příjem (pokud je něco k dispozici)
        receive_message()

        # Čas mezi cykly
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Ukončuji...")
finally:
    if ser.is_open:
        ser.close()
        print("Port uzavřen.")
