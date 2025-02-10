from typing import TYPE_CHECKING, List
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .tables import CHARACTER_CLASSES_TABLE, EQUIPMENT_CHOICE_CATEGORIES_TABLE

if TYPE_CHECKING:
    from .character_class import CharacterClass
    from .equipment_choice_option import EquipmentChoiceOption


class EquipmentChoiceCategory(Base):
    __tablename__ = EQUIPMENT_CHOICE_CATEGORIES_TABLE

    character_class_id: Mapped[str] = mapped_column(
        ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")
    )
    choose: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(Text)

    character_class: Mapped["CharacterClass"] = relationship(
        back_populates="equipment_choice_categories"
    )
    equipment_choice_options: Mapped[List["EquipmentChoiceOption"]] = relationship(
        back_populates="equipment_choice_category"
    )
