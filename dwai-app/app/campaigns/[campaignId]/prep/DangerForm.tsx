"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useId, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { DangerFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { impulseFor } from "@/lib/fronts";
import { getOperationName } from "@/lib/getOperationName";

import { GET_CAMPAIGN_DANGERS_QUERY } from "../FrontsPanel";
import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

const CREATE_DANGER_MUTATION = graphql(`
  mutation CreateDanger($id: ID!, $input: DangerInput!) {
    campaigns {
      createDanger(id: $id, input: $input) {
        id
      }
    }
  }
`);

const UPDATE_DANGER_MUTATION = graphql(`
  mutation UpdateDanger($dangerId: ID!, $input: DangerInput!) {
    campaigns {
      updateDanger(dangerId: $dangerId, input: $input) {
        ...DangerFragment
      }
    }
  }
`);

/** The danger template, as the form suggests from it. */
export type DangerTemplateProps = {
  categories: readonly {
    key: string;
    name: string;
    types: readonly { impulse: string; key: string; name: string }[];
  }[];
  impendingDooms: readonly { description: string; key: string; name: string }[];
};

export type DangerFormProps = DangerTemplateProps & {
  campaignId: string;
  /** The danger to edit; a new danger when absent. */
  danger?: DangerFragmentFragment;
  /** The front a new danger goes in; none when absent. */
  frontId?: string | null;
  /** The campaign's fronts, to move a danger between them. */
  fronts: readonly { id: string; name: string }[];
  onDone: () => void;
};

/**
 * Creates or edits a danger. The type, impulse, and impending doom are free
 * text; the form suggests the template's, and picking a template type fills
 * in its impulse if none is written. Editing keeps each grim portent's
 * checked and revealed state.
 */
export const DangerForm: FC<DangerFormProps> = ({
  campaignId,
  categories,
  danger,
  frontId: initialFrontId = null,
  fronts,
  impendingDooms,
  onDone,
}) => {
  const listId = useId();
  const refetch = {
    refetchQueries: [
      getOperationName(GET_CAMPAIGN_DANGERS_QUERY),
      getOperationName(GET_PREP_QUERY),
    ],
  };
  const [createDanger, { loading: creating }] = useMutation(
    CREATE_DANGER_MUTATION,
    refetch,
  );
  const [updateDanger, { loading: updating }] = useMutation(
    UPDATE_DANGER_MUTATION,
    refetch,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [frontId, setFrontId] = useState(danger?.frontId ?? initialFrontId);
  const [impendingDoom, setImpendingDoom] = useState(
    danger?.impendingDoom ?? "",
  );
  const [impulse, setImpulse] = useState(danger?.impulse ?? "");
  const [name, setName] = useState(danger?.name ?? "");
  const [notes, setNotes] = useState(danger?.notes ?? "");
  const [portents, setPortents] = useState<{ id?: string; text: string }[]>(
    danger?.portents.map((p) => ({ id: p.id, text: p.text })) ?? [],
  );
  const [type, setType] = useState(danger?.type ?? "");

  const handleType = (value: string) => {
    setType(value);
    setImpulse(impulseFor(value, impulse, categories));
  };

  const setPortent = (i: number, text: string) =>
    setPortents(portents.map((p, j) => (j === i ? { ...p, text } : p)));

  const movePortent = (i: number, by: -1 | 1) => {
    const next = [...portents];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setPortents(next);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    setErrors([]);
    const input = {
      frontId: frontId || null,
      impendingDoom,
      impulse,
      name,
      notes,
      portents: portents.map((p) => ({ id: p.id ?? null, text: p.text })),
      type,
    };
    const save = danger
      ? updateDanger({ variables: { dangerId: danger.id, input } })
      : createDanger({ variables: { id: campaignId, input } });
    save.then(onDone).catch((e: unknown) => setErrors(errorMessages(e)));
  };

  return (
    <form
      aria-label={danger ? `Edit ${danger.name}` : "New danger"}
      className="border flex flex-col gap-2 p-2 rounded"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-1">
        Name
        <TextInput
          maxLength={100}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="The College of Arcanists"
          required
          value={name}
        />
      </label>
      <label className="flex flex-col gap-1">
        Front
        <select
          className="border px-3 py-2 rounded"
          onChange={(ev) => setFrontId(ev.target.value || null)}
          value={frontId ?? ""}
        >
          <option className="bg-black" value="">
            No front
          </option>
          {fronts.map((f) => (
            <option className="bg-black" key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Type
        <TextInput
          list={`${listId}-types`}
          maxLength={100}
          onChange={(ev) => handleType(ev.target.value)}
          placeholder="Pick a suggestion or write your own"
          value={type}
        />
        <datalist id={`${listId}-types`}>
          {categories.flatMap((c) =>
            c.types.map((t) => (
              <option key={t.key} value={t.name}>
                {c.name}
              </option>
            )),
          )}
        </datalist>
      </label>
      <label className="flex flex-col gap-1">
        Impulse
        <TextInput
          maxLength={200}
          onChange={(ev) => setImpulse(ev.target.value)}
          placeholder="What drives it, e.g. to infest from within"
          value={impulse}
        />
      </label>
      <label className="flex flex-col gap-1">
        Impending doom
        <TextInput
          list={`${listId}-dooms`}
          maxLength={200}
          onChange={(ev) => setImpendingDoom(ev.target.value)}
          placeholder="What happens if nobody intervenes"
          value={impendingDoom}
        />
        <datalist id={`${listId}-dooms`}>
          {impendingDooms.map((d) => (
            <option key={d.key} value={d.name}>
              {d.description}
            </option>
          ))}
        </datalist>
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
      <fieldset className="flex flex-col gap-2">
        <legend>Grim portents</legend>
        <p className="text-gray-400 text-sm">
          What happens, in order, if nobody intervenes. A few are usually
          enough.
        </p>
        <ol className="flex flex-col gap-1">
          {portents.map((p, i) => (
            <li className="flex flex-wrap gap-2 items-center" key={p.id ?? i}>
              <TextInput
                aria-label={`Grim portent ${i + 1}`}
                className="flex-1"
                maxLength={200}
                onChange={(ev) => setPortent(i, ev.target.value)}
                required
                value={p.text}
              />
              <Button
                aria-label={`Move grim portent ${i + 1} up`}
                disabled={i === 0}
                onClick={() => movePortent(i, -1)}
                type="button"
              >
                ↑
              </Button>
              <Button
                aria-label={`Move grim portent ${i + 1} down`}
                disabled={i === portents.length - 1}
                onClick={() => movePortent(i, 1)}
                type="button"
              >
                ↓
              </Button>
              <Button
                aria-label={`Remove grim portent ${i + 1}`}
                className="bg-red-600"
                onClick={() => setPortents(portents.filter((_, j) => j !== i))}
                type="button"
              >
                ✕
              </Button>
            </li>
          ))}
        </ol>
        {portents.length < 20 && (
          <div>
            <Button
              onClick={() => setPortents([...portents, { text: "" }])}
              type="button"
            >
              Add Grim Portent
            </Button>
          </div>
        )}
      </fieldset>
      <ErrorList errors={errors} />
      <div className="flex gap-2">
        <Button disabled={creating || updating} type="submit">
          {danger ? "Save Danger" : "Create Danger"}
        </Button>
        <Button onClick={onDone} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
};
