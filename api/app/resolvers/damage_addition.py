from typing import Dict, List
from sqlalchemy import select
from strawberry import ID, Info, field, type

from ..context import Context
from ..models import DamageAddition as DamageAdditionModel


@type
class DamageAddition:
    id: ID
    name: str
    value: str

    @staticmethod
    def from_model(model: DamageAdditionModel) -> "DamageAddition":
        return DamageAddition(id=ID(model.id), name=model.name, value=model.value)


@type
class DamageAdditionQuery:
    @field
    async def all(
        self, info: Info[Context, "DamageAdditionQuery"]
    ) -> List[DamageAddition]:
        stmt = select(DamageAdditionModel).order_by(DamageAdditionModel.name.asc())

        forwards: List[DamageAddition] = []
        priming_data: Dict[str, DamageAddition] = {}

        for model in info.context.session.scalars(stmt):
            forwards.append(DamageAddition.from_model(model))
            priming_data[model.id] = model

        return forwards


__all__ = ["DamageAddition", "DamageAdditionQuery"]
