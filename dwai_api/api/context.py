from starlette.requests import Request
from starlette.responses import Response
from starlette.websockets import WebSocket
from typing import TypedDict

from .models import CharacterClasses, Characters, Games, Looks, LookTypes, Messages, Moves, Scenarios

class Context(TypedDict):
    characters: Characters
    character_classes: CharacterClasses
    games: Games
    looks: Looks
    look_types: LookTypes
    messages: Messages
    moves: Moves
    request: Request | WebSocket
    response: Response
    scenarios: Scenarios