from strawberry import field, type

from .campaign import CampaignQuery
from .character import CharacterQuery
from .character_class import CharacterClassQuery
from .damage_addition import DamageAdditionQuery
from .forward import ForwardQuery
from .move import MoveTemplateQuery


@type
class Query:
    campaign: CampaignQuery = field(resolver=lambda: CampaignQuery())
    character: CharacterQuery = field(resolver=lambda: CharacterQuery())
    character_class: CharacterClassQuery = field(resolver=lambda: CharacterClassQuery())
    damage_addition: DamageAdditionQuery = field(resolver=lambda: DamageAdditionQuery())
    forward: ForwardQuery = field(resolver=lambda: ForwardQuery())
    # inventory_item: InventoryItemQuery = field(resolver=lambda: InventoryItemQuery())
    move_template: MoveTemplateQuery = field(resolver=lambda: MoveTemplateQuery())


__all__ = ["Query"]
