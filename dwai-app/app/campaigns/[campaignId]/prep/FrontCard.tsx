"use client";

import { useMutation } from "@apollo/client/react";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { DangerFragment } from "@/fragments/DangerFragment";
import { FragmentType, graphql, unmaskFragment } from "@/gql";
import { FrontKind } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";

import { GET_CAMPAIGN_DANGERS_QUERY } from "../FrontsPanel";
import { DangerCard } from "./DangerCard";
import { DangerForm, DangerTemplateProps } from "./DangerForm";
import { FrontForm } from "./FrontForm";
import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

const SET_FRONT_RESOLVED_MUTATION = graphql(`
  mutation SetFrontResolved($frontId: ID!, $resolved: Boolean!) {
    campaigns {
      setFrontResolved(frontId: $frontId, resolved: $resolved) {
        id
        resolved
      }
    }
  }
`);

const DELETE_FRONT_MUTATION = graphql(`
  mutation DeleteFront($frontId: ID!) {
    campaigns {
      deleteFront(frontId: $frontId)
    }
  }
`);

export type FrontCardProps = DangerTemplateProps & {
  campaignId: string;
  front: {
    dangers: readonly FragmentType<typeof DangerFragment>[];
    id: string;
    kind: FrontKind;
    name: string;
    notes: string;
    resolved: boolean;
    stakes: readonly { answer: string; question: string }[];
  };
  /** The campaign's fronts, to move a danger between them. */
  fronts: readonly { id: string; name: string }[];
};

/**
 * A front on the Prep page: its notes, stakes questions (with the GM's
 * answers), and dangers. A resolved front starts collapsed.
 */
export const FrontCard: FC<FrontCardProps> = ({ front, ...formProps }) => {
  const refetch = {
    refetchQueries: [
      getOperationName(GET_CAMPAIGN_DANGERS_QUERY),
      getOperationName(GET_PREP_QUERY),
    ],
  };
  const [setFrontResolved] = useMutation(SET_FRONT_RESOLVED_MUTATION, refetch);
  const [deleteFront] = useMutation(DELETE_FRONT_MUTATION, refetch);
  const [addingDanger, setAddingDanger] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const run = (action: () => Promise<unknown>) => {
    setErrors([]);
    action().catch((e: unknown) => setErrors(errorMessages(e)));
  };

  if (editing) {
    return (
      <FrontForm
        campaignId={formProps.campaignId}
        front={front}
        onDone={() => setEditing(false)}
      />
    );
  }

  const dangers = front.dangers.map((d) => unmaskFragment(DangerFragment, d));

  return (
    <details
      aria-label={front.name}
      className="border p-4 rounded"
      open={!front.resolved}
    >
      <summary className="cursor-pointer font-semibold text-lg">
        {front.name}{" "}
        <span className="font-normal text-gray-400 text-sm">
          {front.kind === "CAMPAIGN" ? "Campaign" : "Adventure"} front
          {front.resolved && ", resolved"}
        </span>
      </summary>
      <div className="flex flex-col gap-3 pt-2">
        {front.notes && <p className="whitespace-pre-wrap">{front.notes}</p>}

        {front.stakes.length > 0 && (
          <div>
            <h4 className="font-semibold">Stakes</h4>
            <ul className="list-disc pl-6">
              {front.stakes.map((s, i) => (
                <li key={i}>
                  {s.question}
                  {s.answer && (
                    <span className="text-gray-400"> {s.answer}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Dangers</h4>
          {dangers.length === 0 && <p className="text-sm">No dangers yet.</p>}
          {dangers.map((danger) => (
            <DangerCard danger={danger} key={danger.id} {...formProps} />
          ))}
          {dangers.length > 3 && (
            <p className="text-gray-400 text-sm">
              Most fronts have 1 to 3 dangers. Leave room for discovery.
            </p>
          )}
          {addingDanger ? (
            <DangerForm
              {...formProps}
              frontId={front.id}
              onDone={() => setAddingDanger(false)}
            />
          ) : (
            <div>
              <Button onClick={() => setAddingDanger(true)}>Add Danger</Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Button onClick={() => setEditing(true)}>Edit Front</Button>
          <Button
            onClick={() =>
              run(() =>
                setFrontResolved({
                  variables: { frontId: front.id, resolved: !front.resolved },
                }),
              )
            }
          >
            {front.resolved ? "Unresolve" : "Mark Resolved"}
          </Button>
          <Button className="bg-red-600" onClick={() => setConfirming(true)}>
            Delete Front
          </Button>
        </div>
        {confirming && (
          <div
            aria-label="Are you sure?"
            className="border border-red-500 flex flex-col gap-2 p-2 rounded"
            role="alertdialog"
          >
            <p>
              Delete {front.name} with its dangers and their grim portents? This
              can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setConfirming(false)}>Cancel</Button>
              <Button
                className="bg-red-600"
                onClick={() =>
                  run(() => deleteFront({ variables: { frontId: front.id } }))
                }
              >
                Yes, delete {front.name}
              </Button>
            </div>
          </div>
        )}
        <ErrorList errors={errors} />
      </div>
    </details>
  );
};
