import clsx from "clsx";
import { FC, InputHTMLAttributes } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string | null;
};

export const TextInput: FC<TextInputProps> = ({ className, ...rest }) => (
  <input className={clsx(className, "border rounded px-3 py-2")} {...rest} />
);
