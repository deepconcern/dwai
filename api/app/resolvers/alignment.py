from strawberry import ID, type

from ..models import Alignment as AlignmentModel

@type
class Alignment:
    id: ID
    name: str
    text: str

    @staticmethod
    def from_model(model: AlignmentModel) -> "Alignment":
        return Alignment(id=ID(model.id), name=model.name, text=model.text)