"use client";

import { useMutation } from "@apollo/client/react";
import { FC, useState } from "react";

import { ErrorList } from "@/components/ErrorList";
import { graphql } from "@/gql";
import { DangerFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { portentProgress } from "@/lib/fronts";

const SET_DANGER_REVEALED_MUTATION = graphql(`
  mutation SetDangerRevealed($dangerId: ID!, $revealed: Boolean!) {
    campaigns {
      setDangerRevealed(dangerId: $dangerId, revealed: $revealed) {
        ...DangerFragment
      }
    }
  }
`);

const SET_PORTENT_DONE_MUTATION = graphql(`
  mutation SetPortentDone($done: Boolean!, $portentId: ID!) {
    campaigns {
      setPortentDone(done: $done, portentId: $portentId) {
        ...DangerFragment
      }
    }
  }
`);

const SET_PORTENT_REVEALED_MUTATION = graphql(`
  mutation SetPortentRevealed($portentId: ID!, $revealed: Boolean!) {
    campaigns {
      setPortentRevealed(portentId: $portentId, revealed: $revealed) {
        ...DangerFragment
      }
    }
  }
`);

export type DangerTrackerProps = {
  danger: DangerFragmentFragment;
};

/**
 * Play-time controls for a danger: check off its grim portents as they come
 * to pass, and reveal the danger and its portents to the players (or hide
 * them again). Revealing posts a line to the chat; checking doesn't.
 */
export const DangerTracker: FC<DangerTrackerProps> = ({ danger }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [setDangerRevealed] = useMutation(SET_DANGER_REVEALED_MUTATION);
  const [setPortentDone] = useMutation(SET_PORTENT_DONE_MUTATION);
  const [setPortentRevealed] = useMutation(SET_PORTENT_REVEALED_MUTATION);

  const run = (action: () => Promise<unknown>) => {
    setErrors([]);
    action().catch((e: unknown) => setErrors(errorMessages(e)));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
        <label>
          <input
            checked={danger.revealed}
            onChange={(ev) =>
              run(() =>
                setDangerRevealed({
                  variables: {
                    dangerId: danger.id,
                    revealed: ev.target.checked,
                  },
                }),
              )
            }
            type="checkbox"
          />{" "}
          Revealed to players
        </label>
        {danger.portents.length > 0 && (
          <span className="text-gray-400 text-sm">
            Grim portents: {portentProgress(danger.portents)}
          </span>
        )}
      </div>
      {danger.portents.length > 0 && (
        <ol
          aria-label={`Grim portents of ${danger.name}`}
          className="flex flex-col gap-1"
        >
          {danger.portents.map((p) => (
            <li className="flex flex-wrap gap-x-4 items-center" key={p.id}>
              <label className="flex-1">
                <input
                  checked={p.done}
                  onChange={(ev) =>
                    run(() =>
                      setPortentDone({
                        variables: { done: ev.target.checked, portentId: p.id },
                      }),
                    )
                  }
                  type="checkbox"
                />{" "}
                <span className={p.done ? "line-through" : ""}>{p.text}</span>
              </label>
              <label
                className="text-gray-400 text-sm"
                title={danger.revealed ? undefined : "Reveal the danger first"}
              >
                <input
                  aria-label={`Reveal "${p.text}"`}
                  checked={p.revealed}
                  disabled={!danger.revealed && !p.revealed}
                  onChange={(ev) =>
                    run(() =>
                      setPortentRevealed({
                        variables: {
                          portentId: p.id,
                          revealed: ev.target.checked,
                        },
                      }),
                    )
                  }
                  type="checkbox"
                />{" "}
                Revealed
              </label>
            </li>
          ))}
        </ol>
      )}
      <ErrorList errors={errors} />
    </div>
  );
};
