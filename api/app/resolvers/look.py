from strawberry import ID, Info, field, type

from ..context import Context
from ..models import Look as LookModel

from .look_target import LookTarget


@type
class Look:
    id: ID
    text: str

    @field
    async def lookTarget(self, info: Info[Context, "Look"]) -> LookTarget:
        model = await info.context.looks.load(str(self.id))

        return LookTarget.from_model(model.look_target)

    @staticmethod
    def from_model(model: LookModel) -> "Look":
        return Look(id=ID(model.id), text=model.text)
