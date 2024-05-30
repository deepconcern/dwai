from api.models.characters import CHARACTERS_COLLECTION
from api.models.games import GAMES_COLLECTION
from api.models.looks import LOOKS_COLLECTION
from asyncio import run
from motor.core import AgnosticClient
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.config import Config

config = Config(".env")

DATABASE_URL = config("DATABASE_URL")

async def main() -> None:
    client: AgnosticClient = AsyncIOMotorClient(DATABASE_URL)

    db = client.get_default_database()

    for target in (CHARACTERS_COLLECTION, GAMES_COLLECTION, LOOKS_COLLECTION):
        collection = db[target]

        collection.delete_many({})

run(main())
