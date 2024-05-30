from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import Response
from starlette.websockets import WebSocket
from strawberry import Schema, field, type
from strawberry.asgi import GraphQL

from ..context import Context

from .character_classes import CharacterClassesQuery
from .characters import CharactersMutation, CharactersQuery
from .games import GamesMutation, GamesQuery
from .look_types import LookTypesQuery
from .messages import MessagesMutation, MessagesQuery
from .moves import MovesQuery
from .scenarios import ScenariosQuery

@type
class Query:
    @field
    def api_version(self) -> str:
        return "0.0.0"
    
    @field
    def character_classes(self) -> CharacterClassesQuery:
        return CharacterClassesQuery()
    
    @field
    def characters(self) -> CharactersQuery:
        return CharactersQuery()
    
    @field
    def games(self) -> GamesQuery:
        return GamesQuery()
    
    @field
    def look_types(self) -> LookTypesQuery:
        return LookTypesQuery()
    
    @field
    def messages(self) -> MessagesQuery:
        return MessagesQuery()
    
    @field
    def moves(self) -> MovesQuery:
        return MovesQuery()
    
    @field
    def scenarios(self) -> ScenariosQuery:
        return ScenariosQuery()


@type
class Mutation:
    @field
    def characters(self) -> CharactersMutation:
        return CharactersMutation()
    
    @field
    def games(self) -> GamesMutation:
        return GamesMutation()
    
    @field
    def messages(self) -> MessagesMutation:
        return MessagesMutation()
    


class GraphqlView(GraphQL):
    async def get_context(self, request: Request | WebSocket, response: Response) -> Context:
        return {
            "character_classes": request.app.state.CHARACTER_CLASSES,
            "characters": request.app.state.CHARACTERS,
            "games": request.app.state.GAMES,
            "look_types": request.app.state.LOOK_TYPES,
            "looks": request.app.state.LOOKS,
            "messages": request.app.state.MESSAGES,
            "moves": request.app.state.MOVES,
            "request": request,
            "response": response,
            "scenarios": request.app.state.SCENARIOS,
        }

schema = Schema(Query, Mutation)

graphql = GraphqlView(schema)

def setup(app: Starlette) -> None:
    app.add_route("/graphql", graphql) # type: ignore # Strawberry issue
    app.add_websocket_route("/graphql", graphql) # type: ignore # Strawberry issue