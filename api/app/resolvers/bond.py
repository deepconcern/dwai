from __future__ import annotations

from strawberry import ID, Info, field, lazy, type
from typing import TYPE_CHECKING, Annotated, Optional

from ..context import Context
from ..models import Bond as BondModel

if TYPE_CHECKING:
    from .character import Character


@type
class Bond:
    id: ID

    @field
    async def target(self, info: Info[Context, Bond]) -> Annotated[Character, lazy(".character")]:
        from .character import Character

        model = await info.context.bonds.load(str(self.id))

        return Character.from_model(await info.context.characters.load(model.target_id))

    @field
    async def text(self, info: Info[Context, Bond]) -> Optional[str]:
        model = await info.context.bonds.load(str(self.id))

        if model.text is None:
            return None

        target_model = await info.context.characters.load(model.target_id)

        return model.text.replace("[TARGET]", target_model.name)


    @staticmethod
    def from_model(model: BondModel) -> Bond:
        return Bond(id=ID(model.id))
