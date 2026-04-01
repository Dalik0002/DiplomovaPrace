# services/glasses_service.py
from typing import List, Optional, Set

from models.endpoints_schemas import Glass
from core.all_states import glasses_state  # pokud používáš pro předání do HW

# Pevné „stojany“ pro 6 sklenic; prázdné sloty = None
glass_glasses: List[Optional[Glass]] = [None] * 6


def _check_pos(position: int) -> int:
    try:
        p = int(position)
    except (TypeError, ValueError):
        raise ValueError("position musí být celé číslo 0..5")
    if not 0 <= p < 6:
        raise ValueError("position mimo rozsah (0..5)")
    return p


def add_glass_to_position(glass: Glass, position: int) -> None:
    """
    Vloží/nahraje sklenici na danou pozici (0..5).
    Pokud tam něco je, přepíše se.
    """
    p = _check_pos(position)
    glass_glasses[p] = glass
    glasses_state.set_to_glasses_state(glass_glasses)


def get_glasses() -> List[Optional[Glass]]:
    """
    Vrátí seznam 6 slotů (Glass nebo None) pro snadný render na frontendu.
    """
    return glass_glasses


def clear_glasses() -> None:
    for i in range(6):
        glass_glasses[i] = None
    glasses_state.set_to_glasses_state(glass_glasses)


def get_number_of_drinks() -> int:
    """Počet skutečně zadaných sklenic (ne-None)."""
    return sum(1 for g in glass_glasses if g is not None)


def delete_glass(position: int) -> bool:
    """
    Smaže sklenici na dané pozici.
    Vrací True, pokud na pozici něco bylo a bylo smazáno.
    """
    p = _check_pos(position)
    if glass_glasses[p] is None:
        return False

    glass_glasses[p] = None
    glasses_state.set_to_glasses_state(glass_glasses)
    return True

def get_free_positions() -> List[int]:
    """Vrať indexy pozic (0..5), které jsou volné (None)."""
    return [i for i, g in enumerate(glass_glasses) if g is None]


def _normalize_bottle_name(name: str) -> str:
    return (name or "").strip()


def _glass_contains_unavailable_ingredient(glass: Glass, available_bottles: Set[str]) -> bool:
    ingredients = getattr(glass, "ingredients", None) or []

    for ing in ingredients:
        ing_norm = _normalize_bottle_name(ing)
        if ing_norm == "":
            continue
        if ing_norm not in available_bottles:
            return True

    return False

def remove_invalid_glasses(available_bottles: List[str]) -> List[int]:
    allowed = {
        _normalize_bottle_name(b)
        for b in available_bottles
        if _normalize_bottle_name(b) != ""
    }

    deleted_positions: List[int] = []

    for i, glass in enumerate(glass_glasses):
        if glass is None:
            continue

        if _glass_contains_unavailable_ingredient(glass, allowed):
            glass_glasses[i] = None
            deleted_positions.append(i)

    glasses_state.set_to_glasses_state(glass_glasses)
    return deleted_positions

def set_from_temp_to_JSON() -> dict:
    """
    Propíše aktuální 6 slotů do GlassesState (JSON pro HW) a vrátí výsledek.
    Použij po každé změně slotů, těsně před odesláním na ESP32.
    """
    glasses_state.set_to_glasses_state(glass_glasses)

    return glasses_state.to_glasses_json()

def set_from_temp_to_JSON_compact() -> dict:
    """
    Compact varianta: vrací pouze pos_X, kde je aspoň jedna ingredience s vol>0 nebo nm != "".
    """
    # 1) Přepiš do GlassesState (máš už hotové)
    glasses_state.set_to_glasses_state(glass_glasses)

    full = glasses_state.to_glasses_json()  # {"glasses": {...}} (plná verze)
    g = full.get("glasses", {})

    compact_glasses = {}
    for pos_key, items in g.items():
        if not isinstance(items, list):
            continue

        # Kontrola, zda je sklenice na této pozici aktivní (má aspoň jeden objem > 0)
        is_active = any(int(it.get("vol", 0)) > 0 for it in items)

        if is_active:
            # Pošleme všech 6 ingrediencí pro tuto sklenici (včetně prázdných)
            # Tím zajistíme, že ESP32 parser, který jede fixní cyklus 6, neselže.
            compact_glasses[pos_key] = items

    return {"glasses": compact_glasses}

