from typing import TYPE_CHECKING, List
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .tables import EQUIPMENT_CHOICE_CATEGORIES_TABLE, EQUIPMENT_CHOICE_OPTIONS_TABLE

if TYPE_CHECKING:
    from .equipment_choice_category import EquipmentChoiceCategory
    from .inventory_item_template import InventoryItemTemplate

class EquipmentChoiceOption(Base):
    __tablename__ = EQUIPMENT_CHOICE_OPTIONS_TABLE

    equipment_choice_category_id: Mapped[str] = mapped_column(ForeignKey(f"{EQUIPMENT_CHOICE_CATEGORIES_TABLE}.id"))

    equipment_choice_category: Mapped[EquipmentChoiceCategory] = relationship(back_populates="equipment_choice_options")
    inventory_item_templates: Mapped[List[InventoryItemTemplate]] = relationship()

    

