from sqlalchemy import select
from strawberry import ID, Info, field, type
from typing import Dict, List

from ..context import Context
from ..models import Ongoing as OngoingModel


@type
class Ongoing:
    id: ID
    name: str
    value: int

    @staticmethod
    def from_model(model: OngoingModel) -> "Ongoing":
        return Ongoing(id=ID(model.id), name=model.name, value=model.value)


@type
class OngoingQuery:
    @field
    async def all(self, info: Info[Context, "OngoingQuery"]) -> List[Ongoing]:
        stmt = select(OngoingModel).order_by(OngoingModel.name.asc())

        forwards: List[Ongoing] = []
        priming_data: Dict[str, Ongoing] = {}

        for model in info.context.session.scalars(stmt):
            forwards.append(Ongoing.from_model(model))
            priming_data[model.id] = model

        return forwards


__all__ = ["Ongoing", "OngoingQuery"]
