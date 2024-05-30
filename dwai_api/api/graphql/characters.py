from __future__ import annotations

from asyncio import gather
from bson import ObjectId
from strawberry import ID, Private, field, input, type
from strawberry.types import Info
from typing import Any, Dict, List, Optional

from ..context import Context
from ..models import Character as CharacterModel, Look as LookModel

from .look_types import LookType

@type
class Look:
    look_type_key: Private[str]

    id: ID
    value: str

    @field
    def look_type(self, info: Info[Context, Character]) -> Optional[LookType]:
        model = info.context["look_types"].by_key(self.look_type_key)

        if model is None:
            return None

        return LookType.from_pydantic(model)

    @staticmethod
    def from_pydantic(instance: LookModel, _: Optional[Dict[str, Any]] = None) -> Look:
        return Look(
            id=ID(str(instance.id)),
            look_type_key=instance.look_type_key,
            value=instance.value,
        )

@type
class Character:
    id: ID
    name: str

    @field
    async def looks(self, info: Info[Context, Character]) -> List[Look]:
        models = await info.context["looks"].by_character_id(ObjectId(str(self.id)))

        return list(map(Look.from_pydantic, models))

    @staticmethod
    def from_pydantic(instance: CharacterModel, _: Optional[Dict[str, Any]] = None) -> Character:
        return Character(
            id=ID(str(instance.id)),
            name=instance.name,
        )

@type
class CharactersQuery:
    @field
    async def all(self, info: Info[Context, CharactersQuery]) -> List[Character]:
        models = await info.context["characters"].all()

        return list(map(Character.from_pydantic, models))

    @field
    async def by_id(self, id: ID, info: Info[Context, CharactersQuery]) -> Optional[Character]:
        model = await info.context["characters"].by_id(ObjectId(str(id)))

        if model is None:
            return None

        return Character.from_pydantic(model)
    
@input
class NewLookInput:
    look_type_key: str
    value: str
    
@input
class NewCharacterInput:
    looks: List[NewLookInput]
    name: str

@type
class CharactersMutation:
    @field
    async def create(self, info: Info[Context, CharactersQuery], input: NewCharacterInput) -> Character:
        model = await info.context["characters"].create(name=input.name)

        await gather(*[
            info.context["looks"].create(character_id=ObjectId(model.id), look_type_key=look_input.look_type_key, value=look_input.value)
            for look_input in input.looks
        ])

        return Character.from_pydantic(model)