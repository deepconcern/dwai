from strawberry import ID, Info, Private, interface
from strawberry.dataloader import DataLoader
from typing import Any, Generic, TypeVar

from ..context import Context


M = TypeVar("M")

@interface
class ModelLoader(Generic[M]):
    id: ID
    loader_name: Private[str]

    async def load_model(self, info: Info[Context, Any]) -> M:
        loader: DataLoader[str, M] = getattr(info.context, self.loader_name)

        return await loader.load(str(self.id))
    
