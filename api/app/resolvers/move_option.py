from strawberry import ID, Info, field, lazy, type
from typing import TYPE_CHECKING, Annotated, List

from ..context import Context
from ..models import MoveOption as MoveOptionModel

if TYPE_CHECKING:
    from .move import MoveTemplate


@type
class MoveOption:
    id: ID
    value: str

    @field
    async def move(
        self, info: Info[Context, "MoveOption"]
    ) -> Annotated["MoveTemplate", lazy(".move")]:
        from .move import MoveTemplate

        model = await info.context.move_options.load(str(self.id))

        move_model = await info.context.moves.load(str(model.move_id))

        return MoveTemplate.from_model(move_model)

    @staticmethod
    def from_model(model: MoveOptionModel) -> "MoveOption":
        return MoveOption(id=ID(model.id), value=model.value)
