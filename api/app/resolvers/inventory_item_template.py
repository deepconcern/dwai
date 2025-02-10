from strawberry import ID, type
from typing import Optional

from ..models import InventoryItemTemplate as InventoryItemTemplateModel


@type
class InventoryItemTemplate:
    armor: Optional[int]
    extra_armor: Optional[int]
    id: ID
    name: str
    weight: Optional[int]

    @staticmethod
    def from_model(model: InventoryItemTemplateModel) -> "InventoryItemTemplate":
        return InventoryItemTemplate(armor=model.armor, extra_armor=model.extra_armor, id=ID(model.id), name=model.name, weight=model.weight)
