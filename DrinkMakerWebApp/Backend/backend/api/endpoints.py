from fastapi import APIRouter
from models.endpointsClasses import Order

import services.queue_service as queue_service

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

@router.post("/queue/deleteQueue", tags=["Queue"])
def deleteQueue(order: Order):
    queue_service.clear_queue()
    print(f"Vymazání fronty drinků")
    return {"status": "ok", "message": "Fronta vymazána"}


