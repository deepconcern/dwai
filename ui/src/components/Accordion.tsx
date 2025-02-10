import { FC } from "react";

import { Container, ContainerProps } from "./Container";

export type AccordionProps = Omit<ContainerProps, "title"> & {
  title: string;
};

export const Accordion: FC<AccordionProps> = ({
  children,
  title,
  ...props
}) => {
  return (
    <Container {...props}>
      <details css={theme => ({
        "&[open] > summary": {
          marginBottom: theme.spacing[3],
          "&::before": {
            transform: "rotate(90deg)",
          },
        },
      })}>
        {title && <summary css={theme => ({
          "&::before": {
            display: "inline-block",
            content: "\">\"",
            marginRight: theme.spacing[2],
          },
          "&::marker": {
              content: "\"\"",
          },
        })}>{title}</summary>}
        <div css={theme => ({ marginLeft: theme.spacing[4] })}>
        {children}
        </div>
      </details>
    </Container>
  );
};
