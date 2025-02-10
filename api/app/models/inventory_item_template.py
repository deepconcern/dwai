from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .tables import (
    INVENTORY_ITEM_TEMPLATES_TABLE,
    inventory_item_tags_inventory_item_templates,
)

if TYPE_CHECKING:
    from .inventory_item_tag import InventoryItemTag


class InventoryItemTemplate(Base):
    __tablename__ = INVENTORY_ITEM_TEMPLATES_TABLE

    armor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cost: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    extra_armor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    extra_damage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(Text)
    starting_ammo: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    type: Mapped[str] = mapped_column(Text)
    weight: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    inventory_item_tags: Mapped[List["InventoryItemTag"]] = relationship(
        back_populates="inventory_item_templates",
        secondary=inventory_item_tags_inventory_item_templates,
    )
