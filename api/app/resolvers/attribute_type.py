from enum import Enum
from strawberry import enum


@enum
class AttributeType(Enum):
    CHARISMA = "CHARISMA"
    CONSTITUTION = "CONSTITUTION"
    DEXTERITY = "DEXTERITY"
    INTELLIGENCE = "INTELLIGENCE"
    STRENGTH = "STRENGTH"
    WISDOM = "WISDOM"