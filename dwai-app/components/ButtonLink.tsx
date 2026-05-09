import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { FC, PropsWithChildren } from "react";

export type ButtonLinkProps = PropsWithChildren<
  LinkProps & {
    className?: string | null;
  }
>;

export const ButtonLink: FC<ButtonLinkProps> = ({ className, ...rest }) => (
  <Link
    className={clsx(
      className,
      "bg-blue-500 hover:bg-blue-600 inline-block text-white py-2 px-4 rounded",
    )}
    {...rest}
  />
);
