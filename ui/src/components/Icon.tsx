import clsx from "clsx";
import { FC } from "react";

export type IconProps = {
  icon: "close" | "coin" | "trophy";
  invertable?: boolean;
  size?: "small" | "medium" | "large";
};

export const Icon: FC<IconProps> = ({ icon, invertable, size }) => (
  <i className={clsx("nes-icon", icon, size && `is-${size}`)} css={theme => (theme.mode === "dark" && invertable ? {
    filter: "invert(1)",
  } : {})} />
);
