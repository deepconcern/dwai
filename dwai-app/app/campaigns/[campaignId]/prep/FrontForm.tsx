"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { FrontKind } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";

import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

const CREATE_FRONT_MUTATION = graphql(`
  mutation CreateFront($id: ID!, $input: FrontInput!) {
    campaigns {
      createFront(id: $id, input: $input) {
        id
      }
    }
  }
`);

const UPDATE_FRONT_MUTATION = graphql(`
  mutation UpdateFront($frontId: ID!, $input: FrontInput!) {
    campaigns {
      updateFront(frontId: $frontId, input: $input) {
        id
      }
    }
  }
`);

/** A front as the form edits it. */
export type EditableFront = {
  id: string;
  kind: FrontKind;
  name: string;
  notes: string;
  stakes: readonly { answer: string; question: string }[];
};

export type FrontFormProps = {
  campaignId: string;
  /** The front to edit; a new front when absent. */
  front?: EditableFront;
  onDone: () => void;
};

/** Creates or edits a front: its name, kind, notes, and stakes questions. */
export const FrontForm: FC<FrontFormProps> = ({
  campaignId,
  front,
  onDone,
}) => {
  const refetch = { refetchQueries: [getOperationName(GET_PREP_QUERY)] };
  const [createFront, { loading: creating }] = useMutation(
    CREATE_FRONT_MUTATION,
    refetch,
  );
  const [updateFront, { loading: updating }] = useMutation(
    UPDATE_FRONT_MUTATION,
    refetch,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [kind, setKind] = useState<FrontKind>(front?.kind ?? "ADVENTURE");
  const [name, setName] = useState(front?.name ?? "");
  const [notes, setNotes] = useState(front?.notes ?? "");
  const [stakes, setStakes] = useState(
    front?.stakes.map((s) => ({ ...s })) ?? [],
  );

  const setStake = (i: number, field: "answer" | "question", value: string) =>
    setStakes(stakes.map((s, j) => (j === i ? { ...s, [field]: value } : s)));

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    setErrors([]);
    const input = { kind, name, notes, stakes };
    const save = front
      ? updateFront({ variables: { frontId: front.id, input } })
      : createFront({ variables: { id: campaignId, input } });
    save.then(onDone).catch((e: unknown) => setErrors(errorMessages(e)));
  };

  return (
    <form
      aria-label={front ? `Edit ${front.name}` : "New front"}
      className="border flex flex-col gap-2 p-2 rounded"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-1">
        Name
        <TextInput
          maxLength={100}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="The Opening of the White Gate"
          required
          value={name}
        />
      </label>
      <label className="flex flex-col gap-1">
        Kind
        <select
          className="border px-3 py-2 rounded"
          onChange={(ev) => setKind(ev.target.value as FrontKind)}
          value={kind}
        >
          <option className="bg-black" value={"ADVENTURE"}>
            Adventure (the next few sessions)
          </option>
          <option className="bg-black" value={"CAMPAIGN"}>
            Campaign (the whole campaign)
          </option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Notes
        <textarea
          className="border px-3 py-2 rounded"
          maxLength={5000}
          onChange={(ev) => setNotes(ev.target.value)}
          rows={3}
          value={notes}
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend>Stakes questions</legend>
        <p className="text-gray-400 text-sm">
          Things you want to find out in play. Write a quick answer when play
          answers one.
        </p>
        {stakes.map((stake, i) => (
          <div className="border flex flex-col gap-1 p-2 rounded" key={i}>
            <TextInput
              aria-label={`Stakes question ${i + 1}`}
              maxLength={200}
              onChange={(ev) => setStake(i, "question", ev.target.value)}
              placeholder="Will the baron survive?"
              required
              value={stake.question}
            />
            <textarea
              aria-label={`Answer ${i + 1}`}
              className="border px-3 py-2 rounded"
              maxLength={1000}
              onChange={(ev) => setStake(i, "answer", ev.target.value)}
              placeholder="Answer (once play answers it)"
              rows={1}
              value={stake.answer}
            />
            <div>
              <Button
                className="bg-red-600"
                onClick={() => setStakes(stakes.filter((_, j) => j !== i))}
                type="button"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {stakes.length < 10 && (
          <div>
            <Button
              onClick={() =>
                setStakes([...stakes, { answer: "", question: "" }])
              }
              type="button"
            >
              Add Stakes Question
            </Button>
          </div>
        )}
      </fieldset>
      <ErrorList errors={errors} />
      <div className="flex gap-2">
        <Button disabled={creating || updating} type="submit">
          {front ? "Save Front" : "Create Front"}
        </Button>
        <Button onClick={onDone} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
};
