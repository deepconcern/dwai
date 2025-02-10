import { FC, Fragment, HTMLAttributes, PropsWithChildren } from "react";

export type DefinitionItem = {
  definition: string;
  key: string;
  term: string;
};

export type DlDefinitionProps = HTMLAttributes<HTMLElement>;

export const DlDefinition: FC<DlDefinitionProps> = ({ ...props }) => (
  <dd
    css={(theme) => ({
      marginLeft: theme.spacing[4],
      marginBottom: theme.spacing[4],
    })}
    {...props}
  />
);

export type DtTermProps = HTMLAttributes<HTMLElement>;

export const DlTerm: FC<DtTermProps> = ({ ...props }) => (
  <dt css={(theme) => ({ marginBottom: theme.spacing[2] })} {...props} />
);

export type DefinitionListProps = PropsWithChildren<
  HTMLAttributes<HTMLDListElement> & {
    items?: DefinitionItem[];
  }
>;

export const DefinitionList: FC<DefinitionListProps> = ({
  children,
  items,
  ...props
}) => (
  <dl {...props}>
    {items?.map((i) => (
      <Fragment key={i.key}>
        <DlTerm>{i.term}</DlTerm>
        <DlDefinition>{i.definition}</DlDefinition>
      </Fragment>
    ))}
    {children}
  </dl>
);
