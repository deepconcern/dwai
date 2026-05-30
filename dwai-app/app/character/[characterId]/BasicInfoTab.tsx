import { FC } from "react";

import { Button } from "@/components/Button";
import { List } from "@/components/List";
import { MoveCard } from "@/components/MoveCard";
import { Section } from "@/components/Section";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { capitalize } from "@/lib/capitalize";

export type BasicInfoProps = {
  character: CharacterFragmentFragment;
};

export const BasicInfoTab: FC<BasicInfoProps> = ({ character }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <Section className="flex-1" title="Health">
          <div className="flex">
            <div className="flex flex-1 flex-col space-y-2">
              <p>HP: {character.hitPoints}</p>
              <p>Armor: ??? </p>
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-4">
              <Button>Heal</Button>
              <Button>Take Damage</Button>
            </div>
          </div>
        </Section>
        <Section className="flex-1" title="Damage">
          <div className="flex">
            <div className="flex flex-1 flex-col space-y-2">
              <p>Weapon: ???</p>
              <p>Damage: ??? </p>
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-4">
              <Button>Deal Damage</Button>
            </div>
          </div>
        </Section>
      </div>

      <div className="flex space-x-4">
        <Section className="flex-1" title="Race Move">
          <MoveCard move={character.raceMove} />
        </Section>
        <Section className="flex-1" title="Alignment">
          <p>
            {capitalize(character.alignmentType)}:{" "}
            {character.alignmentDescription}
          </p>
        </Section>
      </div>

      <div className="flex space-x-4">
        <Section className="flex-1" title="Bonds">
          TODO (only available during campaign)
        </Section>
        <Section className="flex-1" title="Looks">
          <List
            items={character.looks.map((look) => ({
              content: `${look.lookType.name}: ${look.value}`,
              key: look.id,
            }))}
          />
        </Section>
      </div>
    </div>
  );
};
