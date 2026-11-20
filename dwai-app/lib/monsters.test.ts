import { describe, expect, test } from "bun:test";

import {
  filterMonsters,
  groupBySetting,
  monsterFormState,
  monsterInput,
  parseList,
} from "./monsters";

const ankheg = {
  name: "Ankheg",
  setting: { key: "caverns", name: "Cavern Dwellers" },
  tags: ["Group", "Large"],
};
const caveRat = {
  name: "Cave Rat",
  setting: { key: "caverns", name: "Cavern Dwellers" },
  tags: ["Horde", "Small"],
};
const goblin = {
  name: "Goblin",
  setting: { key: "caverns", name: "Cavern Dwellers" },
  tags: ["Horde", "Small", "Intelligent"],
};
const zombie = {
  name: "Zombie",
  setting: { key: "undead", name: "Undead Legions" },
  tags: ["Horde"],
};
const all = [ankheg, caveRat, goblin, zombie];

describe("filterMonsters", () => {
  test("matches the search anywhere in the name, ignoring case", () => {
    expect(
      filterMonsters(all, { search: "RAT", setting: "", tag: "" }),
    ).toEqual([caveRat]);
  });

  test("keeps only the chosen setting", () => {
    expect(
      filterMonsters(all, { search: "", setting: "undead", tag: "" }),
    ).toEqual([zombie]);
  });

  test("combines setting and tag", () => {
    expect(
      filterMonsters(all, { search: "", setting: "caverns", tag: "Horde" }),
    ).toEqual([caveRat, goblin]);
  });

  test("keeps everything with no filters", () => {
    expect(filterMonsters(all, { search: " ", setting: "", tag: "" })).toEqual(
      all,
    );
  });
});

describe("groupBySetting", () => {
  test("groups monsters under their setting's name, in order", () => {
    expect(groupBySetting(all)).toEqual([
      { monsters: [ankheg, caveRat, goblin], name: "Cavern Dwellers" },
      { monsters: [zombie], name: "Undead Legions" },
    ]);
  });
});

describe("parseList", () => {
  test("takes one entry per line, dropping blank lines", () => {
    expect(parseList(" Swarm \n\nRip something apart\n")).toEqual([
      "Swarm",
      "Rip something apart",
    ]);
  });
});

describe("monsterInput", () => {
  const blank = monsterFormState(null);

  test("leaves blank HP, armor, and attack out", () => {
    expect(monsterInput({ ...blank, name: "Peasant" })).toEqual({
      armor: null,
      attack: null,
      description: "",
      hp: null,
      instinct: "",
      moves: [],
      name: "Peasant",
      sourceKey: null,
      specialQualities: [],
      tags: [],
    });
  });

  test("sends the numbers and the attack when they're filled in", () => {
    const input = monsterInput({
      ...blank,
      armor: "1",
      attackDamage: "d8+1",
      attackName: "Claw",
      attackPiercing: "2",
      hp: "12",
      name: "Bog Hag",
    });

    expect([input.hp, input.armor, input.attack]).toEqual([
      12,
      1,
      {
        damage: "d8+1",
        ignoresArmor: false,
        name: "Claw",
        piercing: 2,
        tags: [],
      },
    ]);
  });
});

describe("monsterFormState", () => {
  test("fills the form from a compendium monster, remembering its key", () => {
    const form = monsterFormState({
      armor: 1,
      attack: {
        damage: "d6",
        ignoresArmor: false,
        name: "Gnaw",
        piercing: 1,
        tags: ["Close"],
      },
      description: "",
      hp: 7,
      instinct: "To devour",
      moves: ["Swarm", "Rip something apart"],
      name: "Cave Rat",
      source: "COMPENDIUM",
      sourceKey: "cave_rat",
      specialQualities: [],
      tags: ["Horde"],
    });

    expect(form).toMatchObject({
      armor: "1",
      attackDamage: "d6",
      attackPiercing: "1",
      hp: "7",
      moves: "Swarm\nRip something apart",
      sourceKey: "cave_rat",
    });
  });
});
