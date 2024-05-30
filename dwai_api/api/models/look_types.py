from pydantic import BaseModel
from yaml import safe_load
from typing import Dict, List, Optional

class LookType(BaseModel):
    examples: List[str]
    key: str
    name: str

class LookTypes:
    look_type_map: Dict[str, LookType] = {}

    def __init__(self) -> None:
        def handle_look_type_dict(look_type_dict: dict) -> None:
            for key, look_type_datum in look_type_dict.items():
                self.look_type_map[key] = LookType(
                    examples=look_type_datum["examples"],
                    key=key,
                    name=look_type_datum["name"],
                )

        # Load look types
        with open("look_types.yml", "r") as f:
            look_type_data = safe_load(f)

            for look_type_dict in look_type_data:
                handle_look_type_dict(look_type_dict)
    
    def all(self) -> List[LookType]:
        return list(self.look_type_map.values())

    def by_key(self, key: str) -> Optional[LookType]:
        return self.look_type_map.get(key, None)