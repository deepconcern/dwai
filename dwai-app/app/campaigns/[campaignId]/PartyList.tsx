"use client";

import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { graphql } from "@/gql";
import { capitalize } from "@/lib/capitalize";
import { errorMessages } from "@/lib/errorMessages";

import { CampaignData } from "./types";

const LEAVE_CAMPAIGN_MUTATION = graphql(`
  mutation LeaveCampaign($characterId: ID!) {
    campaigns {
      leave(characterId: $characterId) {
        id
      }
    }
  }
`);

const REMOVE_CHARACTER_MUTATION = graphql(`
  mutation RemoveCharacter($characterId: ID!, $id: ID!) {
    campaigns {
      removeCharacter(characterId: $characterId, id: $id) {
        id
      }
    }
  }
`);

export type PartyListProps = {
  campaignId: string;
  characters: CampaignData["characters"];
  isGm: boolean;
  /** The viewer's own character, which they can take out of the campaign. */
  myCharacterId: string | null;
  /** Called after the party changes, to reload the campaign. */
  onChanged: () => void;
};

/**
 * The party: each character's summary. The GM can open full sheets and
 * remove characters; a player can leave with their own character. Either
 * way the character is kept, and bonds by or about it are deleted.
 */
export const PartyList: FC<PartyListProps> = ({
  campaignId,
  characters,
  isGm,
  myCharacterId,
  onChanged,
}) => {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [leave] = useMutation(LEAVE_CAMPAIGN_MUTATION);
  const [removeCharacter] = useMutation(REMOVE_CHARACTER_MUTATION);

  const handleLeave = async (characterId: string) => {
    setErrors([]);
    try {
      await leave({ variables: { characterId } });
      router.push("/campaigns");
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  const handleRemove = async (characterId: string) => {
    setErrors([]);
    try {
      await removeCharacter({ variables: { characterId, id: campaignId } });
      onChanged();
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Section title="Party">
      {characters.length === 0 ? (
        <p>No players yet.</p>
      ) : (
        <ul className="flex flex-col space-y-2">
          {characters.map((character) => (
            <li
              aria-label={character.name}
              className="border flex flex-wrap gap-4 items-center p-2 rounded"
              key={character.id}
            >
              <div className="flex-1">
                <p className="font-semibold">
                  {isGm || character.id === myCharacterId ? (
                    <Link
                      className="hover:underline"
                      href={`/character/${character.id}`}
                    >
                      {character.name}
                    </Link>
                  ) : (
                    character.name
                  )}{" "}
                  <span className="font-normal text-gray-400">
                    played by {character.owner.displayName}
                  </span>
                </p>
                <p>
                  {character.raceMove.name} {character.characterClass.name},{" "}
                  {capitalize(character.alignmentType)}. HP{" "}
                  {character.hitPoints} / {character.maxHitPoints}
                </p>
                <p className="text-gray-400">
                  {character.looks.map((look) => look.value).join(", ")}
                </p>
              </div>
              {isGm && (
                <Button onClick={() => handleRemove(character.id)}>
                  Remove
                </Button>
              )}
              {character.id === myCharacterId && (
                <Button onClick={() => handleLeave(character.id)}>
                  Leave Campaign
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <ErrorList errors={errors} />
    </Section>
  );
};
