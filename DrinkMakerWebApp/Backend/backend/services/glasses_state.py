# services/glasses_state.py

class GlassesState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.glasses = {
            f"pos_{i}": [{"nm": "", "vol": 0} for _ in range(6)]
            for i in range(6)
        }

    def set_glass(self, pos: int, index: int, name: str, volume: int):
        """
        Nastaví ingredienci na konkrétní pozici sklenice
        pos = pozice sklenice (0-5)
        index = index ingredience (0-5)
        """
        key = f"pos_{pos}"
        if key in self.glasses and 0 <= index < 6:
            self.glasses[key][index] = {"nm": name, "vol": volume}

    def to_glasses_json(self):
        return {"glasses": self.glasses}
