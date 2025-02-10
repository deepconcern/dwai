from __future__ import annotations

from strawberry import field, type

from ..models import (
    Attribute as AttributeModel,
    get_modifier,
)

from .attribute_type import AttributeType


@type
class Attribute:
    score: int
    type: AttributeType

    @field
    def modifier(self) -> int:
        return get_modifier(self.score)

    @staticmethod
    def from_model(model: AttributeModel) -> Attribute:
        return Attribute(score=model.value, type=model.type)
