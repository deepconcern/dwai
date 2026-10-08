"use client";

import { useMutation } from "@apollo/client/react";
import { ChangeEventHandler, FC } from "react";

import { ItemFragment } from "@/fragments/ItemFragment";
import { graphql, unmaskFragment } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { getOperationName } from "@/lib/getOperationName";

import { GET_CHARACTER_QUERY } from "./GET_CHARACTER_QUERY";

const TOGGLE_ITEM_WORN_MUTATION = graphql(`
  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {
    items {
      setWorn(id: $id, worn: $worn) {
        ...ItemFragment
      }
    }
  }
`);

export type EquipmentTabProps = {
  character: CharacterFragmentFragment;
};

export const EquipmentTab: FC<EquipmentTabProps> = ({ character }) => {
  const [toggleItemWorn, { loading }] = useMutation(TOGGLE_ITEM_WORN_MUTATION, {
    refetchQueries: [getOperationName(GET_CHARACTER_QUERY)],
  });

  const handleToggle: ChangeEventHandler<HTMLInputElement> = async (ev) => {
    if (loading) return;

    const id = ev.currentTarget.dataset.itemId;

    if (!id) return;

    const worn = ev.target.checked;

    await toggleItemWorn({
      variables: {
        id,
        worn,
      },
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <p>Gold: {character.gold}</p>
      <table className="border border-collapse table-fixed">
        <thead>
          <tr>
            <th>Item</th>
            <th>Count</th>
            <th>Description</th>
            <th>Tags</th>
            <th>Is Worn?</th>
          </tr>
        </thead>
        <tbody>
          {character.equipment.map((i) => {
            const item = unmaskFragment(ItemFragment, i);

            const isWearable = !!item.tags.find((t) => t.key === "worn");
            const tags = item.tags.map(
              (t) => t.name + (t.quantity !== null ? ` ${t.quantity}` : ""),
            );
            tags.sort();

            return (
              <tr className="border" key={item.id}>
                <td>{item.label}</td>
                <td>{item.count}</td>
                <td>{item.description}</td>
                <td>{tags.join(", ")}</td>
                {isWearable && (
                  <td>
                    <label>
                      <input
                        checked={item.isWorn}
                        data-item-id={item.id}
                        onChange={handleToggle}
                        type="checkbox"
                      />{" "}
                      Worn
                    </label>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
