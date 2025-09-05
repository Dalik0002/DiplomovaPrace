# services/glasses_state.py
from models.endpoints_classes import Order
from typing import List, Optional

class GlassesState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.glasses = {
            f"pos_{i}": [{"nm": "", "vol": 0} for _ in range(6)]
            for i in range(6)
        }

    def _is_pos_empty(self, pos: int) -> bool:
        key = f"pos_{pos}"
        return all((item["nm"] == "" and int(item["vol"]) == 0) for item in self.glasses[key])

    def set_glass_item(self, pos: int, index: int, name: str, volume: int):
        """Nastaví jednu ingredienci (nm/vol) na daný index (0–5) v dané sklenici (pos 0–5)."""
        key = f"pos_{pos}"
        if key in self.glasses and 0 <= index < 6:
            self.glasses[key][index] = {"nm": name, "vol": int(volume)}

    def set_glass_full(self, pos: int, ingredients: List[str], volumes: List[int]):
        """
        Naplní celou sklenici na pozici `pos` šesti položkami.
        Kratší seznamy doplní prázdnými hodnotami.
        """
        key = f"pos_{pos}"
        if key not in self.glasses:
            raise ValueError(f"Neplatná pozice sklenice: {pos}")

        # zajisti délku 6
        ing = (ingredients + [""] * 6)[:6]
        vol = (volumes + [0] * 6)[:6]

        for i in range(6):
            self.glasses[key][i] = {"nm": ing[i] or "", "vol": int(vol[i] or 0)}

    def set_glass_from_order(self, order: Order, preferred_pos: Optional[int] = None) -> Optional[int]:
        """
        Najde prázdnou sklenici a naplní ji ingrediencemi z objednávky.
        Vrací index pozice (0–5), nebo None pokud není volno.
        Pokud dáš preferred_pos, nejdřív zkusí ji.
        """
        candidates = []
        if preferred_pos is not None:
            candidates.append(preferred_pos)
        candidates += [p for p in range(6) if p != preferred_pos]

        for pos in candidates:
            if self._is_pos_empty(pos):
                self.set_glass_full(pos, order.ingredients, order.volumes)
                return pos

        print("Žádná volná sklenice pro objednávku.")
        return None

    def to_glasses_json(self):
        return {"glasses": self.glasses}
