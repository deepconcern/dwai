import clsx from "clsx";
import { InputHTMLAttributes, FC } from "react";

import { useInputStatus } from "../hooks/useInputStatus";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  validate?: (value: string | number | readonly string[] | undefined) => boolean,
  variant?: "disabled" | "error" | "primary" | "success" | "warning";
};

export const TextInput: FC<TextInputProps> = ({
  className,
  disabled,
  validate,
  value,
  variant,
  ...props
}) => {
  const status = useInputStatus(value, validate);

  return (
    <input
      className={clsx(
        className,
        "nes-input",
        variant ? `is-${variant}` : status,
        disabled && "is-disabled"
      )}
      disabled={disabled}
      value={value}
      {...props}
    />
  );
}
