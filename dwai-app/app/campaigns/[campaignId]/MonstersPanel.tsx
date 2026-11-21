"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { DamageDialog } from "@/components/DamageDialog";
import { ErrorList } from "@/components/ErrorList";
import { MonsterPicker } from "@/components/MonsterPicker";
import { MonsterStatBlock } from "@/components/MonsterStatBlock";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { MonsterFragment } from "@/fragments/MonsterFragment";
import { graphql, unmaskFragment } from "@/gql";
import { AddMonstersInput } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { groupMonstersByEncounter } from "@/lib/fronts";
import { getOperationName } from "@/lib/getOperationName";

const GET_CAMPAIGN_MONSTERS_QUERY = graphql(`
  query GetCampaignMonsters($id: ID!) {
    campaigns {
      byId(id: $id) {
        encounters {
          id
          monsters {
            id
          }
          name
        }
        id
        monsters {
          encounterId
          hp
          id
          maxHp
          name
          statBlock {
            ...MonsterFragment
          }
        }
      }
    }
    monsters {
      compendium {
        hp
        id
        name
        setting {
          key
          name
        }
        tags
      }
      mine {
        hp
        id
        name
        tags
      }
    }
  }
`);

const ADD_MONSTERS_MUTATION = graphql(`
  mutation AddMonsters($id: ID!, $input: AddMonstersInput!) {
    campaigns {
      addMonsters(id: $id, input: $input) {
        id
      }
    }
  }
`);

const DAMAGE_MONSTER_MUTATION = graphql(`
  mutation DamageMonster($input: TakeDamageInput!, $monsterId: ID!) {
    campaigns {
      damageMonster(input: $input, monsterId: $monsterId) {
        hp
        id
      }
    }
  }
`);

const HEAL_MONSTER_MUTATION = graphql(`
  mutation HealMonster($amount: Int!, $monsterId: ID!) {
    campaigns {
      healMonster(amount: $amount, monsterId: $monsterId) {
        hp
        id
      }
    }
  }
`);

const RENAME_MONSTER_MUTATION = graphql(`
  mutation RenameMonster($monsterId: ID!, $name: String!) {
    campaigns {
      renameMonster(monsterId: $monsterId, name: $name) {
        id
        name
      }
    }
  }
`);

const RUN_ENCOUNTER_MUTATION = graphql(`
  mutation RunEncounter($encounterId: ID!) {
    campaigns {
      runEncounter(encounterId: $encounterId) {
        id
      }
    }
  }
`);

const REMOVE_MONSTER_MUTATION = graphql(`
  mutation RemoveMonster($monsterId: ID!) {
    campaigns {
      removeMonster(monsterId: $monsterId)
    }
  }
`);

type Action = "damage" | "heal" | "remove" | "rename" | "roll";

export type MonstersPanelProps = {
  campaignId: string;
};

/**
 * The GM's monsters in play: add them from the compendium or the GM's own
 * monsters (several at once for a group), deal damage (the API applies
 * armor), heal, rename, roll their damage to chat, and remove them. The GM
 * can also run one of the campaign's encounters, which puts all of its
 * monsters into play; monsters are grouped by the encounter they came from.
 * Players
 * never see this panel, and the API won't show them monsters in play.
 */
