from pydantic import BaseModel
from yaml import safe_load
from typing import Dict, List, Optional

from .moves import Move, handle_move_dict

class CharacterClass(BaseModel):
    alignment_moves: Dict[str, Move]
    bonds: List[str]
    damage_die: int
    hp_base: int
    key: str
    name: str
    race_moves: Dict[str, Move]
    starting_moves: Dict[str, Move]

class CharacterClasses:
    character_class_map: Dict[str, CharacterClass] = {}

    def __init__(self) -> None:

        def handle_character_class_dict(character_class_dict: dict) -> None:
            for key, character_class_datum in character_class_dict.items():
                self.character_class_map[key] = CharacterClass(
                    alignment_moves={},
                    bonds=character_class_datum["bonds"],
                    damage_die=character_class_datum["damage_die"],
                    hp_base=character_class_datum["hp_base"],
                    key=key,
                    name=character_class_datum["name"],
                    race_moves={},
                    starting_moves={},
                )

                for move_dict in character_class_datum["alignment_moves"]:
                    handle_move_dict(move_dict, "alignment", self.character_class_map[key].alignment_moves)

                for move_dict in character_class_datum["race_moves"]:
                    handle_move_dict(move_dict, "race", self.character_class_map[key].race_moves)
                
                for move_dict in character_class_datum["starting_moves"]:
                    handle_move_dict(move_dict, "starting", self.character_class_map[key].starting_moves)

        # Load character classes
        with open("character_classes.yml", "r") as f:
            character_class_data = safe_load(f)

            for character_class_dict in character_class_data:
                handle_character_class_dict(character_class_dict)
    
    def all(self) -> List[CharacterClass]:
        return list(self.character_class_map.values())

    def by_key(self, key: str) -> Optional[CharacterClass]:
        return self.character_class_map.get(key, None)