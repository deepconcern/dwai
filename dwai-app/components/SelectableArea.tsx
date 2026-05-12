import clsx from "clsx";
import { PropsWithChildren } from "react";

export type SelectableAreaChildrenProps = {
  isHovered: boolean;
  isSelected: boolean;
};

export type SelectableAreaProps = PropsWithChildren<{
  onClick: () => void;
  selected?: boolean | null;
}>;

export const SelectableArea: React.FC<SelectableAreaProps> = ({
  children,
  onClick,
  selected: isSelected = false,
}) => (
  <div
    className={clsx(
      "border border-dashed cursor-pointer hover:bg-gray-900 p-4 rounded",
      {
        "bg-gray-800 border-solid": isSelected,
      },
    )}
    onClick={onClick}
  >
    {children}
  </div>
);
