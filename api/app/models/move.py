from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List, Optional

from .base import Base
from .tables import CHARACTER_CLASSES_TABLE, MOVES_TABLE, levels_picked_moves

if TYPE_CHECKING:
    from .damage_addition import DamageAddition
    from .dice_override import DiceOverride
    from .forward import Forward
    from .level import Level
    from .move_option import MoveOption
    from .ongoing import Ongoing


class Move(Base):
    __tablename__ = MOVES_TABLE

    character_class_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")
    )
    is_pickable: Mapped[bool] = mapped_column(Boolean, default=False)
    name: Mapped[str] = mapped_column(Text)
    roll: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    text: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(Text)

    damage_additions: Mapped[List["DamageAddition"]] = relationship(
        back_populates="move"
    )
    dice_overrides: Mapped[List["DiceOverride"]] = relationship(back_populates="move")
    forwards: Mapped[List["Forward"]] = relationship(back_populates="move")
    levels: Mapped[List["Level"]] = relationship(
        back_populates="picked_moves", secondary=levels_picked_moves
    )
    move_options: Mapped[List["MoveOption"]] = relationship(back_populates="move")
    ongoings: Mapped[List["Ongoing"]] = relationship(back_populates="move")
