import {
  ChangeEvent,
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { FragmentType, getFragmentData } from "../gql";
import { AttributeType, Forward, FullCharacterFragment, FullCharacterMoveFragment } from "../gql/graphql";
import { useLastRoll } from "../hooks/useLastRoll";
import { useModal } from "../hooks/useModal";
import { formatModValue } from "../lib/formatting";
import { rollDice } from "../lib/roll";
import { FORM_SPACING_CSS } from "../lib/styles";
import { FULL_CHARACTER, FULL_CHARACTER_MOVE, SHORT_CHARACTER } from "../queries";

import { Accordion } from "./Accordion";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Container } from "./Container";
import { Radio } from "./Radio";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { List } from "./List";

const ANY_MOD_ROLL = "MOD";
const BOND_ROLL = "BOND";
const MOD_ROLL: { [key: string]: AttributeType } = {
  CHA: AttributeType.Charisma,
  CON: AttributeType.Constitution,
  DEX: AttributeType.Dexterity,
  INT: AttributeType.Intelligence,
  STR: AttributeType.Strength,
  WIS: AttributeType.Wisdom,
};
const NOTHING_ROLL = "NOTHING";

type ApplicableForward = {
  isApplied: boolean;
  name: string;
  value: number;
};

type MoveRollModalProps = {
  forwards: Forward[];
  character: FullCharacterFragment;
  move: FullCharacterMoveFragment;
};

