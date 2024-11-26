from strawberry import field, type

from .character import CharacterMutation


@type
class Mutation:
    character: CharacterMutation = field(resolver=lambda: CharacterMutation())


__all__ = ["Mutation"]
