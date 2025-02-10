from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List, Optional

from .attribute import get_modifier
from .base import Base
from .tables import CAMPAIGNS_TABLE, CHARACTER_CLASSES_TABLE, CHARACTERS_TABLE
from .bond import Bond
from .bond_score import BondScore

if TYPE_CHECKING:
    from .alignment import Alignment
    from .attribute import Attribute
    from .campaign import Campaign
    from .character_class import CharacterClass
    from .inventory_item import InventoryItem
    from .level import Level
    from .look import Look
    from .move import Move
    from .ongoing import Ongoing


class Character(Base):
    __tablename__ = CHARACTERS_TABLE

    campaign_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey(f"{CAMPAIGNS_TABLE}.id"), nullable=True
    )
    character_class_id: Mapped[str] = mapped_column(
        ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")
    )
    coin: Mapped[int] = mapped_column(Integer, default=0)
    current_hp: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(Text)
    xp: Mapped[int] = mapped_column(Integer)

    alignments: Mapped[List[Alignment]] = relationship(back_populates="character")
    attributes: Mapped[List["Attribute"]] = relationship(
        "Attribute", back_populates="character"
    )
    bonds: Mapped[List[Bond]] = relationship(
        back_populates="character", foreign_keys=[Bond.character_id]
    )
    bond_scores: Mapped[List[BondScore]] = relationship(
        back_populates="character", foreign_keys=[BondScore.character_id]
    )
    campaign: Mapped[Optional["Campaign"]] = relationship(back_populates="characters")
    character_class: Mapped["CharacterClass"] = relationship()
    inventory_items: Mapped[List["InventoryItem"]] = relationship(
        back_populates="character"
    )
    levels: Mapped[List["Level"]] = relationship(back_populates="character")
    looks: Mapped[List["Look"]] = relationship(back_populates="character")

    def armor(self) -> int:
        def is_valid_armor(i: InventoryItem) -> bool:
            if i.is_worn == False:
                return False

            if i.is_disabled:
                return False

            return True

        armor = 0

        is_wearing_armor = False

        for item in self.inventory_items:
            if item.armor is None:
                continue

            if not is_valid_armor(item):
                continue

            armor = max(armor, item.armor)

            is_wearing_armor = True

        for i in self.inventory_items:
            if i.extra_armor is None:
                continue

            if not is_valid_armor(i):
                continue

            is_wearing_armor = True

            armor += i.extra_armor

        # Unencumbered, Unharmed
        uu = self.class_move("barbarian_starting_unencumbered_unharmed")

        if uu is not None and not is_wearing_armor:
            armor += 1

        return armor

    def class_move(self, move_id: str) -> Optional["Move"]:
        return next(filter(lambda m: m.id == move_id, self.class_moves()))

    def class_moves(self) -> List["Move"]:
        moves = []

        moves.extend(filter(lambda m: not m.is_pickable, self.character_class.starting_moves))

        for level in self.levels:
            moves.extend(filter(lambda m: m.type != "race", level.picked_moves))

        return moves

    def max_hp(self) -> int:
        constitution = next(filter(lambda a: a.type == "CONSTITUTION", self.attributes))

        return constitution.value + self.character_class.hp_base

    def max_weight(self) -> int:
        strength = next(filter(lambda a: a.type == "STRENGTH", self.attributes))

        return self.character_class.weight_base + get_modifier(strength.value)

    def ongoings(self) -> List["Ongoing"]:
        ongoings = []

        clumsy_item = next(
            filter(lambda i: i.is_worn and i.has_tag("clumsy"), self.inventory_items),
            None,
        )

        if clumsy_item is not None:
            # Full Plate and Packing Steel
            fpaps = self.class_move("barbarian_starting_full_plate_and_packing_steel")

            if fpaps is None:
                ongoings.append(Ongoing(name="Clumsy", value=-1))

        return ongoings
    
    def race_move(self) -> "Move":
        return next(filter(lambda m: m.type == "race", self.levels[0].picked_moves))


__all__ = ["Character", "get_modifier"]
