from __future__ import annotations
from typing import NotRequired, Union

from click import option
from flask import Flask

from .alignment import Alignment
from .alignment_template import AlignmentTemplate
from .attribute import Attribute, get_modifier
from .base import Base, DoesNotExistError, build_data_loader
from .bond import Bond
from .bond_score import BondScore
from .bond_template import BondTemplate
from .campaign import Campaign
from .character import Character
from .character_class import CharacterClass
from .damage_addition import DamageAddition
from .dice_override import DiceOverride
from .forward import Forward
from .inventory_item import InventoryItem
from .inventory_item_tag import InventoryItemTag
from .inventory_item_template import InventoryItemTemplate
from .level import Level
from .look import Look
from .look_target import LookTarget
from .look_template import LookTemplate
from .move import Move
from .move_option import MoveOption
from .ongoing import Ongoing


def init_db(debug) -> None:
    from sqlalchemy.orm import Session
    from typing import Dict, List, TypedDict
    from uuid import uuid4
    from yaml import Loader, load

    from ..connectors import engine

    class CharacterClassData(TypedDict):
        alignment_templates: Dict[str, str]
        bonds: List[str]
        damage_die: int
        hp_base: int
        load_base: int
        name: str
        race_moves: Dict[str, MoveData]
        starting_move_choose: NotRequired[int]
        starting_moves: Dict[str, MoveData]
        weight_base: int

    class InventoryItemTemplateData(TypedDict):
        armor: NotRequired[int]
        cost: NotRequired[int]
        location: NotRequired[str]
        name: str
        starting_ammo: NotRequired[int]
        tags: NotRequired[List[str]]
        type: str
        weight: NotRequired[int]

    class DamageAdditionData(TypedDict):
        name: str
        value: Union[int, str]

    class ForwardData(TypedDict):
        name: str
        value: int

    class LookTargetData(TypedDict):
        look_templates: List[str]
        name: str

    class MoveData(TypedDict):
        choice: NotRequired[MoveOptionData]
        damage_additions: NotRequired[List[DamageAdditionData]]
        forwards: NotRequired[List[ForwardData]]
        name: str
        roll: NotRequired[str]
        text: str

    class MoveOptionData(TypedDict):
        choose: int
        options: List[str]

    class OngoingData(TypedDict):
        name: str
        value: str

    class RollModificationsData(TypedDict):
        ongoing: List[OngoingData]

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

                def add_moves(type: str) -> List[Move]:
                    moves: List[Move] = []

                    for move_subtype, move_data in character_class_data[
                        f"{type}_moves"
                    ].items():
                        move_id = f"{character_class_id}_{type}_{move_subtype}"

                        move_map[move_id] = Move(
                            character_class_id=character_class_id,
                            dice_overrides=[
                                DiceOverride(
                                    name=dice_override_data["name"],
                                    value=dice_override_data["value"],
                                )
                                for dice_override_data in move_data.get(
                                    "dice_overrides", []
                                )
                            ],
                            forwards=[
                                Forward(
                                    name=forward_data["name"],
                                    value=forward_data["value"],
                                )
                                for forward_data in move_data.get("forwards", [])
                            ],
                            id=move_id,
                            is_pickable=move_data.get(
                                "is_pickable", type != "starting"
                            ),
                            move_options=[
                                MoveOption(value=option_data)
                                for option_data in move_data.get(
                                    "choice", {"options": []}
                                )["options"]
                            ],
                            name=move_data["name"],
                            roll=move_data.get("roll", None),
                            text=move_data["text"].strip(),
                            type=type,
                        )

                        moves.append(move_map[move_id])

                    return moves

                character_classes.append(
                    CharacterClass(
                        advanced_one_moves=add_moves("advanced_one"),
                        advanced_two_moves=add_moves("advanced_two"),
                        alignment_templates=[
                            AlignmentTemplate(name=id.capitalize(), text=text)
                            for id, text in character_class_data[
                                "alignment_templates"
                            ].items()
                        ],
                        bond_templates=[
                            BondTemplate(text=bond_data.replace("X", "[TARGET]"))
                            for bond_data in character_class_data["bonds"]
                        ],
                        damage_die=character_class_data["damage_die"],
                        hp_base=character_class_data["hp_base"],
                        id=character_class_id,
                        name=character_class_data["name"],
                        race_moves=add_moves("race"),
                        starting_move_choose=character_class_data.get("starting_move_choose", 0),
                        starting_moves=add_moves("starting"),
                        weight_base=character_class_data["weight_base"],
                    )
                )
            session.add_all(character_classes)

        with open("inventory_item_templates.yml", "r") as f:
            inventory_item_templates_data: Dict[str, InventoryItemTemplateData] = load(
                f, Loader=Loader
            )

            inventory_item_tag_map: Dict[str, InventoryItemTag] = {}
            inventory_item_template_map: Dict[str, InventoryItemTemplate] = {}

            for (
                inventory_item_template_id,
                inventory_item_template_data,
            ) in inventory_item_templates_data.items():
                inventory_item_tags: List[InventoryItemTag] = []

                for tag in inventory_item_template_data.get("tags", []):
                    inventory_item_tags.append(
                        inventory_item_tag_map.setdefault(tag, InventoryItemTag(id=tag))
                    )

                inventory_item_template_map[inventory_item_template_id] = (
                    InventoryItemTemplate(
                        armor=inventory_item_template_data.get("armor", None),
                        cost=inventory_item_template_data.get("cost", None),
                        extra_armor=inventory_item_template_data.get(
                            "extra_armor", None
                        ),
                        id=inventory_item_template_id,
                        inventory_item_tags=inventory_item_tags,
                        location=inventory_item_template_data.get("location", None),
                        name=inventory_item_template_data["name"],
                        starting_ammo=inventory_item_template_data.get(
                            "starting_ammo", None
                        ),
                        type=inventory_item_template_data["type"],
                        weight=inventory_item_template_data.get("weight", None),
                    )
                )

            session.add_all(inventory_item_template_map.values())

        with open("look_targets.yml", "r") as f:
            look_targets_data: Dict[str, LookTargetData] = load(f, Loader=Loader)

            look_tagets: List[LookTarget] = []

            for type, look_target_data in look_targets_data.items():
                look_tagets.append(
                    LookTarget(
                        id=type,
                        look_templates=[
                            LookTemplate(text=look_template_data)
                            for look_template_data in look_target_data["look_templates"]
                        ],
                        name=look_target_data["name"],
                    )
                )

            session.add_all(look_tagets)

        with open("moves.yml", "r") as f:
            moves_data: Dict[str, Dict[str, MoveData]] = load(f, Loader=Loader)

            for type, moves_data_items in moves_data.items():
                for sub_type, move_data in moves_data_items.items():
                    move_id = f"{type}_{sub_type}"

                    move_map[move_id] = Move(
                        character_class_id=None,
                        damage_additions=[
                            DamageAddition(
                                name=damage_addition_data["name"],
                                value=str(damage_addition_data["value"]),
                            )
                            for damage_addition_data in move_data.get(
                                "damage_additions", []
                            )
                        ],
                        forwards=[
                            Forward(
                                name=forward_data["name"],
                                value=forward_data["value"],
                            )
                            for forward_data in move_data.get("forwards", [])
                        ],
                        id=move_id,
                        name=move_data["name"],
                        roll=move_data.get("roll", None),
                        text=move_data["text"].strip(),
                        type=type,
                    )

            session.add_all(move_map.values())

        with open("roll_modifications.yml") as f:
            roll_modification_data: RollModificationsData = load(f, Loader=Loader)

            ongoings = []

            for ongoing_data in roll_modification_data["ongoing"]:
                ongoings.append(
                    Ongoing(name=ongoing_data["name"], value=ongoing_data["value"])
                )

            session.add_all(ongoings)

        # DEBUG: Adding character
        if debug:

            target = Character(
                alignments=[
                    Alignment(name="Chaotic", text="Leap into danger without a plan.")
                ],
                attributes=[
                    Attribute(id=str(uuid4()), type=t, value=v)
                    for t, v in [
                        ("STRENGTH", 13),
                        ("DEXTERITY", 16),
                        ("CONSTITUTION", 15),
                        ("INTELLIGENCE", 8),
                        ("WISDOM", 9),
                        ("CHARISMA", 23),
                    ]
                ],
                bonds=[],
                bond_scores=[],
                character_class_id="thief",
                current_hp=21,
                looks=[],
                name="Erhart",
                xp=0,
            )

            session.add(target)
            session.commit()

            def build_item(id: str) -> InventoryItem:
                data = inventory_item_templates_data[id]
                tags = [inventory_item_tag_map[t] for t in data["tags"]]
                return InventoryItem(
                    inventory_item_tags=tags,
                    **{k: v for k, v in data.items() if k != "tags"}
                )

            character = Character(
                alignments=[
                    Alignment(
                        name="Neutral", text="Teach someone the ways of your people."
                    ),
                    Alignment(name="Test", is_enabled=False, text="Test alignment."),
                ],
                attributes=[
                    Attribute(id=str(uuid4()), type=t, value=v)
                    for t, v in [
                        ("STRENGTH", 16),
                        ("DEXTERITY", 15),
                        ("CONSTITUTION", 13),
                        ("INTELLIGENCE", 12),
                        ("WISDOM", 9),
                        ("CHARISMA", 8),
                    ]
                ],
                bonds=[
                    Bond(
                        is_complete=False,
                        target_id=target.id,
                        text="I have a test bond with [TARGET].",
                    )
                ],
                bond_scores=[BondScore(id=str(uuid4()), score=1, target=target)],
                character_class_id="barbarian",
                coin=10,
                current_hp=21,
                id="xutz",
                inventory_items=[build_item("dagger")],
                levels=[
                    Level(
                        picked_move_options=[
                            move_map[
                                "barbarian_starting_herculean_appetites"
                            ].move_options[0],
                            move_map[
                                "barbarian_starting_herculean_appetites"
                            ].move_options[1],
                        ],
                        picked_moves=[
                            move_map["barbarian_race_outsider"],
                            move_map["barbarian_starting_unencumbered_unharmed"],
                        ],
                    ),
                ],
                looks=[
                    Look(look_target_id="body", text="might thews"),
                    Look(look_target_id="eyes", text="tormented"),
                    Look(look_target_id="decoration", text="tattoos"),
                ],
                name="Xutz",
                xp=0,
            )

            session.add(
                Campaign(
                    characters=[character, target],
                    id=str(uuid4()),
                    name="Test Campaign",
                )
            )

            print("DEBUG", f"http://localhost:5173/character/{character.id}")

        session.commit()


def setup_models(app: Flask) -> None:
    app.cli.command("init_db")(
        option("--debug/--no-debug", default=False, type=bool)(init_db)
    )


__all__ = [
    "Attribute",
    "Base",
    "Bond",
    "BondScore",
    "BondTemplate",
    "Campaign",
    "Character",
    "CharacterClass",
    "DamageAddition",
    "DiceOverride",
    "DoesNotExistError",
    "Forward",
    "Move",
    "InventoryItem",
    "InventoryItemTag",
    "InventoryItemTemplate",
    "Ongoing",
    "build_data_loader",
    "get_modifier",
    "setup_models",
]
