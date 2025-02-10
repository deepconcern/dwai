from strawberry import ID, Info, field, input, lazy, type
from typing import TYPE_CHECKING, Annotated, List, Optional

from ..context import Context
from ..models import InventoryItem as InventoryItemModel


@type
class InventoryItem:
    ammo: Optional[int]
    armor: Optional[int]
    cost: Optional[int]
    extra_armor: Optional[int]
    id: ID
    is_disabled: bool
    is_worn: Optional[bool]
    location: Optional[str]
    name: str
    type: str
    weight: Optional[int]

    @field
    async def tags(self, info: Info[Context, "InventoryItem"]) -> List[str]:
        model = await info.context.inventory_items.load(str(self.id))

        return [t.id for t in model.inventory_item_tags]

    @staticmethod
    def from_model(model: InventoryItemModel) -> "InventoryItem":
        return InventoryItem(
            ammo=model.ammo,
            armor=model.armor,
            cost=model.cost,
            extra_armor=model.extra_armor,
            id=ID(model.id),
            is_disabled=model.is_disabled,
            is_worn=model.is_worn,
            location=model.location,
            name=model.name,
            type=model.type,
            weight=model.weight,
        )


@input
class UpdateAmmoInput:
    id: ID
    value: int


@type
class InventoryItemMutation:
    @field
    async def update_ammo(
        self, info: Info[Context, "InventoryItemMutation"], input: UpdateAmmoInput
    ) -> InventoryItem:
        model = await info.context.inventory_items.load(str(input.id))

        if model.ammo is not None:
            model.ammo = max(0, model.ammo + input.value)

            info.context.session.commit()

        return InventoryItem.from_model(model)
