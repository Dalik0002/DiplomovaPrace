from typing import List, Dict, Any
from models.endpoints_schemas import BottleAssignment
from services.storage_service import save_data, load_data

class BottlesState:
    def __init__(self):
        # 1. Při startu aplikace zkusíme načíst uložený stav z Docker Volume
        saved_state = load_data("bottles_state", default_value=None)
        
        if saved_state:
            # Pokud záznam existuje, načteme ho
            self.bottles = saved_state.get("bottles", [""] * 6)
            self.disabled = saved_state.get("disabled", [False] * 6)
            self.empty_bottle = saved_state.get("empty_bottle", [False] * 6)
            print("INFO: Stav lahví úspěšně načten ze zálohy.")
        else:
            # Pokud záznam neexistuje (např. první spuštění), vytvoříme čistý stav
            self.bottles = [""] * 6
            self.disabled = [False] * 6
            self.empty_bottle = [False] * 6

    def _save_state(self):
        current_state = {
            "bottles": self.bottles,
            "disabled": self.disabled,
            "empty_bottle": self.empty_bottle
        }
        save_data("bottles_state", current_state)

    def get_available_bottles(self) -> List[str]:

        return [
            self.bottles[i]
            for i in range(6)
            if (self.bottles[i] or "").strip() != ""
            and not self.disabled[i]
        ]


    def set_bottles(self, assignments: List[BottleAssignment]):
        for item in assignments:
            if 0 <= item.position < 6:
                self.bottles[item.position] = item.bottle
                # Jakmile nastavíš novou lahev, stanoviště se automaticky "opraví"
                if item.bottle != "":
                    self.disabled[item.position] = False
                    self.empty_bottle[item.position] = False
        self._save_state()
    
    def delete_bottle_at_position(self, position: int):
        if 0 <= position < 6:
            self.bottles[position] = ""
            # Pokud lahev smažeš ručně, zrušíme i chybové stavy
            self.disabled[position] = False
            self.empty_bottle[position] = False
        self._save_state()

    def disable_position(self, position: int, is_empty: bool = False):
        """Zakáže stanoviště. Pokud je důvodem prázdná lahev, is_empty=True"""
        if 0 <= position < 6:
            self.disabled[position] = True
            if is_empty:
                self.empty_bottle[position] = True
        self._save_state()

    def enable_position(self, position: int):
        """Manuální povolení z frontendu"""
        if 0 <= position < 6:
            self.disabled[position] = False
            self.empty_bottle[position] = False
        self._save_state()

    def get_bottles(self) -> List[str]:
        return self.bottles

    def get_bottle_assignments(self) -> List[Dict[str, Any]]:
        # Můžeš vracet rozšířené info, kdyby to frontend potřeboval
        return [
            {
                "position": i, 
                "bottle": b,
                "disabled": self.disabled[i],
                "empty_bottle": self.empty_bottle[i]
            }
            for i, b in enumerate(self.bottles)
        ]
    
    def to_position_json(self) -> dict:
        return {
            "bottOnPos": [
                {f"pos_{i}": b for i, b in enumerate(self.bottles)}
            ]
        }