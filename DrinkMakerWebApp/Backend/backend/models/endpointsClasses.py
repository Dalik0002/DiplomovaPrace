from pydantic import BaseModel
from typing import List

class Order(BaseModel):
    ingredients: List[str]
    volumes: List[int]
