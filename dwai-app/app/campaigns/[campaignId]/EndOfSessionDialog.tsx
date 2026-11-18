"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { CheckedReasonField } from "@/components/CheckedReasonField";
import { ErrorList } from "@/components/ErrorList";
import { Modal } from "@/components/Modal";
import { graphql } from "@/gql";
import { CheckedReason, needsReason } from "@/lib/campaigns";
import { errorMessages } from "@/lib/errorMessages";

const END_SESSION_MUTATION = graphql(`
  mutation EndSession($id: ID!, $input: EndSessionInput!) {
    campaigns {
      endSession(id: $id, input: $input) {
        id
      }
    }
  }
`);

const UNCHECKED: CheckedReason = { checked: false, reason: "" };

export type EndOfSessionDialogProps = {
  campaignId: string;
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when the dialog closes, by cancelling or after ending. */
  onClose: () => void;
  /** Called after the session is recorded, to reload the campaign. */
  onEnded: () => void;
};

/**
 * The GM's half of End of Session: answer the three group questions for
 * everyone, with a reason for each "yes". Players then report their own
 * alignment and bonds, and each "yes" here is worth 1 XP to them.
 */
export const EndOfSessionDialog: FC<EndOfSessionDialogProps> = ({
  campaignId,
  isOpen,
  onClose,
  onEnded,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [learned, setLearned] = useState(UNCHECKED);
  const [looted, setLooted] = useState(UNCHECKED);
  const [overcame, setOvercame] = useState(UNCHECKED);
  const [endSession, { loading }] = useMutation(END_SESSION_MUTATION);

  const incomplete = [learned, looted, overcame].some(needsReason);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      await endSession({
        variables: { id: campaignId, input: { learned, looted, overcame } },
      });
      setLearned(UNCHECKED);
      setLooted(UNCHECKED);
      setOvercame(UNCHECKED);
      onEnded();
      onClose();
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        aria-label="End of Session"
        className="flex flex-col max-w-2xl space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl">End of Session</h2>
        <p className="text-gray-400 text-sm" role="note">
          This can&apos;t be undone. XP can still be marked or unmarked on each
          sheet afterwards.
        </p>
        <p>
          Answer as a group. Each &quot;yes&quot; is 1 XP for every character.
          Players then report their alignment and bonds. Any report still open
          for the previous session closes.
        </p>
        <CheckedReasonField
          label="Did we learn something new and important about the world?"
          onChange={setLearned}
          reasonLabel="Why we learned something"
          value={learned}
        />
        <CheckedReasonField
          label="Did we overcome a notable monster or enemy?"
          onChange={setOvercame}
          reasonLabel="Why we overcame an enemy"
          value={overcame}
        />
        <CheckedReasonField
          label="Did we loot a memorable treasure?"
          onChange={setLooted}
          reasonLabel="Why we looted a treasure"
          value={looted}
        />
        {incomplete && (
          <p className="text-yellow-400">
            Write a reason for each checked item.
          </p>
        )}
        <ErrorList errors={errors} />
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button disabled={loading || incomplete} type="submit">
            End Session
          </Button>
        </div>
      </form>
    </Modal>
  );
};
