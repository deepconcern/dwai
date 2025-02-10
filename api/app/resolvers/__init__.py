from flask import Flask, Request, Response
from strawberry import Schema
from strawberry.flask.views import AsyncGraphQLView

from ..context import Context, build_context

from .mutation import Mutation
from .query import Query


class CustomGraphQLView(AsyncGraphQLView):
    async def get_context(self, request: Request, response: Response) -> Context:
        return build_context(request, response)

def setup_graphql(app: Flask) -> None:
    app.add_url_rule(
        "/graphql",
        view_func=CustomGraphQLView.as_view("graphql", schema=Schema(Query, Mutation)),
    )


__all__ = ["setup_graphql"]
