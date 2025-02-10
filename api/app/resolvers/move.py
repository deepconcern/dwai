from functools import partial
from sqlalchemy import select
from strawberry import ID, Info, Private, field, interface, lazy, type
from strawberry.dataloader import DataLoader
from typing import (
    TYPE_CHECKING,
    Annotated,
    Any,
    Callable,
    Dict,
    List,
    Optional,
)

from ..context import Context
from ..models import (
    Character as CharacterModel,
    DiceOverride as DiceOverrideModel,
    Forward as ForwardModel,
    Move as MoveModel,
    MoveOption as MoveOptionModel,
    Ongoing as OngoingModel,
)

from .model_loader import ModelLoader

if TYPE_CHECKING:
    from .dice_override import DiceOverride
    from .forward import Forward
    from .move_option import MoveOption
    from .ongoing import Ongoing


def prime_data[M](loader_name: str, info: Info[Context, Any], models: List[M]) -> None:
    priming_data: Dict[str, M] = {getattr(model, "id"): model for model in models}

    loader: DataLoader[str, M] = getattr(info.context, loader_name)

    loader.prime_many(priming_data)

    return models


prime_dice_overrides: Callable[[List[DiceOverrideModel]], List[DiceOverrideModel]] = (
    partial(prime_data, "dice_overrides")
)
prime_forwards: Callable[[List[ForwardModel]], List[ForwardModel]] = partial(
    prime_data, "forwards"
)
prime_move_options: Callable[[List[MoveOptionModel]], List[MoveOptionModel]] = partial(
    prime_data, "move_options"
)
prime_moves: Callable[[List[MoveModel]], List[MoveModel]] = partial(prime_data, "moves")
prime_ongoings: Callable[[List[OngoingModel]], List[OngoingModel]] = partial(
    prime_data, "ongoings"
)


@interface
class Move(ModelLoader[MoveModel]):
    id: ID
    name: str
    roll: Optional[str]
    text: str

    async def get_base_dice_overrides(
        self,
        info: Info[Context, Any],
        extra_dice_overrides: List[DiceOverrideModel] = [],
    ) -> List[DiceOverrideModel]:
        model = await self.load_model(info)

        return prime_dice_overrides(info, [*model.dice_overrides, *extra_dice_overrides])

    async def get_base_forwards(
        self, info: Info[Context, Any], extra_forwards: List[OngoingModel] = []
    ) -> List[OngoingModel]:
        model = await self.load_model(info)

        return prime_forwards(info, [*model.forwards, *extra_forwards])

    async def get_base_ongoings(
        self, info: Info[Context, Any], extra_ongoings: List[OngoingModel] = []
    ) -> List[OngoingModel]:
        model = await self.load_model(info)

        return prime_ongoings(info, [*model.ongoings, *extra_ongoings])


@type
class MoveTemplate(Move):
    is_pickable: bool

    @field
    async def dice_overrides(
        self, info: Info[Context, "MoveTemplate"]
    ) -> List[Annotated["DiceOverride", lazy(".dice_override")]]:
        from .dice_override import DiceOverride

        dice_override_models = await self.get_base_dice_overrides(info)

        return list(map(DiceOverride.from_model, dice_override_models))

    @field
    async def forwards(
        self, info: Info[Context, "MoveTemplate"]
    ) -> List[Annotated["Forward", lazy(".forward")]]:
        from .forward import Forward

        ongoing_models = await self.get_base_forwards(info)

        return list(map(Forward.from_model, ongoing_models))

    @field
    async def move_options(
        self, info: Info[Context, "MoveTemplate"]
    ) -> List[Annotated["MoveOption", lazy(".move_option")]]:
        from .move_option import MoveOption

        model = await self.load_model(info)

        move_option_models = prime_move_options(info, model.move_options)

        return list(map(MoveOption.from_model, move_option_models))

    @field
    async def ongoings(
        self, info: Info[Context, "MoveTemplate"]
    ) -> List[Annotated["Ongoing", lazy(".ongoing")]]:
        from .ongoing import Ongoing

        ongoing_models = await self.get_base_ongoings(info)

        return list(map(Ongoing.from_model, ongoing_models))

    @staticmethod
    def from_model(model: MoveModel) -> "MoveTemplate":
        return MoveTemplate(
            id=ID(model.id),
            is_pickable=model.is_pickable,
            loader_name="moves",
            name=model.name,
            roll=model.roll,
            text=model.text,
        )