const MoveRollModal: FC<MoveRollModalProps> = ({
  character,
  forwards,
  move,
}) => {
  const [applicableForwards, setApplicableForwards] = useState<
    ApplicableForward[]
  >(forwards.map((f) => ({ ...f, isApplied: false })));
  const [bondTargetId, setBondTargetId] = useState<string>("");
  const [mod, setMod] = useState<string>("CHA");
  const [diceOverrideId, setDiceOverrideId] = useState<string>("");
  const [rolls, setRolls] = useState<[string, number][] | null>(null);

  const dice = useMemo(() => {
    if (diceOverrideId)
      return move.diceOverrides
        .find((d) => d.id === diceOverrideId)!
        .value.split(" ");

    return ["2d6"];
  }, [diceOverrideId, move]);

  const rollValue = useMemo(() => {
    if (!rolls) return null;

    return rolls.reduce((sum, [, r]) => r + sum, 0);
  }, [rolls]);

  const { setLastRoll } = useLastRoll();

  const bondScore =
    character.bondScores.find(
      (b) => getFragmentData(SHORT_CHARACTER, b.target).id === bondTargetId
    ) || null;

  const target = getFragmentData(SHORT_CHARACTER, bondScore?.target);

  const getAttribute = useCallback(
    (type: AttributeType) => {
      return character.attributes.find((a) => a.type === type)!;
    },
    [character]
  );

  const adjustments = useMemo(() => {
    const adjustments = [];

    if (move.roll) {
      if (move.roll === ANY_MOD_ROLL) {
        adjustments.push({
          name: mod,
          value: character.attributes.find((a) => a.type === MOD_ROLL[mod])!
            .modifier,
        });
      } else if (move.roll === BOND_ROLL) {
        adjustments.push({
          name: bondScore ? `Bond with ${target?.name}` : "No bond",
          value: bondScore?.score || 0,
        });
      } else if (move.roll in MOD_ROLL) {
        adjustments.push({
          name: move.roll,
          value: getAttribute(MOD_ROLL[move.roll]).modifier,
        });
      } else if (move.roll === NOTHING_ROLL) {
        adjustments.push({
          name: "Nothing",
          value: 0,
        });
      } else {
        adjustments.push({
          name: move.roll,
          value: getAttribute(move.roll as AttributeType).score,
        });
      }
    }

    if (move.id === "special_last_breath") {
      // The Upper Hand
      const tuh = character.classMoves
        .map((m) => getFragmentData(FULL_CHARACTER_MOVE, m))
        .find((m) => m.id === "barbarian_starting_the_upper_hand");

      if (tuh) {
        adjustments.push({
          name: tuh.name,
          value: 1,
        });
      }
    }

    for (const forward of applicableForwards) {
      if (!forward.isApplied) continue;

      adjustments.push({
        ...forward,
      });
    }

    return adjustments;
  }, [
    applicableForwards,
    bondScore,
    character,
    getAttribute,
    mod,
    move,
    target,
  ]);

  const adjustment = adjustments.reduce((val, adj) => val + adj.value!, 0);
  const adjustedRollValue = rollValue === null ? "?" : rollValue + adjustment;

  useEffect(() => {
    if (rollValue === null) return;

    setLastRoll(`"${move.name}"  -> ${adjustedRollValue}`);
  }, [adjustedRollValue, move, rollValue, setLastRoll]);

  const isRollDisabled = useMemo(() => {
    if (!move.roll) return true;

    if (move.roll === BOND_ROLL) {
      return bondTargetId === "";
    }

    return false;
  }, [bondTargetId, move]);

  const handleBondTargetChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      setBondTargetId(ev.target.value);
    },
    [setBondTargetId]
  );

  const handleDiceOverrideChange = useCallback(
    (id: string) => () => {
      setDiceOverrideId(id);
    },
    [setDiceOverrideId]
  );

  const handleForwardToggle = useCallback(
    (i: number) => () => {
      setApplicableForwards((forwards) =>
        forwards.map((f, j) => {
          if (j !== i) return f;

          return { ...f, isApplied: !f.isApplied };
        })
      );
    },
    [setApplicableForwards]
  );

  const handleModChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      setMod(ev.target.value);
    },
    [setMod]
  );

  const handleRoll = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      setRolls(dice.map((d) => [d, rollDice(d)]));
    },
    [dice, setRolls]
  );

  return (
    <>
      <h4 css={FORM_SPACING_CSS}>Roll: {move.name}</h4>
      <div
        css={(theme) => ({
          display: "flex",
          flexDirection: "row",
          gap: theme.spacing[3],
        })}
      >
        <div>
          {move.roll === ANY_MOD_ROLL && (
            <div css={FORM_SPACING_CSS}>
              <label htmlFor="mod-select">Mod</label>
              <Select
                css={FORM_SPACING_CSS}
                id="mod-select"
                onChange={handleModChange}
                items={Object.keys(MOD_ROLL).map((m) => ({ key: m, label: m }))}
              />
            </div>
          )}
          {move.roll === BOND_ROLL && (
            <div css={FORM_SPACING_CSS}>
              <label htmlFor="bond-target-select">Bond</label>
              <Select
                css={FORM_SPACING_CSS}
                id="bond-target-select"
                onChange={handleBondTargetChange}
                placeholder="Select a bond"
                items={character.partyMembers.map((p) => {
                  const partyMember = getFragmentData(SHORT_CHARACTER, p);

                  const bondScoreValue =
                    character.bondScores.find(
                      (b) =>
                        getFragmentData(SHORT_CHARACTER, b.target).id ===
                        partyMember.id
                    )?.score || 0;

                  return {
                    key: partyMember.id,
                    label: `${partyMember.name}: +${bondScoreValue}`,
                  };
                })}
                value={bondTargetId}
              />
            </div>
          )}

          <Container css={FORM_SPACING_CSS} title="Adjustments">
            {adjustments.map(({ name, value }, i) => (
              <p key={i}>
                {name}: {formatModValue(value!)}
              </p>
            ))}
          </Container>
          <p>
            <Button disabled={isRollDisabled} onClick={handleRoll}>
              ROLL
            </Button>
          </p>
          <Textarea
            readOnly
            value={`${rolls === null ? "?" : rolls.map(([d, v]) => `${d} (${v})`).join(" + ")} ${
              adjustment >= 0 ? "+" : "-"
            } ${Math.abs(adjustment)} = ${adjustedRollValue}`}
          />
        </div>
        <div>
          <Accordion css={FORM_SPACING_CSS} title="Forwards">
            {applicableForwards.map((forward, i) => (
              <p key={i}>
                <Checkbox
                  checked={forward.isApplied}
                  label={`${forward.name} (${formatModValue(forward.value)})`}
                  onChange={handleForwardToggle(i)}
                />
              </p>
            ))}
          </Accordion>
          {move.diceOverrides.length > 0 && (
            <Accordion css={FORM_SPACING_CSS} title="Dice Overrides">
              <p>
                <Radio
                  checked={diceOverrideId === ""}
                  label="Default (2d6)"
                  onChange={handleDiceOverrideChange("")}
                />
              </p>
              {move.diceOverrides.map((diceOverride) => (
                <p key={diceOverride.id}>
                  <Radio
                    checked={diceOverride.id === diceOverrideId}
                    label={`${diceOverride.name} (${diceOverride.value})`}
                    onChange={handleDiceOverrideChange(diceOverride.id)}
                  />
                </p>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </>
  );
};

export type MoveProps = {
  forwards: Forward[];
  character?: FragmentType<typeof FULL_CHARACTER> | null;
  move: FragmentType<typeof FULL_CHARACTER_MOVE>;
};

export const MoveDisplay: FC<MoveProps> = ({
  forwards,
  ...props
}) => {
  const character = getFragmentData(FULL_CHARACTER, props.character);
  const move = getFragmentData(FULL_CHARACTER_MOVE, props.move);

  const { open } = useModal();

  const handleRollModalOpen = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      if (!character) return;

      open(
        <MoveRollModal
          forwards={forwards}
          character={character}
          move={move}
        />
      );
    },
    [character, forwards, move, open]
  );

  return (
    <Container rounded>
      <h4>{move.name}</h4>
      {move.text.split("\n").map((part, i) => (
        <p css={{ fontSize: "10px" }} key={i}>
          {part}
        </p>
      ))}
      {move.moveOptions && (
        <List css={{ fontSize: "10px" }}>
          {move.moveOptions.map(p => (
            <li key={p.id}>{p.value}</li>
          ))}
        </List>
      )}
      {character && move.roll && (
        <Button onClick={handleRollModalOpen}>Roll + {move.roll}</Button>
      )}
    </Container>
  );
};
