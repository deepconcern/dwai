import { describe, expect, test } from "bun:test";

import {
  groupMonstersByEncounter,
  impulseFor,
  portentProgress,
} from "./fronts";

const categories = [
  {
    types: [
      { impulse: "to infest from within", name: "Cult" },
      { impulse: "to take by subterfuge", name: "Thieves Guild" },
    ],
  },
];

describe("groupMonstersByEncounter", () => {
  test("puts monsters under their encounter and the rest under Other monsters", () => {
    const groups = groupMonstersByEncounter(
      [
        { encounterId: "e1", name: "Goblin 1" },
        { encounterId: null, name: "Ogre" },
        { encounterId: "e1", name: "Goblin 2" },
      ],
      [{ id: "e1", name: "Goblin ambush" }],
    );

    expect(groups).toEqual([
      {
        monsters: [
          { encounterId: "e1", name: "Goblin 1" },
          { encounterId: "e1", name: "Goblin 2" },
        ],
        name: "Goblin ambush",
      },
      {
        monsters: [{ encounterId: null, name: "Ogre" }],
        name: "Other monsters",
      },
    ]);
  });

  test("leaves out encounters with no monsters in play", () => {
    const groups = groupMonstersByEncounter(
      [{ encounterId: null, name: "Ogre" }],
      [{ id: "e1", name: "Goblin ambush" }],
    );

    expect(groups.map((g) => g.name)).toEqual(["Other monsters"]);
  });

  test("counts a monster from a deleted encounter as another monster", () => {
    const groups = groupMonstersByEncounter(
      [{ encounterId: "gone", name: "Ogre" }],
      [],
    );

    expect(groups.map((g) => g.name)).toEqual(["Other monsters"]);
  });
});

describe("impulseFor", () => {
  test("suggests the template impulse when the impulse is empty", () => {
    expect(impulseFor("Cult", "", categories)).toBe("to infest from within");
  });

  test("keeps an impulse the GM already wrote", () => {
    expect(impulseFor("Cult", "to recruit nobles", categories)).toBe(
      "to recruit nobles",
    );
  });

  test("matches the type ignoring case", () => {
    expect(impulseFor("thieves guild", "", categories)).toBe(
      "to take by subterfuge",
    );
  });

  test("leaves the impulse empty for a type the GM made up", () => {
    expect(impulseFor("Rival bard", "", categories)).toBe("");
  });
});

describe("portentProgress", () => {
  test("counts the checked portents", () => {
    expect(
      portentProgress([{ done: true }, { done: false }, { done: true }]),
    ).toBe("2 of 3");
  });
});
