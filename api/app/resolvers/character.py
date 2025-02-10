from sqlalchemy import select
from strawberry import ID, field, input, lazy, type
from strawberry.types import Info
from typing import TYPE_CHECKING, Annotated, Dict, List, Optional
from uuid import uuid4

from ..context import Context
from ..models import (
    Attribute as AttributeModel,
    Character as CharacterModel,
)

from .attribute_type import AttributeType
from .model_loader import ModelLoader

if TYPE_CHECKING:
    from .alignment import Alignment
    from .attribute import Attribute
    from .bond import Bond
    from .bond_score import BondScore
    from .campaign import Campaign
    from .character_class import CharacterClass
    from .inventory_item import InventoryItem
    from .look import Look
    from .move import CharacterMove
    

@type
class Character(ModelLoader[CharacterModel]):
    coin: int
    current_hp: int
    name: str
    xp: int
    
    @field
    async def alignment(self, info: Info[Context, "Character"]) -> Annotated["Alignment", lazy(".alignment")]:
        from .alignment import Alignment

        model = await self.load_model(info)

        return Alignment.from_model(next(filter(lambda a: a.is_enabled, model.alignments)))

    @field
    async def armor(self, info: Info[Context, "Character"]) -> int:
        model = await self.load_model(info)

        return model.armor()

    @field
    async def attributes(
        self, info: Info[Context, "Character"]
    ) -> List[Annotated["Attribute", lazy(".attribute")]]:
        from .attribute import Attribute

        model = await self.load_model(info)

        return list(map(Attribute.from_model, model.attributes))

    @field
    async def bonds(
        self, info: Info[Context, "Character"]
    ) -> List[Annotated["Bond", lazy(".bond")]]:
        from .bond import Bond

        model = await self.load_model(info)

        return list(map(Bond.from_model, model.bonds))

    @field
    async def bond_scores(
        self, info: Info[Context, "Character"]
    ) -> List[Annotated["BondScore", lazy(".bond_score")]]:
        from .bond_score import BondScore

        model = await self.load_model(info)

        return list(map(BondScore.from_model, model.bond_scores))

    @field
    async def bond_score_by_target(
        self, info: Info[Context, "Character"], target_id: ID
    ) -> int:
        model = await self.load_model(info)

        bond_score = next(
            filter(lambda b: b.target_id == str(target_id), model.bond_scores), None
        )

        if bond_score is None:
            return 0

        return bond_score.score

    @field
    async def campaign(
        self, info: Info[Context, "Character"]
    ) -> Optional[Annotated["Campaign", lazy(".campaign")]]:
        from .campaign import Campaign

        model = await self.load_model(info)

        if model.campaign is None:
            return None

        return Campaign.from_model(model.campaign)

    @field
    async def character_class(
        self, info: Info[Context, "Character"]
    ) -> Annotated["CharacterClass", lazy(".character_class")]:
        from .character_class import CharacterClass

        model = await self.load_model(info)

        return CharacterClass.from_model(
            await info.context.character_classes.load(model.character_class_id)
        )

    @field
    async def class_moves(self, info: Info[Context, "Character"]) -> List[Annotated["CharacterMove", lazy(".move")]]:
        from .move import CharacterMove

        model = await self.load_model(info)

        return list(map(CharacterMove.from_model(self.id), model.class_moves()))

    @field
    async def inventory_items(
        self, info: Info[Context, "Character"]
    ) -> List[Annotated["InventoryItem", lazy(".inventory_item")]]:
        from .inventory_item import InventoryItem

        model = await self.load_model(info)

        return list(map(InventoryItem.from_model, model.inventory_items))

    @field
    async def level(self, info: Info[Context, "Character"]) -> int:
        model = await self.load_model(info)

        return len(model.levels)

    @field
    async def looks(self, info: Info[Context, "Character"]) -> List[Annotated["Look", lazy(".look")]]:
        from .look import Look

        model = await self.load_model(info)

        return list(map(Look.from_model, model.looks))

    @field
    async def max_hp(self, info: Info[Context, "Character"]) -> int:
        model = await self.load_model(info)

        return model.max_hp()

    @field
    async def max_weight(self, info: Info[Context, "Character"]) -> int:
        model = await self.load_model(info)

        return model.max_weight()

    @field
    async def party_members(
        self, info: Info[Context, "Character"]
    ) -> List["Character"]:
        model = await self.load_model(info)

        return list(
            map(
                Character.from_model,
                filter(lambda c: c.id != model.id, model.campaign.characters),
            )
        )
    
    @field
    async def race_move(self, info: Info[Context, "Character"]) -> Annotated["CharacterMove", lazy(".move")]:
        from .move import CharacterMove

        model = await self.load_model(info)

        return CharacterMove.from_model(self.id)(model.race_move())

    @field
    async def weight(self, info: Info[Context, "Character"]) -> int:
        model = await self.load_model(info)

        weight = 0

        for inventory_item in model.inventory_items:
            if inventory_item.weight is not None:
                weight += inventory_item.weight

        return weight

    @staticmethod
    def from_model(model: CharacterModel) -> "Character":
        return Character(
            coin=model.coin,
            current_hp=model.current_hp,
            id=ID(model.id),
            loader_name="characters",
            name=model.name,
            xp=model.xp,
        )


