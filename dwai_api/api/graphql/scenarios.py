from __future__ import annotations
from typing import Any, Dict, List, Optional

from strawberry import ID, field, type
from strawberry.types import Info

from ..context import Context
from ..models import Scenario as ScenarioModel

@type
class Scenario:
    description: str
    key: ID
    name: str

    @staticmethod
    def from_pydantic(instance: ScenarioModel, _: Optional[Dict[str, Any]] = None) -> Scenario:
        return Scenario(
            description=instance.description,
            key=ID(instance.key),
            name=instance.name,
        )

@type
class ScenariosQuery:
    @field
    def all(self, info: Info[Context, ScenariosQuery]) -> List[Scenario]:
        models = info.context["scenarios"].all()

        return list(map(Scenario.from_pydantic, models))

    @field
    def by_key(self, key: ID, info: Info[Context, ScenariosQuery]) -> Optional[Scenario]:
        model = info.context["scenarios"].by_key(str(key))

        if model is None:
            return None

        return Scenario.from_pydantic(model)