import clsx from "clsx";
import { FC, HTMLAttributes, ReactNode } from "react";

export type ListItem = {
  key: string | number;
  content: ReactNode;
};

export type ListProps = HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
  items: ListItem[];
  ordered?: boolean;
};

export const List: FC<ListProps> = ({
  className,
  items,
  ordered = false,
  ...rest
}) => {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={clsx(
        className,
        "list-inside",
        ordered ? "list-decimal" : "list-disc",
      )}
      {...(rest as HTMLAttributes<HTMLUListElement>)}
    >
      {items.map(({ key, content }) => (
        <li key={key}>{content}</li>
      ))}
    </Tag>
  );
};
