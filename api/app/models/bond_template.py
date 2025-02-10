from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .character_class import CharacterClass
from .tables import BOND_TEMPLATES_TABLE, CHARACTER_CLASSES_TABLE


class BondTemplate(Base):
    __tablename__ = BOND_TEMPLATES_TABLE

    character_class_id: Mapped[str] = mapped_column(
        ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")
    )
    character_class: Mapped[CharacterClass] = relationship(back_populates="bond_templates")
    text: Mapped[str] = mapped_column(Text)
