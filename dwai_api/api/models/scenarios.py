from pydantic import BaseModel
from yaml import safe_load
from typing import Dict, List, Optional

class Scenario(BaseModel):
    description: str
    key: str
    name: str

class Scenarios:
    scenario_map: Dict[str, Scenario] = {}

    def __init__(self) -> None:
        def handle_scenario_dict(scenario_dict: dict) -> None:
            for key, scenario_datum in scenario_dict.items():
                self.scenario_map[key] = Scenario(
                    key=key,
                    description=scenario_datum["description"],
                    name=scenario_datum["name"],
                )

        # Load scenarios
        with open("scenarios.yml", "r") as f:
            scenario_data = safe_load(f)

            for scenario_dict in scenario_data:
                handle_scenario_dict(scenario_dict)
    
    def all(self) -> List[Scenario]:
        return list(self.scenario_map.values())

    def by_key(self, key: str) -> Optional[Scenario]:
        return self.scenario_map.get(key, None)