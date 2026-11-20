"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { FC } from "react";

import { graphql } from "@/gql";
import { getOperationName } from "@/lib/getOperationName";
import { MonsterFormState, MonsterInputValue } from "@/lib/monsters";

import { GET_MONSTERS_QUERY } from "../GET_MONSTERS_QUERY";
import { MonsterForm } from "../MonsterForm";

const CREATE_CUSTOM_MONSTER_MUTATION = graphql(`
  mutation CreateCustomMonster($input: MonsterInput!) {
    monsters {
      createCustom(input: $input) {
        id
      }
    }
  }
`);

export type NewMonsterFormProps = {
  initial: MonsterFormState;
  tagSuggestions: readonly string[];
};

/** Saves a new custom monster, then opens it. */
export const NewMonsterForm: FC<NewMonsterFormProps> = ({
  initial,
  tagSuggestions,
}) => {
  const router = useRouter();
  const [createCustom] = useMutation(CREATE_CUSTOM_MONSTER_MUTATION, {
    refetchQueries: [getOperationName(GET_MONSTERS_QUERY)],
  });

  const handleSubmit = async (input: MonsterInputValue) => {
    const { data } = await createCustom({ variables: { input } });
    if (data) router.push(`/monsters/custom/${data.monsters.createCustom.id}`);
  };

  return (
    <MonsterForm
      initial={initial}
      onCancel={() => router.back()}
      onSubmit={handleSubmit}
      submitLabel="Save Monster"
      tagSuggestions={tagSuggestions}
    />
  );
};
