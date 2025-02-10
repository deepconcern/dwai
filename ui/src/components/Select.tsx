import clsx from "clsx";
import { InputHTMLAttributes, FC } from "react";

import { useInputStatus } from "../hooks/useInputStatus";

export type SelectItem = {
  key: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = InputHTMLAttributes<HTMLSelectElement> & {
  items?: SelectItem[];
  validate?: (
    value: string | number | readonly string[] | undefined
  ) => boolean;
  variant?: "error" | "primary" | "success" | "warning";
};

export const Select: FC<SelectProps> = ({
  className,
  items,
  placeholder,
  validate,
  value,
  variant,
  ...props
}) => {
  const status = useInputStatus(value, validate);

  return (
    <div
      className={clsx(
        className,
        "nes-select",
        variant ? `is-${variant}` : status
      )}
    >
      <select value={value} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {items?.map((item) => (
          <option disabled={item.disabled} key={item.key} value={item.key}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};
