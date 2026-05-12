"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, ChangeEvent } from "react";

import { graphql } from "@/gql";
import { Ability } from "@/gql/graphql";
import { PageTitle } from "@/components/PageTitle";
import { Dropdown } from "@/components/Dropdown";
import { capitalize } from "@/lib/capitalize";
import { Button } from "@/components/Button";
import { SectionTitle } from "@/components/SectionTitle";
import { MoveCard } from "@/components/MoveCard";
import { SelectableArea } from "@/components/SelectableArea";
import clsx from "clsx";

const ABILITY_LABELS: { ability: Ability; label: string }[] = [
  { ability: "STRENGTH", label: "Strength" },
  { ability: "DEXTERITY", label: "Dexterity" },
  { ability: "CONSTITUTION", label: "Constitution" },
  { ability: "INTELLIGENCE", label: "Intelligence" },
  { ability: "WISDOM", label: "Wisdom" },
  { ability: "CHARISMA", label: "Charisma" },
];

const ATTRIBUTE_SCORES = [16, 15, 13, 12, 9, 8];

function calculateModifier(score: number): number {
  if (score > 17) return 3;
  if (score > 15) return 2;
  if (score > 12) return 1;
  if (score > 8) return 0;
  if (score > 5) return -1;
  if (score > 3) return -2;
  return -3;
}

function formatScore(score: number): string {
  const mod = calculateModifier(score);
  return `${score} (${mod >= 0 ? "+" : ""}${mod})`;
}

const GET_CHARACTER_CLASSES_QUERY = graphql(`
  query GetCharacterClassesForCreate {
    characterClasses {
      all {
        alignmentTemplates {
          alignment
          description
        }
        bonds
        damageDie
        hpBase
        key
        lookExamples {
          examples
          type
        }
        name
        raceMoves {
          key
          ...MoveFragment
        }
        startingMoves {
          key
          ...MoveFragment
        }
      }
    }
  }
`);

const CREATE_CHARACTER_MUTATION = graphql(`
  mutation CreateCharacter($input: CreateCharacterInput!) {
    characters {
      create(input: $input) {
        id
        name
      }
    }
  }
`);

type AbilityScoreEntry = { ability: Ability; score: number | null };
type LookEntry = { lookTypeKey: string; value: string };

