from __future__ import annotations

from sqlalchemy import select
from strawberry import ID, field, input, type
from strawberry.types import Info
from typing import Dict, List
from uuid import uuid4

from ..context import Context
from ..models import Character as CharacterModel

from .character_class import CharacterClass


@type
class Character:
    id: ID
    name: str

    @field
    async def character_class(self, info: Info[Context, Character]) -> CharacterClass:
        model = await info.context.character_loader.load(str(self.id))

        return CharacterClass.from_model(
            await info.context.character_class_loader.load(model.character_class_id)
        )

    @staticmethod
    def from_model(model: CharacterModel) -> Character:
        return Character(
            id=ID(model.id),
            name=model.name,
        )


@input
class CreateCharacterInput:
    character_class_id: ID
    name: str


@type
class CharacterMutation:
    @field
    def create(
        self, info: Info[Context, CharacterMutation], input: CreateCharacterInput
    ) -> Character:
        model = CharacterModel(
            character_class_id=str(input.character_class_id),
            id=str(uuid4()),
            name=input.name,
        )

        info.context.session.add(model)

        info.context.session.commit()

        info.context.character_loader.prime(model.id, model)

        return Character.from_model(model)


@type
class CharacterQuery:
    @field
    def all(self, info: Info[Context, CharacterQuery]) -> List[Character]:
        stmt = select(CharacterModel)

        characters: List[Character] = []
        priming_data: Dict[str, CharacterModel] = {}

        for model in info.context.session.scalars(stmt):
            characters.append(Character.from_model(model))
            priming_data[model.id] = model

        info.context.character_loader.prime_many(priming_data)

        return characters

    @field
    async def by_id(self, info: Info[Context, CharacterQuery], id: ID) -> Character:
        model = await info.context.character_loader.load(str(id))

        return Character.from_model(model)
