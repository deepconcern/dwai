from __future__ import annotations

from sqlalchemy import select
from strawberry import ID, field, type
from strawberry.types import Info
from typing import Dict, List

from ..context import Context
from ..models import InventoryItem as InventoryItemModel


@type
class InventoryItem:
    id: ID
    name: str

    @staticmethod
    def from_model(model: InventoryItemModel) -> InventoryItem:
        return InventoryItem(
            id=ID(model.id),
            name=model.name,
        )


@type
class InventoryItemQuery:
    @field
    def all(self, info: Info[Context, InventoryItemQuery]) -> List[InventoryItem]:
        stmt = select(InventoryItemModel)

        inventory_items: List[InventoryItem] = []
        priming_data: Dict[str, InventoryItemModel] = {}

        for model in info.context.session.scalars(stmt):
            inventory_items.append(InventoryItem.from_model(model))
            priming_data[model.id] = model

        info.context.inventory_item_loader.prime_many(priming_data)

        return inventory_items
    
    @field
    async def by_id(self, info: Info[Context, InventoryItemQuery], id: ID) -> InventoryItem:
        model = await info.context.inventory_item_loader.load(str(id))

        return InventoryItem.from_model(model)
