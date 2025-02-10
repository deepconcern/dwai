from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import BOND_SCORES_TABLE, CHARACTERS_TABLE

if TYPE_CHECKING:
    from .character import Character


class BondScore(Base):
    __tablename__ = BOND_SCORES_TABLE

    character_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    target_id: Mapped[str] = mapped_column(ForeignKey(f"{CHARACTERS_TABLE}.id"))
    score: Mapped[int] = mapped_column(Integer)

    character: Mapped["Character"] = relationship(back_populates="bond_scores", foreign_keys=[character_id])
    target: Mapped["Character"] = relationship(foreign_keys=[target_id])
