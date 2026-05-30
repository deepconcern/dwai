import { FC } from "react";

import { CharacterFragmentFragment } from "@/gql/graphql";

export type EquipmentTabProps = {
  character: CharacterFragmentFragment;
};

export const EquipmentTab: FC<EquipmentTabProps> = ({ character }) => {
  return (
    <>
      <p>Gold: ???</p>
    </>
  );
};
