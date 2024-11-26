import clsx from "clsx";
import { FC, HTMLAttributes } from "react";

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  inline?: boolean;
};

export const Field: FC<FieldProps> = ({ className, inline, ...props }) => (
  <div
    className={clsx(className, "nes-field", inline && "is-inline")}
    {...props}
  />
);
