import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    color: {
      background: string;
      primary: string;
      text: string;
    };
    mode: "dark" | "light";
    spacing: (number | string)[];
  }
}
