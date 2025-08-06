from fastapi import APIRouter
from typing import List

from models.endpointsClasses import Order
from models.endpointsClasses import BottleAssignment
import services.queue_service as queue_service
from services.bottle_state import BottleState

bottle_state = BottleState()

router = APIRouter()

@router.post("/startPouring", tags=["Pouring"])
def startPouring():
    print(f"Požadavek na zahájení nalévání")
    return {"status": "ok", "message": "Nalévání drinků zahájeno"}


#Queue
@router.get("/queue/queueList", tags=["Queue"])
def getQueueList():
    print(f"Požadavek na frontu drinků")
    return queue_service.get_queue()

@router.post("/queue/addToQueue", tags=["Queue"])
def addToQueue(order: Order):
    queue_service.add_order(order)
    print(f"Přidání objednávky do fronty: {order}")
    return {"status": "ok", "message": "Přidáno do fronty"}

@router.post("/queue/deleteFullQueue", tags=["Queue"])
def deleteFullQueue():
    queue_service.clear_queue()
    print(f"Vymazání fronty drinků")
    return {"status": "ok", "message": "Fronta vymazána"}

#bottles
stored_bottles = [""] * 6

@router.post("/bottles/assigBottles", tags=["Bottles"])
def assign_bottles(bottles: List[BottleAssignment]):
    bottle_state.set_bottles(bottles)
    return {"status": "ok", "message": "Bottles assigned"}

@router.get("/bottles/getBottles", response_model=List[BottleAssignment], tags=["Bottles"])
def get_bottles():
    return bottle_state.get_bottle_assignments()