import { useTheme } from "@emotion/react";
import clsx from "clsx";
import { FC, InputHTMLAttributes } from "react";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Checkbox: FC<CheckboxProps> = ({ className, label, ...props }) => {
  const theme = useTheme();

  return (
    <label>
      <input
        className={clsx(className, "nes-checkbox", theme.mode === "dark" && "is-dark")}
        type="checkbox"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};
