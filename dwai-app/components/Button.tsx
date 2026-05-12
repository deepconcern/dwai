import clsx from "clsx";
import { ButtonHTMLAttributes, FC } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string | null;
};

export const Button: FC<ButtonProps> = ({ className, ...rest }) => (
  <button
    className={clsx(
      className,
      "bg-blue-500 hover:bg-blue-600 inline-block py-2 px-4 rounded text-white",
    )}
    {...rest}
  />
);
