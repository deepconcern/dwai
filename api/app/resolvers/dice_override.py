from sqlalchemy import select
from strawberry import ID, Info, field, type
from typing import Dict, List, Optional

from ..context import Context
from ..models import DiceOverride as DiceOverrideModel


@type
class DiceOverride:
    id: ID
    name: str
    value: str

    @staticmethod
    def from_model(model: DiceOverrideModel) -> "DiceOverride":
        return DiceOverride(
            id=ID(model.id),
            name=model.name,
            value=model.value,
        )


@type
class DiceOverrideQuery:
    @field
    def all(self, info: Info[Context, "DiceOverrideQuery"]) -> List[DiceOverride]:
        priming_data: Dict[str, DiceOverrideModel] = {}

        for model in info.context.session.scalars(select(DiceOverrideModel)):
            priming_data[model.id] = model

        info.context.moves.prime_many(priming_data)

        return list(map(DiceOverride.from_model, priming_data.values()))
    
    @field
    async def by_character_id(self, info: Info[Context, "DiceOverrideQuery"], character_id: ID) -> List[DiceOverride]:
        character_model = await info.context.characters.load(str(character_id))

        priming_data: Dict[str, DiceOverrideModel] = {}

        for move_model in character_model.class_moves():
            for model in move_model.dice_overrides:
                priming_data[model.id] = model
        
        return list(map(DiceOverride.from_model, priming_data.values()))

    @field
    async def by_id(self, info: Info[Context, "DiceOverrideQuery"], id: ID) -> DiceOverride:
        model = await info.context.moves.load(str(id))

        return DiceOverride.from_model(model)
