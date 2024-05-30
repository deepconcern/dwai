from datetime import datetime
from pydantic import BaseModel, UUID4
from typing import List, Optional
from uuid import uuid4

class Message(BaseModel):
    author: str
    content: str
    datetime: datetime
    id: UUID4

class Messages:
    messages: List[Message] = []

    def by_id(self, id: UUID4) -> Optional[Message]:
        for message in self.messages:
            if message.id == id:
                return message
        
        return None

    def create(self, author: str, content: str) -> Message:
        message = Message(
            author=author,
            content=content,
            datetime=datetime.now(),
            id=uuid4(),
        )

        self.messages.append(message)

        return message

    def get_all(self) -> List[Message]:
        return self.messages