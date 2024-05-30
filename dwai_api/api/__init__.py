from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import PlainTextResponse
from starlette.routing import Route

from .connecters import setup as setup_connectors
from .graphql import setup as setup_graphql
from .models import setup as setup_model

async def healthcheck(_: Request) -> PlainTextResponse:
    return PlainTextResponse("OK")

app = Starlette(debug=True, middleware=[
    Middleware(CORSMiddleware, allow_methods=["*"], allow_origins=["*"]),
], routes=[
    Route("/", healthcheck),
])

setup_connectors(app)
setup_model(app)
setup_graphql(app)