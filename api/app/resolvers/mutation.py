from strawberry import field, type

from .campaign import CampaignMutation
from .character import CharacterMutation
from .inventory_item import InventoryItemMutation


@type
class Mutation:
    campaign: CampaignMutation = field(resolver=lambda: CampaignMutation())
    character: CharacterMutation = field(resolver=lambda: CharacterMutation())
    inventory_item: InventoryItemMutation = field(resolver=lambda: InventoryItemMutation())


__all__ = ["Mutation"]
