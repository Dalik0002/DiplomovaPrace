# services/position_state.py

class PositionState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.bottleOnPosition = {
            f"pos_{i}": "" for i in range(6)
        }

    def set_bottle(self, pos: int, name: str):
        """
        Nastaví název láhve na pozici 0-5
        """
        key = f"pos_{pos}"
        if key in self.bottleOnPosition:
            self.bottleOnPosition[key] = name

    def to_position_json(self):
        return {"bottOnPos": [self.bottleOnPosition]}
