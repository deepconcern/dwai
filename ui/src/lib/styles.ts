import { Interpolation, Theme } from "@emotion/react";

export const GENERIC_FLOW_CSS: Interpolation<Theme> = (theme) => ({ display: "flex", flexDirection: "column", gap: theme.spacing[4] });
export const NESTED_FLOW_CSS: Interpolation<Theme> = [GENERIC_FLOW_CSS, (theme) => ({ gap: theme.spacing[3] })];

export const FORM_SPACING_CSS: Interpolation<Theme> = (theme) => ({ marginBottom: theme.spacing[4] });