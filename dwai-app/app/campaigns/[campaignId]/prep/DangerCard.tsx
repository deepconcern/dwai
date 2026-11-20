"use client";

import { useMutation } from "@apollo/client/react";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { graphql } from "@/gql";
import { DangerFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";

import { DangerTracker } from "../DangerTracker";
import { GET_CAMPAIGN_DANGERS_QUERY } from "../FrontsPanel";
import { DangerForm, DangerTemplateProps } from "./DangerForm";
import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

const DELETE_DANGER_MUTATION = graphql(`
  mutation DeleteDanger($dangerId: ID!) {
    campaigns {
      deleteDanger(dangerId: $dangerId)
    }
  }
`);

export type DangerCardProps = DangerTemplateProps & {
  campaignId: string;
  danger: DangerFragmentFragment;
  fronts: readonly { id: string; name: string }[];
};

/**
 * A danger on the Prep page: its details, its grim portents to check off
 * and reveal, and edit and delete (with a confirmation).
 */
export const DangerCard: FC<DangerCardProps> = ({ danger, ...formProps }) => {
  const [deleteDanger] = useMutation(DELETE_DANGER_MUTATION, {
    refetchQueries: [
      getOperationName(GET_CAMPAIGN_DANGERS_QUERY),
      getOperationName(GET_PREP_QUERY),
    ],
  });
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (editing) {
    return (
      <DangerForm
        {...formProps}
        danger={danger}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <article
      aria-label={danger.name}
      className="border flex flex-col gap-2 p-2 rounded"
    >
      <h4 className="font-semibold">
        {danger.name}
        {danger.type && (
          <span className="font-normal text-gray-400"> ({danger.type})</span>
        )}
      </h4>
      <dl className="gap-x-2 grid grid-cols-[auto_1fr] text-sm">
        {danger.impulse && (
          <>
            <dt className="text-gray-400">Impulse</dt>
            <dd>{danger.impulse}</dd>
          </>
        )}
        {danger.impendingDoom && (
          <>
            <dt className="text-gray-400">Impending doom</dt>
            <dd>{danger.impendingDoom}</dd>
          </>
        )}
      </dl>
      {danger.notes && (
        <p className="text-sm whitespace-pre-wrap">{danger.notes}</p>
      )}
      {danger.category && (
        <details>
          <summary className="cursor-pointer text-gray-400 text-sm">
            Moves for {danger.category.name}
          </summary>
          <ul className="list-disc pl-6 text-sm">
            {danger.category.moves.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </details>
      )}
      <DangerTracker danger={danger} />
      <div className="flex flex-wrap gap-2 text-sm">
        <Button onClick={() => setEditing(true)}>Edit</Button>
        <Button className="bg-red-600" onClick={() => setConfirming(true)}>
          Delete
        </Button>
      </div>
      {confirming && (
        <div
          aria-label="Are you sure?"
          className="border border-red-500 flex flex-col gap-2 p-2 rounded"
          role="alertdialog"
        >
          <p>
            Delete {danger.name} and its grim portents? This can&apos;t be
            undone. Encounters linked to it stay, unlinked.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
            <Button
              className="bg-red-600"
              onClick={() =>
                deleteDanger({ variables: { dangerId: danger.id } }).catch(
                  (e: unknown) => setErrors(errorMessages(e)),
                )
              }
            >
              Yes, delete {danger.name}
            </Button>
          </div>
        </div>
      )}
      <ErrorList errors={errors} />
    </article>
  );
};
