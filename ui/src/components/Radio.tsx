import { useTheme } from "@emotion/react";
import clsx from "clsx";
import { FC, InputHTMLAttributes } from "react";

export type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Radio: FC<RadioProps> = ({ className, label, ...props }) => {
  const theme = useTheme();

  return (
    <label>
      <input
        className={clsx(
          className,
          "nes-radio",
          theme.mode === "dark" && "is-dark"
        )}
        type="radio"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};
