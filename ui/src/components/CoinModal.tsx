import { useMutation } from "@apollo/client";
import {
  ChangeEvent,
  FC,
  MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { graphql } from "../gql";
import { FullCharacterFragment } from "../gql/graphql";
import { GET_CHARACTER_QUERY } from "../queries";

import { Button } from "./Button";
import { Modal } from "./Modal";
import { TextInput } from "./TextInput";

const UPDATE_COIN_MUTATION = graphql(`
  mutation UpdateCoin($input: UpdateCoinInput!) {
    character {
      updateCoin(input: $input) {
        coin
        id
      }
    }
  }
`);

export type CoinModalProps = {
  character: FullCharacterFragment;
  onClose: () => void;
  open?: boolean;
};

export const CoinModal: FC<CoinModalProps> = ({ character, onClose, open }) => {
  const coinRef = useRef(character.coin);

  const [changeAmount, setChangeAmount] = useState(0);

  const [updateCoin, { data }] = useMutation(UPDATE_COIN_MUTATION, {
    refetchQueries: [GET_CHARACTER_QUERY],
  });

  const coin = useMemo(() => {
    if (data) {
      coinRef.current = data.character.updateCoin.coin;
    }

    return coinRef.current;
  }, [coinRef, data]);

  const handleCoinChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      ev.preventDefault();

      setChangeAmount(Number(ev.target.value) - coin);
    },
    [coin, setChangeAmount]
  );

  const handleCoinSubmit = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      updateCoin({
        variables: {
          input: {
            id: character.id,
            value: changeAmount,
          },
        },
      });

      setChangeAmount(0);
      onClose();
    },
    [changeAmount, character, onClose, setChangeAmount, updateCoin]
  );

  return (
    <Modal onClose={onClose} open={open} title="Update Coins">
      <p>Coins: {coin}</p>
      <TextInput
        onChange={handleCoinChange}
        type="number"
        value={coin + changeAmount}
      />
      <Button onClick={handleCoinSubmit}>Update</Button>
    </Modal>
  );
};
