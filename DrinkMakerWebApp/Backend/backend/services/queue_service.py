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

def get_number_of_drinks() -> int:
    return len(order_queue)

def delete_item_from_queue(index: int):
    if 0 <= index < len(order_queue):
        del order_queue[index]
    else:
        raise IndexError("Index out of range for queue")