export default function CreateCharacterPage() {
  const router = useRouter();

  const [abilityScores, setAbilityScores] = useState<AbilityScoreEntry[]>(
    ABILITY_LABELS.map(({ ability }) => ({ ability, score: null })),
  );
  const [alignmentType, setAlignmentType] = useState("");
  const [alignmentDescription, setAlignmentDescription] = useState("");
  const [characterClassKey, setCharacterClassKey] = useState("");
  const [looks, setLooks] = useState<LookEntry[]>([]);
  const [name, setName] = useState("");
  const [raceKey, setRaceKey] = useState("");

  const { data: characterClassesData, loading: classesLoading } = useQuery(
    GET_CHARACTER_CLASSES_QUERY,
  );
  const [createCharacter] = useMutation(CREATE_CHARACTER_MUTATION);

  const characterClass = characterClassesData?.characterClasses.all.find(
    (c) => c.key === characterClassKey,
  );

  const conScore = abilityScores.find(
    (a) => a.ability === "CONSTITUTION",
  )?.score;
  const hitPoints =
    characterClass && typeof conScore === "number"
      ? conScore + characterClass.hpBase
      : null;

  const handleAddLook = useCallback(() => {
    const firstType = characterClass?.lookExamples[0]?.type ?? "";
    setLooks((prev) => [...prev, { lookTypeKey: firstType, value: "" }]);
  }, [characterClass]);

  const handleAlignmentDescriptionChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) =>
      setAlignmentDescription(ev.target.value),
    [setAlignmentDescription],
  );

  const handleAlignmentTemplateClick = useCallback(
    (i: number) => () => {
      const template = characterClass?.alignmentTemplates[i];
      if (template) {
        setAlignmentDescription(template.description);
        setAlignmentType(template.alignment.toLocaleLowerCase());
      }
    },
    [characterClass, setAlignmentDescription, setAlignmentType],
  );

  const handleAlignmentTypeChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => setAlignmentType(ev.target.value),
    [setAlignmentType],
  );

  const handleCharacterClassChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) =>
      setCharacterClassKey(ev.target.value),
    [setCharacterClassKey],
  );

  const handleCreate = useCallback(async () => {
    const abilities = abilityScores
      .filter((a) => a.score !== null)
      .map((a) => ({ ability: a.ability, score: a.score as number }));

    const { data } = await createCharacter({
      variables: { input: { abilities, looks, name } },
    });

    if (data) {
      router.push(`/character/${data.characters.create.id}`);
    }
  }, [abilityScores, createCharacter, looks, name, router]);

  const handleRemoveLook = useCallback((i: number) => {
    setLooks((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const handleLookTypeChange = useCallback((i: number, type: string) => {
    setLooks((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, lookTypeKey: type } : l)),
    );
  }, []);

  const handleLookValueChange = useCallback((i: number, value: string) => {
    setLooks((prev) => prev.map((l, idx) => (idx === i ? { ...l, value } : l)));
  }, []);

  const handleScoreChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const { ability } = ev.target.dataset;
      if (!ability) return;

      const score = ev.target.value ? parseInt(ev.target.value, 10) : null;

      setAbilityScores((prev) =>
        prev.map((a) => (a.ability === ability ? { ...a, score } : a)),
      );
    },
    [],
  );

  if (classesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PageTitle title="Create Character" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="space-y-8"
      >
        {/* Name + Class */}
        <div className="flex gap-4">
          <div className="flex-2">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Class</label>
            <Dropdown
              items={
                characterClassesData?.characterClasses.all.map((c) => ({
                  label: c.name,
                  value: c.key,
                })) || []
              }
              onChange={handleCharacterClassChange}
              placeholder="Select a class..."
              value={characterClassKey}
            />
          </div>
        </div>

        {characterClass && (
          <>
            {/* Stats summary */}
            <div className="bg-gray-900 border flex gap-6 px-4 py-3 rounded text-sm">
              <span>
                Hit Points: {hitPoints ?? "—"} (CON + {characterClass.hpBase})
              </span>
              <span>Damage Die: d{characterClass.damageDie}</span>
              <span>Armor: 0</span>
            </div>

            {/* Looks + Ability Scores */}
            <div className="grid grid-cols-2 gap-8">
              <section>
                <SectionTitle title="Looks" />
                <p>Pick as many looks as you like:</p>
                <div className="space-y-2">
                  {looks.map((look, i) => {
                    const examples =
                      characterClass.lookExamples.find(
                        (e) => e.type === look.lookTypeKey,
                      )?.examples ?? [];
                    return (
                      <div key={i} className="flex gap-2 items-center">
                        <Dropdown
                          items={characterClass.lookExamples.map((l) => ({
                            label: capitalize(l.type),
                            value: l.type,
                          }))}
                          onChange={(e) =>
                            handleLookTypeChange(i, e.target.value)
                          }
                          placeholder="-"
                          value={look.lookTypeKey}
                        />
                        <input
                          className="flex-1 border rounded px-2 py-1 text-sm"
                          list={`look-examples-${i}`}
                          value={look.value}
                          onChange={(e) =>
                            handleLookValueChange(i, e.target.value)
                          }
                          placeholder={examples[0] ?? ""}
                        />
                        <datalist id={`look-examples-${i}`}>
                          {examples.map((ex) => (
                            <option key={ex} value={ex} />
                          ))}
                        </datalist>
                        <button
                          type="button"
                          onClick={() => handleRemoveLook(i)}
                          className="text-red-500 hover:text-red-700 text-sm px-1"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleAddLook}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    + Add look
                  </button>
                </div>
              </section>

              <section>
                <SectionTitle title="Ability Scores" />
                <p className="text-xs text-gray-500 mb-3">
                  Assign each value once: {ATTRIBUTE_SCORES.join(", ")}
                </p>
                <div className="space-y-2">
                  {abilityScores.map(({ ability, score }) => (
                    <div key={ability} className="flex items-center gap-3">
                      <label className="w-28 text-sm">{ability}</label>
                      <Dropdown
                        className="flex-1"
                        data-ability={ability}
                        items={ATTRIBUTE_SCORES.map((s) => ({
                          disabled: abilityScores.some(
                            (a) => a.ability !== ability && a.score === s,
                          ),
                          label: formatScore(s),
                          value: s,
                        }))}
                        onChange={handleScoreChange}
                        placeholder="-"
                        value={score ?? ""}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Alignment */}
            <section>
              <SectionTitle title="Alignment" />
              <p>Select an alignment, or fill in with your own:</p>
              <div className="space-y-2">
                {characterClass.alignmentTemplates.map((template, i) => (
                  <button
                    className="bg-gray-900 cursor-pointer rounded p-4 text-left w-full"
                    key={i}
                    type="button"
                    onClick={handleAlignmentTemplateClick(i)}
                  >
                    <div className="font-medium capitalize">
                      {template.alignment}
                    </div>
                    <div className="text-sm text-gray-300">
                      {template.description}
                    </div>
                  </button>
                ))}
                <div className="flex gap-3 px-4 py-3 rounded border cursor-pointer transition-colors">
                  <Dropdown
                    items={["chaotic", "evil", "good", "lawful", "neutral"].map(
                      (a) => ({
                        label: capitalize(a),
                        value: a,
                      }),
                    )}
                    onChange={handleAlignmentTypeChange}
                    placeholder="-"
                    value={alignmentType}
                  />
                  <input
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    placeholder="Alignment description..."
                    value={alignmentDescription}
                    onChange={handleAlignmentDescriptionChange}
                  />
                </div>
              </div>
            </section>

            {/* Race Moves */}
            <section>
              <SectionTitle title="Race" />
              <p>Pick one:</p>
              <div className="space-y-2">
                {characterClass.raceMoves.map((move) => (
                  <SelectableArea
                    key={move.key}
                    onClick={() => setRaceKey(move.key)}
                    selected={raceKey === move.key}
                  >
                    <MoveCard move={move} />
                  </SelectableArea>
                ))}
              </div>
            </section>

            {/* Class Moves */}
            <section>
              <SectionTitle title="Class Moves" />
              <div className="grid grid-cols-2 gap-4">
                {characterClass.startingMoves.map((move) => (
                  <MoveCard key={move.key} move={move} />
                ))}
              </div>
            </section>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Create Character
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
