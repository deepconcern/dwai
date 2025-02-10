from strawberry import ID, type

from ..models import AlignmentTemplate as AlignmentTemplateModel

@type
class AlignmentTemplate:
    id: ID
    name: str
    text: str

    @staticmethod
    def from_model(model: AlignmentTemplateModel) -> "AlignmentTemplate":
        return AlignmentTemplate(id=ID(model.id), name=model.name, text=model.text)