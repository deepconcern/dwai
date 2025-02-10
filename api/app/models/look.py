from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import CHARACTERS_TABLE, LOOK_TARGETS_TABLE, LOOKS_TABLE

if TYPE_CHECKING:
    from .character import Character
    from .look_target import LookTarget

class Look(Base):
    __tablename__ = LOOKS_TABLE

    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    look_target_id: Mapped[str] = mapped_column(ForeignKey(f"{LOOK_TARGETS_TABLE}.id"))
    text: Mapped[str] = mapped_column(Text)

    character: Mapped["Character"] = relationship(back_populates="looks")
    look_target: Mapped["LookTarget"] = relationship()