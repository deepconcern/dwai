import clsx from "clsx";
import { ButtonHTMLAttributes, FC } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "error" | "primary" | "success" | "warning";
};

export const Button: FC<ButtonProps> = ({
  className,
  disabled,
  variant,
  ...props
}) => (
  <button
    className={clsx(
      className,
      "nes-btn",
      variant && `is-${variant}`,
      disabled && "is-disabled"
    )}
    disabled={disabled}
    {...props}
  />
);
