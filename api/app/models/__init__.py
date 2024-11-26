from __future__ import annotations
from typing import Optional

from flask import Flask

from .base import Base, DoesNotExistError, build_data_loader
from .bond import Bond
from .character import Character
from .character_class import CharacterClass
from .inventory_item import InventoryItem
from .move import Move


def init_db() -> None:
    from sqlalchemy.orm import Session
    from typing import Dict, List, TypedDict
    from uuid import uuid4
    from yaml import Loader, load

    from ..connectors import engine

    class CharacterClassData(TypedDict):
        alignment_moves: Dict[str, MoveData]
        bonds: List[str]
        damage_die: int
        hp_base: int
        load_base: int
        name: str
        race_moves: Dict[str, MoveData]
        starting_moves: Dict[str, MoveData]

    class InventoryItemData(TypedDict):
        armor: Optional[int]
        cost: Optional[int]
        location: Optional[str]
        name: str
        tags: List[str]
        weight: int

    class MoveData(TypedDict):
        name: str
        text: str

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        move_map: Dict[str, Move] = {}

        with open("character_classes.yml", "r") as f:
            character_classes_data: Dict[str, CharacterClassData] = load(
                f, Loader=Loader
            )

            character_classes: List[CharacterClass] = []

            for (
                character_class_id,
                character_class_data,
            ) in character_classes_data.items():
                alignment_moves: List[Move] = []

                for alignment_type, alignment_move_data in character_class_data[
                    "alignment_moves"
                ].items():
                    alignment_move_id = (
                        f"{character_class_id}_alignment_{alignment_type}"
                    )

                    move_map[alignment_move_id] = Move(
                        description=alignment_move_data["text"],
                        id=alignment_move_id,
                        name=alignment_move_data["name"],
                    )

                    alignment_moves.append(move_map[alignment_move_id])

                character_classes.append(
                    CharacterClass(
                        alignment_moves=alignment_moves,
                        bonds=[
                            Bond(description=bond_data, id=str(uuid4()))
                            for bond_data in character_class_data["bonds"]
                        ],
                        damage_die=character_class_data["damage_die"],
                        hp_base=character_class_data["hp_base"],
                        id=character_class_id,
                        name=character_class_data["name"],
                    )
                )
            session.add_all(character_classes)

        with open("inventory_items.yml", "r") as f:
            inventory_items_data: Dict[str, InventoryItemData] = load(f, Loader=Loader)

            inventory_items: List[InventoryItem] = []

            for inventory_item_id, inventory_item_data in inventory_items_data.items():
                inventory_items.append(
                    InventoryItem(
                        id=inventory_item_id, name=inventory_item_data["name"]
                    )
                )

            session.add_all(inventory_items)

        session.commit()


def setup_models(app: Flask) -> None:
    app.cli.command("init_db")(init_db)


__all__ = [
    "Base",
    "Character",
    "CharacterClass",
    "DoesNotExistError",
    "Move",
    "build_data_loader",
    "setup_models",
]
