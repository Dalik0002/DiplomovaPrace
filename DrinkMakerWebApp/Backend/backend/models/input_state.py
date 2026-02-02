# services/input_state.py

class InputState:
    def __init__(self):
        self.reset()
        self.reset_mode()

        self.mode_map = {
            1: "STAND BY",
            2: "STOP",
            3: "CHECKING",
            4: "POURING",
            5: "SERVICE",
            6: "UPDATING"
        }

    def reset(self):
        self.position_check = [False] * 6
        self.glass_done = [False] * 6
        self.HX711_error = [False] * 6
        self.empty_bottle = [False] * 6
        self.position_disabled = [False] * 6
        self.tensometer_values = [0.0] * 6
        self.pouring_done = False
        self.mess_error = False
        self.cannot_process_position = False
        self.cannot_process_glass = False
        self.cannot_set_mode = False
        self.emergency_stop = False
        self.process_pouring_started = False

        self._prev_mess_error = False
    
    def reset_mode(self):
        self.current_mode = None
    
    def mess_error_rising_edge(self) -> bool:
        rising = (not self._prev_mess_error) and bool(self.mess_error)
        self._prev_mess_error = bool(self.mess_error)
        return rising

    def simulate(self, data: dict):
        """
        Simulace příchozích dat (např. z ESP32)
        """
        if "mode" in data:
            self.current_mode = data["mode"]

        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    
    def update_mode_from_json(self, msg: dict):
        mode_number = msg.get("State", None)

        if mode_number in self.mode_map:
            self.current_mode = self.mode_map[mode_number]
    
    def set_standby_mode(self):
        mode_number = 1

        if mode_number in self.mode_map:
            self.current_mode = self.mode_map[mode_number]


    def update_from_json(self, msg: dict):
        for i in range(6):
            self.position_check[i] = msg.get(f"pos_{i}_check", self.position_check[i])
            self.glass_done[i] = msg.get(f"glsDn_{i}", self.glass_done[i])
            self.HX711_error[i] = msg.get(f"HX711Error_{i}", self.HX711_error[i])
            self.empty_bottle[i] = msg.get(f"emptBotAtPos_{i}", self.empty_bottle[i])
            self.position_disabled[i] = msg.get(f"disabl_{i}", self.position_disabled[i])
            self.tensometer_values[i] = msg.get(f"tensoValOnPos_{i}", self.tensometer_values[i])

        self.pouring_done = msg.get("pourDone", self.pouring_done)
        self.mess_error = msg.get("messErr", self.mess_error)
        self.cannot_process_position = msg.get("canotProcPos", self.cannot_process_position)
        self.cannot_process_glass = msg.get("canotProcGls", self.cannot_process_glass)
        self.cannot_set_mode = msg.get("canotStMd", self.cannot_set_mode)
        self.emergency_stop = msg.get("emrgncyStopAppear", self.emergency_stop)
        self.process_pouring_started = msg.get("procPouringStarted", self.process_pouring_started)

    def mode_return(self):
        return self.current_mode

    def to_dict(self):
        return {
            "position_check": self.position_check,
            "glass_done": self.glass_done,
            "HX711_error": self.HX711_error,
            "empty_bottle": self.empty_bottle,
            "position_disabled": self.position_disabled,
            "tensometer_values": self.tensometer_values,
            "pouring_done": self.pouring_done,
            "mess_error": self.mess_error,
            "cannot_process_position": self.cannot_process_position,
            "cannot_process_glass": self.cannot_process_glass,
            "cannot_set_mode": self.cannot_set_mode,
            "emergency_stop": self.emergency_stop,
            "process_pouring_started": self.process_pouring_started
        }
