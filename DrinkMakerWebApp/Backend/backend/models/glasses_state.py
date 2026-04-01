from typing import List, Optional
from collections import OrderedDict
from models.endpoints_schemas import Glass


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

    def _normalize_name(self, name: str) -> str:
        # Odstraní mezery a také uvozovky, které by mohly způsobit chybu v JSONu
        if not name:
            return ""
        return str(name).strip().replace('"', '').replace("'", "")

    def _merge_duplicate_ingredients(self, ingredients: List[str], volumes: List[int]) -> tuple[List[str], List[int]]:
        """
        Sloučí duplicity ingrediencí:
        např. ["Cola", "Rum", "Cola"], [10, 20, 10]
        -> ["Cola", "Rum"], [20, 20]

        Zachovává pořadí první occurrence.
        Ignoruje prázdné názvy a položky s vol <= 0.
        """
        merged = OrderedDict()

        max_len = max(len(ingredients or []), len(volumes or []))

        for i in range(max_len):
            nm = self._normalize_name(ingredients[i] if i < len(ingredients) else "")
            vol = int((volumes[i] if i < len(volumes) else 0) or 0)

            if nm == "" or vol <= 0:
                continue

            if nm in merged:
                merged[nm] += vol
            else:
                merged[nm] = vol

        merged_ing = list(merged.keys())
        merged_vol = list(merged.values())

        return merged_ing, merged_vol

    def set_glass_full(self, pos: int, ingredients: List[str], volumes: List[int]) -> None:
        if not (0 <= pos < 6):
            raise ValueError("Pozice mimo rozsah (0..5)")

        # 1) nejdřív sloučení duplicit
        merged_ing, merged_vol = self._merge_duplicate_ingredients(ingredients or [], volumes or [])

        # 2) doplnění na délku 6
        ing6 = self._ensure_len6(merged_ing, "")
        vol6 = self._ensure_len6(merged_vol, 0)

        key = f"pos_{pos}"
        self.glasses[key] = [
            {"nm": ing6[i] or "", "vol": int(vol6[i] or 0)}
            for i in range(6)
        ]

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

            ingredients = getattr(g, "ingredients", None) or []
            volumes = getattr(g, "volumes", None) or []

            self.set_glass_full(pos, ingredients, volumes)

    def to_glasses_json(self) -> dict:
        return {"glasses": self.glasses}


    def get_glasses_in_list(self) -> List[Optional[Glass]]:
        result = []
        for pos in range(6):
            key = f"pos_{pos}"
            items = self.glasses[key]

            filtered = [
                item for item in items
                if (item["nm"] != "" and int(item["vol"]) > 0)
            ]

            if not filtered:
                result.append(None)
            else:
                ingredients = [item["nm"] for item in filtered]
                volumes = [int(item["vol"]) for item in filtered]
                g = Glass(name="", ingredients=ingredients, volumes=volumes)
                result.append(g)

        return result