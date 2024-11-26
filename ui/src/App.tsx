import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { HomePage } from "./pages/HomePage";
import { Global, Theme, ThemeProvider } from "@emotion/react";
import { CharacterPage } from "./pages/CharacterPage";
import { CharacterClassPage } from "./pages/CharacterClassPage";
import { CreateCharacterPage } from "./pages/CreateCharacterPage";
import { AppWrapper } from "./components/AppWrapper";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "/graphql",
});

const router = createBrowserRouter([
  { element: <HomePage />, hasErrorBoundary: true, path: "/" },
  { element: <CharacterClassPage />, hasErrorBoundary: true, path: "/character-class/:id" },
  { element: <CharacterPage />, hasErrorBoundary: true, path: "/character/:id" },
  { element: <CreateCharacterPage />, hasErrorBoundary: true, path: "/create-character" },
]);

const theme: Theme = {
  color: {
    text: "black",
    primary: "#209cee",
  },
  mode: "light",
  spacing: Array.from({ length: 32 }).map((_, i) => i === 0 ? 0 : Math.pow(2, i + 1)),
};

export const App: FC = () => (
  <AppWrapper>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <Global
          styles={(theme) => ({
            color: theme.color.text,
            fontFamily: '"Press Start 2P", serif',
            fontStyle: "normal",
            fontWeight: "400",
          })}
        />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ApolloProvider>
  </AppWrapper>
);
