"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { BondDraft, BondFields } from "@/components/BondFields";
import { Button } from "@/components/Button";
import { CheckedReasonField } from "@/components/CheckedReasonField";
import { Dropdown } from "@/components/Dropdown";
import { ErrorList } from "@/components/ErrorList";
import { Modal } from "@/components/Modal";
import { CampaignCharacterFragment } from "@/fragments/CampaignCharacterFragment";
import { FragmentType, graphql, unmaskFragment } from "@/gql";
import { CheckedReason, endOfSessionXp, needsReason } from "@/lib/campaigns";
import { capitalize } from "@/lib/capitalize";
import { errorMessages } from "@/lib/errorMessages";

const SUBMIT_SESSION_REPORT_MUTATION = graphql(`
  mutation SubmitSessionReport($id: ID!, $input: SessionReportInput!) {
    characters {
      submitSessionReport(id: $id, input: $input) {
        ...CampaignCharacterFragment
      }
    }
  }
`);

const GROUP_QUESTIONS = [
  ["learned", "Did we learn something new and important about the world?"],
  ["overcame", "Did we overcome a notable monster or enemy?"],
  ["looted", "Did we loot a memorable treasure?"],
] as const;

const UNCHECKED: CheckedReason = { checked: false, reason: "" };

export type SessionReportDialogProps = {
  /** The player's character, with a pending session to report on. */
  character: FragmentType<typeof CampaignCharacterFragment>;
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when the dialog closes, by cancelling or after submitting. */
  onClose: () => void;
  /** Called after the report is saved, for pages showing the session log. */
  onSubmitted?: () => void;
};

/**
 * A player's End of Session: the GM's group answers, then whether they
 * fulfilled their alignment and resolved a bond (writing a new one). Each
 * checked item needs a reason. The API marks the XP when it's submitted.
 */
export const SessionReportDialog: FC<SessionReportDialogProps> = ({
  character: characterRef,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const character = unmaskFragment(CampaignCharacterFragment, characterRef);
  const session = character.pendingSession;

  const [alignment, setAlignment] = useState(UNCHECKED);
  const [bond, setBond] = useState(UNCHECKED);
  const [errors, setErrors] = useState<string[]>([]);
  const [replacement, setReplacement] = useState<BondDraft>({
    targetId: "",
    text: "",
  });
  const [resolvedBondId, setResolvedBondId] = useState("");
  const [submitReport, { loading }] = useMutation(
    SUBMIT_SESSION_REPORT_MUTATION,
  );

  if (!session) return null;

  const groupYes = GROUP_QUESTIONS.filter(
    ([key]) => session[key].checked,
  ).length;
  const xp = endOfSessionXp(groupYes, alignment.checked, bond.checked);
  const targets = (character.campaign?.characters ?? []).filter(
    (c) => c.id !== character.id,
  );
  const incomplete =
    needsReason(alignment) ||
    needsReason(bond) ||
    (bond.checked &&
      (!resolvedBondId ||
        !replacement.targetId ||
        replacement.text.trim() === ""));

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      await submitReport({
        variables: {
          id: character.id,
          input: {
            alignment,
            bondReason: bond.checked ? bond.reason : null,
            replacementBond: bond.checked ? replacement : null,
            resolvedBondId: bond.checked ? resolvedBondId : null,
            sessionId: session.id,
          },
        },
      });
      setAlignment(UNCHECKED);
      setBond(UNCHECKED);
      setReplacement({ targetId: "", text: "" });
      setResolvedBondId("");
      onSubmitted?.();
      onClose();
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        aria-label="End of Session report"
        className="flex flex-col max-w-2xl space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl">
          End of Session {session.number}: {character.name}
        </h2>

        <section>
          <h3 className="font-semibold">The group&apos;s answers</h3>
          <ul>
            {GROUP_QUESTIONS.map(([key, question]) => (
              <li key={key}>
                {session[key].checked ? "Yes" : "No"}: {question}
              </li>
            ))}
          </ul>
        </section>

        <CheckedReasonField
          label={
            <>
              I fulfilled my alignment ({capitalize(character.alignmentType)}:{" "}
              {character.alignmentDescription})
            </>
          }
          onChange={setAlignment}
          reasonLabel="Alignment reason"
          value={alignment}
        />

        {character.bonds.length > 0 && (
          <div className="flex flex-col gap-2">
            <CheckedReasonField
              label="I resolved a bond"
              onChange={setBond}
              reasonLabel="Bond reason"
              value={bond}
            />
            {bond.checked && (
              <div className="flex flex-col gap-2 ml-6">
                <Dropdown
                  aria-label="Resolved bond"
                  items={character.bonds.map((b) => ({
                    label: b.text,
                    value: b.id,
                  }))}
                  onChange={(ev) => setResolvedBondId(ev.target.value)}
                  placeholder="Which bond?"
                  required
                  value={resolvedBondId}
                />
                <p>Write a new bond in its place:</p>
                <BondFields
                  onChange={setReplacement}
                  targets={targets}
                  templates={character.characterClass.bonds}
                  value={replacement}
                />
              </div>
            )}
          </div>
        )}

        <p role="status">You&apos;ll mark {xp} XP.</p>
        {incomplete && (
          <p className="text-yellow-400">
            Write a reason for each checked item
            {bond.checked && ", and choose the bond and its replacement"}.
          </p>
        )}
        <ErrorList errors={errors} />
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button disabled={loading || incomplete} type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
