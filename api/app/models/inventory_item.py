from sqlalchemy import Boolean, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List, Optional

from .base import Base
from .tables import (
    CHARACTERS_TABLE,
    INVENTORY_ITEMS_TABLE,
    inventory_item_tags_inventory_items,
)

if TYPE_CHECKING:
    from .character import Character
    from .inventory_item_tag import InventoryItemTag


class InventoryItem(Base):
    __tablename__ = INVENTORY_ITEMS_TABLE

    ammo: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    armor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    cost: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    extra_armor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    extra_damage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_disabled: Mapped[bool] = mapped_column(Boolean, default=False)
    is_worn: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(Text)
    weight: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    character: Mapped["Character"] = relationship(back_populates="inventory_items")
    inventory_item_tags: Mapped[List["InventoryItemTag"]] = relationship(secondary=inventory_item_tags_inventory_items)
