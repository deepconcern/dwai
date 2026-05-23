import clsx from "clsx";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  MouseEvent,
  PropsWithChildren,
} from "react";

export type SelectableAreaChildrenProps = {
  isHovered: boolean;
  isSelected: boolean;
};

export type SelectableAreaProps = PropsWithChildren<
  Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    "onClick"
  > & {
    onSelect?: (ev: MouseEvent<HTMLElement>) => void;
    onDeselect?: (ev: MouseEvent<HTMLElement>) => void;
    selected?: boolean | null;
  }
>;

export const SelectableArea: React.FC<SelectableAreaProps> = ({
  children,
  className,
  onSelect,
  onDeselect,
  selected: isSelected = false,
  ...rest
}) => (
  <div
    className={clsx(
      className,
      "border border-dashed hover:bg-gray-900 px-4 py-8 relative rounded",
      {
        "bg-gray-800 border-solid": isSelected,
        "cursor-pointer": !isSelected,
      },
    )}
    onClick={(ev) => {
      if (isSelected) return;

      onSelect?.(ev);
    }}
    {...rest}
  >
    <button
      className={clsx(
        "absolute border cursor-pointer font-bold h-4 right-2 rounded text-xs top-2 w-4",
        {
          "bg-white text-black": isSelected,
        },
      )}
      onClick={(ev) => {
        ev.preventDefault();

        if (isSelected) {
          onDeselect?.(ev);
        } else {
          onSelect?.(ev);
        }
      }}
    >
      {isSelected ? "🗸" : ""}
    </button>
    {children}
  </div>
);
