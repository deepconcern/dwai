from bson import ObjectId
from motor.core import AgnosticDatabase
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

from ..py_object_id import PyObjectId

class Game(BaseModel):
    character_id: PyObjectId
    id: PyObjectId = Field(alias="_id")
    model_config = ConfigDict(arbitrary_types_allowed=True)
    name: str
    scenario_key: str

GAMES_COLLECTION = "games"

class Games:
    __db: AgnosticDatabase

    def __init__(self, db: AgnosticDatabase) -> None:
        self.__db = db
    
    async def all(self) -> List[Game]:
        collection = self.__db[GAMES_COLLECTION]

        return [Game(**data) for data in await collection.find({}).to_list(length=None)]
    
    async def by_id(self, id: ObjectId) -> Optional[Game]:
        collection = self.__db[GAMES_COLLECTION]

        data = await collection.find_one({ "_id": id })

        if data is None:
            return None
        
        return Game(**data)

    async def create(self, character_id: ObjectId, name: str, scenario_key: str) -> Game:
        collection = self.__db[GAMES_COLLECTION]

        result = await collection.insert_one({
            "character_id": character_id,
            "name": name,
            "scenario_key": scenario_key,
        })

        game = await self.by_id(result.inserted_id)

        if game is None:
            raise Exception(f"Invalid state. Game does not exist: {result.inserted_id}")
        
        return game

