from strawberry import ID, type

from ..models import LookTarget as LookTargetModel

@type
class LookTarget:
    id: ID
    name: str

    @staticmethod
    def from_model(model: LookTargetModel) -> "LookTarget":
        return LookTarget(id=ID(model.id), name=model.name)