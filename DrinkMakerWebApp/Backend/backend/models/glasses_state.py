# services/glasses_state.py
from typing import List, Optional
from models.endpoints_classes import Glass

class GlassesState:
    def __init__(self):
        self.reset()

    def reset(self) -> None:
        self.glasses = {
            f"pos_{i}": [{"nm": "", "vol": 0} for _ in range(6)]
            for i in range(6)
        }

    def _is_pos_empty(self, pos: int) -> bool:
        key = f"pos_{pos}"
        return all((item["nm"] == "" and int(item["vol"]) == 0) for item in self.glasses[key])

    def _ensure_len6(self, arr: List, fill):
        out = list(arr[:6])
        while len(out) < 6:
            out.append(fill)
        return out

    def set_glass_full(self, pos: int, ingredients: List[str], volumes: List[int]) -> None:
        if not (0 <= pos < 6):
            raise ValueError("Pozice mimo rozsah (0..5)")

        ing6 = self._ensure_len6(ingredients or [], "")
        vol6 = self._ensure_len6(volumes or [], 0)

        key = f"pos_{pos}"
        self.glasses[key] = [{"nm": ing6[i] or "", "vol": int(vol6[i] or 0)} for i in range(6)]

    def clear_pos(self, pos: int) -> None:
        """Vymaže jednu pozici (nastaví všech 6 položek na prázdno)."""
        if not (0 <= pos < 6):
            raise ValueError("pos mimo rozsah (0..5)")
        self.glasses[f"pos_{pos}"] = [{"nm": "", "vol": 0} for _ in range(6)]

    def set_to_glasses_state(self, slots: List[Optional[Glass]]) -> None:
        if len(slots) != 6:
            raise ValueError("slots musí mít délku 6")

        for pos, g in enumerate(slots):
            if g is None:
                self.clear_pos(pos)
                continue

            # Bezpečné vytažení atributů z Glass
            ingredients = getattr(g, "ingredients", None) or []
            volumes = getattr(g, "volumes", None) or []
            # drink_name = getattr(g, "name", None)  # pokud by se někdy hodilo

            self.set_glass_full(pos, ingredients, volumes)

    def to_glasses_json(self) -> dict:
        return {"glasses": self.glasses}

    def get_glasses_in_list(self) -> List[Optional[Glass]]:
        result = []
        for pos in range(6):
            key = f"pos_{pos}"
            items = self.glasses[key]
            if all(item["nm"] == "" and int(item["vol"]) == 0 for item in items):
                result.append(None)
            else:
                ingredients = [item["nm"] for item in items if item["nm"] != ""]
                volumes = [int(item["vol"]) for item in items if int(item["vol"]) > 0]
                g = Glass(name="", ingredients=ingredients, volumes=volumes)
                result.append(g)
        return result