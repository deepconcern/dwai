from __future__ import annotations

from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List

from ..connectors import engine

from .base import Base
from .move import Move
from .tables import CHARACTER_CLASS_TABLE, alignment_moves_character_classes

if TYPE_CHECKING:
    from .bond import Bond


class CharacterClass(Base):
    __tablename__ = CHARACTER_CLASS_TABLE

    alignment_moves: Mapped[List[Move]] = relationship(
        secondary=alignment_moves_character_classes
    )
    bonds: Mapped[List[Bond]] = relationship(back_populates="character_class")
    damage_die: Mapped[int] = mapped_column(Integer)
    hp_base: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(Text)


__all__ = ["CharacterClass"]
