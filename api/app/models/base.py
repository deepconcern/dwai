from sqlalchemy import Text, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from strawberry.dataloader import DataLoader
from typing import Any, Dict, List, Type, TypeVar, Union


class Base(DeclarativeBase):
    id: Mapped[str] = mapped_column(Text, primary_key=True)


class DoesNotExistError(Exception):
    def __init__(self, key: Any, table: str) -> None:
        super().__init__(f"Key '{key}' doesn't exist for table '{table}'")


M = TypeVar("M", bound=Base)


def build_data_loader(
    ModelClass: Type[M],
    session: Session,
) -> DataLoader[str, M]:
    from ..connectors import engine

    async def load_models(ids: List[str]) -> List[Union[DoesNotExistError, M]]:
        stmt = select(ModelClass).where(ModelClass.id.in_(ids))

        model_map: Dict[str, M] = {m.id: m for m in session.scalars(stmt)}

        return [
            model_map.get(id, DoesNotExistError(id, ModelClass.__tablename__))
            for id in ids
        ]

    return DataLoader(load_fn=load_models)


async def test(keys: List[str]) -> List[Union[DoesNotExistError | Base]]:
    return [
        Base(id=id) if i % 2 == 0 else DoesNotExistError(id, "base")
        for i, id in enumerate(keys)
    ]


test_loader = DataLoader(load_fn=test)

__all__ = ["Base", "DoesNotExistError", "build_data_loader"]
