from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import ATTRIBUTES_TABLE, CHARACTERS_TABLE

if TYPE_CHECKING:
    from .character import Character


def get_modifier(score: int) -> int:
    if score >= 16:
        return 2
    if score >= 13:
        return 1
    if score >= 9:
        return 0
    return -1


class Attribute(Base):
    __tablename__ = ATTRIBUTES_TABLE

    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    character: Mapped["Character"] = relationship(
        "Character", back_populates="attributes"
    )
    type: Mapped[str] = mapped_column(Text)
    value: Mapped[int] = mapped_column(Integer)
