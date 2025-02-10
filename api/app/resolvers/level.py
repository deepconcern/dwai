from strawberry import ID, Info, field, lazy, type
from typing import TYPE_CHECKING, Annotated, List, Optional

from ..context import Context
from ..models import Level as LevelModel

if TYPE_CHECKING:
    from .attribute_type import AttributeType
    from .move import MoveTemplate
    from .move_option import MoveOption


@type
class Level:
    id: ID
    upgraded_stat: Optional[Annotated["AttributeType", lazy(".attribute_type")]]

    @field
    async def picked_moves(
        self, info: Info[Context, "Level"]
    ) -> List[Annotated["MoveTemplate", lazy(".move")]]:
        from .move import MoveTemplate

        model = await info.context.levels.load(str(self.id))

        return list(map(MoveTemplate.from_model(model.picked_moves)))

    @field
    async def picked_move_options(
        self, info: Info[Context, "Level"]
    ) -> List[Annotated["MoveOption", lazy(".move_option")]]:
        from .move_option import MoveOption

        model = await info.context.levels.load(str(self.id))

        return list(map(MoveOption.from_model, model.picked_move_options))

    @staticmethod
    def from_model(model: LevelModel) -> "Level":
        from .attribute_type import AttributeType

        return Level(
            id=ID(model.id),
            upgraded_stat=(
                AttributeType(model.upgraded_stat)
                if model.upgraded_stat is not None
                else None
            ),
        )
