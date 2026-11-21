"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";

import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

const CREATE_ENCOUNTER_MUTATION = graphql(`
  mutation CreateEncounter($id: ID!, $input: EncounterInput!) {
    campaigns {
      createEncounter(id: $id, input: $input) {
        id
      }
    }
  }
`);

const UPDATE_ENCOUNTER_MUTATION = graphql(`
  mutation UpdateEncounter($encounterId: ID!, $input: EncounterInput!) {
    campaigns {
      updateEncounter(encounterId: $encounterId, input: $input) {
        id
      }
    }
  }
`);

/** An encounter as the form edits it. */
export type EditableEncounter = {
  danger?: { id: string } | null;
  id: string;
  location: string;
  name: string;
  notes: string;
};

export type EncounterFormProps = {
  campaignId: string;
  /** The campaign's dangers, to link one. */
  dangers: readonly { id: string; name: string }[];
  /** The encounter to edit; a new encounter when absent. */
  encounter?: EditableEncounter;
  onDone: () => void;
};

/**
 * Creates or edits an encounter's details. A danger and a location are
 * optional; the monsters are added on the encounter's card.
 */
export const EncounterForm: FC<EncounterFormProps> = ({
  campaignId,
  dangers,
  encounter,
  onDone,
}) => {
  const refetch = { refetchQueries: [getOperationName(GET_PREP_QUERY)] };
  const [createEncounter, { loading: creating }] = useMutation(
    CREATE_ENCOUNTER_MUTATION,
    refetch,
  );
  const [updateEncounter, { loading: updating }] = useMutation(
    UPDATE_ENCOUNTER_MUTATION,
    refetch,
  );
  const [dangerId, setDangerId] = useState(encounter?.danger?.id ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [location, setLocation] = useState(encounter?.location ?? "");
  const [name, setName] = useState(encounter?.name ?? "");
  const [notes, setNotes] = useState(encounter?.notes ?? "");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    setErrors([]);
    const input = { dangerId: dangerId || null, location, name, notes };
    const save = encounter
      ? updateEncounter({ variables: { encounterId: encounter.id, input } })
      : createEncounter({ variables: { id: campaignId, input } });
    save.then(onDone).catch((e: unknown) => setErrors(errorMessages(e)));
  };

  return (
    <form
      aria-label={encounter ? `Edit ${encounter.name}` : "New encounter"}
      className="border flex flex-col gap-2 p-2 rounded"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-1">
        Name
        <TextInput
          maxLength={100}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="Goblin ambush"
          required
          value={name}
        />
      </label>
      <label className="flex flex-col gap-1">
        Location (optional)
        <TextInput
          maxLength={100}
          onChange={(ev) => setLocation(ev.target.value)}
          placeholder="Hargrosh Pass"
          value={location}
        />
      </label>
      <label className="flex flex-col gap-1">
        Danger (optional)
        <select
          className="border px-3 py-2 rounded"
          onChange={(ev) => setDangerId(ev.target.value)}
          value={dangerId}
        >
          <option className="bg-black" value="">
            None
          </option>
          {dangers.map((d) => (
            <option className="bg-black" key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Notes
        <textarea
          className="border px-3 py-2 rounded"
          maxLength={2000}
          onChange={(ev) => setNotes(ev.target.value)}
          rows={2}
          value={notes}
        />
      </label>
      <ErrorList errors={errors} />
      <div className="flex gap-2">
        <Button disabled={creating || updating} type="submit">
          {encounter ? "Save Encounter" : "Create Encounter"}
        </Button>
        <Button onClick={onDone} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
};
