import clsx from "clsx";
import { FC, SelectHTMLAttributes } from "react";

export type DropdownItem = {
  disabled?: boolean | null;
  label?: string | number | null;
  value: string | number | null;
};

export type DropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  items: DropdownItem[];
  placeholder: string;
};

export const Dropdown: FC<DropdownProps> = ({
  className,
  items,
  placeholder,
  ...rest
}) => (
  <select
    className={clsx(className, "border px-3 py-2 rounded w-full")}
    {...rest}
  >
    <option className="appearance-none bg-black" value="">
      {placeholder}
    </option>
    {items.map(({ disabled, label, value }) => (
      <option
        className="appearance-none bg-black"
        disabled={!!disabled}
        key={value}
        value={value?.toString() || ""}
      >
        {label}
      </option>
    ))}
  </select>
);
