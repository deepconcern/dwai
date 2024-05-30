from pydantic import BaseModel
from typing import List

class InventoryItem(BaseModel):
    key: str
    tags: List[str]
    type: str
    weight: int

class Equipment(InventoryItem):
    armor: int
    location: str

class UsableItem(InventoryItem):
    uses: int

class Weapon(InventoryItem):
    base: str