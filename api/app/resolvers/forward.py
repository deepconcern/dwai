from sqlalchemy import select
from strawberry import ID, Info, field, type
from typing import Dict, List

from ..context import Context
from ..models import Forward as ForwardModel


@type
class Forward:
    id: ID
    name: str
    value: int

    @staticmethod
    def from_model(model: ForwardModel) -> "Forward":
        return Forward(id=ID(model.id), name=model.name, value=model.value)


@type
class ForwardQuery:
    @field
    async def all(self, info: Info[Context, "ForwardQuery"]) -> List[Forward]:
        stmt = select(ForwardModel).order_by(ForwardModel.name.asc())

        forwards: List[Forward] = []
        priming_data: Dict[str, Forward] = {}

        for model in info.context.session.scalars(stmt):
            forwards.append(Forward.from_model(model))
            priming_data[model.id] = model

        return forwards


__all__ = ["Forward", "ForwardQuery"]