@input
class AttributeInput:
    type: AttributeType
    score: int


@input
class CreateCharacterInput:
    attributes: List[AttributeInput]
    character_class_id: ID
    name: str


@input
class LevelCharacterInput:
    id: ID
    increased_attribute_type: AttributeType


@input
class PickBondInput:
    bond_id: ID
    text: str


@input
class UpdateAmmoInput:
    id: ID
    inventory_item_id: ID
    value: int

@input
class UpdateCoinInput:
    id: ID
    value: int


@input
class UpdateHpInput:
    id: ID
    value: int


@type
class CharacterMutation:
    @field
    async def create(
        self, info: Info[Context, "CharacterMutation"], input: CreateCharacterInput
    ) -> Character:
        character_class_model = await info.context.character_classes.load(
            str(input.character_class_id)
        )

        constitution = next(
            filter(lambda a: a.type == AttributeType.CONSTITUTION, input.attributes)
        )

        model = CharacterModel(
            attributes=[
                AttributeModel(id=str(uuid4()), type=a.type.value, value=a.score)
                for a in input.attributes
            ],
            character_class_id=str(input.character_class_id),
            current_hp=character_class_model.hp_base + constitution.score,
            id=str(uuid4()),
            name=input.name,
            xp=0,
        )

        info.context.session.add(model)

        info.context.session.commit()

        info.context.characters.prime(model.id, model)

        return Character.from_model(model)

    @field
    async def level_up(
        self, info: Info[Context, "CharacterMutation"], input: LevelCharacterInput
    ) -> Character:
        model = await info.context.characters.load(str(input.id))

        # model.xp = 7 + len(model.levels)

        attribute = next(
            filter(
                lambda a: a.type == input.increased_attribute_type.value,
                model.attributes,
            )
        )
        attribute.value += 1

        info.context.session.commit()

        info.context.characters.prime(model.id, model)

        return Character.from_model(model)

    @field
    async def mark_xp(self, info: Info[Context, "CharacterMutation"], id: ID) -> int:
        model = await info.context.characters.load(str(id))

        model.xp += 1

        info.context.session.commit()

        info.context.characters.prime(model.id, model)

        return model.xp

    @field
    async def update_coin(
        self, info: Info[Context, "CharacterMutation"], input: UpdateCoinInput
    ) -> Character:
        model = await info.context.characters.load(str(input.id))

        model.coin = max(0, model.coin + input.value)

        info.context.session.commit()

        return Character.from_model(model)

    @field
    async def update_hp(
        self, info: Info[Context, "CharacterMutation"], input: UpdateHpInput
    ) -> Character:
        model = await info.context.characters.load(str(input.id))

        model.current_hp = max(0, min(model.max_hp(), model.current_hp + input.value))

        info.context.session.commit()

        return Character.from_model(model)


@type
class CharacterQuery:
    @field
    def all(self, info: Info[Context, "CharacterQuery"]) -> List[Character]:
        stmt = select(CharacterModel)

        characters: List[Character] = []
        priming_data: Dict[str, CharacterModel] = {}

        for model in info.context.session.scalars(stmt):
            characters.append(Character.from_model(model))
            priming_data[model.id] = model

        info.context.characters.prime_many(priming_data)

        return characters

    @field
    async def by_id(self, info: Info[Context, "CharacterQuery"], id: ID) -> Character:
        model = await info.context.characters.load(str(id))

        return Character.from_model(model)
