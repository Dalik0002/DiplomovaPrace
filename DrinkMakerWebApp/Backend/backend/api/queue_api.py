from fastapi import APIRouter
from typing import List

from models.endpointsClasses import Order

import services.queue_service as queue_service
from services.bottle_state import BottleState

router_queue = APIRouter()

#Queue
@router_queue.get("/queue/queueList", tags=["Queue"])
def getQueueList():
    print(f"Požadavek na frontu drinků")
    return queue_service.get_queue()

@router_queue.post("/queue/addToQueue", tags=["Queue"])
def addToQueue(order: Order):
    queue_service.add_order(order)
    print(f"Přidání objednávky do fronty: {order}")
    return {"status": "ok", "message": "Přidáno do fronty"}

@router_queue.post("/queue/deleteFullQueue", tags=["Queue"])
def deleteFullQueue():
    queue_service.clear_queue()
    print(f"Vymazání fronty drinků")
    return {"status": "ok", "message": "Fronta vymazána"}

@router_queue.get("/queue/numberOfDrinks", tags=["Queue"])
def numberOfDrinks():
    number = queue_service.get_number_of_drinks()
    print(f"Počet drinků ve frontě: {number}")
    return {"status": "ok", "count": number}
