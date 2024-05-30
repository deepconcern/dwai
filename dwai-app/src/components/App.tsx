import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FC } from "react";

import { getApolloClient } from "../lib/getApolloClient";
import { themeOptions } from "../themeOptions";

import { GamePage } from "./GamePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./HomePage";
import { CreateCharacterPage } from "./CreateCharacterPage";
import { CharacterPage } from "./CharacterPage";
import { CreateGamePage } from "./CreateGamePage";

const router = createBrowserRouter([
  {
    element: <HomePage/>,
    path: "/",
  },
  {
    element: <CharacterPage/>,
    path: "/character/:characterId",
  },
  {
    element: <CreateCharacterPage/>,
    path: "/create-character",
  },
  {
    element: <CreateGamePage/>,
    path: "/create-game",
  },
  {
    element: <GamePage/>,
    path: "/game/:gameId",
  },
]);

const theme = createTheme(themeOptions);

export const App: FC = () => {
  return (
    <ApolloProvider client={getApolloClient()}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <RouterProvider router={router}/>
      </ThemeProvider>
    </ApolloProvider>
  );
};
