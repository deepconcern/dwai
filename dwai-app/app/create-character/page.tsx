"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

import { graphql } from "@/gql";
import { Ability } from "@/gql/graphql";
import { PageTitle } from "@/components/PageTitle";

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
          name
          trigger
          type
        }
        startingMoves {
          key
          name
          trigger
          type
        }
      }
    }
  }
`);

const GET_MOVES_QUERY = graphql(`
  query GetMovesForCreate {
    moves {
      all {
        key
        name
        trigger
        type
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

type LookEntry = { lookTypeKey: string; value: string };
type AbilityScoreEntry = { ability: Ability; score: number | null };
type MoveTab = "class" | "basic" | "special";

export default function CreateCharacterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [classKey, setClassKey] = useState("");
  const [raceKey, setRaceKey] = useState("");
  const [alignmentKey, setAlignmentKey] = useState("");
  const [customAlignmentType, setCustomAlignmentType] = useState("good");
  const [customAlignmentText, setCustomAlignmentText] = useState("");
  const [looks, setLooks] = useState<LookEntry[]>([]);
  const [abilityScores, setAbilityScores] = useState<AbilityScoreEntry[]>(
    ABILITY_LABELS.map(({ ability }) => ({ ability, score: null })),
  );
  const [moveTab, setMoveTab] = useState<MoveTab>("class");

  const { data: classesData, loading: classesLoading } = useQuery(
    GET_CHARACTER_CLASSES_QUERY,
  );
  const { data: movesData, loading: movesLoading } = useQuery(GET_MOVES_QUERY);
  const [createCharacter] = useMutation(CREATE_CHARACTER_MUTATION);

  const characterClass = classesData?.characterClasses.all.find(
    (c) => c.key === classKey,
  );

  const conScore = abilityScores.find(
    (a) => a.ability === "CONSTITUTION",
  )?.score;
  const hitPoints =
    characterClass && typeof conScore === "number"
      ? conScore + characterClass.hpBase
      : null;

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

  const handleAddLook = useCallback(() => {
    const firstType = characterClass?.lookExamples[0]?.type ?? "";
    setLooks((prev) => [...prev, { lookTypeKey: firstType, value: "" }]);
  }, [characterClass]);

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

  const handleScoreChange = useCallback((ability: Ability, raw: string) => {
    const parsed = raw === "" ? null : parseInt(raw, 10);
    const score = parsed === null || isNaN(parsed) ? null : parsed;
    setAbilityScores((prev) =>
      prev.map((a) => (a.ability === ability ? { ...a, score } : a)),
    );
  }, []);

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
            <select
              className="w-full border rounded px-3 py-2"
              value={classKey}
              onChange={(e) => setClassKey(e.target.value)}
            >
              <option className="appearance-none bg-black" value="">
                Select a class...
              </option>
              {classesData?.characterClasses.all.map((c) => (
                <option
                  className="appearance-none bg-black"
                  key={c.key}
                  value={c.key}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {characterClass && (
          <>
            {/* Stats summary */}
            <div className="flex gap-6 text-sm text-gray-600 border rounded px-4 py-3 bg-gray-50">
              <span>
                Hit Points: {hitPoints ?? "—"} (CON + {characterClass.hpBase})
              </span>
              <span>Damage Die: d{characterClass.damageDie}</span>
              <span>Armor: 0</span>
            </div>

            {/* Race + Alignment */}
            <div className="grid grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-semibold mb-2">Race</h2>
                <div className="space-y-2">
                  {characterClass.raceMoves.map((move) => (
                    <button
                      key={move.key}
                      type="button"
                      onClick={() => setRaceKey(move.key)}
                      className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                        raceKey === move.key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">{move.name}</div>
                      <div className="text-sm text-gray-600">
                        {move.trigger}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-2">Alignment</h2>
                <div className="space-y-2">
                  {characterClass.alignmentTemplates.map((template) => (
                    <button
                      key={template.alignment}
                      type="button"
                      onClick={() => setAlignmentKey(template.alignment)}
                      className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                        alignmentKey === template.alignment
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium capitalize">
                        {template.alignment}
                      </div>
                      <div className="text-sm text-gray-600">
                        {template.description}
                      </div>
                    </button>
                  ))}
                  {/* Custom alignment */}
                  <div
                    onClick={() => setAlignmentKey("custom")}
                    className={`flex gap-3 px-4 py-3 rounded border cursor-pointer transition-colors ${
                      alignmentKey === "custom"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={customAlignmentType}
                      onChange={(e) => setCustomAlignmentType(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {["chaotic", "evil", "good", "lawful", "neutral"].map(
                        (a) => (
                          <option key={a} value={a}>
                            {a.charAt(0).toUpperCase() + a.slice(1)}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      placeholder="Custom alignment description..."
                      value={customAlignmentText}
                      onChange={(e) => setCustomAlignmentText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Looks + Ability Scores */}
            <div className="grid grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-semibold mb-2">Looks</h2>
                <div className="space-y-2">
                  {looks.map((look, i) => {
                    const examples =
                      characterClass.lookExamples.find(
                        (e) => e.type === look.lookTypeKey,
                      )?.examples ?? [];
                    return (
                      <div key={i} className="flex gap-2 items-center">
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={look.lookTypeKey}
                          onChange={(e) =>
                            handleLookTypeChange(i, e.target.value)
                          }
                        >
                          {characterClass.lookExamples.map((e) => (
                            <option key={e.type} value={e.type}>
                              {e.type.charAt(0).toUpperCase() + e.type.slice(1)}
                            </option>
                          ))}
                        </select>
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
                <h2 className="text-lg font-semibold mb-2">Ability Scores</h2>
                <p className="text-xs text-gray-500 mb-3">
                  Assign each value once: {ATTRIBUTE_SCORES.join(", ")}
                </p>
                <div className="space-y-2">
                  {abilityScores.map(({ ability, score }) => (
                    <div key={ability} className="flex items-center gap-3">
                      <label className="w-28 text-sm">{ability}</label>
                      <select
                        className="border rounded px-2 py-1 text-sm flex-1"
                        value={score ?? ""}
                        onChange={(e) =>
                          handleScoreChange(ability, e.target.value)
                        }
                      >
                        <option value="">—</option>
                        {ATTRIBUTE_SCORES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            disabled={abilityScores.some(
                              (a) => a.ability !== ability && a.score === s,
                            )}
                          >
                            {formatScore(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Moves */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Moves</h2>
              <div className="flex gap-0 mb-4 border-b">
                {(
                  [
                    ["class", "Class Moves"],
                    ["basic", "Basic Moves"],
                    ["special", "Special Moves"],
                  ] as const
                ).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMoveTab(tab)}
                    className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors ${
                      moveTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {movesLoading ? (
                <div className="text-sm text-gray-500">Loading moves...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {moveTab === "class"
                    ? characterClass.startingMoves.map((move) => (
                        <div key={move.key} className="border rounded p-3">
                          <div className="font-medium">{move.name}</div>
                          <div className="text-sm text-gray-600">
                            {move.trigger}
                          </div>
                        </div>
                      ))
                    : movesData?.moves.all
                        .filter((m) => m.type === moveTab)
                        .map((move) => (
                          <div key={move.key} className="border rounded p-3">
                            <div className="font-medium">{move.name}</div>
                            <div className="text-sm text-gray-600">
                              {move.trigger}
                            </div>
                          </div>
                        ))}
                </div>
              )}
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
