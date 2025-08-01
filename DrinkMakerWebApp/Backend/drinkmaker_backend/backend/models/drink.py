from pydantic import BaseModel
from typing import List

class Drink(BaseModel):
    glass_id: int
    ingredients: List[str]