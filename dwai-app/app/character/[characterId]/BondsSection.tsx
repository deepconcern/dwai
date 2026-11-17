"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { BondDraft, BondFields } from "@/components/BondFields";
import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { CampaignCharacterFragment } from "@/fragments/CampaignCharacterFragment";
import { FragmentType, graphql, unmaskFragment } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";

const ADD_BOND_MUTATION = graphql(`
  mutation AddBond($id: ID!, $input: BondInput!) {
    characters {
      addBond(id: $id, input: $input) {
        ...CampaignCharacterFragment
      }
    }
  }
`);

const DELETE_BOND_MUTATION = graphql(`
  mutation DeleteBond($bondId: ID!) {
    characters {
      deleteBond(bondId: $bondId) {
        ...CampaignCharacterFragment
      }
    }
  }
`);

const UPDATE_BOND_MUTATION = graphql(`
  mutation UpdateBond($bondId: ID!, $text: String!) {
    characters {
      updateBond(bondId: $bondId, text: $text) {
        ...CampaignCharacterFragment
      }
    }
  }
`);

const EMPTY_DRAFT: BondDraft = { targetId: "", text: "" };

export type BondsSectionProps = {
  /** The character whose bonds are shown and, for its owner, edited. */
  character: FragmentType<typeof CampaignCharacterFragment>;
};

/**
 * The character's active bonds. Bonds only exist in a campaign, and each is
 * about another character in it. How many to have is up to the table.
 */
export const BondsSection: FC<BondsSectionProps> = ({
  character: characterRef,
}) => {
  const character = unmaskFragment(CampaignCharacterFragment, characterRef);

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(
    null,
  );
  const [errors, setErrors] = useState<string[]>([]);

  const [addBond, { loading: adding }] = useMutation(ADD_BOND_MUTATION);
  const [deleteBond] = useMutation(DELETE_BOND_MUTATION, {
    update: (cache, _, { variables }) => {
      if (variables) cache.evict({ id: `Bond:${variables.bondId}` });
    },
  });
  const [updateBond, { loading: saving }] = useMutation(UPDATE_BOND_MUTATION);

  if (!character.campaign) {
    return (
      <Section className="flex-1" title="Bonds">
        <p>Bonds are written once the character joins a campaign.</p>
      </Section>
    );
  }

  const canEdit = character.viewerIsOwner;
  const targets = character.campaign.characters.filter(
    (c) => c.id !== character.id,
  );

  const run = async (action: () => Promise<unknown>) => {
    setErrors([]);
    try {
      await action();
      return true;
    } catch (error) {
      setErrors(errorMessages(error));
      return false;
    }
  };

  const handleAdd: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    if (
      await run(() =>
        addBond({ variables: { id: character.id, input: draft } }),
      )
    ) {
      setDraft(EMPTY_DRAFT);
    }
  };

  const handleSave: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    if (!editing) return;
    if (
      await run(() =>
        updateBond({ variables: { bondId: editing.id, text: editing.text } }),
      )
    ) {
      setEditing(null);
    }
  };

  return (
    <Section className="flex-1" title="Bonds">
      <div className="flex flex-col space-y-4">
        {character.bonds.length === 0 ? (
          <p>No bonds yet.</p>
        ) : (
          <ul aria-label="Active bonds" className="flex flex-col space-y-2">
            {character.bonds.map((bond) =>
              editing?.id === bond.id ? (
                <li key={bond.id}>
                  <form
                    aria-label="Edit bond"
                    className="flex flex-col gap-2"
                    onSubmit={handleSave}
                  >
                    <textarea
                      aria-label="Bond text"
                      className="border px-3 py-2 rounded"
                      maxLength={500}
                      onChange={(ev) =>
                        setEditing({ ...editing, text: ev.target.value })
                      }
                      required
                      rows={2}
                      value={editing.text}
                    />
                    <div className="flex gap-2">
                      <Button disabled={saving} type="submit">
                        Save
                      </Button>
                      <Button onClick={() => setEditing(null)} type="button">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </li>
              ) : (
                <li className="flex gap-2 items-start" key={bond.id}>
                  <span className="flex-1">
                    {bond.text}{" "}
                    <span className="text-gray-400">({bond.target.name})</span>
                  </span>
                  {canEdit && (
                    <>
                      <Button
                        onClick={() =>
                          setEditing({ id: bond.id, text: bond.text })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() =>
                          run(() =>
                            deleteBond({ variables: { bondId: bond.id } }),
                          )
                        }
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </li>
              ),
            )}
          </ul>
        )}

        {canEdit &&
          (targets.length === 0 ? (
            <p>Bonds are about other characters: invite more players.</p>
          ) : (
            <form
              aria-label="Add bond"
              className="flex flex-col gap-2"
              onSubmit={handleAdd}
            >
              <BondFields
                onChange={setDraft}
                targets={targets}
                templates={character.characterClass.bonds}
                value={draft}
              />
              <div>
                <Button disabled={adding} type="submit">
                  Add Bond
                </Button>
              </div>
            </form>
          ))}
        <ErrorList errors={errors} />
      </div>
    </Section>
  );
};
