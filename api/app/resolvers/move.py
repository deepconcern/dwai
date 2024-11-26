from __future__ import annotations

from strawberry import ID, type

from ..models import Move as MoveModel


@type
class Move:
    description: str
    id: ID
    name: str

    @staticmethod
    def from_model(model: MoveModel) -> Move:
        return Move(description=model.description, id=ID(model.id), name=model.name)
