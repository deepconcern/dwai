from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, Optional

from .base import Base
from .tables import MOVES_TABLE, ONGOINGS_TABLE

if TYPE_CHECKING:
    from .move import Move


class Ongoing(Base):
    __tablename__ = ONGOINGS_TABLE

    move_id: Mapped[Optional[str]] = mapped_column(ForeignKey(f"{MOVES_TABLE}.id"), nullable=True)
    name: Mapped[str] = mapped_column(Text)
    value: Mapped[int] = mapped_column(Integer)

    move: Mapped["Move"] = relationship(back_populates="ongoings")
