from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List, Optional

from .base import Base
from .tables import (
    CHARACTERS_TABLE,
    LEVELS_TABLE,
    levels_picked_move_options,
    levels_picked_moves,
)

if TYPE_CHECKING:
    from .character import Character
    from .move import Move
    from .move_option import MoveOption


class Level(Base):
    __tablename__ = LEVELS_TABLE

    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    upgraded_stat: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    character: Mapped["Character"] = relationship(back_populates="levels")
    picked_move_options: Mapped[List["MoveOption"]] = relationship(
        back_populates="levels", secondary=levels_picked_move_options
    )
    picked_moves: Mapped[List["Move"]] = relationship(
        back_populates="levels", secondary=levels_picked_moves
    )
