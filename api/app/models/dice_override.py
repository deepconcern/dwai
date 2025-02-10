from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import DICE_OVERRIDES_TABLE, MOVES_TABLE

if TYPE_CHECKING:
    from .move import Move


class DiceOverride(Base):
    __tablename__ = DICE_OVERRIDES_TABLE

    move_id: Mapped[str] = mapped_column(ForeignKey(f"{MOVES_TABLE}.id"))
    name: Mapped[str] = mapped_column(Text)
    value: Mapped[int] = mapped_column(Text)

    move: Mapped["Move"] = relationship(back_populates="dice_overrides")
