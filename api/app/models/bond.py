from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, Optional

from .base import Base
from .tables import BONDS_TABLE, CHARACTERS_TABLE

if TYPE_CHECKING:
    from .character import Character


class Bond(Base):
    __tablename__ = BONDS_TABLE

    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    is_complete: Mapped[bool] = mapped_column(Boolean)
    target_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    character: Mapped["Character"] = relationship(back_populates="bonds", foreign_keys=[character_id])
    target: Mapped["Character"] = relationship(foreign_keys=[target_id])
