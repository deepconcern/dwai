from asyncio import sleep
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route

async def echo(request: Request) -> JSONResponse:
    json = await request.json()

    await sleep(20)

    return JSONResponse({
        "message": f"You said \"{json['content']}\""
    })

app = Starlette(debug=True, middleware=[
    Middleware(CORSMiddleware, allow_methods=["*"], allow_origins=["*"]),
], routes=[
    Route("/echo", echo),
])