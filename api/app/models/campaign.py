from __future__ import annotations

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List

from .base import Base
from .tables import CAMPAIGNS_TABLE

if TYPE_CHECKING:
    from .character import Character

class Campaign(Base):
    __tablename__ = CAMPAIGNS_TABLE

    name: Mapped[str] = mapped_column(Text)

    characters: Mapped[List[Character]] = relationship(back_populates="campaign")