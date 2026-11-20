"use client";

import { useMutation } from "@apollo/client/react";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { MonsterPicker, PickableMonster } from "@/components/MonsterPicker";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { AddMonstersInput } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";

import { EncounterForm } from "./EncounterForm";
import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

const ADD_ENCOUNTER_MONSTERS_MUTATION = graphql(`
  mutation AddEncounterMonsters($encounterId: ID!, $input: AddMonstersInput!) {
    campaigns {
      addEncounterMonsters(encounterId: $encounterId, input: $input) {
        id
      }
    }
  }
`);

const SET_ENCOUNTER_MONSTER_COUNT_MUTATION = graphql(`
  mutation SetEncounterMonsterCount($count: Int!, $encounterMonsterId: ID!) {
    campaigns {
      setEncounterMonsterCount(
        count: $count
        encounterMonsterId: $encounterMonsterId
      ) {
        id
      }
    }
  }
`);

const REMOVE_ENCOUNTER_MONSTER_MUTATION = graphql(`
  mutation RemoveEncounterMonster($encounterMonsterId: ID!) {
    campaigns {
      removeEncounterMonster(encounterMonsterId: $encounterMonsterId) {
        id
      }
    }
  }
`);

const DELETE_ENCOUNTER_MUTATION = graphql(`
  mutation DeleteEncounter($encounterId: ID!) {
    campaigns {
      deleteEncounter(encounterId: $encounterId)
    }
  }
`);

export type EncounterCardProps = {
  campaignId: string;
  compendium: readonly PickableMonster[];
  dangers: readonly { id: string; name: string }[];
  encounter: {
    danger?: { id: string; name: string } | null;
    id: string;
    location: string;
    monsters: readonly {
      count: number;
      id: string;
      maxHp: number;
      statBlock: { armor?: number | null; name: string };
    }[];
    name: string;
    notes: string;
  };
  mine: readonly PickableMonster[];
};

/**
 * An encounter on the Prep page: its details and its monsters (each a
 * snapshot with a count), which the GM can add to, change, or remove. The
 * Monsters panel on the campaign page runs it.
 */
export const EncounterCard: FC<EncounterCardProps> = ({
  campaignId,
  compendium,
  dangers,
  encounter,
  mine,
}) => {
  const refetch = { refetchQueries: [getOperationName(GET_PREP_QUERY)] };
  const [addMonsters, { loading: adding }] = useMutation(
    ADD_ENCOUNTER_MONSTERS_MUTATION,
    refetch,
  );
  const [setCount] = useMutation(SET_ENCOUNTER_MONSTER_COUNT_MUTATION, refetch);
  const [removeMonster] = useMutation(
    REMOVE_ENCOUNTER_MONSTER_MUTATION,
    refetch,
  );
  const [deleteEncounter] = useMutation(DELETE_ENCOUNTER_MUTATION, refetch);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);

  const run = (action: () => Promise<unknown>) => {
    setErrors([]);
    action().catch((e: unknown) => setErrors(errorMessages(e)));
  };

  const handleAdd = async (input: AddMonstersInput) => {
    setErrors([]);
    try {
      await addMonsters({ variables: { encounterId: encounter.id, input } });
      setPicking(false);
    } catch (e) {
      setErrors(errorMessages(e));
      throw e;
    }
  };

  if (editing) {
    return (
      <EncounterForm
        campaignId={campaignId}
        dangers={dangers}
        encounter={encounter}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <article
      aria-label={encounter.name}
      className="border flex flex-col gap-2 p-4 rounded"
    >
      <h3 className="font-semibold text-lg">{encounter.name}</h3>
      {(encounter.location || encounter.danger) && (
        <p className="text-gray-400 text-sm">
          {encounter.location}
          {encounter.location && encounter.danger && " · "}
          {encounter.danger && `Danger: ${encounter.danger.name}`}
        </p>
      )}
      {encounter.notes && (
        <p className="whitespace-pre-wrap">{encounter.notes}</p>
      )}

      {encounter.monsters.length === 0 && (
        <p className="text-sm">No monsters yet.</p>
      )}
      <ul
        aria-label={`Monsters in ${encounter.name}`}
        className="flex flex-col gap-1"
      >
        {encounter.monsters.map((m) => (
          <li className="flex flex-wrap gap-2 items-center" key={m.id}>
            <TextInput
              aria-label={`How many ${m.statBlock.name}`}
              className="w-20"
              defaultValue={m.count}
              max={20}
              min={1}
              onBlur={(ev) => {
                const count = Number(ev.target.value);
                if (count !== m.count) {
                  run(() =>
                    setCount({
                      variables: { count, encounterMonsterId: m.id },
                    }),
                  );
                }
              }}
              type="number"
            />
            <span className="flex-1">
              {m.statBlock.name}{" "}
              <span className="text-gray-400 text-sm">
                ({m.maxHp} HP
                {m.statBlock.armor != null && `, armor ${m.statBlock.armor}`})
              </span>
            </span>
            <Button
              aria-label={`Remove ${m.statBlock.name}`}
              className="bg-red-600"
              onClick={() =>
                run(() =>
                  removeMonster({ variables: { encounterMonsterId: m.id } }),
                )
              }
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>

      {picking ? (
        <MonsterPicker
          compendium={compendium}
          label={`Add monsters to ${encounter.name}`}
          mine={mine}
          onCancel={() => setPicking(false)}
          onSubmit={handleAdd}
          submitLabel="Add to Encounter"
          submitting={adding}
        />
      ) : (
        <div className="flex flex-wrap gap-2 text-sm">
          <Button onClick={() => setPicking(true)}>Add Monsters</Button>
          <Button onClick={() => setEditing(true)}>Edit</Button>
          <Button className="bg-red-600" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      )}
      {confirming && (
        <div
          aria-label="Are you sure?"
          className="border border-red-500 flex flex-col gap-2 p-2 rounded"
          role="alertdialog"
        >
          <p>
            Delete {encounter.name}? This can&apos;t be undone. Its monsters
            already in play stay.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
            <Button
              className="bg-red-600"
              onClick={() =>
                run(() =>
                  deleteEncounter({ variables: { encounterId: encounter.id } }),
                )
              }
            >
              Yes, delete {encounter.name}
            </Button>
          </div>
        </div>
      )}
      <ErrorList errors={errors} />
    </article>
  );
};
