import clsx from "clsx";
import { FC, HTMLAttributes } from "react";

export type TextProps = HTMLAttributes<HTMLSpanElement> & {
  disabled?: boolean;
  variant?: "disabled" | "error" | "primary" | "success" | "warning" | false;
};

export const Text: FC<TextProps> = ({
  className,
  disabled,
  variant,
  ...props
}) => (
  <span
    className={clsx(
      className,
      "nes-text",
      variant && `is-${variant}`,
      disabled && "is-disabled"
    )}
    {...props}
  />
);
