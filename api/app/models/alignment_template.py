from __future__ import annotations

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import ALIGNMENT_TEMPLATES_TABLE, CHARACTER_CLASSES_TABLE

if TYPE_CHECKING:
    from .character_class import CharacterClass


class AlignmentTemplate(Base):
    __tablename__ = ALIGNMENT_TEMPLATES_TABLE

    character_class_id: Mapped[str] = mapped_column(
        ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")
    )
    name: Mapped[str] = mapped_column(Text)
    text: Mapped[str] = mapped_column(Text)

    character_class: Mapped[CharacterClass] = relationship(
        back_populates="alignment_templates"
    )
