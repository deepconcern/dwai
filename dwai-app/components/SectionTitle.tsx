import { FC } from "react";

export type SectionTitleProps = {
  title: string;
};

export const SectionTitle: FC<SectionTitleProps> = ({ title }) => (
  <h3 className="font-semibold mb-2 text-lg">{title}</h3>
);
