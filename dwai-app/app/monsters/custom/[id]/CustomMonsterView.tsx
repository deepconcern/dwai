"use client";

import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { MonsterStatBlock } from "@/components/MonsterStatBlock";
import { PageTitle } from "@/components/PageTitle";
import { graphql } from "@/gql";
import { MonsterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";
import { MonsterInputValue, monsterFormState } from "@/lib/monsters";

import { GET_MONSTERS_QUERY } from "../../GET_MONSTERS_QUERY";
import { MonsterForm } from "../../MonsterForm";

const UPDATE_CUSTOM_MONSTER_MUTATION = graphql(`
  mutation UpdateCustomMonster($id: ID!, $input: MonsterInput!) {
    monsters {
      updateCustom(id: $id, input: $input) {
        id
      }
    }
  }
`);

const DELETE_CUSTOM_MONSTER_MUTATION = graphql(`
  mutation DeleteCustomMonster($id: ID!) {
    monsters {
      deleteCustom(id: $id)
    }
  }
`);

export type CustomMonsterViewProps = {
  monster: MonsterFragmentFragment;
  tagSuggestions: readonly string[];
};

/**
 * A custom monster's stat block, with Edit and Delete. Deleting can't be
 * undone, so it asks first; copies already in play keep their stat block.
 */
export const CustomMonsterView: FC<CustomMonsterViewProps> = ({
  monster,
  tagSuggestions,
}) => {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const refetch = { refetchQueries: [getOperationName(GET_MONSTERS_QUERY)] };
  const [updateCustom] = useMutation(UPDATE_CUSTOM_MONSTER_MUTATION, refetch);
  const [deleteCustom, { loading: deleting }] = useMutation(
    DELETE_CUSTOM_MONSTER_MUTATION,
    refetch,
  );

  const handleSave = async (input: MonsterInputValue) => {
    await updateCustom({ variables: { id: monster.id, input } });
    setEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setErrors([]);
    try {
      await deleteCustom({ variables: { id: monster.id } });
      router.push("/monsters?tab=mine");
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col p-4 space-y-4">
        <PageTitle title={`Edit ${monster.name}`} />
        <MonsterForm
          initial={monsterFormState(monster)}
          onCancel={() => setEditing(false)}
          onSubmit={handleSave}
          submitLabel="Save Changes"
          tagSuggestions={tagSuggestions}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 space-y-4">
      <PageTitle title={monster.name} />
      <p className="text-gray-400">
        My monster
        {monster.sourceKey && (
          <>
            {" "}
            · copied from{" "}
            <Link
              className="hover:underline"
              href={`/monsters/${monster.sourceKey}`}
            >
              the compendium
            </Link>
          </>
        )}
      </p>
      <MonsterStatBlock monster={monster} />
      <div className="flex gap-2">
        <Button onClick={() => setEditing(true)}>Edit</Button>
        <Button
          className="bg-red-600"
          onClick={() => setConfirmingDelete(true)}
        >
          Delete
        </Button>
        <Link className="hover:underline py-2" href="/monsters?tab=mine">
          Back to My Monsters
        </Link>
      </div>
      {confirmingDelete && (
        <div
          aria-label="Are you sure?"
          className="border border-red-500 flex flex-col gap-2 p-2 rounded"
          role="alertdialog"
        >
          <p>
            Are you sure? This deletes {monster.name} from your monsters. It
            can&apos;t be undone. Copies already in play in your campaigns keep
            their stat block.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            <Button
              className="bg-red-600"
              disabled={deleting}
              onClick={handleDelete}
            >
              Yes, delete {monster.name}
            </Button>
          </div>
        </div>
      )}
      <ErrorList errors={errors} />
    </div>
  );
};
