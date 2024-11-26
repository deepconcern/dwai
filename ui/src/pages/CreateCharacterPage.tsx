import { useMutation, useSuspenseQuery } from "@apollo/client";
import { ChangeEvent, FC, FormEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Form } from "../components/Form";
import { Page } from "../components/Page";
import { TextInput } from "../components/TextInput";
import { graphql } from "../gql";
import { Theme } from "@emotion/react";
import { Select } from "../components/Select";

const CREATE_CHARACTER_MUTATION = graphql(`
  mutation CreateCharacter($input: CreateCharacterInput!) {
    character {
      create(input: $input) {
        characterClass {
          id
          name
        }
        id
        name
      }
    }
  }
`);

const GET_CHARACTER_CLASSES_QUERY = graphql(`
  query GetCharacterClasses {
    characterClass {
      all {
        id
        name
      }
    }
  }
`);

const FIELD_CSS = (theme: Theme) => ({ marginBottom: theme.spacing[4] });

function validateCharacterClass(characterClassId: unknown) {
  if (typeof characterClassId !== "string") return false;

  return characterClassId.length > 0;
}

function validateName(name: unknown) {
  if (typeof name !== "string") return false;

  return name.length > 3;
}

export const CreateCharacterPage: FC = () => {
  const navigate = useNavigate();

  const { data } = useSuspenseQuery(GET_CHARACTER_CLASSES_QUERY);

  const [createCharacter] = useMutation(CREATE_CHARACTER_MUTATION);

  const [characterClassId, setCharacterClassId] = useState<string>("");
  const [name, setName] = useState("");

  const validity = (() => {
    if (!validateName(name)) return false;
    if (!validateCharacterClass(characterClassId)) return false;

    return true;
  })();

  const handleCharacterClassChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      setCharacterClassId(ev.target.value);
    },
    [setCharacterClassId]
  );

  const handleCreate = useCallback(
    (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      if (!validity) return;

      createCharacter({
        variables: {
          input: {
            characterClassId,
            name,
          },
        },
      }).then(({ data }) => {
        if (!data) {
          // TODO better handling
          navigate("/");
          return;
        }

        navigate(`/character/${data?.character.create.id}`);
      });
    },
    [createCharacter, characterClassId, name, navigate, validity]
  );

  const handleNameChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setName(ev.target.value);
    },
    [setName]
  );

  return (
    <Page
      css={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing[4],
      })}
      title="Create Character"
    >
      <Form onSubmit={handleCreate}>
        <Field css={FIELD_CSS}>
          <label htmlFor="create-character-name">Name</label>
          <TextInput
            id="create-character-name"
            onChange={handleNameChange}
            validate={validateName}
            value={name}
          />
        </Field>
        <Field css={FIELD_CSS}>
          <label htmlFor="create-character-class">Class</label>
          <Select
            items={data.characterClass.all.map((c) => ({
              key: c.id,
              label: c.name,
            }))}
            onChange={handleCharacterClassChange}
            placeholder="Select a class"
            value={characterClassId!}
          />
        </Field>
        <Button disabled={!validity}>Create</Button>
      </Form>
    </Page>
  );
};
