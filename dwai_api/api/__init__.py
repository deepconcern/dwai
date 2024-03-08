from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import PlainTextResponse
from starlette.routing import Route

async def healthcheck(_: Request) -> PlainTextResponse:
    return PlainTextResponse("OK")

app = Starlette(debug=True, routes=[
    Route("/", healthcheck)
])