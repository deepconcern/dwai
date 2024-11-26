from strawberry import field, type

from .character import CharacterQuery
from .character_class import CharacterClassQuery
from .inventory_item import InventoryItemQuery


@type
class Query:
    character: CharacterQuery = field(resolver=lambda: CharacterQuery())
    character_class: CharacterClassQuery = field(resolver=lambda: CharacterClassQuery())
    inventory_item: InventoryItemQuery = field(resolver=lambda: InventoryItemQuery())


__all__ = ["Query"]
