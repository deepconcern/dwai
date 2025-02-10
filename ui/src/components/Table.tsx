import { useTheme } from "@emotion/react";
import clsx from "clsx";
import { FC, TableHTMLAttributes } from "react";

export type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  bordered?: boolean;
  centered?: boolean;
  responsive?: boolean;
};

export const Table: FC<TableProps> = ({
  bordered,
  centered,
  className,
  responsive,
  ...props
}) => {
  const theme = useTheme();

  const content = (
    <table
      className={clsx(className, "nes-table", {
        "is-bordered": bordered,
        "is-centered": centered,
        "is-dark": theme.mode === "dark",
      })}
      css={responsive ? { width: "100%" } : {}}
      {...props}
    ></table>
  );

  if (responsive) return <div className="nes-table-responsive">{content}</div>;

  return content;
};
