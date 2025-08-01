import serial

ser = serial.Serial('/dev/serial0', 9600, timeout=1)

def send_uart_command(drink):
    msg = f"GLASS:{drink.glass_id}|ING:{','.join(drink.ingredients)}"
    ser.write(msg.encode())