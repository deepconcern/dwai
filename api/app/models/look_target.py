from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List

from .base import Base
from .tables import LOOK_TARGETS_TABLE

if TYPE_CHECKING:
    from .look_template import LookTemplate


class LookTarget(Base):
    __tablename__ = LOOK_TARGETS_TABLE

    name: Mapped[str] = mapped_column(Text)

    look_templates: Mapped[List["LookTemplate"]] = relationship(
        back_populates="look_target"
    )
