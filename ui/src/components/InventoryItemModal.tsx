import { useMutation } from "@apollo/client";
import { FC, MouseEvent, useCallback, useMemo } from "react";

import { getFragmentData, graphql } from "../gql";
import {
  FullCharacterFragment,
  FullInventoryItemFragment,
} from "../gql/graphql";
import { FULL_INVENTORY_ITEM } from "../queries";

import { Button } from "./Button";
import { Modal } from "./Modal";

const UPDATE_AMMO_MUTATION = graphql(`
  mutation UpdateAmmo($input: UpdateAmmoInput!) {
    inventoryItem {
      updateAmmo(input: $input) {
        ...FullInventoryItem
      }
    }
  }
`);

export type InventoryItemModalProps = {
  character: FullCharacterFragment;
  inventoryItem?: FullInventoryItemFragment | null;
  onClose: () => void;
};

export const InventoryItemModal: FC<InventoryItemModalProps> = ({
  inventoryItem,
  onClose,
}) => {
  const [updateAmmo, { data: ammoData }] = useMutation(UPDATE_AMMO_MUTATION);

  const ammo = useMemo(() => {
    const updatedInventoryItem = getFragmentData(
      FULL_INVENTORY_ITEM,
      ammoData?.inventoryItem.updateAmmo
    );

    return updatedInventoryItem?.ammo || inventoryItem?.ammo;
  }, [ammoData, inventoryItem]);

  const handleAmmoDecrement = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      if (ammo === null) return;
      if (!inventoryItem) return;

      updateAmmo({
        variables: {
          input: {
            id: inventoryItem.id,
            value: -1,
          },
        },
      });
    },
    [ammo, inventoryItem, updateAmmo]
  );

  const handleAmmoIncrement = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      if (ammo === null) return;
      if (!inventoryItem) return;

      updateAmmo({
        variables: {
          input: {
            id: inventoryItem.id,
            value: 1,
          },
        },
      });
    },
    [ammo, inventoryItem, updateAmmo]
  );

  return (
    <Modal onClose={onClose} open={!!inventoryItem} title={inventoryItem?.name}>
      <div
        css={theme => ({
          alignItems: "center",
          columnGap: theme.spacing[3],
          display: "grid",
          gridAutoRows: "1fr",
          gridTemplateColumns: "1fr 1fr",
        })}
      >
        {ammo !== null && (
          <>
            <div>Ammo:</div>
            <div>
              {ammo} <Button onClick={handleAmmoIncrement}>+</Button>{" "}
              <Button onClick={handleAmmoDecrement}>-</Button>
            </div>
          </>
        )}
        {inventoryItem && inventoryItem.weight !== null && (
          <>
            <div>Weight:</div>
            <div>{inventoryItem.weight}</div>
          </>
        )}
      </div>
    </Modal>
  );
};
