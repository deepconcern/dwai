import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getFragmentData } from "../gql";
import { DamageAddition, FullCharacterFragment } from "../gql/graphql";
import { useLastRoll } from "../hooks/useLastRoll";
import { hasClassMove } from "../lib/hasClassMove";
import { rollDice } from "../lib/roll";
import { FORM_SPACING_CSS } from "../lib/styles";
import { FULL_INVENTORY_ITEM } from "../queries";

import { Accordion } from "./Accordion";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Container } from "./Container";
import { Modal } from "./Modal";
import { Textarea } from "./Textarea";
import { Radio } from "./Radio";

type AppliedDamageAdditions = DamageAddition & {
  isApplied: boolean;
};

export type DamageModalProps = {
  character: FullCharacterFragment;
  damageAdditions: DamageAddition[];
  onClose: () => void;
  open?: boolean;
};

export const DamageModal: FC<DamageModalProps> = ({
  character,
  damageAdditions,
  onClose,
  open,
}) => {
  const weapons = useMemo(() => {
    const weapons = [];

    for (const i of character.inventoryItems) {
      const item = getFragmentData(FULL_INVENTORY_ITEM, i);

      if (item.type !== "weapon") continue;

      const weapon = { ...item };

      // Barbarian - Musclebound
      if (hasClassMove(character, "barbarian_starting_musclebound")) {
        const updatedTags = (() => {
          const updatedTags = new Set(weapon.tags);

          updatedTags.add("messy");
          updatedTags.add("forceful");

          return Array.from(updatedTags);
        })();

        updatedTags.sort();

        weapon.tags = updatedTags;
      }

      weapons.push(weapon);
    }

    weapons.push({
      id: "unarmed",
      isDisabled: false,
      name: "Unarmed",
      tags: [],
      type: "weapon",
    });

    return weapons;
  }, [character]);

  const [appliedDamageAdditions, setApplicableDamageAdditions] = useState<
    AppliedDamageAdditions[]
  >(damageAdditions.map((d) => ({ ...d, isApplied: false })));
  const [diceResults, setDiceResults] = useState<[string, number][]>([]);
  const [selectedWeaponId, setSelectWeaponId] = useState(weapons[0].id);

  const rollValue =
    diceResults.length > 0
      ? diceResults.reduce((sum, [, value]) => sum + value, 0)
      : null;

  const { setLastRoll } = useLastRoll();

  const dice = useMemo<{ name: string; value: string }[]>(() => {
    const dice = [];

    dice.push({
      name: character.characterClass.name,
      value: `1d${character.characterClass.damageDie}`,
    });

    for (const damageAddition of appliedDamageAdditions) {
      if (!damageAddition.isApplied) continue;

      dice.push({
        ...damageAddition,
      });
    }

    return dice;
  }, [appliedDamageAdditions, character]);

  // const selectedWeapon = weapons.find((w) => w.id === selectedWeaponId) || {
  //   name: "Unarmed",
  // };

  useEffect(() => {
    if (rollValue === null) return;

    setLastRoll(`"Damage"  -> ${rollValue}`);
  }, [rollValue, setLastRoll]);

  const handleDamageAdditionToggle = useCallback(
    (i: number) => () => {
      setApplicableDamageAdditions((damageAdditions) =>
        damageAdditions.map((d, j) => {
          if (j !== i) return d;

          return { ...d, isApplied: !d.isApplied };
        })
      );
    },
    [setApplicableDamageAdditions]
  );

  const handleRoll = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      setDiceResults(dice.map((d) => [d.value, rollDice(d.value)]));
    },
    [dice, setDiceResults]
  );

  const handleWeaponChange = useCallback(
    (weaponId: string) => () => {
      setSelectWeaponId(weaponId);
    },
    [setSelectWeaponId]
  );

  return (
    <Modal onClose={onClose} open={open} title="Damage">
      <div css={(theme) => ({ display: "flex", gap: theme.spacing[3] })}>
        <div>
          <Container css={FORM_SPACING_CSS} title="Damage Dice">
            {dice.map(({ name, value }, i) => (
              <p key={i}>
                {name}: {value}
              </p>
            ))}
          </Container>
          <p>
            <Button onClick={handleRoll}>ROLL</Button>
          </p>
          <Textarea
            readOnly
            value={
              rollValue === null
                ? "?"
                : `${diceResults
                    .map(([d, v]) => `${d} (${v})`)
                    .join(" + ")} = ${rollValue}`
            }
          />
        </div>
        <div
          css={(theme) => ({
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing[4],
          })}
        >
          <Accordion title="Main Weapon">
            {weapons.map((weapon) => {
              const label =
                weapon.tags.length > 0
                  ? `${weapon.name} (${weapon.tags.join(", ")})`
                  : weapon.name;

              return (
                <p key={weapon.id}>
                  <Radio
                    checked={weapon.id === selectedWeaponId}
                    label={label}
                    onChange={handleWeaponChange(weapon.id)}
                  />
                </p>
              );
            })}
          </Accordion>
          <Accordion title="Additions">
            {appliedDamageAdditions.map((damageAddition, i) => (
              <p key={i}>
                <Checkbox
                  checked={damageAddition.isApplied}
                  label={`${damageAddition.name} (${
                    !damageAddition.value.startsWith("-") ? "+" : ""
                  }${damageAddition.value})`}
                  onChange={handleDamageAdditionToggle(i)}
                />
              </p>
            ))}
          </Accordion>
        </div>
      </div>
    </Modal>
  );
};
