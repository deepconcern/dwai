from __future__ import annotations
from typing import Any, Dict, List, Optional

from strawberry import ID, field, type
from strawberry.types import Info

from ..context import Context
from ..models import CharacterClass as CharacterClassModel

from .moves import Move

@type
class CharacterClass:
    damage_die: int
    hp_base: int
    key: ID
    name: str

    def get_model(self, info: Info[Context, CharacterClass]) -> CharacterClassModel:
        model = info.context["character_classes"].by_key(str(self.key))

        if model is None:
            raise Exception("Invalid state: model is none")

        return model

    @field
    def alignment_moves(self, info: Info[Context, CharacterClass]) -> List[Move]:
        return list(map(Move.from_pydantic, self.get_model(info).alignment_moves.values()))

    @field
    def race_moves(self, info: Info[Context, CharacterClass]) -> List[Move]:
        return list(map(Move.from_pydantic, self.get_model(info).race_moves.values()))

    @field
    def starting_moves(self, info: Info[Context, CharacterClass]) -> List[Move]:
        return list(map(Move.from_pydantic, self.get_model(info).starting_moves.values()))

    @staticmethod
    def from_pydantic(instance: CharacterClassModel, _: Optional[Dict[str, Any]] = None) -> CharacterClass:
        return CharacterClass(
            damage_die=instance.damage_die,
            hp_base=instance.hp_base,
            key=ID(instance.key),
            name=instance.name,
        )

@type
class CharacterClassesQuery:
    @field
    def all(self, info: Info[Context, CharacterClassesQuery]) -> List[CharacterClass]:
        models = info.context["character_classes"].all()

        return list(map(CharacterClass.from_pydantic, models))

    @field
    def by_key(self, key: ID, info: Info[Context, CharacterClassesQuery]) -> Optional[CharacterClass]:
        model = info.context["character_classes"].by_key(str(key))

        if model is None:
            return None

        return CharacterClass.from_pydantic(model)