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

const CREATE_CAMPAIGN_MUTATION = graphql(`
  mutation CreateCampaign($input: CampaignInput!) {
    campaigns {
      create(input: $input) {
        id
      }
    }
  }
`);

/** Starts a campaign, with the user as its GM, and opens it. */
export const CreateCampaignForm: FC = () => {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [createCampaign, { loading }] = useMutation(CREATE_CAMPAIGN_MUTATION);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      const { data } = await createCampaign({
        variables: { input: { description, name } },
      });
      if (data) router.push(`/campaigns/${data.campaigns.create.id}`);
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Section title="Start a Campaign">
      <form
        aria-label="Start a campaign"
        className="flex flex-col gap-2"
        onSubmit={handleSubmit}
      >
        <TextInput
          aria-label="Campaign name"
          maxLength={100}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="Name"
          required
          value={name}
        />
        <textarea
          aria-label="Description"
          className="border px-3 py-2 rounded"
          maxLength={2000}
          onChange={(ev) => setDescription(ev.target.value)}
          placeholder="Description (optional)"
          rows={3}
          value={description}
        />
        <ErrorList errors={errors} />
        <div>
          <Button disabled={loading} type="submit">
            Start Campaign
          </Button>
        </div>
      </form>
    </Section>
  );
};
