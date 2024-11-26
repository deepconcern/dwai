from dataclasses import dataclass
from flask import Request, Response
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from strawberry.dataloader import DataLoader

from .models import Character, CharacterClass, InventoryItem, Move


@dataclass
class Context:
    character_loader: DataLoader[str, Character]
    character_class_loader: DataLoader[str, CharacterClass]
    inventory_item_loader: DataLoader[str, InventoryItem]
    move_loader: DataLoader[str, Move]
    request: Request
    response: Response
    session: Session
