import { FC } from "react";

import { Button } from "@/components/Button";
import { List } from "@/components/List";
import { MoveCard } from "@/components/MoveCard";
import { Section } from "@/components/Section";
import { ItemFragment } from "@/fragments/ItemFragment";
import { unmaskFragment } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { capitalize } from "@/lib/capitalize";

import { ExperienceSection } from "./ExperienceSection";
import { HealthSection } from "./HealthSection";

export type BasicInfoProps = {
  character: CharacterFragmentFragment;
};

export const BasicInfoTab: FC<BasicInfoProps> = ({ character }) => {
  const weapons = (() => {
    const weapons = [];

    for (const i of character.equipment) {
      const item = unmaskFragment(ItemFragment, i);

      if (item.type !== "weapon") continue;

      weapons.push(item);
    }

    return weapons;
  })();

  return (
    <div className="flex flex-col space-y-4">
      <ExperienceSection character={character} />
      <div className="flex space-x-4">
        <HealthSection character={character} />
        <Section className="flex-1" title="Damage">
          <div className="flex">
            <div className="flex flex-1 flex-col space-y-2">
              <p>Damage: 1d{character.characterClass.damageDie} </p>
            </div>
            <div className="flex flex-2 flex-col justify-between space-y-4">
              <ul>
                {weapons.map((w) => (
                  <li key={w.id}>
                    <Button disabled>
                      <>Use: {w.label}</>
                      {w.tags.length > 0 && (
                        <>
                          <br />
                          &nbsp;({w.tags.map((t) => t.name).join(", ")})
                        </>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
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
