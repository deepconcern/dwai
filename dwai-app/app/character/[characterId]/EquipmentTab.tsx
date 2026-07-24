import { FC } from "react";

import { CharacterFragmentFragment } from "@/gql/graphql";

export type EquipmentTabProps = {
  character: CharacterFragmentFragment;
};

export const EquipmentTab: FC<EquipmentTabProps> = ({ character }) => {
  return (
    <div className="flex flex-col space-y-4">
      <p>Gold: {character.gold}</p>
      <table className="border border-collapse table-fixed">
        <thead>
          <tr>
            <th>Item</th><th>Count</th><th>Description</th><th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {character.equipment.map(item => (
            <tr className="border" key={item.id}>
              <td>{item.label}</td>
              <td>{item.count}</td>
              <td>{item.description}</td>
              <td>{item.tags.map(t => t.name + (t.quantity !== null ? ` ${t.quantity}` : "")).join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
