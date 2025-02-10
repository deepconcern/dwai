import { useMutation, useSuspenseQuery } from "@apollo/client";
import { FC, MouseEvent, useCallback, useState } from "react";
import { useParams } from "react-router";

import { Button } from "../components/Button";
import { CoinModal } from "../components/CoinModal";
import { Container } from "../components/Container";
import { DamageModal } from "../components/DamageModal";
import { DefinitionList } from "../components/DefinitionList";
import { InventoryItemModal } from "../components/InventoryItemModal";
import { List } from "../components/List";
import { Modal } from "../components/Modal";
import { MoveDisplay } from "../components/MoveDisplay";
import { Page } from "../components/Page";
import { Text } from "../components/Text";
import { getFragmentData, graphql } from "../gql";
import { FullInventoryItemFragment, InventoryItem } from "../gql/graphql";
import { ATTRIBUTES } from "../lib/attributes";
import { capitalize } from "../lib/capitalize";
import { formatModName, formatModValue } from "../lib/formatting";
import {
  FULL_CHARACTER,
  FULL_CHARACTER_MOVE,
  FULL_INVENTORY_ITEM,
  GET_CHARACTER_QUERY,
  SHORT_CHARACTER,
} from "../queries";

type MoveTab = "basic" | "class" | "special";

const GET_MOVES_QUERY = graphql(`
  query GetMoves {
    damageAddition {
      all {
        id
        name
        value
      }
    }
    forward {
      all {
        id
        name
        value
      }
    }
    moveTemplate {
      basic: byType(type: "basic") {
        ... on MoveTemplate {
          ...FullMoveTemplate
        }
      }
      special: byType(type: "special") {
        ... on MoveTemplate {
          ...FullMoveTemplate
        }
      }
    }
  }
`);

const MARK_XP_MUTATION = graphql(`
  mutation MarkXp($id: ID!) {
    character {
      markXp(id: $id)
    }
  }
`);

const UPDATE_HP_MUTATION = graphql(`
  mutation UpdateHp($input: UpdateHpInput!) {
    character {
      updateHp(input: $input) {
        id
        currentHp
      }
    }
  }
`);

