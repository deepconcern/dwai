from motor.motor_asyncio import AsyncIOMotorClient
from starlette.applications import Starlette

from ..settings import DATABASE_URL

def setup(app: Starlette) -> None:
    app.state.DB = AsyncIOMotorClient(DATABASE_URL).get_default_database()