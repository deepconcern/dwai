import { FC } from "react";

export type PickMoveModalProps = {
  choose: number;
};

export const PickMoveModal: FC<PickMoveModalProps> = ({ choose }) => {
  return (
    <>
      <h4>Pick Moves</h4>
      <p>(Choose {choose})</p>
    </>
  );
};
