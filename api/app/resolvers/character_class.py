from __future__ import annotations

from sqlalchemy import select
from strawberry import ID, field, type
from strawberry.types import Info
from typing import Dict, List

from ..context import Context
from ..models import CharacterClass as CharacterClassModel, Move as MoveModel

from .move import Move


@type
class CharacterClass:
    damage_die: int
    hp_base: int
    id: ID
    name: str

    @field
    async def alignment_moves(self, info: Info[Context, CharacterClass]) -> List[Move]:
        model = await info.context.character_class_loader.load(str(self.id))

        moves: List[Move] = []
        priming_data: Dict[str, MoveModel] = {}

        for move_model in model.alignment_moves:
            moves.append(Move.from_model(move_model))
            priming_data[move_model.id] = move_model

        info.context.move_loader.prime_many(priming_data)

        return moves

    @staticmethod
    def from_model(model: CharacterClassModel) -> CharacterClass:
        return CharacterClass(
            damage_die=model.damage_die,
            hp_base=model.hp_base,
            id=ID(model.id),
            name=model.name,
        )


@type
class CharacterClassQuery:
    @field
    def all(self, info: Info[Context, CharacterClassQuery]) -> List[CharacterClass]:
        stmt = select(CharacterClassModel)

        character_classes: List[CharacterClass] = []
        priming_data: Dict[str, CharacterClassModel] = {}

        for model in info.context.session.scalars(stmt):
            character_classes.append(CharacterClass.from_model(model))
            priming_data[model.id] = model

        info.context.character_class_loader.prime_many(priming_data)

        return character_classes
    
    @field
    async def by_id(self, info: Info[Context, CharacterClassQuery], id: ID) -> CharacterClass:
        model = await info.context.character_class_loader.load(str(id))

        return CharacterClass.from_model(model)
