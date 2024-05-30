from __future__ import annotations
from typing import Any, Dict, List, Optional

from strawberry import ID, field, type
from strawberry.types import Info

from ..context import Context
from ..models import Move as MoveModel

@type
class Move:
    key: ID
    name: str
    text: str
    type: str

    @staticmethod
    def from_pydantic(instance: MoveModel, _: Optional[Dict[str, Any]] = None) -> Move:
        return Move(
            key=ID(instance.key),
            name=instance.name,
            text=instance.text,
            type=instance.type,
        )

@type
class MovesQuery:
    @field
    def all(self, info: Info[Context, MovesQuery]) -> List[Move]:
        models = info.context["moves"].all()

        return list(map(Move.from_pydantic, models))

    @field
    def by_key(self, key: ID, info: Info[Context, MovesQuery]) -> Optional[Move]:
        model = info.context["moves"].by_key(str(key))

        if model is None:
            return None

        return Move.from_pydantic(model)