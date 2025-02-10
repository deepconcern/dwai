from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import ALIGNMENTS_TABLE, CHARACTERS_TABLE

if TYPE_CHECKING:
    from .character import Character


class Alignment(Base):
    __tablename__ = ALIGNMENTS_TABLE

    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    name: Mapped[str] = mapped_column(Text)
    text: Mapped[str] = mapped_column(Text)

    character: Mapped[Character] = relationship(back_populates="alignments")
