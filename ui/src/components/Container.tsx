import { useTheme } from "@emotion/react";
import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

export type ContainerProps = PropsWithChildren<{
  className?: string | null;
  title?: string | null;
}>;

export const Container: FC<ContainerProps> = ({
  children,
  className,
  title,
}) => {
  const theme = useTheme();

  return (
    <article
      className={clsx(className, {
        "is-dark": theme.mode === "dark",
        "nes-container": true,
        "with-title": !!title,
      })}
    >
      {title && <h3 className="title">{title}</h3>}
      {children}
    </article>
  );
};