@type
class CharacterMove(Move):
    character_id: Private[ID]
    id: ID
    name: str
    text: str

    async def __load_character_model(
        self, info: Info[Context, "CharacterMove"]
    ) -> Optional[CharacterModel]:
        if self.character_id is None:
            return None

        return await info.context.characters.load(str(self.character_id))

    @field
    async def dice_overrides(
        self, info: Info[Context, "CharacterMove"]
    ) -> List[Annotated["DiceOverride", lazy(".dice_override")]]:
        from .dice_override import DiceOverride

        model = await self.load_model(info)
        character_model = await self.__load_character_model(info)

        priming_data: Dict[str, DiceOverrideModel] = {}

        for dice_override_model in model.dice_overrides:
            priming_data[dice_override_model.id] = dice_override_model

        if character_model is not None:
            for move_model in character_model.class_moves():
                if move_model.id == model.id:
                    continue

                for dice_override_model in move_model.dice_overrides:
                    priming_data[dice_override_model.id] = dice_override_model

        info.context.dice_overrides.load_many(priming_data)

        return list(map(DiceOverride.from_model, priming_data.values()))

    @field
    async def forwards(
        self, info: Info[Context, "CharacterMove"]
    ) -> List[Annotated["Forward", lazy(".forward")]]:
        from .forward import Forward

        model = await self.load_model(info)

        character_model = await self.__load_character_model(info)

        extra_forwards: List[ForwardModel] = []

        if character_model is not None:
            for move_model in character_model.class_moves():
                if move_model.id == model.id:
                    continue

                for forward_model in move_model.forwards:
                    extra_forwards.append(forward_model)

        forward_models = await self.get_base_forwards(info, extra_forwards)

        return list(map(Forward.from_model, forward_models))

    @field
    async def move_options(
        self, info: Info[Context, "CharacterMove"]
    ) -> List[Annotated["MoveOption", lazy(".move_option")]]:
        from .move_option import MoveOption

        character_model = await self.__load_character_model(info)

        move_option_models: List[MoveOptionModel] = []

        for level in character_model.levels:
            for move_option_model in level.picked_move_options:
                if move_option_model.move_id == str(self.id):
                    move_option_models.append(move_option_model)

        return list(map(MoveOption.from_model, prime_move_options(info, move_option_models)))

    @field
    async def ongoings(
        self, info: Info[Context, "CharacterMove"]
    ) -> List[Annotated["Ongoing", lazy(".ongoing")]]:
        from .ongoing import Ongoing

        model = await self.load_model(info)

        character_model = await self.__load_character_model(info)

        extra_ongoings: List[OngoingModel] = []

        if character_model is not None:
            for move_model in character_model.class_moves():
                if move_model.id == model.id:
                    continue

                for ongoing_model in move_model.ongoings:
                    extra_ongoings.append(ongoing_model)

        ongoing_models = await self.get_base_ongoings(info, extra_ongoings)

        return list(map(Ongoing.from_model, ongoing_models))

    @staticmethod
    def from_model(character_id: Optional[ID] = None):
        def from_model_inner(character_id: Optional[ID], model: Move) -> "Move":
            return CharacterMove(
                character_id=character_id,
                id=ID(model.id),
                loader_name="moves",
                name=model.name,
                roll=model.roll,
                text=model.text,
            )

        return partial(from_model_inner, character_id)


@type
class MoveTemplateQuery:
    @field
    def all(self, info: Info[Context, "MoveTemplateQuery"]) -> List[MoveTemplate]:
        moves: List[MoveTemplate] = []
        priming_data: Dict[str, MoveModel] = {}

        for model in info.context.session.scalars(select(MoveModel)):
            moves.append(MoveTemplate.from_model(model))
            priming_data[model.id] = model

        info.context.moves.prime_many(priming_data)

        return moves

    @field
    async def by_id(
        self, info: Info[Context, "MoveTemplateQuery"], id: ID
    ) -> MoveTemplate:
        model = await info.context.moves.load(str(id))

        return MoveTemplate.from_model(model)

    @field
    def by_type(
        self, info: Info[Context, "MoveTemplateQuery"], type: str
    ) -> List[MoveTemplate]:
        stmt = select(MoveModel).where(MoveModel.type == type)

        models = info.context.session.scalars(stmt).all()

        return list(map(MoveTemplate.from_model, prime_moves(info, models)))
