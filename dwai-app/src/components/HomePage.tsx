import { useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Unstable_Grid2";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { FC, ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";

import { graphql } from "../gql";
import { useErrorLogging } from "../hooks/useErrorLogging";
import { GET_CHARACTERS_QUERY } from "../operations/GET_CHARACTERS_QUERY";
import { Page } from "./Page";

const GET_GAMES_QUERY = graphql(`query GetGames {
    games {
        all {
            id
            name
        }
    }
}`);

const loadingContent = (
    <>
        <Skeleton/>
        <Skeleton/>
        <Skeleton/>
    </>
);

const errorContent = "ERROR";

function noContent(type: "characters" | "games"): ReactNode {
    return <Box sx={{ textAlign: "center" }}>No {type}... yet.</Box>
}

export const HomePage: FC = () => {
    const { data: getCharactersData, error: getCharactersError, loading: getCharactersLoading } = useQuery(GET_CHARACTERS_QUERY);
    const { data: getGamesData, error: getGamesError, loading: getGamesLoading } = useQuery(GET_GAMES_QUERY);

    useErrorLogging(getCharactersError);
    useErrorLogging(getGamesError);

    const charactersContent = useMemo(() => {
        if (getCharactersLoading) return loadingContent;
        if (getCharactersError || !getCharactersData) return errorContent;
        if (getCharactersData.characters.all.length === 0) return noContent("characters");
 
        return (
             <List>
                 {getCharactersData.characters.all.map(({ id, name }) => (
                     <ListItemButton component={Link} key={id} to={`/character/${id}`}>
                         {name}
                     </ListItemButton>
                 ))}
             </List>
         );
     }, [getCharactersData, getCharactersError, getCharactersLoading]);

     const gamesContent = useMemo(() => {
        if (getGamesLoading) return loadingContent;
        if (getGamesError || !getGamesData) return errorContent;
        if (getGamesData.games.all.length === 0) return noContent("games");
 
        return (
             <List>
                 {getGamesData.games.all.map(({ id, name }) => (
                     <ListItemButton component={Link} key={id} to={`/game/${id}`}>
                         {name}
                     </ListItemButton>
                 ))}
             </List>
         );
     }, [getGamesData, getGamesError, getGamesLoading]);

    return (
        <Page>
            <Grid container spacing={3}>
                <Grid xs={8}>
                    <Paper sx={{ p: 3 }}>
                        {gamesContent}
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Button component={Link} to="/create-game" variant="contained">Create Game</Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid xs={4}>
                    <Paper sx={{ p: 3 }}>
                        {charactersContent}
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Button component={Link} to="/create-character" variant="contained">Create Character</Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Page>
    );
}