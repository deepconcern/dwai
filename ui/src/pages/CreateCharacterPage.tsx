import { useMutation, useSuspenseQuery } from "@apollo/client";
import {
  ChangeEvent,
  FC,
  FormEvent,
  MouseEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { AlignmentModal } from "../components/AlignmentModel";
import { Button } from "../components/Button";
import { ChooseMoveModal } from "../components/ChooseMoveModal";
import { Container } from "../components/Container";
import { DefinitionList } from "../components/DefinitionList";
import { Field } from "../components/Field";
import { Form } from "../components/Form";
import { Page } from "../components/Page";
import { TextInput } from "../components/TextInput";
import { Select } from "../components/Select";
import { getFragmentData, graphql } from "../gql";
import { Alignment, AttributeType } from "../gql/graphql";
import { ATTRIBUTES, getModifier, STANDARD_ARRAY } from "../lib/attributes";
import { capitalize } from "../lib/capitalize";
import { GENERIC_FLOW_CSS, NESTED_FLOW_CSS } from "../lib/styles";
import {
  FULL_CHARACTER_CLASS,
  GET_CHARACTER_CLASSES_QUERY,
  SHORT_MOVE_TEMPLATE,
} from "../queries";

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

function validateScore(score: unknown): score is number {
  const scoreNumber = Number(score);

  if (!Number.isFinite(scoreNumber)) return false;

  return scoreNumber > 0;
}

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

  const [alignment, setAlignment] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const [attributes, setAttributes] = useState<{
    [key in AttributeType]: number | null;
  }>({
    [AttributeType.Charisma]: null,
    [AttributeType.Constitution]: null,
    [AttributeType.Dexterity]: null,
    [AttributeType.Intelligence]: null,
    [AttributeType.Strength]: null,
    [AttributeType.Wisdom]: null,
  });
  const [isAlignmentModalOpen, setAlignmentModalOpen] = useState(false);
  const [characterClassId, setCharacterClassId] = useState<string>("");
  const [name, setName] = useState("");
  const [isRaceMoveModalOpen, setRaceMoveModalOpen] = useState(false);
  const [isStartingMoveModalOpen, setStartingMoveModalOpen] = useState(false);
  const [selectedRaceMoveId, setSelectedRaceMoveId] = useState<string | null>(
    null
  );
  const [selectedStartingMoveId, setSelectedStartingMoveId] = useState<
    string | null
  >(null);

  const usedAttributes = useMemo(
    () => new Set(Object.values(attributes)),
    [attributes]
  );

  const attributeItems = useMemo(
    () =>
      STANDARD_ARRAY.map((a) => ({
        disabled: usedAttributes.has(a),
        key: a.toString(),
        label: a.toString(),
      })),
    [usedAttributes]
  );

  const characterClass = useMemo(() => {
    return (
      data.characterClass.all
        .map((c) => getFragmentData(FULL_CHARACTER_CLASS, c))
        .find((c) => c.id === characterClassId) || null
    );
  }, [characterClassId, data]);

  const selectedRaceMove = useMemo(() => {
    if (!characterClass) return null;
    if (!selectedRaceMoveId) return null;

    return (
      characterClass.raceMoves
        .map((r) => getFragmentData(SHORT_MOVE_TEMPLATE, r))
        .find((r) => r.id === selectedRaceMoveId) || null
    );
  }, [characterClass, selectedRaceMoveId]);

  const strengthModifier = useMemo(() => {
    if (attributes[AttributeType.Strength] === null) return null;

    return getModifier(attributes[AttributeType.Strength]);
  }, [attributes]);

  const maxWeight = useMemo(() => {
    if (strengthModifier === null) return null;
    if (!characterClass) return null;

    return characterClass.weightBase + strengthModifier;
  }, [characterClass, strengthModifier]);

  const validity = useMemo(() => {
    for (const attributeType of ATTRIBUTES) {
      if (!validateScore(attributes[attributeType])) return false;
    }
    if (alignment === null) return false;
    if (!validateCharacterClass(characterClassId)) return false;
    if (!validateName(name)) return false;
    if (selectedRaceMove === null) return false;

    return true;
  }, [alignment, attributes, characterClassId, name, selectedRaceMove]);

  const handleAlignmentClose = useCallback(() => {
    setAlignmentModalOpen(false);
  }, [setAlignmentModalOpen]);

  const handleAlignmentOpen = useCallback(
    (ev: MouseEvent<HTMLElement>) => {
      ev.preventDefault();

      setAlignmentModalOpen(true);
    },
    [setAlignmentModalOpen]
  );

  const handleAlignmentSubmit = useCallback(
    (newAlignment: Pick<Alignment, "name" | "text">) => {
      setAlignment(newAlignment);
      setAlignmentModalOpen(false);
    },
    [setAlignment, setAlignmentModalOpen]
  );

  const handleAttributeChange = useCallback(
    (type: AttributeType) => (ev: ChangeEvent<HTMLSelectElement>) => {
      setAttributes((a) => ({
        ...a,
        [type]: ev.target.value === "" ? null : Number(ev.target.value),
      }));
    },
    [setAttributes]
  );

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
            attributes: ATTRIBUTES.map((a) => ({
              score: attributes[a]!,
              type: a,
            })),
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
    [attributes, createCharacter, characterClassId, name, navigate, validity]
  );

  const handleNameChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setName(ev.target.value);
    },
    [setName]
  );

  const handleRaceMoveClose = useCallback(() => {
    setRaceMoveModalOpen(false);
  }, [setRaceMoveModalOpen]);

  const handleRaceMoveOpen = useCallback(
    (ev: MouseEvent<HTMLElement>) => {
      ev.preventDefault();

      setRaceMoveModalOpen(true);
    },
    [setRaceMoveModalOpen]
  );

  const handleRaceMoveSubmit = useCallback(
    (newRaceMoveIds: string[]) => {
      setSelectedRaceMoveId(newRaceMoveIds[0]);
      setRaceMoveModalOpen(false);
    },
    [setRaceMoveModalOpen, setSelectedRaceMoveId]
  );

  const handleStartingMoveClose = useCallback(() => {
    setStartingMoveModalOpen(false);
  }, [setStartingMoveModalOpen]);

  const handleStartingMoveOpen = useCallback(
    (ev: MouseEvent<HTMLElement>) => {
      ev.preventDefault();

      setStartingMoveModalOpen(true);
    },
    [setStartingMoveModalOpen]
  );

  const handleStartingMoveSubmit = useCallback(
    (newStartingMoveIds: string[]) => {
      setSelectedStartingMoveId(newStartingMoveIds[0]);
      setStartingMoveModalOpen(false);
    },
    [setStartingMoveModalOpen, setSelectedStartingMoveId]
  );

  return (
    <Page title="Create Character">
      <Form css={GENERIC_FLOW_CSS} onSubmit={handleCreate}>
        <Field>
          <label htmlFor="create-character-name">Name</label>
          <TextInput
            id="create-character-name"
            onChange={handleNameChange}
            validate={validateName}
            value={name}
          />
        </Field>
        <Field>
          <label htmlFor="create-character-class">Class</label>
          <Select
            items={data.characterClass.all.map((c) => ({
              key: getFragmentData(FULL_CHARACTER_CLASS, c).id,
              label: getFragmentData(FULL_CHARACTER_CLASS, c).name,
            }))}
            onChange={handleCharacterClassChange}
            placeholder="Select a class"
            validate={validateCharacterClass}
            value={characterClassId!}
          />
        </Field>
        <Field>
          <div
            css={(theme) => ({
              display: "grid",
              gap: theme.spacing[2],
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              marginBottom: theme.spacing[2],
            })}
          >
            {ATTRIBUTES.map((type) => (
              <div key={type}>
                <label>{capitalize(type)}</label>
                <Select
                  items={attributeItems}
                  onChange={handleAttributeChange(type)}
                  placeholder="Pick a number"
                  validate={validateScore}
                  value={attributes[type]?.toString() || ""}
                />
              </div>
            ))}
          </div>
        </Field>
        {!characterClass && <p>Pick a character class to continue...</p>}
        {characterClass && (
          <>
            <Field css={NESTED_FLOW_CSS}>
              <label>Basic Info</label>
              <Container>
                {(() => {
                  const constitution = attributes[AttributeType.Constitution];

                  const hpValue = constitution
                    ? constitution + characterClass.hpBase
                    : "?";

                  return (
                    <>
                      <p>
                        HP: CONSTUTION ({constitution || "?"}) +{" "}
                        {characterClass.hpBase} = {hpValue}
                      </p>
                      <p>Damage Die: d{characterClass.damageDie}</p>
                    </>
                  );
                })()}
              </Container>
            </Field>
            <Field css={NESTED_FLOW_CSS}>
              <label htmlFor="create-character-alignment">Alignment</label>
              <Container>
                {!alignment && <p>No alignment chosen.</p>}
                {alignment && (
                  <p>
                    {alignment.name}: {alignment.text}
                  </p>
                )}
              </Container>
              <div>
                <Button onClick={handleAlignmentOpen}>Change Alignment</Button>
              </div>
            </Field>
            <Field css={NESTED_FLOW_CSS}>
              <label htmlFor="create-character-race">Race</label>
              <Container>
                {!selectedRaceMove && <p>No race chosen.</p>}
                {selectedRaceMove && (
                  <DefinitionList
                    items={[
                      {
                        definition: selectedRaceMove.text,
                        key: selectedRaceMove.id,
                        term: selectedRaceMove.name,
                      },
                    ]}
                  />
                )}
              </Container>
              <div>
                <Button onClick={handleRaceMoveOpen}>Change Race</Button>
              </div>
            </Field>
            <Field css={NESTED_FLOW_CSS}>
              <label htmlFor="create-character-race">Starting Moves</label>
              {characterClass.pickableStartingMoves.length > 0 && (
                <Container title="Picked Starting Moves">
                  {!selectedStartingMoveId && <p>Pick extra starting moves.</p>}
                  {selectedStartingMoveId && (
                    <DefinitionList
                      items={characterClass.pickableStartingMoves
                        .map((s) => getFragmentData(SHORT_MOVE_TEMPLATE, s))
                        .filter((s) => s.id === selectedStartingMoveId)
                        .map((startingMove) => ({
                          definition: startingMove.text,
                          key: startingMove.id,
                          term: startingMove.name,
                        }))}
                    />
                  )}
                  <Button onClick={handleStartingMoveOpen}>
                    Pick starting moves
                  </Button>
                </Container>
              )}
              <Container title="Default Starting Moves">
                <DefinitionList
                  items={characterClass.defaultStartingMoves.map((s) => {
                    const startingMove = getFragmentData(
                      SHORT_MOVE_TEMPLATE,
                      s
                    );

                    return {
                      definition: startingMove.text,
                      key: startingMove.id,
                      term: startingMove.name,
                    };
                  })}
                />
              </Container>
            </Field>
            <Field css={NESTED_FLOW_CSS}>
              <label htmlFor="create-character-starting-equipment">
                Starting Equipment
              </label>
              <Container>
                Current Load: 0/{maxWeight || "?"} (STR +{" "}
                {characterClass.weightBase})
              </Container>
              <Container title="Picked Starting Gear">
                TODO
              </Container>
              <Container title="Default Starting Gear">
                TODO
              </Container>
              <div>
                <Button onClick={handleRaceMoveOpen}>Change Race</Button>
              </div>
            </Field>
            <AlignmentModal
              characterClass={characterClass}
              onClose={handleAlignmentClose}
              onSubmit={handleAlignmentSubmit}
              open={isAlignmentModalOpen}
            />
            <ChooseMoveModal
              defaultValues={selectedRaceMoveId ? [selectedRaceMoveId] : null}
              onClose={handleRaceMoveClose}
              onSubmit={handleRaceMoveSubmit}
              open={isRaceMoveModalOpen}
              selectableMoves={characterClass.raceMoves}
            />
            <ChooseMoveModal
              defaultValues={
                selectedStartingMoveId ? [selectedStartingMoveId] : null
              }
              onClose={handleStartingMoveClose}
              onSubmit={handleStartingMoveSubmit}
              open={isStartingMoveModalOpen}
              selectableMoves={characterClass.pickableStartingMoves}
            />
          </>
        )}
        <div>
          <Button disabled={!validity}>Create</Button>
        </div>
      </Form>
    </Page>
  );
};
