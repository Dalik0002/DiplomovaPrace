from fastapi import APIRouter
from typing import List

from models.endpointsClasses import Order
from models.endpointsClasses import BottleAssignment

from services.bottle_state import BottleState

bottle_state = BottleState()

router = APIRouter()

@router.post("/startPouring", tags=["Pouring"])
def startPouring():
    print(f"Požadavek na zahájení nalévání")
    return {"status": "ok", "message": "Nalévání drinků zahájeno"}


#bottles
stored_bottles = [""] * 6

@router.post("/bottles/assigBottles", tags=["Bottles"])
def assign_bottles(bottles: List[BottleAssignment]):
    bottle_state.set_bottles(bottles)
    return {"status": "ok", "message": "Bottles assigned"}

@router.get("/bottles/getBottles", response_model=List[BottleAssignment], tags=["Bottles"])
def get_bottles():
    return bottle_state.get_bottle_assignments()