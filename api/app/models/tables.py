from sqlalchemy import Column, ForeignKey, Table

from .base import Base

ALIGNMENT_TEMPLATES_TABLE = "alignment_templates"
ALIGNMENTS_TABLE = "alignments"
ATTRIBUTES_TABLE = "attributes"
BOND_SCORES_TABLE = "bond_scores"
BONDS_TABLE = "bonds"
BOND_TEMPLATES_TABLE = "bond_templates"
CAMPAIGNS_TABLE = "campaigns"
CHARACTER_CLASSES_TABLE = "character_classes"
CHARACTERS_TABLE = "characters"
DAMAGE_ADDITIONS_TABLE = "damage_additions"
DICE_OVERRIDES_TABLE = "dice_overrides"
EQUIPMENT_CHOICE_CATEGORIES_TABLE = "equipment_choice_categories"
EQUIPMENT_CHOICE_OPTIONS_TABLE = "equipment_choice_options"
FORWARDS_TABLE = "forwards"
INVENTORY_ITEM_TAGS_TABLE = "inventory_item_tags"
INVENTORY_ITEM_TEMPLATES_TABLE = "inventory_item_templates"
INVENTORY_ITEMS_TABLE = "inventory_items"
LEVELS_TABLE = "levels"
LOOK_TARGETS_TABLE = "look_targets"
LOOK_TEMPLATES_TABLE = "look_templates_table"
LOOKS_TABLE = "looks_table"
MOVE_OPTIONS_TABLE = "move_options"
MOVES_TABLE = "moves"
ONGOINGS_TABLE = "ongoings"
PICKED_MOVES_TABLE = "picked_moves"

advanced_one_moves_character_classes = Table(
    "advanced_one_moves_character_classes",
    Base.metadata,
    Column("advanced_one_move_id", ForeignKey(f"{MOVES_TABLE}.id")),
    Column("character_class_id", ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")),
)

advanced_two_moves_character_classes = Table(
    "advanced_two_moves_character_classes",
    Base.metadata,
    Column("advanced_two_move_id", ForeignKey(f"{MOVES_TABLE}.id")),
    Column("character_class_id", ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")),
)

inventory_item_tags_inventory_item_templates = Table(
    "inventory_item_tags_inventory_item_templates",
    Base.metadata,
    Column("inventory_item_tag_id", ForeignKey(f"{INVENTORY_ITEM_TAGS_TABLE}.id")),
    Column("inventory_item_template_id", ForeignKey(f"{INVENTORY_ITEM_TEMPLATES_TABLE}.id")),
)

inventory_item_tags_inventory_items = Table(
    "inventory_item_tags_inventory_items",
    Base.metadata,
    Column("inventory_item_tag_id", ForeignKey(f"{INVENTORY_ITEM_TAGS_TABLE}.id")),
    Column("inventory_item_id", ForeignKey(f"{INVENTORY_ITEMS_TABLE}.id")),
)

levels_picked_move_options = Table(
    "levels_picked_move_options",
    Base.metadata,
    Column("level_id", ForeignKey(f"{LEVELS_TABLE}.id")),
    Column("picked_move_option_id", ForeignKey(f"{MOVE_OPTIONS_TABLE}.id"))
)

levels_picked_moves = Table(
    "levels_picked_moves",
    Base.metadata,
    Column("level_id", ForeignKey(f"{LEVELS_TABLE}.id")),
    Column("picked_move_id", ForeignKey(f"{MOVES_TABLE}.id")),
)

race_moves_character_classes = Table(
    "race_moves_character_classes",
    Base.metadata,
    Column("race_move_id", ForeignKey(f"{MOVES_TABLE}.id")),
    Column("character_class_id", ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")),
)

starting_moves_character_classes = Table(
    "starting_moves_character_classes",
    Base.metadata,
    Column("starting_move_id", ForeignKey(f"{MOVES_TABLE}.id")),
    Column("character_class_id", ForeignKey(f"{CHARACTER_CLASSES_TABLE}.id")),
)
