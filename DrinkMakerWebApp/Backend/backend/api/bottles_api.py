# api/bottles_api.py
from fastapi import APIRouter
from typing import List

from core.all_states import bottles_state
import services.glasses_service as glasses_service

from models.endpoints_schemas import BottleAssignment, BottleStatus

router_bottles = APIRouter(tags=["Bottle Management"])

stored_bottles = [""] * 6

@router_bottles.post("/bottles/assigBottles")
def assign_bottles(bottles: List[BottleAssignment]):
    bottles_state.set_bottles(bottles)

    available_bottles = bottles_state.get_available_bottles()
    deleted_positions = glasses_service.remove_invalid_glasses(available_bottles)

    print(f"[BOTTLES] Assigned bottles. Deleted invalid glasses on positions: {deleted_positions}")

    return {
        "status": "ok",
        "message": "Bottles assigned",
        "deleted_glasses_positions": deleted_positions,
        "deleted_glasses_count": len(deleted_positions),
    }


@router_bottles.post("/bottles/deleteBottleAtPosition")
def delete_bottle_at_position(position: int):
    bottles_state.delete_bottle_at_position(position)

    available_bottles = bottles_state.get_available_bottles()
    deleted_positions = glasses_service.remove_invalid_glasses(available_bottles)

    print(f"[BOTTLES] Deleted bottle at position {position}. Deleted invalid glasses on positions: {deleted_positions}")

    return {
        "status": "ok",
        "message": f"Bottle at position {position} deleted",
        "deleted_glasses_positions": deleted_positions,
        "deleted_glasses_count": len(deleted_positions),
    }

@router_bottles.get("/bottles/getBottles", response_model=List[BottleStatus])
def get_bottles():
    return bottles_state.get_bottle_assignments()