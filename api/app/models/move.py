from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .tables import MOVES_TABLE


class Move(Base):
    __tablename__ = MOVES_TABLE

    description: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
