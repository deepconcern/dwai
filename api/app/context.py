from dataclasses import dataclass
from flask import Request, Response, g
from sqlalchemy.orm import Session
from strawberry.dataloader import DataLoader

from .models import (
    Bond,
    BondScore,
    Campaign,
    Character,
    CharacterClass,
    DiceOverride,
    Forward,
    InventoryItem,
    InventoryItemTemplate,
    Level,
    Look,
    Move,
    MoveOption,
    Ongoing,
    build_data_loader,
)


@dataclass
class Context:
    bonds: DataLoader[str, Bond]
    bond_scores: DataLoader[str, BondScore]
    campaigns: DataLoader[str, Campaign]
    characters: DataLoader[str, Character]
    character_classes: DataLoader[str, CharacterClass]
    dice_overrides: DataLoader[str, DiceOverride]
    forwards: DataLoader[str, Forward]
    inventory_items: DataLoader[str, InventoryItem]
    inventory_item_templates: DataLoader[str, InventoryItemTemplate]
    levels: DataLoader[str, Level]
    looks: DataLoader[str, Look]
    moves: DataLoader[str, Move]
    move_options: DataLoader[str, MoveOption]
    ongoings: DataLoader[str, Forward]
    request: Request
    response: Response
    session: Session


def build_context(request: Request, response: Response) -> Context:
    return Context(
        bonds=build_data_loader(Bond, g.session),
        bond_scores=build_data_loader(BondScore, g.session),
        campaigns=build_data_loader(Campaign, g.session),
        characters=build_data_loader(Character, g.session),
        character_classes=build_data_loader(CharacterClass, g.session),
        dice_overrides=build_data_loader(DiceOverride, g.session),
        forwards=build_data_loader(Forward, g.session),
        inventory_items=build_data_loader(InventoryItem, g.session),
        inventory_item_templates=build_data_loader(InventoryItemTemplate, g.session),
        levels=build_data_loader(Level, g.session),
        looks=build_data_loader(Look, g.session),
        moves=build_data_loader(Move, g.session),
        move_options=build_data_loader(MoveOption, g.session),
        ongoings=build_data_loader(Ongoing, g.session),
        request=request,
        response=response,
        session=g.session,
    )
