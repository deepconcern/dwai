from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base
from .tables import LOOK_TARGETS_TABLE, LOOK_TEMPLATES_TABLE

if TYPE_CHECKING:
    from .look_target import LookTarget

class LookTemplate(Base):
    __tablename__ = LOOK_TEMPLATES_TABLE

    look_target_id: Mapped[str] = mapped_column(ForeignKey(f"{LOOK_TARGETS_TABLE}.id"))
    text: Mapped[str] = mapped_column(Text)

    look_target: Mapped["LookTarget"] = relationship(back_populates="look_templates")