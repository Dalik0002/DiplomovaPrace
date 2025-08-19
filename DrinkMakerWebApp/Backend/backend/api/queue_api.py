from fastapi import APIRouter
from typing import List
from fastapi import HTTPException

from models.endpointsClasses import Order
from models.endpointsClasses import DrinkName

import services.queue_service as queue_service
from services.bottle_state import BottleState

router_queue = APIRouter()

#Queue
@router_queue.get("/queue/queueList", tags=["Queue"])
def getQueueList():
    print(f"Požadavek na frontu drinků")
    return queue_service.get_queue()

@router_queue.get("/queue/queueList4", tags=["Queue"])
def getQueueListof4():
    print(f"Požadavek na frontu drinků s maximálně 6 položkami")
    return queue_service.get_queue_of_4_only_name()

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

@router_queue.post("/queue/deleteItemFromQueue", tags=["Queue"])
def deleteItemFromQueue(payload: DrinkName):
      queue_service.delete_item_from_queue(payload.name)
      return {"status": "ok", "message": "Položka vymazána z fronty"}