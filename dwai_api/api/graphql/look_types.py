from __future__ import annotations

from strawberry import ID, field, type
from strawberry.types import Info
from typing import Any, Dict, List, Optional

from ..context import Context
from ..models import LookType as LookTypeModel

@type
class LookType:
    examples: List[str]
    key: ID
    name: str

    @staticmethod
    def from_pydantic(instance: LookTypeModel, _: Optional[Dict[str, Any]] = None) -> LookType:
        return LookType(
            examples=instance.examples,
            key=ID(instance.key),
            name=instance.name,
        )

@type
class LookTypesQuery:
    @field
    def all(self, info: Info[Context, LookTypesQuery]) -> List[LookType]:
        models = info.context["look_types"].all()

        return list(map(LookType.from_pydantic, models))