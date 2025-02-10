from __future__ import annotations

from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List

from .base import Base
from .move import Move
from .tables import (
    CHARACTER_CLASSES_TABLE,
    advanced_one_moves_character_classes,
    advanced_two_moves_character_classes,
    race_moves_character_classes,
    starting_moves_character_classes,
)

if TYPE_CHECKING:
    from .alignment_template import AlignmentTemplate
    from .bond_template import BondTemplate
    from .equipment_choice_category import EquipmentChoiceCategory


class CharacterClass(Base):
    __tablename__ = CHARACTER_CLASSES_TABLE

    damage_die: Mapped[int] = mapped_column(Integer)
    hp_base: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(Text)
    starting_move_choose: Mapped[int] = mapped_column(Integer)
    weight_base: Mapped[int] = mapped_column(Integer)

    advanced_one_moves: Mapped[List[Move]] = relationship(
        secondary=advanced_one_moves_character_classes
    )
    advanced_two_moves: Mapped[List[Move]] = relationship(
        secondary=advanced_two_moves_character_classes
    )
    alignment_templates: Mapped[List[AlignmentTemplate]] = relationship(
        back_populates="character_class"
    )
    bond_templates: Mapped[List[BondTemplate]] = relationship(
        back_populates="character_class"
    )
    equipment_choice_categories: Mapped[List["EquipmentChoiceCategory"]] = relationship(
        back_populates="character_class"
    )
    race_moves: Mapped[List[Move]] = relationship(
        secondary=race_moves_character_classes
    )
    starting_moves: Mapped[List[Move]] = relationship(
        secondary=starting_moves_character_classes
    )


__all__ = ["CharacterClass"]
