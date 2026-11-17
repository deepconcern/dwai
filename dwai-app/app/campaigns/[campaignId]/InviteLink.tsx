"use client";

import { useMutation } from "@apollo/client/react";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { graphql } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";

const REGENERATE_INVITE_CODE_MUTATION = graphql(`
  mutation RegenerateInviteCode($id: ID!) {
    campaigns {
      regenerateInviteCode(id: $id) {
        id
        inviteCode
      }
    }
  }
`);

export type InviteLinkProps = {
  campaignId: string;
  /** The campaign's current invite code. */
  code: string;
};

/**
 * The GM's invite link, with buttons to copy it and to replace it (which
 * stops the old link working).
 */
export const InviteLink: FC<InviteLinkProps> = ({ campaignId, code }) => {
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [regenerate, { loading }] = useMutation(
    REGENERATE_INVITE_CODE_MUTATION,
  );

  const path = `/join/${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.origin + path);
    setCopied(true);
  };

  const handleRegenerate = async () => {
    setErrors([]);
    setCopied(false);
    try {
      await regenerate({ variables: { id: campaignId } });
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Section title="Invite Players">
      <div className="flex flex-col space-y-2">
        <p>Share this link. Players log in and pick a character to join.</p>
        <div className="flex flex-wrap gap-2 items-center">
          <code aria-label="Invite link" className="border px-2 py-1 rounded">
            {path}
          </code>
          <Button onClick={handleCopy}>{copied ? "Copied" : "Copy"}</Button>
          <Button disabled={loading} onClick={handleRegenerate}>
            New Link
          </Button>
        </div>
        <ErrorList errors={errors} />
      </div>
    </Section>
  );
};
