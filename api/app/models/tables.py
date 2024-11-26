from sqlalchemy import Column, ForeignKey, Table

from .base import Base

BONDS_TABLE = "bonds"
CHARACTER_CLASS_TABLE = "character_classes"
MOVES_TABLE = "moves"

alignment_moves_character_classes = Table(
    "alignment_moves_character_classes",
    Base.metadata,
    Column("alignment_move_id", ForeignKey(f"{MOVES_TABLE}.id")),
    Column("character_class_id", ForeignKey(f"{CHARACTER_CLASS_TABLE}.id")),
)
