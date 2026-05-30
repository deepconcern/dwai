import clsx from "clsx";
import { DetailedHTMLProps, FC, HTMLAttributes } from "react";

import { SectionTitle } from "./SectionTitle";

export type SectionProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  title?: string | null;
};

export const Section: FC<SectionProps> = ({
  className,
  children,
  title,
  ...rest
}) => (
  <section
    className={clsx(className, "border flex flex-col p-4 rounded")}
    {...rest}
  >
    {title && <SectionTitle title={title} />}
    <div>{children}</div>
  </section>
);
