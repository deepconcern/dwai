import clsx from "clsx";
import { InputHTMLAttributes, FC, useRef } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  validate?: (value: string | number | readonly string[] | undefined) => boolean,
  variant?: "error" | "primary" | "success" | "warning";
};

export const TextInput: FC<TextInputProps> = ({
  className,
  disabled,
  validate,
  value,
  variant,
  ...props
}) => {
  const previousValue = useRef(value);
  const hasBeenTouched = useRef(false);

  console.log("DEBUG", "previousValue.current !== value", previousValue.current !== value);
  console.log("DEBUG", "hasBeenTouched.current", hasBeenTouched.current);

  hasBeenTouched.current = hasBeenTouched.current || previousValue.current !== value;
  previousValue.current = value;

  const status = (() => {
    if (variant) return `is-${variant}`;
    if (!validate) return null;
    if (!hasBeenTouched.current) return null;

    const validity = validate(value);

    if (validity) return "is-success";
    return "is-error";
  })();

  return (
    <input
      className={clsx(
        className,
        "nes-input",
        status,
        disabled && "is-disabled"
      )}
      disabled={disabled}
      value={value}
      {...props}
    />
  );
}
