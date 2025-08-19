from models.endpointsClasses import Order
from typing import List

order_queue: List[Order] = []

def add_order(order: Order):
    order_queue.append(order)

def has_pending_order():
    return not order_queue.empty()

def get_queue() -> List[Order]:
    return order_queue

def get_queue_of_4_only_name() -> List[Order]:
    return [order.name for order in order_queue[:4]]

def get_next_order():
    if not order_queue.empty():
        return order_queue.get()
    return None   

def clear_queue():
    order_queue.clear()

def get_number_of_drinks() -> int:
    return len(order_queue)

def delete_item_from_queue(name: str):
    global order_queue
    order_queue = [order for order in order_queue if order.name != name]
    if not order_queue:
        print("Fronta je nyní prázdná.")
    else:
        print(f"Zbývající položky ve frontě: {[order.name for order in order_queue]}")
