import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Global, Theme, ThemeProvider } from "@emotion/react";
import { FC, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import { AppWrapper } from "./components/AppWrapper";
import { HomePage } from "./pages/HomePage";
import { CharacterPage } from "./pages/CharacterPage";
import { CharacterClassPage } from "./pages/CharacterClassPage";
import { CharacterClassesPage } from "./pages/CharacterClassesPage";
import { CreateCharacterPage } from "./pages/CreateCharacterPage";
import { ModalProvider } from "./providers/ModalProvider";
import { LastRollProvider } from "./providers/LastRollProvider";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "/graphql",
});

const router = createBrowserRouter([
  { element: <HomePage />, hasErrorBoundary: true, path: "/" },
  {
    element: <CharacterClassPage />,
    hasErrorBoundary: true,
    path: "/character-class/:id",
  },
  {
    element: <CharacterClassesPage />,
    hasErrorBoundary: true,
    path: "/character-classes",
  },
  {
    element: <CharacterPage />,
    hasErrorBoundary: true,
    path: "/character/:id",
  },
  {
    element: <CreateCharacterPage />,
    hasErrorBoundary: true,
    path: "/create-character",
  },
]);

const lightTheme: Theme = {
  color: {
    background: "white",
    text: "black",
    primary: "#209cee",
  },
  mode: "light",
  spacing: Array.from({ length: 32 }).map((_, i) =>
    i === 0 ? 0 : `${Math.pow(2, i + 1)}px`
  ),
};

const darkTheme: Theme = {
  ...lightTheme,
  color: {
    ...lightTheme.color,
    background: "black",
    text: "white",
  },
  mode: "dark",
};

function getColorScheme(): "dark" | "light" {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";

  return "light";
}

function getTheme(): Theme {
  if (getColorScheme() === "dark") return darkTheme;

  return lightTheme;
}

export const App: FC = () => {
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const onColorSchemeChange = () => {
      setTheme(getTheme());
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    media.addEventListener("change", onColorSchemeChange);

    return () => media.removeEventListener("change", onColorSchemeChange);
  }, [setTheme]);

  return (
    <AppWrapper>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Global
            styles={{
              body: {
                background: `${theme.color.background} !important`,
                color: theme.color.text,
                fontFamily: '"Press Start 2P", serif',
                fontStyle: "normal",
                fontWeight: "400",
              },
            }}
          />
          <LastRollProvider>
            <ModalProvider>
              <RouterProvider router={router} />
            </ModalProvider>
          </LastRollProvider>
        </ThemeProvider>
      </ApolloProvider>
    </AppWrapper>
  );
};
