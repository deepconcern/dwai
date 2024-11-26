import { useTheme } from "@emotion/react";
import clsx from "clsx";
import { FC, FormHTMLAttributes } from "react";

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  className?: string | null;
  title?: string | null;
};

export const Form: FC<FormProps> = ({
  children,
  className,
  title,
  ...props
}) => {
  const theme = useTheme();

  return (
    <form
      className={clsx(className, {
        "is-dark": theme.mode === "dark",
        "nes-container": true,
        "with-title": !!title,
      })}
      {...props}
    >
      {title && <h3 className="title">{title}</h3>}
      {children}
    </form>
  );
};
