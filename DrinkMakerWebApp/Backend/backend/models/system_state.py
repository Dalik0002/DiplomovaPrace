# services/system_state.py

class SystemState:

    def __init__(self):
        self.reset()
        self._current_values = {}


    def set_state(self, **kwargs) -> dict:
        payload = {}

        mapping = {
            "start": "strt", "stop": "stp", "check": "chck",
            "service": "srvc", "standBy": "stnd", "update": "updt", "party": "prty",
            "partySong": "prtySng",
            "releaseCarouselMotor": "relsCarMtr",
            "releasePlexiMotor": "relsPlxMtr",
            "homeCarousel": "homeCarousel",
            "homePlexi": "homePlexi",
            "errorAcknowledgment": "errAcknow",
            "messErrfromESP32": "messErrfromESP32",
            "restartESP32": "resESP32",
            "updateESP32": "updESP32",
            "movePlexi": "movePlexi",
            "moveCarousel": "moveCarousel",
            "percentHeight": "percentHeight",
        }

        for key, raw in kwargs.items():
            # --- 1) percentHeight je číslo, ne bool ---
            if key == "percentHeight":
                try:
                    v_int = int(raw)
                except (TypeError, ValueError):
                    raise ValueError(f"percentHeight must be int (0..100), got: {raw!r}")

                if v_int < 0 or v_int > 100:
                    raise ValueError(f"percentHeight out of range: {v_int} (0..100)")

                self._current_values[key] = v_int
                payload[mapping[key]] = v_int
                continue

            # ostatní jsou logické příkazy
            value = bool(raw)
            self._current_values[key] = value

            # --- 2) indexované příkazy ---
            if key.startswith("openValve"):
                idx = key[len("openValve"):]
                if not idx.isdigit():
                    raise ValueError(f"Invalid key: {key} (expected openValve0..5)")
                payload[f"opnVlvOnPos{idx}"] = value
                continue

            if key.startswith("restartESP32C3"):
                idx = key[len("restartESP32C3"):]
                if not idx.isdigit():
                    raise ValueError(f"Invalid key: {key} (expected restartESP32C30..5)")
                payload[f"resESP_{idx}"] = value
                continue

            if key.startswith("updateESP32C3"):
                idx = key[len("updateESP32C3"):]
                if not idx.isdigit():
                    raise ValueError(f"Invalid key: {key} (expected updateESP32C30..5)")
                payload[f"updESP_{idx}"] = value
                continue

            if key.startswith("calibratePosition"):
                idx = key[len("calibratePosition"):]
                if not idx.isdigit():
                    raise ValueError(f"Invalid key: {key} (expected calibratePosition0..5)")
                payload[f"calibPos_{idx}"] = value
                continue

            # --- 3) hromadné příkazy ---
            if key == "restartAllESP32C3":
                if value:
                    for i in range(6):
                        payload[f"resESP_{i}"] = True
                continue

            if key == "updateAllESP32C3":
                if value:
                    for i in range(6):
                        payload[f"updESP_{i}"] = True
                continue

            # --- 4) mapované jednoduché příkazy ---
            if key in mapping:
                payload[mapping[key]] = value
                continue

            # --- 5) neznámý klíč ---
            raise ValueError(f"Unknown state key in set_state(): {key}")

        return {"info": [payload]}

    def reset(self):
        self.start = False
        self.stop = False
        self.check = False
        self.service = False
        self.standBy = False
        self.update = False
        self.party = False

        self.openValve = [False] * 6
        self.releaseCarouselMotor = False
        self.releasePlexiMotor = False
        self.homeCarousel = False
        self.moveCarousel = False
        self.homePlexi = False
        self.movePlexi = False
        self.percentHeight = 0
        self.errorAcknowledgment = False
        self.messErrfromESP32 = False

        self.restartESP32 = False
        self.restartESP32C3 = [False] * 6
        self.updateESP32 = False
        self.updateESP32C3 = [False] * 6
        self.calibratePosition = [False] * 6

    def _parse_index(self, key: str, prefix: str) -> int:
        suffix = key[len(prefix):]
        if not suffix.isdigit():
            raise ValueError(f"Invalid key '{key}'. Expected {prefix}<0..{6-1}>")
        idx = int(suffix)
        if idx < 0 or idx >= 6:
            raise ValueError(f"Index out of range in '{key}': {idx} (0..{6-1})")
        return idx


    def set_state_OLD(self, **kwargs):
        self.reset()

        for key, value in kwargs.items():
            value = bool(value)

            if key.startswith("openValve"):
                idx = self._parse_index(key, "openValve")
                self.openValve[idx] = value
            
            elif key.startswith("restartESP32"):
                if key == "restartESP32" and value:
                    self.restartESP32 = True

            elif key.startswith("restartESP32C3"):
                idx = self._parse_index(key, "restartESP32C3")
                self.restartESP32C3[idx] = value

            elif key.startswith("restartAllESP32C3"):
                for i in range(6):
                    self.restartESP32C3[i] = True
            
            elif key.startswith("updateESP32"):
                if key == "updateESP32" and value:
                    self.updateESP32 = True

            elif key.startswith("updateESP32C3"):
                idx = self._parse_index(key, "updateESP32C3")
                self.updateESP32C3[idx] = value

            elif key == "updateAllESP32C3":
                for i in range(6):
                    self.updateESP32C3[i] = True

            elif key.startswith("calibratePosition"):
                idx = self._parse_index(key, "calibratePosition")
                self.calibratePosition[idx] = value

            elif key == "homeCarousel":
                self.homeCarousel = value

            elif key == "homePlexi":
                self.homePlexi = value
            
            elif key == "messErrfromESP32":
                self.messErrfromESP32 = value

            elif hasattr(self, key):
                # přímé bool flagy (service, start, restartESP32, ...)
                setattr(self, key, value)

            else:
                raise ValueError(f"Unknown state key: {key}")

    def to_info_json(self):
        return {
            "info": [{
                "strt": self.start,
                "stp": self.stop,
                "chck": self.check,
                "srvc": self.service,
                "stnd": self.standBy,
                "updt": self.update,
                "prty": self.party,

                "opnVlvOnPos0": self.openValve[0],
                "opnVlvOnPos1": self.openValve[1],
                "opnVlvOnPos2": self.openValve[2],
                "opnVlvOnPos3": self.openValve[3],
                "opnVlvOnPos4": self.openValve[4],
                "opnVlvOnPos5": self.openValve[5],

                "relsCarMtr": self.releaseCarouselMotor,
                "relsPlxMtr": self.releasePlexiMotor,
                "homeCarousel": self.homeCarousel,
                "homePlexi": self.homePlexi,
                "movePlexi": self.movePlexi,
                "percentHeight": self.percentHeight,
                
                "errAcknow": self.errorAcknowledgment,
                "messErrfromESP32": self.messErrfromESP32,

                "resESP32": self.restartESP32,
                "resESP_0": self.restartESP32C3[0],
                "resESP_1": self.restartESP32C3[1],
                "resESP_2": self.restartESP32C3[2],
                "resESP_3": self.restartESP32C3[3],
                "resESP_4": self.restartESP32C3[4],
                "resESP_5": self.restartESP32C3[5],

                "updESP32": self.updateESP32,
                "updESP_0": self.updateESP32C3[0],
                "updESP_1": self.updateESP32C3[1],
                "updESP_2": self.updateESP32C3[2],
                "updESP_3": self.updateESP32C3[3],
                "updESP_4": self.updateESP32C3[4],
                "updESP_5": self.updateESP32C3[5],

                "calibPos_0": self.calibratePosition[0],
                "calibPos_1": self.calibratePosition[1],
                "calibPos_2": self.calibratePosition[2],
                "calibPos_3": self.calibratePosition[3],
                "calibPos_4": self.calibratePosition[4],
                "calibPos_5": self.calibratePosition[5],
            }]
        }
