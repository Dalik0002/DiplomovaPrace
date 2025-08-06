from pydantic import BaseModel
from typing import List

class Order(BaseModel):
    name: str
    ingredients: List[str]
    volumes: List[int]

class BottleAssignment(BaseModel):
    position: int
    bottle: str