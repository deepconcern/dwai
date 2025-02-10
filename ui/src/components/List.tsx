import clsx from "clsx";
import { FC, HTMLAttributes } from "react";

export type ListProps = HTMLAttributes<HTMLUListElement> & {
  ordered?: boolean;
  type?: "circle" | "disc";
};

export const List: FC<ListProps> = ({ className, ordered, type, ...props }) => {
  const Element = ordered ? "ol" : "ul";

  return (
    <Element
      className={clsx(className, "nes-list", `is-${type || "disc"}`)}
      css={(theme) => ({
        "&.nes-list > li::before": {
          color: theme.color.text,
        },
      })}
      {...props}
    />
  );
};
