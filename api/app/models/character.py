from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .character_class import CharacterClass


class Character(Base):
    __tablename__ = "characters"

    character_class: Mapped[CharacterClass] = relationship()
    character_class_id: Mapped[str] = mapped_column(
        ForeignKey(f"{CharacterClass.__tablename__}.id")
    )
    name: Mapped[str] = mapped_column(Text)
