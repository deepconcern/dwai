import clsx from "clsx";
import { FC, TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: FC<TextareaProps> = ({
  className,
  value,
  ...props
}) => (
  <textarea
    className={clsx(className, "nes-textarea")}
    value={value}
    {...props}
  />
);
