from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List, Optional

from .base import Base
from .tables import MOVE_OPTIONS_TABLE, MOVES_TABLE, levels_picked_move_options

if TYPE_CHECKING:
    from .level import Level
    from .move import Move


class MoveOption(Base):
    __tablename__ = MOVE_OPTIONS_TABLE

    move_id: Mapped[str] = mapped_column(ForeignKey(f"{MOVES_TABLE}.id"))
    value: Mapped[str] = mapped_column(Text)

    levels: Mapped[List["Level"]] = relationship(
        back_populates="picked_move_options", secondary=levels_picked_move_options
    )
    move: Mapped["Move"] = relationship()
