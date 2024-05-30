from bson import ObjectId
from motor.core import AgnosticDatabase
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

from ..py_object_id import PyObjectId

class Character(BaseModel):
    id: PyObjectId = Field(alias="_id")
    name: str
    model_config = ConfigDict(arbitrary_types_allowed=True)

CHARACTERS_COLLECTION = "characters"

class Characters:
    __db: AgnosticDatabase

    def __init__(self, db: AgnosticDatabase) -> None:
        self.__db = db
    
    async def all(self) -> List[Character]:
        collection = self.__db[CHARACTERS_COLLECTION]

        return [Character(**data) for data in await collection.find({}).to_list(length=None)]
    
    async def by_id(self, id: ObjectId) -> Optional[Character]:
        collection = self.__db[CHARACTERS_COLLECTION]

        data = await collection.find_one({ "_id": id })

        if data is None:
            return None
        
        return Character(**data)

    async def create(self, name: str) -> Character:
        collection = self.__db[CHARACTERS_COLLECTION]

        result = await collection.insert_one({
            "name": name,
        })

        character = await self.by_id(result.inserted_id)

        if character is None:
            raise Exception(f"Invalid state. Character does not exist: {result.inserted_id}")
        
        return character