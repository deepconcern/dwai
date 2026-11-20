"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { DamageDialog } from "@/components/DamageDialog";
import { ErrorList } from "@/components/ErrorList";
import { MonsterStatBlock } from "@/components/MonsterStatBlock";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { MonsterFragment } from "@/fragments/MonsterFragment";
import { graphql, unmaskFragment } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";
import { filterMonsters, groupBySetting } from "@/lib/monsters";

const GET_CAMPAIGN_MONSTERS_QUERY = graphql(`
  query GetCampaignMonsters($id: ID!) {
    campaigns {
      byId(id: $id) {
        id
        monsters {
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

const REMOVE_MONSTER_MUTATION = graphql(`
  mutation RemoveMonster($monsterId: ID!) {
    campaigns {
      removeMonster(monsterId: $monsterId)
    }
  }
`);

/** The value of an option in the add form's monster list. */
const sourceValue = (kind: "compendium" | "custom", id: string) =>
  `${kind}:${id}`;

type Action = "damage" | "heal" | "remove" | "rename" | "roll";

export type MonstersPanelProps = {
  campaignId: string;
};

/**
 * The GM's monsters in play: add them from the compendium or the GM's own
 * monsters (several at once for a group), deal damage (the API applies
 * armor), heal, rename, roll their damage to chat, and remove them. Players
 * never see this panel, and the API won't show them monsters in play.
 */
export const MonstersPanel: FC<MonstersPanelProps> = ({ campaignId }) => {
  const { data, error } = useQuery(GET_CAMPAIGN_MONSTERS_QUERY, {
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

  const [active, setActive] = useState<{ action: Action; id: string } | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [count, setCount] = useState("1");
  const [errors, setErrors] = useState<string[]>([]);
  const [ignoresArmor, setIgnoresArmor] = useState(false);
  const [isAdding, setAdding] = useState(false);
  const [maxHp, setMaxHp] = useState("");
  const [newName, setNewName] = useState("");
  const [piercing, setPiercing] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");

  if (error) return <ErrorList errors={errorMessages(error)} />;
  if (!data) return <Section title="Monsters">Loading...</Section>;

  const inPlay = data.campaigns.byId.monsters;
  const { compendium, mine } = data.monsters;
  const filters = { search, setting: "", tag: "" };
  const mineShown = filterMonsters(mine, filters);
  const compendiumGroups = groupBySetting(filterMonsters(compendium, filters));
  const selected = source.startsWith("custom:")
    ? mine.find((m) => sourceValue("custom", m.id) === source)
    : compendium.find((m) => sourceValue("compendium", m.id) === source);

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

  const handleAdd: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    const [kind, id] = source.split(/:(.*)/);
    void run(async () => {
      await addMonsters({
        variables: {
          id: campaignId,
          input: {
            ...(kind === "custom"
              ? { customMonsterId: id }
              : { compendiumKey: id }),
            count: Number(count),
            maxHp: maxHp.trim() === "" ? null : Number(maxHp),
          },
        },
      });
      setAdding(false);
      setCount("1");
      setMaxHp("");
      setSource("");
    });
  };

  return (
    <Section title="Monsters">
      <div className="flex flex-col gap-4">
        <p className="text-gray-400 text-sm">Only you can see this panel.</p>

        {inPlay.length === 0 && <p>No monsters in play.</p>}
        <ul aria-label="Monsters in play" className="flex flex-col gap-2">
          {inPlay.map((monster) => {
            const stats = unmaskFragment(MonsterFragment, monster.statBlock);
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
                  <Button onClick={() => open(monster.id, "heal")}>Heal</Button>
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
                        onChange={(ev) => setIgnoresArmor(ev.target.checked)}
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
                          variables: { monsterId: monster.id, name: newName },
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
                      Remove {monster.name} from play? Its HP is lost, and this
                      can&apos;t be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => setActive(null)}>Cancel</Button>
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

        <ErrorList errors={errors} />

        {isAdding ? (
          <form
            aria-label="Add monsters"
            className="border flex flex-col gap-2 p-2 rounded"
            onSubmit={handleAdd}
          >
            <TextInput
              aria-label="Search monsters"
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Search monsters"
              type="search"
              value={search}
            />
            <select
              aria-label="Monster"
              className="border px-3 py-2 rounded w-full"
              onChange={(ev) => setSource(ev.target.value)}
              required
              value={source}
            >
              <option className="bg-black" value="">
                Choose a monster
              </option>
              {mineShown.length > 0 && (
                <optgroup className="bg-black" label="My monsters">
                  {mineShown.map((m) => (
                    <option key={m.id} value={sourceValue("custom", m.id)}>
                      {m.name}
                      {m.hp != null ? ` (${m.hp} HP)` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
              {compendiumGroups.map((group) => (
                <optgroup
                  className="bg-black"
                  key={group.name}
                  label={group.name}
                >
                  {group.monsters.map((m) => (
                    <option key={m.id} value={sourceValue("compendium", m.id)}>
                      {m.name}
                      {m.hp != null ? ` (${m.hp} HP)` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-1">
                How many
                <TextInput
                  className="w-24"
                  max={20}
                  min={1}
                  onChange={(ev) => setCount(ev.target.value)}
                  required
                  type="number"
                  value={count}
                />
              </label>
              <label className="flex flex-col gap-1">
                Max HP{selected && selected.hp == null && " (required)"}
                <TextInput
                  className="w-24"
                  max={999}
                  min={1}
                  onChange={(ev) => setMaxHp(ev.target.value)}
                  placeholder={selected?.hp?.toString() ?? ""}
                  required={selected != null && selected.hp == null}
                  type="number"
                  value={maxHp}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button disabled={adding} type="submit">
                Add to Play
              </Button>
              <Button onClick={() => setAdding(false)} type="button">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <Button onClick={() => setAdding(true)}>Add Monsters</Button>
          </div>
        )}
      </div>
    </Section>
  );
};
