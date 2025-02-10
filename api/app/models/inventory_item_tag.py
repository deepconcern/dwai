from typing import TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, relationship

from .base import Base
from .tables import (
    INVENTORY_ITEM_TAGS_TABLE,
    inventory_item_tags_inventory_item_templates,
    inventory_item_tags_inventory_items,
)

if TYPE_CHECKING:
    from .inventory_item import InventoryItem
    from .inventory_item_template import InventoryItemTemplate


class InventoryItemTag(Base):
    __tablename__ = INVENTORY_ITEM_TAGS_TABLE

    inventory_item_templates: Mapped[List["InventoryItemTemplate"]] = relationship(
        back_populates="inventory_item_tags",
        secondary=inventory_item_tags_inventory_item_templates,
    )
    inventory_items: Mapped[List["InventoryItem"]] = relationship(
        back_populates="inventory_item_tags",
        secondary=inventory_item_tags_inventory_items,
    )
