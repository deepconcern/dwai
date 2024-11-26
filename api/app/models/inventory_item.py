from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    name: Mapped[str] = mapped_column(Text)
