from pydantic import BaseModel
from yaml import safe_load
from typing import Dict, List, Optional, TypedDict

class Move(BaseModel):
    key: str
    name: str
    text: str
    type: str

class MoveDatum(TypedDict):
    name: str
    text: str

def handle_move_dict(move_dict: Dict[str, MoveDatum], move_type: str, target_dict: Dict[str, Move]) -> None:
    for key, move_datum in move_dict.items():
        target_dict[key] = Move(
            key=key,
            name=move_datum["name"],
            text=move_datum["text"],
            type=move_type,
        )

class Moves:
    move_map: Dict[str, Move] = {}

    def __init__(self) -> None:
        with open("moves.yml", "r") as f:
            data = safe_load(f)

            for datum in data:
                for type, move_data in datum.items():
                    for move_dict in move_data:
                        handle_move_dict(move_dict, type, self.move_map)
    
    def all(self) -> List[Move]:
        return list(self.move_map.values())

    def by_key(self, key: str) -> Optional[Move]:
        return self.move_map.get(key, None)

    def by_type(self, type: str) -> List[Move]:
        return list(filter(lambda m: m.type == type, self.move_map.values()))