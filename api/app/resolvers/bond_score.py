from __future__ import annotations

from strawberry import ID, field, type
from strawberry.types import Info
from typing import Dict, List

from ..context import Context
from ..models import BondScore as BondScoreModel

from .character import Character


@type
class BondScore:
    id: ID
    score: int

    @field
    async def target(self, info: Info[Context, BondScore]) -> Character:
        model = await info.context.bond_scores.load(str(self.id))

        return Character.from_model(model.target)

    @staticmethod
    def from_model(model: BondScoreModel) -> BondScore:
        return BondScore(id=ID(model.id), score=model.score)
