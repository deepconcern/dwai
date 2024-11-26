import clsx from "clsx";
import { FC } from "react";
import { Link, LinkProps } from "react-router";

export type ButtonLinkProps = LinkProps & {
  variant?: "error" | "primary" | "success" | "warning";
};

export const ButtonLink: FC<ButtonLinkProps> = ({ className, variant, ...props }) => (
  <Link
    className={clsx(className, "nes-btn", variant && `is-${variant}`)}
    {...props}
  />
);
