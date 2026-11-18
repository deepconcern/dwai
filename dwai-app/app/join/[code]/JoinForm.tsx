"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/ButtonLink";
import { Dropdown } from "@/components/Dropdown";
import { ErrorList } from "@/components/ErrorList";
import { graphql } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";

const JOIN_CAMPAIGN_MUTATION = graphql(`
  mutation JoinCampaign($characterId: ID!, $code: String!) {
    campaigns {
      join(characterId: $characterId, code: $code) {
        id
      }
    }
  }
`);

export type JoinFormProps = {
  /** The player's characters that aren't in a campaign. */
  characters: { id: string; name: string }[];
  /** The invite code from the link. */
  code: string;
};

/**
 * Picks a character to bring into the campaign, or creates a new one and
 * comes back here.
 */
export const JoinForm: FC<JoinFormProps> = ({ characters, code }) => {
  const router = useRouter();
  const [characterId, setCharacterId] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [join, { loading }] = useMutation(JOIN_CAMPAIGN_MUTATION);

  const createHref = `/create-character?next=${encodeURIComponent(`/join/${code}`)}`;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      const { data } = await join({ variables: { characterId, code } });
      if (data) router.push(`/campaigns/${data.campaigns.join.id}`);
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {characters.length === 0 ? (
        <p>
          All your characters are already in campaigns. Create a new one to
          join.
        </p>
      ) : (
        <form
          aria-label="Join campaign"
          className="flex flex-col gap-2"
          onSubmit={handleSubmit}
        >
          <Dropdown
            aria-label="Character"
            items={characters.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(ev) => setCharacterId(ev.target.value)}
            placeholder="Choose a character"
            required
            value={characterId}
          />
          <ErrorList errors={errors} />
          <div>
            <Button disabled={loading} type="submit">
              Join
            </Button>
          </div>
        </form>
      )}
      <p>
        <ButtonLink href={createHref}>Create a New Character</ButtonLink>
      </p>
    </div>
  );
};
