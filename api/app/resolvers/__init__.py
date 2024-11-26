from flask import Flask, Request, Response, g
from strawberry import Schema
from strawberry.flask.views import AsyncGraphQLView

from ..context import Context
from ..models import Character, CharacterClass, InventoryItem, Move, build_data_loader

from .mutation import Mutation
from .query import Query


class CustomGraphQLView(AsyncGraphQLView):
    async def get_context(self, request: Request, response: Response) -> Context:
        return Context(
            character_loader=build_data_loader(Character, g.session),
            character_class_loader=build_data_loader(CharacterClass, g.session),
            inventory_item_loader=build_data_loader(InventoryItem, g.session),
            move_loader=build_data_loader(Move, g.session),
            request=request,
            response=response,
            session=g.session,
        )


def setup_graphql(app: Flask) -> None:
    app.add_url_rule(
        "/graphql",
        view_func=CustomGraphQLView.as_view("graphql", schema=Schema(Query, Mutation)),
    )


__all__ = ["setup_graphql"]
