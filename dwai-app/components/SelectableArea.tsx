import clsx from "clsx";
import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";

export type SelectableAreaChildrenProps = {
  isHovered: boolean;
  isSelected: boolean;
};

export type SelectableAreaProps = PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    selected?: boolean | null;
  }
>;

export const SelectableArea: React.FC<SelectableAreaProps> = ({
  children,
  className,
  selected: isSelected = false,
  ...rest
}) => (
  <div
    className={clsx(
      className,
      "border border-dashed cursor-pointer hover:bg-gray-900 p-4 rounded",
      {
        "bg-gray-800 border-solid": isSelected,
      },
    )}
    {...rest}
  >
    {children}
  </div>
);
