import clsx from "clsx";
import { InputHTMLAttributes, FC } from "react";

export type SelectItem = {
  key: string;
  label: string;
};

export type SelectProps = InputHTMLAttributes<HTMLSelectElement> & {
  items?: SelectItem[];
  variant?: "error" | "primary" | "success" | "warning";
};

export const Select: FC<SelectProps> = ({
  className,
  items,
  placeholder,
  variant,
  ...props
}) => (
  <div className={clsx(className, "nes-select", variant && `is-${variant}`)}>
    <select {...props}>
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {items?.map((item) => (
        <option key={item.key} value={item.key}>
          {item.label}
        </option>
      ))}
    </select>
  </div>
);
