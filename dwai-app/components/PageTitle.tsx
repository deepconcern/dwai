import { FC } from "react";

export type PageTitleProps = {
  title: string;
};

export const PageTitle: FC<PageTitleProps> = ({ title }) => (
  <h2 className="font-bold mb-4 text-2xl">{title}</h2>
);
