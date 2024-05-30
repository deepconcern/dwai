from __future__ import annotations
from asyncio import sleep
from enum import Enum
import strawberry
from strawberry import enum, field, type
from strawberry.types import Info
from typing import List

from ..context import Context
from ..models import Message as MessageModel

@enum
class MessageType(Enum):
    PROMPT = "prompt"

@strawberry.experimental.pydantic.type(all_fields=True, model=MessageModel)
class Message:
    pass

@type
class MessagesQuery:
    @field
    def all(self, info: Info[Context, MessagesQuery]) -> List[Message]:
        return list(map(Message.from_pydantic, info.context["messages"].get_all()))

@type
class MessagesMutation:
    @field
    async def send(self, info: Info[Context, MessagesMutation], content: str, type: MessageType) -> Message:
        user_message = info.context["messages"].create("user", content)

        await sleep(4)
        
        response_message = info.context["messages"].create("system", f"You said \"{user_message.content}\"")

        return Message.from_pydantic(response_message)

# @type
# class PromptSubscription:
#     @field
#     def message_received(self) -> str:
#         pass