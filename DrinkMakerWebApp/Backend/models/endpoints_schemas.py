from pydantic import BaseModel, conint
from typing import List, Optional

# QUEUES
class Order(BaseModel):
    name: str
    ingredients: List[str]
    volumes: List[int]

# GLASSES
class Glass(BaseModel):
    name: str
    ingredients: List[str]
    volumes: List[int]

class GlassAtPosition(BaseModel):
    position: conint(ge=0, le=5)
    glass: Glass

class DeleteGlassPayload(BaseModel):
    position: conint(ge=0, le=5)
    name: Optional[str] = None


# BOTTLES
class BottleAssignment(BaseModel):
    position: int
    bottle: str

class DrinkName(BaseModel):
    name: str
    position: int

class ChoosedDrink(BaseModel):
    name: str
    position: int

# SERVICE
class ValveID(BaseModel):
    valve_id: conint(ge=0, le=5)
    open: bool

# LOCKS
class LockRequest(BaseModel):
    client_id: str