export const MonstersPanel: FC<MonstersPanelProps> = ({ campaignId }) => {
  // The Prep page changes the encounters, so don't trust the cache on the
  // way back.
  const { data, error } = useQuery(GET_CAMPAIGN_MONSTERS_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: { id: campaignId },
  });
  const refetch = {
    refetchQueries: [getOperationName(GET_CAMPAIGN_MONSTERS_QUERY)],
  };
  const [addMonsters, { loading: adding }] = useMutation(
    ADD_MONSTERS_MUTATION,
    refetch,
  );
  const [damageMonster] = useMutation(DAMAGE_MONSTER_MUTATION);
  const [healMonster] = useMutation(HEAL_MONSTER_MUTATION);
  const [renameMonster] = useMutation(RENAME_MONSTER_MUTATION);
  const [removeMonster] = useMutation(REMOVE_MONSTER_MUTATION, refetch);
  const [runEncounter, { loading: running }] = useMutation(
    RUN_ENCOUNTER_MUTATION,
    refetch,
  );

  const [active, setActive] = useState<{ action: Action; id: string } | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [ignoresArmor, setIgnoresArmor] = useState(false);
  const [isAdding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [piercing, setPiercing] = useState("");
  const [encounterId, setEncounterId] = useState("");

  if (error) return <ErrorList errors={errorMessages(error)} />;
  if (!data) return <Section title="Monsters">Loading...</Section>;

  const { encounters, monsters: inPlay } = data.campaigns.byId;
  const { compendium, mine } = data.monsters;
  const groups = groupMonstersByEncounter(inPlay, encounters);
  const runnable = encounters.filter((e) => e.monsters.length > 0);

  const open = (id: string, action: Action, name = "") => {
    setActive({ action, id });
    setAmount("");
    setErrors([]);
    setIgnoresArmor(false);
    setNewName(name);
    setPiercing("");
  };

  const run = async (action: () => Promise<unknown>) => {
    setErrors([]);
    try {
      await action();
      setActive(null);
    } catch (e) {
      setErrors(errorMessages(e));
    }
  };

  const handleAdd = async (input: AddMonstersInput) => {
    setErrors([]);
    try {
      await addMonsters({ variables: { id: campaignId, input } });
      setAdding(false);
    } catch (e) {
      setErrors(errorMessages(e));
      throw e;
    }
  };

  const handleRun = () =>
    void run(async () => {
      await runEncounter({ variables: { encounterId } });
      setEncounterId("");
    });

  return (
    <Section title="Monsters">
      <div className="flex flex-col gap-4">
        <p className="text-gray-400 text-sm">Only you can see this panel.</p>

        {inPlay.length === 0 && <p>No monsters in play.</p>}
        {groups.map((group) => (
          <div className="flex flex-col gap-2" key={group.name}>
            {groups.length > 1 && (
              <h4 className="font-semibold">{group.name}</h4>
            )}
            <ul aria-label={group.name} className="flex flex-col gap-2">
              {group.monsters.map((monster) => {
                const stats = unmaskFragment(
                  MonsterFragment,
                  monster.statBlock,
                );
                const defeated = monster.hp === 0;
                const isActive = (action: Action) =>
                  active?.id === monster.id && active.action === action;

                return (
                  <li
                    aria-label={monster.name}
                    className="border flex flex-col gap-2 p-2 rounded"
                    key={monster.id}
                  >
                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                      <span
                        className={defeated ? "line-through text-gray-400" : ""}
                      >
                        {monster.name}
                      </span>
                      <span>
                        HP {monster.hp} / {monster.maxHp}
                      </span>
                      {stats.armor != null && <span>Armor {stats.armor}</span>}
                      {defeated && (
                        <span className="font-bold text-red-400">Defeated</span>
                      )}
                      <progress
                        aria-label={`${monster.name}'s HP`}
                        className="flex-1 min-w-16"
                        max={monster.maxHp}
                        value={monster.hp}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Button onClick={() => open(monster.id, "damage")}>
                        Deal Damage
                      </Button>
                      <Button onClick={() => open(monster.id, "heal")}>
                        Heal
                      </Button>
                      {stats.attack && (
                        <Button onClick={() => open(monster.id, "roll")}>
                          Roll Damage
                        </Button>
                      )}
                      <Button
                        onClick={() => open(monster.id, "rename", monster.name)}
                      >
                        Rename
                      </Button>
                      <Button
                        className="bg-red-600"
                        onClick={() => open(monster.id, "remove")}
                      >
                        Remove
                      </Button>
                    </div>

                    {isActive("damage") && (
                      <form
                        aria-label={`Deal damage to ${monster.name}`}
                        className="flex flex-wrap gap-2 items-center"
                        onSubmit={(ev) => {
                          ev.preventDefault();
                          void run(() =>
                            damageMonster({
                              variables: {
                                input: {
                                  amount: Number(amount),
                                  ignoresArmor,
                                  piercing: Number(piercing || 0),
                                },
                                monsterId: monster.id,
                              },
                            }),
                          );
                        }}
                      >
                        <TextInput
                          aria-label="Damage"
                          className="w-24"
                          min={0}
                          onChange={(ev) => setAmount(ev.target.value)}
                          placeholder="Damage"
                          required
                          type="number"
                          value={amount}
                        />
                        <TextInput
                          aria-label="Piercing"
                          className="w-24"
                          min={0}
                          onChange={(ev) => setPiercing(ev.target.value)}
                          placeholder="Piercing"
                          type="number"
                          value={piercing}
                        />
                        <label>
                          <input
                            checked={ignoresArmor}
                            onChange={(ev) =>
                              setIgnoresArmor(ev.target.checked)
                            }
                            type="checkbox"
                          />{" "}
                          Ignores armor
                        </label>
                        <Button type="submit">Deal Damage</Button>
                        <span className="basis-full text-gray-400 text-sm">
                          Its armor ({stats.armor ?? 0}) is subtracted, less any
                          piercing.
                        </span>
                      </form>
                    )}

                    {isActive("heal") && (
                      <form
                        aria-label={`Heal ${monster.name}`}
                        className="flex flex-wrap gap-2 items-center"
                        onSubmit={(ev) => {
                          ev.preventDefault();
                          void run(() =>
                            healMonster({
                              variables: {
                                amount: Number(amount),
                                monsterId: monster.id,
                              },
                            }),
                          );
                        }}
                      >
                        <TextInput
                          aria-label="Healing"
                          className="w-24"
                          min={0}
                          onChange={(ev) => setAmount(ev.target.value)}
                          placeholder="Healing"
                          required
                          type="number"
                          value={amount}
                        />
                        <Button type="submit">Heal</Button>
                      </form>
                    )}

                    {isActive("rename") && (
                      <form
                        aria-label={`Rename ${monster.name}`}
                        className="flex flex-wrap gap-2 items-center"
                        onSubmit={(ev) => {
                          ev.preventDefault();
                          void run(() =>
                            renameMonster({
                              variables: {
                                monsterId: monster.id,
                                name: newName,
                              },
                            }),
                          );
                        }}
                      >
                        <TextInput
                          aria-label="New name"
                          maxLength={60}
                          onChange={(ev) => setNewName(ev.target.value)}
                          required
                          value={newName}
                        />
                        <Button type="submit">Rename</Button>
                      </form>
                    )}

                    {isActive("remove") && (
                      <div
                        aria-label="Are you sure?"
                        className="border border-red-500 flex flex-col gap-2 p-2 rounded"
                        role="alertdialog"
                      >
                        <p>
                          Remove {monster.name} from play? Its HP is lost, and
                          this can&apos;t be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={() => setActive(null)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-red-600"
                            onClick={() =>
                              void run(() =>
                                removeMonster({
                                  variables: { monsterId: monster.id },
                                }),
                              )
                            }
                          >
                            Yes, remove {monster.name}
                          </Button>
                        </div>
                      </div>
                    )}

                    {isActive("roll") && stats.attack && (
                      <DamageDialog
                        campaignId={campaignId}
                        initialExpression={stats.attack.damage}
                        isOpen
                        monster={{
                          attackName: stats.attack.name,
                          id: monster.id,
                          name: monster.name,
                        }}
                        onClose={() => setActive(null)}
                      />
                    )}

                    <details>
                      <summary className="cursor-pointer text-gray-400 text-sm">
                        Stat block
                      </summary>
                      <div className="pt-2">
                        <MonsterStatBlock monster={stats} />
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <ErrorList errors={errors} />

        {isAdding ? (
          <MonsterPicker
            compendium={compendium}
            label="Add monsters"
            mine={mine}
            onCancel={() => setAdding(false)}
            onSubmit={handleAdd}
            submitLabel="Add to Play"
            submitting={adding}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setAdding(true)}>Add Monsters</Button>
            {runnable.length > 0 && (
              <>
                <select
                  aria-label="Encounter"
                  className="border px-3 py-2 rounded"
                  onChange={(ev) => setEncounterId(ev.target.value)}
                  value={encounterId}
                >
                  <option className="bg-black" value="">
                    Choose an encounter
                  </option>
                  {runnable.map((e) => (
                    <option className="bg-black" key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={encounterId === "" || running}
                  onClick={handleRun}
                >
                  Run Encounter
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Section>
  );
};
