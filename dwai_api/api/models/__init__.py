from starlette.applications import Starlette

from .character_classes import CharacterClass, CharacterClasses
from .characters import Character, Characters
from .games import Game, Games
from .look_types import LookType, LookTypes
from .looks import Look, Looks
from .messages import Message, Messages
from .moves import Move, Moves
from .scenarios import Scenario, Scenarios

def setup(app: Starlette) -> None:
    app.state.CHARACTER_CLASSES = CharacterClasses()
    app.state.CHARACTERS = Characters(app.state.DB)
    app.state.GAMES = Games(app.state.DB)
    app.state.LOOK_TYPES = LookTypes()
    app.state.LOOKS = Looks(app.state.DB)
    app.state.MESSAGES = Messages()
    app.state.MOVES = Moves()
    app.state.SCENARIOS = Scenarios()

__all__ = [
    "Character",
    "CharacterClass",
    "CharacterClasses",
    "Characters",
    "Game",
    "Games",
    "Look",
    "Looks",
    "LookType",
    "LookTypes",
    "Message",
    "Messages",
    "Move",
    "Moves",
    "Scenario",
    "Scenarios",
    "setup",
]