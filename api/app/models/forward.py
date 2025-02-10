from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import FORWARDS_TABLE, MOVES_TABLE

if TYPE_CHECKING:
    from .move import Move


class Forward(Base):
    __tablename__ = FORWARDS_TABLE

    move_id: Mapped[str] = mapped_column(ForeignKey(f"{MOVES_TABLE}.id"))
    name: Mapped[str] = mapped_column(Text)
    value: Mapped[int] = mapped_column(Integer)

    move: Mapped["Move"] = relationship(back_populates="forwards")
