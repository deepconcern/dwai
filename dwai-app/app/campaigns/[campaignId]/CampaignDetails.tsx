"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";

import { CampaignData } from "./types";

const UPDATE_CAMPAIGN_MUTATION = graphql(`
  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {
    campaigns {
      update(id: $id, input: $input) {
        description
        id
        name
      }
    }
  }
`);

const DELETE_CAMPAIGN_MUTATION = graphql(`
  mutation DeleteCampaign($id: ID!) {
    campaigns {
      delete(id: $id)
    }
  }
`);

export type CampaignDetailsProps = {
  campaign: Pick<CampaignData, "description" | "id" | "isGm" | "name">;
};

/**
 * The campaign's description. The GM can edit the name and description, and
 * delete the campaign (its characters are kept).
 */
export const CampaignDetails: FC<CampaignDetailsProps> = ({ campaign }) => {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [description, setDescription] = useState(campaign.description);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState(campaign.name);

  const [deleteCampaign, { loading: deleting }] = useMutation(
    DELETE_CAMPAIGN_MUTATION,
  );
  const [updateCampaign, { loading: saving }] = useMutation(
    UPDATE_CAMPAIGN_MUTATION,
  );

  const handleSave: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      await updateCampaign({
        variables: { id: campaign.id, input: { description, name } },
      });
      setEditing(false);
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  const handleDelete = async () => {
    setErrors([]);
    try {
      await deleteCampaign({ variables: { id: campaign.id } });
      router.push("/campaigns");
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  const handleEdit = () => {
    setDescription(campaign.description);
    setName(campaign.name);
    setEditing(true);
  };

  if (editing) {
    return (
      <Section title="Campaign Details">
        <form
          aria-label="Edit campaign"
          className="flex flex-col gap-2"
          onSubmit={handleSave}
        >
          <TextInput
            aria-label="Campaign name"
            maxLength={100}
            onChange={(ev) => setName(ev.target.value)}
            required
            value={name}
          />
          <textarea
            aria-label="Description"
            className="border px-3 py-2 rounded"
            maxLength={2000}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={3}
            value={description}
          />
          <ErrorList errors={errors} />
          <div className="flex gap-2">
            <Button disabled={saving} type="submit">
              Save
            </Button>
            <Button onClick={() => setEditing(false)} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </Section>
    );
  }

  return (
    <Section title="Campaign Details">
      <div className="flex flex-col space-y-2">
        <p className="whitespace-pre-wrap">
          {campaign.description || "No description."}
        </p>
        {campaign.isGm && (
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={handleEdit}>Edit</Button>
            {confirmingDelete ? (
              <>
                <span>
                  Delete this campaign? Characters are kept, but bonds and
                  sessions are lost.
                </span>
                <Button disabled={deleting} onClick={handleDelete}>
                  Yes, delete
                </Button>
                <Button onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setConfirmingDelete(true)}>
                Delete Campaign
              </Button>
            )}
          </div>
        )}
        <ErrorList errors={errors} />
      </div>
    </Section>
  );
};
