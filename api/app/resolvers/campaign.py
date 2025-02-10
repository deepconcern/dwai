from __future__ import annotations
from uuid import uuid4

from sqlalchemy import select
from strawberry import ID, Info, field, input, lazy, type
from typing import TYPE_CHECKING, Annotated, Dict, List

from ..context import Context
from ..models import (
    Bond as BondModel,
    BondScore as BondScoreModel,
    Campaign as CampaignModel,
)

if TYPE_CHECKING:
    from .character import Character


@type
class Campaign:
    id: ID
    name: str

    async def __get_model(self, info: Info[Context, Campaign]) -> CampaignModel:
        return await info.context.campaigns.load(str(self.id))

    @field
    async def characters(
        self, info: Info[Context, Campaign]
    ) -> List[Annotated[Character, lazy(".character")]]:
        from .character import Character

        model = await self.__get_model(info)

        return list(map(Character.from_model, model.characters))

    @staticmethod
    def from_model(model: CampaignModel) -> Campaign:
        return Campaign(id=str(model.id), name=model.name)


@input
class CreateCampaignInput:
    name: str


@input
class JoinCampaignInput:
    campaign_id: ID
    character_id: ID


@type
class CampaignMutation:
    @field
    async def create(
        self, info: Info[Context, CampaignMutation], input: CreateCampaignInput
    ) -> Campaign:
        model = CampaignModel(id=str(uuid4()), name=input.name)

        info.context.session.add(model)

        info.context.session.commit()

        return Campaign.from_model(model)

    @field
    async def join(
        self, info: Info[Context, CampaignMutation], input: JoinCampaignInput
    ) -> Campaign:
        model = await info.context.campaigns.load(str(input.campaign_id))

        character_model = await info.context.characters.load(str(input.character_id))

        for c in model.characters:
            c.bonds.append(BondModel(id=str(uuid4()), is_complete=False, target=character_model, text=None))
            c.bond_scores.append(
                BondScoreModel(id=str(uuid4()), score=0, target=character_model)
            )
            character_model.bonds.append(BondModel(id=str(uuid4()), is_complete=False, target=c, text=None))
            character_model.bond_scores.append(
                BondScoreModel(id=str(uuid4()), score=0, target=c)
            )

        model.characters.append(character_model)

        info.context.session.commit()

        return Campaign.from_model(model)


@type
class CampaignQuery:
    @field
    async def all(self, info: Info[Context, CampaignQuery]) -> List[Campaign]:
        campaigns: List[Campaign] = []
        priming_data: Dict[str, CampaignModel] = {}

        stmt = select(CampaignModel)

        for model in info.context.session.scalars(stmt):
            campaigns.append(Campaign.from_model(model))
            priming_data[model.id] = model

        info.context.campaigns.prime_many(priming_data)

        return campaigns

    @field
    async def by_id(self, info: Info[Context, CampaignQuery], id: ID) -> Campaign:
        model = await info.context.campaigns.load(str(id))

        return Campaign.from_model(model)