export const CharacterPage: FC = () => {
  const [isBondScoresModalOpen, setBondScoresModalOpen] = useState(false);
  const [isCoinModalOpen, setCoinModalOpen] = useState(false);
  const [isDamageModalOpen, setDamageModalOpen] = useState(false);
  const [inventoryItemModalTarget, setInventoryItemModalTarget] =
    useState<FullInventoryItemFragment | null>(null);
  const [selectedMoveTab, setSelectedMoveTab] = useState<MoveTab>("class");
  const [selectedTab, setSelectedTab] = useState("moves");

  const { id } = useParams<{ id: string }>();

  const [markXp] = useMutation(MARK_XP_MUTATION, {
    refetchQueries: [GET_CHARACTER_QUERY],
  });

  const [updateHp] = useMutation(UPDATE_HP_MUTATION, {
    refetchQueries: [GET_CHARACTER_QUERY],
  });

  const { data: characterData } = useSuspenseQuery(GET_CHARACTER_QUERY, {
    variables: { id: id! },
  });

  const { data: movesData } = useSuspenseQuery(GET_MOVES_QUERY);

  const character = getFragmentData(
    FULL_CHARACTER,
    characterData.character.byId
  );
  const basicMoves = movesData.moveTemplate.basic;
  const damageAdditions = movesData.damageAddition.all;
  const forwards = movesData.forward.all;
  const raceMove = getFragmentData(FULL_CHARACTER_MOVE, character.raceMove);
  const specialMoves = movesData.moveTemplate.special;

  const displayedMoves = (() => {
    if (selectedMoveTab === "basic") return basicMoves;
    if (selectedMoveTab === "class") return character.classMoves;
    return specialMoves;
  })();

  const handleBondScoresModalClose = useCallback(() => {
    setBondScoresModalOpen(false);
  }, [setBondScoresModalOpen]);

  const handleBondScoresModalOpen = useCallback(
    (ev: MouseEvent) => {
      ev.preventDefault();

      setBondScoresModalOpen(true);
    },
    [setBondScoresModalOpen]
  );

  const handleCoinModalClose = useCallback(() => {
    setCoinModalOpen(false);
  }, [setCoinModalOpen]);

  const handleCoinModalOpen = useCallback(
    (ev: MouseEvent) => {
      ev.preventDefault();

      setCoinModalOpen(true);
    },
    [setCoinModalOpen]
  );

  const handleDamageClose = useCallback(() => {
    setDamageModalOpen(false);
  }, [setDamageModalOpen]);

  const handleDamageOpen = useCallback(
    (ev: MouseEvent) => {
      ev.preventDefault();

      setDamageModalOpen(true);
    },
    [setDamageModalOpen]
  );

  const handleHpDecrement = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      updateHp({
        variables: {
          input: {
            id: character.id,
            value: -1,
          },
        },
      });
    },
    [character, updateHp]
  );

  const handleHpIncrement = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      updateHp({
        variables: {
          input: {
            id: character.id,
            value: 1,
          },
        },
      });
    },
    [character, updateHp]
  );

  const handleInventoryItemClose = useCallback(() => {
    setInventoryItemModalTarget(null);
  }, [setInventoryItemModalTarget]);

  const handleInventoryItemOpen = useCallback(
    (inventoryItem: InventoryItem) => () => {
      setInventoryItemModalTarget(inventoryItem);
    },
    [setInventoryItemModalTarget]
  );

  const handleMoveTabChange = useCallback(
    (newMoveTab: MoveTab) => (ev: MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();

      setSelectedMoveTab(newMoveTab);
    },
    [setSelectedMoveTab]
  );

  const handleTabChange = useCallback(
    (newTab: string) => (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      setSelectedTab(newTab);
    },
    [setSelectedTab]
  );

  const handleXpMark = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      markXp({
        variables: {
          id: character.id,
        },
      });
    },
    [character, markXp]
  );

  return (
    <Page
      title={`${character.name} (Level 1 ${character.characterClass.name})`}
    >
      <div
        css={(theme) => ({
          alignItems: "stretch",
          display: "flex",
          gap: theme.spacing[4],
        })}
      >
        <Container css={{ flex: 1, height: "100%" }} title="Basic Info">
          <p>
            HP: {character.currentHp}/{character.maxHp}{" "}
            <Button onClick={handleHpIncrement}>+</Button>{" "}
            <Button onClick={handleHpDecrement}>-</Button>
          </p>
          <p>
            XP: {character.xp} <Button onClick={handleXpMark}>Mark XP</Button>
          </p>
          <p>Armor: {character.armor}</p>
          <p>
            <Button onClick={handleDamageOpen}>
              Roll Damage (1d{character.characterClass.damageDie})
            </Button>
          </p>
        </Container>
        <Container css={{ flex: 1, height: "100%" }} title="Looks">
          <DefinitionList
            items={character.looks.map((l) => ({
              definition: l.text,
              key: l.id,
              term: l.lookTarget.name,
            }))}
          />
        </Container>
      </div>
      <div
        css={(theme) => ({
          display: "flex",
          gap: theme.spacing[4],
        })}
      >
        <Container css={{ flex: 1 }} title="Alignment">
          <DefinitionList
            items={[
              {
                definition: character.alignment.text,
                key: "alignment",
                term: character.alignment.name,
              },
            ]}
          />
        </Container>

        <Container css={{ flex: 2 }} title="Race">
          <DefinitionList
            items={[
              {
                definition: raceMove.text,
                key: raceMove.id,
                term: raceMove.name,
              },
            ]}
          />
        </Container>
      </div>
      <Container title="Bonds">
        {character.partyMembers.length === 0 && (
          <p>No bonds for this character</p>
        )}
        {character.partyMembers.length > 0 && (
          <List
            css={(theme) => ({
              display: "flex",
              gap: theme.spacing[4],
            })}
          >
            {character.partyMembers.map((p) => {
              const partyMember = getFragmentData(SHORT_CHARACTER, p);

              const bondText =
                character.bonds.find(
                  (b) =>
                    getFragmentData(SHORT_CHARACTER, b.target).id ===
                    partyMember.id
                )?.text || null;

              return (
                <li key={partyMember.id}>
                  {bondText ? bondText : `No bond with ${partyMember.name}.`}{" "}
                  <Button>Pick a Bond</Button>
                </li>
              );
            })}
          </List>
        )}
        <Button onClick={handleBondScoresModalOpen}>Bond Scores</Button>
      </Container>
      <Container title="Attributes">
        <div
          css={(theme) => ({
            display: "grid",
            gap: theme.spacing[4],
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            margin: theme.spacing[4],
          })}
        >
          {ATTRIBUTES.map((type) => {
            const attribute = character.attributes.find((a) => a.type === type);

            return (
              <Container key={type} rounded>
                <p>
                  {formatModName(type)}: {formatModValue(attribute!.modifier)}
                </p>
                <p
                  css={(theme) => ({
                    fontSize: ".7rem",
                    marginLeft: theme.spacing[0],
                  })}
                >
                  {capitalize(type)}: {attribute!.score}
                </p>
              </Container>
            );
          })}
        </div>
      </Container>
      <div
        css={(theme) => ({
          display: "flex",
          gap: theme.spacing[4],
        })}
      >
        {["moves", "inventory"].map((tab) => (
          <Button
            key={tab}
            onClick={handleTabChange(tab)}
            variant={tab === selectedTab && "primary"}
          >
            {capitalize(tab)}
          </Button>
        ))}
      </div>
      {selectedTab === "inventory" && (
        <Container title="Inventory">
          <p>
            Coin: {character.coin}{" "}
            <a onClick={handleCoinModalOpen}>
              <Text variant="primary">Edit</Text>
            </a>
          </p>
          <p>
            Weight: {character.weight} / {character.maxWeight}{" "}
            {character.weight > character.maxWeight && "(OVERENCUMBERED)"}
          </p>
          <List>
            {character.inventoryItems.map((i) => {
              const inventoryItem = getFragmentData(FULL_INVENTORY_ITEM, i);

              return (
                <li key={inventoryItem.id}>
                  {inventoryItem.name}{" "}
                  <a onClick={handleInventoryItemOpen(inventoryItem)}>
                    <Text variant="primary">View</Text>
                  </a>
                </li>
              );
            })}
          </List>
        </Container>
      )}
      {selectedTab === "moves" && (
        <Container title="Moves">
          <div
            css={(theme) => ({
              display: "flex",
              gap: theme.spacing[4],
              marginBottom: theme.spacing[4],
            })}
          >
            {["class", "basic", "special"].map((moveTab) => (
              <a
                key={moveTab}
                onClick={handleMoveTabChange(moveTab as MoveTab)}
              >
                <Text variant={moveTab === selectedMoveTab && "primary"}>
                  {capitalize(moveTab)} Moves
                </Text>
              </a>
            ))}
          </div>
          <div
            css={(theme) => ({
              display: "grid",
              gap: theme.spacing[4],
              gridAutoRows: "1fr",
              gridTemplateColumns: "1fr 1fr 1fr",
            })}
          >
            {displayedMoves.map((moveItem, i) => (
              <MoveDisplay
                character={characterData.character.byId}
                forwards={forwards}
                key={i}
                move={moveItem}
              />
            ))}
          </div>
        </Container>
      )}
      <CoinModal
        character={character}
        onClose={handleCoinModalClose}
        open={isCoinModalOpen}
      />
      <DamageModal
        character={character}
        damageAdditions={damageAdditions}
        onClose={handleDamageClose}
        open={isDamageModalOpen}
      />
      <InventoryItemModal
        character={character}
        inventoryItem={inventoryItemModalTarget}
        onClose={handleInventoryItemClose}
      />
      <Modal
        onClose={handleBondScoresModalClose}
        open={isBondScoresModalOpen}
        title="Bond Scores"
      >
        {character.partyMembers.length === 0 && (
          <p>The character has no bonds</p>
        )}
        {character.partyMembers.length > 0 && (
          <List>
            {character.partyMembers.map((p) => {
              const partyMember = getFragmentData(SHORT_CHARACTER, p);

              const bondScoreValue =
                character.bondScores.find(
                  (b) =>
                    getFragmentData(SHORT_CHARACTER, b.target).id ===
                    partyMember.id
                )?.score || 0;

              return (
                <li key={partyMember.id}>
                  {partyMember.name} (+{bondScoreValue})
                </li>
              );
            })}
          </List>
        )}
      </Modal>
    </Page>
  );
};
