from models.endpointsClasses import Order
from typing import List

order_queue: List[Order] = []

def add_order(order: Order):
    order_queue.append(order)

def has_pending_order():
    return not order_queue.empty()

def get_queue() -> List[Order]:
    return order_queue

def get_next_order():
    if not order_queue.empty():
        return order_queue.get()
    return None

def clear_queue():
    order_queue.clear()
