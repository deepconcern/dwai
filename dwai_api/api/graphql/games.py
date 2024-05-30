from __future__ import annotations

from bson import ObjectId
from strawberry import ID, field, type
from strawberry.types import Info
from typing import Any, Dict, List, Optional

from ..context import Context
from ..models import Game as GameModel

@type
class Game:
    character_id: str
    id: ID
    name: str
    scenario_key: str

    @staticmethod
    def from_pydantic(instance: GameModel, _: Optional[Dict[str, Any]] = None) -> Game:
        return Game(
            character_id=str(instance.character_id),
            id=ID(str(instance.id)),
            name=instance.name,
            scenario_key=instance.scenario_key,
        )
    
    def to_pydantic(self) -> GameModel:
        return GameModel(
            _id=ObjectId(str(self.id)),
            character_id=ObjectId(self.character_id),
            name=self.name,
            scenario_key=self.scenario_key,
        )

@type
class GamesQuery:
    @field
    async def all(self, info: Info[Context, GamesQuery]) -> List[Game]:
        models = await info.context["games"].all()

        return list(map(Game.from_pydantic, models))

    @field
    async def by_id(self, id: ID, info: Info[Context, GamesQuery]) -> Optional[Game]:
        model = await info.context["games"].by_id(ObjectId(str(id)))

        if model is None:
            return None

        return Game.from_pydantic(model)

@type
class GamesMutation:
    @field
    async def create(self, character_id: str, info: Info[Context, GamesQuery], name: str, scenario_key: str) -> Game:
        model = await info.context["games"].create(character_id=ObjectId(character_id), name=name, scenario_key=scenario_key)

        return Game.from_pydantic(model)