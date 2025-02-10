from sqlalchemy import select
from strawberry import ID, field, lazy, type
from strawberry.types import Info
from typing import TYPE_CHECKING, Annotated, Dict, List

from ..context import Context
from ..models import CharacterClass as CharacterClassModel, Move as MoveModel

from .model_loader import ModelLoader

if TYPE_CHECKING:
    from .alignment_template import AlignmentTemplate
    from .bond import Bond
    from .move import MoveTemplate


@type
class CharacterClass(ModelLoader[CharacterClassModel]):
    damage_die: int
    hp_base: int
    name: str
    weight_base: int

    async def get_moves(
        self, type: str, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        from .move import MoveTemplate

        model = await self.load_model(info)

        moves: List[MoveTemplate] = []
        priming_data: Dict[str, MoveModel] = {}

        for move_model in getattr(model, f"{type}_moves"):
            moves.append(MoveTemplate.from_model(move_model))
            priming_data[move_model.id] = move_model

        info.context.moves.prime_many(priming_data)

        return moves

    @field
    async def advanced_one_moves(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        return await self.get_moves("advanced_one", info)

    @field
    async def advanced_two_moves(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        return await self.get_moves("advanced_two", info)

    @field
    async def alignment_templates(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["AlignmentTemplate", lazy(".alignment_template")]]:
        from .alignment_template import AlignmentTemplate

        model = await self.load_model(info)

        return list(map(AlignmentTemplate.from_model, model.alignment_templates))

    @field
    async def bonds(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["Bond", lazy(".bond")]]:
        from .bond import Bond

        model = await self.load_model(info)

        return list(map(Bond.from_model, model.bonds))

    @field
    async def default_starting_moves(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        return list(filter(lambda m: not m.is_pickable, await self.get_moves("starting", info)))

    @field
    async def race_moves(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        return await self.get_moves("race", info)

    @field
    async def pickable_starting_moves(
        self, info: Info[Context, "CharacterClass"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        return list(filter(lambda m: m.is_pickable, await self.get_moves("starting", info)))

    @staticmethod
    def from_model(model: CharacterClassModel) -> "CharacterClass":
        return CharacterClass(
            damage_die=model.damage_die,
            hp_base=model.hp_base,
            id=ID(model.id),
            loader_name="character_classes",
            name=model.name,
            weight_base=model.weight_base,
        )


@type
class CharacterClassQuery:
    @field
    def all(self, info: Info[Context, "CharacterClassQuery"]) -> List[CharacterClass]:
        stmt = select(CharacterClassModel)

        character_classes: List[CharacterClass] = []
        priming_data: Dict[str, CharacterClassModel] = {}

        for model in info.context.session.scalars(stmt):
            character_classes.append(CharacterClass.from_model(model))
            priming_data[model.id] = model

        info.context.character_classes.prime_many(priming_data)

        return character_classes

    @field
    async def by_id(
        self, info: Info[Context, "CharacterClassQuery"], id: ID
    ) -> CharacterClass:
        model = await info.context.character_classes.load(str(id))

        return CharacterClass.from_model(model)
