from typing import Optional
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .character_class import CharacterClass
from .tables import BONDS_TABLE, CHARACTER_CLASS_TABLE


class Bond(Base):
    __tablename__ = BONDS_TABLE

    character_class: Mapped[Optional[CharacterClass]] = relationship(
        back_populates="bonds"
    )
    character_class_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey(f"{CHARACTER_CLASS_TABLE}.id")
    )
    description: Mapped[str] = mapped_column(Text)
