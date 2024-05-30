from bson import ObjectId
from motor.core import AgnosticDatabase
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

from ..py_object_id import PyObjectId

class Look(BaseModel):
    character_id: PyObjectId
    id: PyObjectId = Field(alias="_id")
    model_config = ConfigDict(arbitrary_types_allowed=True)
    look_type_key: str
    value: str

LOOKS_COLLECTION = "looks"

class Looks:
    __db: AgnosticDatabase

    def __init__(self, db: AgnosticDatabase) -> None:
        self.__db = db
    
    async def all(self) -> List[Look]:
        collection = self.__db[LOOKS_COLLECTION]

        return [Look(**data) for data in await collection.find({}).to_list(length=None)]
    
    async def by_character_id(self, character_id: ObjectId) -> List[Look]:
        collection = self.__db[LOOKS_COLLECTION]

        return [Look(**data) for data in await collection.find({
            "character_id": character_id,
        }).to_list(length=None)]
    
    async def by_id(self, id: ObjectId) -> Optional[Look]:
        collection = self.__db[LOOKS_COLLECTION]

        data = await collection.find_one({ "_id": id })

        if data is None:
            return None
        
        return Look(**data)

    async def create(self, character_id: ObjectId, look_type_key: str, value: str) -> Look:
        collection = self.__db[LOOKS_COLLECTION]

        result = await collection.insert_one({
            "character_id": character_id,
            "look_type_key": look_type_key,
            "value": value,
        })

        look = await self.by_id(result.inserted_id)

        if look is None:
            raise Exception(f"Invalid state. Look does not exist: {result.inserted_id}")
        
        return look
