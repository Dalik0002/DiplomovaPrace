from fastapi import APIRouter
from typing import List

from core.all_states import bottles_state

from models.endpoints_schemas import BottleAssignment

router_bottles = APIRouter(tags=["Bottle Management"])

stored_bottles = [""] * 6

@router_bottles.post("/bottles/assigBottles")
def assign_bottles(bottles: List[BottleAssignment]):
    bottles_state.set_bottles(bottles)
    return {"status": "ok", "message": "Bottles assigned"}

@router_bottles.post("/bottles/deleteBottleAtPosition")
def delete_bottle_at_position(position: int):
    bottles_state.delete_bottle_at_position(position)
    return {"status": "ok", "message": f"Bottle at position {position} deleted"}

@router_bottles.get("/bottles/getBottles", response_model=List[BottleAssignment])
def get_bottles():
    return bottles_state.get_bottle_assignments()