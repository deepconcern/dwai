import { useTheme } from "@emotion/react";
import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

export type ContainerProps = PropsWithChildren<{
  className?: string | null;
  rounded?: boolean;
  title?: string | null;
}>;

export const Container: FC<ContainerProps> = ({
  children,
  className,
  rounded,
  title,
}) => {
  const theme = useTheme();

  return (
    <div className={className!}>
      <article
        className={clsx({
          "is-dark": theme.mode === "dark",
          "is-rounded": rounded,
          "nes-container": true,
          "with-title": !!title,
        })}
        css={{ minHeight: "100%" }}
      >
        {title && <h3 className="title">{title}</h3>}
        {children}
      </article>
    </div>
  );
};
