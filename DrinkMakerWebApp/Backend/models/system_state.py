# services/system_state.py

class SystemState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.start = False
        self.stop = False
        self.check = False
        self.service = False
        self.standBy = False
        self.update = False

        self.openValve = [False] * 6
        self.releaseCarouselMotor = False
        self.releasePlexiMotor = False
        self.pouringHeight = 100
        self.errorAcknowledgment = False

        self.restartESP32 = False
        self.restartESP = [False] * 6
        self.updateESP32 = False
        self.updateESP = [False] * 6

    def set_restart_esps(self, value: bool):
        for i in range(6):
            self.restartESP[i] = value

    def set_state(self, **kwargs):
        self.reset()
        for key, value in kwargs.items():
            if key.startswith("openValve"):
                idx = int(key.replace("openValve", ""))
                self.openValve[idx] = value

            elif key == "restartESPs" and value:
              self.set_restart_esps(value)

            elif key == "pouringHeight":
                self.pouringHeight = int(value)

            elif hasattr(self, key):
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
                "upd": self.update,
                "opnVlvOnPos0": self.openValve[0],
                "opnVlvOnPos1": self.openValve[1],
                "opnVlvOnPos2": self.openValve[2],
                "opnVlvOnPos3": self.openValve[3],
                "opnVlvOnPos4": self.openValve[4],
                "opnVlvOnPos5": self.openValve[5],
                "relsCarMtr": self.releaseCarouselMotor,
                "relsPlxMtr": self.releasePlexiMotor,
                "pourHght": self.pouringHeight,
                "errAcknow": self.errorAcknowledgment,
                "resESP32": self.restartESP32,
                "resESP_0": self.restartESP[0],
                "resESP_1": self.restartESP[1],
                "resESP_2": self.restartESP[2],
                "resESP_3": self.restartESP[3],
                "resESP_4": self.restartESP[4],
                "resESP_5": self.restartESP[5],
                "updESP32": self.updateESP32,
                "updESP_0": self.updateESP[0],
                "updESP_1": self.updateESP[1],
                "updESP_2": self.updateESP[2],
                "updESP_3": self.updateESP[3],
                "updESP_4": self.updateESP[4],
                "updESP_5": self.updateESP[5]
            }]
        }
