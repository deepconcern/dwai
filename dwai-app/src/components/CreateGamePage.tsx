import { useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { graphql } from "../gql";
import { GET_CHARACTERS_QUERY } from "../operations/GET_CHARACTERS_QUERY";

import { Page } from "./Page";
import { useErrorLogging } from "../hooks/useErrorLogging";

const CREATE_GAME_MUTATION = graphql(`mutation CreateGame($characterId: String!, $name: String!, $scenarioKey: String!) {
    games {
        create(characterId: $characterId, name: $name, scenarioKey: $scenarioKey) {
            id
            name
        }
    }
}`);

const GET_SCENARIOS_QUERY = graphql(`query GetScenarios {
    scenarios {
        all {
            description
            key
            name
        }
    }
}`);

export const CreateGamePage: FC = () => {
    const [characterId, setCharacterId] = useState<string>("");
    const [name, setName] = useState("");
    const [scenarioKey, setScenarioKey] = useState<string>("");

    const navigate = useNavigate();

    const { data: getCharactersData, error: getCharactersError, loading: getCharactersLoading } = useQuery(GET_CHARACTERS_QUERY);
    const { data: getScenariosData, error: getScenariosError, loading: getScenariosLoading } = useQuery(GET_SCENARIOS_QUERY);
    const [createGame, { data: createGameData, error: createGameError }] = useMutation(CREATE_GAME_MUTATION);

    useEffect(() => {
        if (!createGameData) return;

        navigate(`/game/${createGameData.games.create.id}`);
    }, [createGameData, navigate]);

    useErrorLogging(createGameError);
    useErrorLogging(getCharactersError);
    useErrorLogging(getScenariosError);

    const handleCharacterChange = useCallback((ev: SelectChangeEvent) => {
        setCharacterId(ev.target.value);
    }, [setCharacterId]);

    const handleCreate = useCallback((ev: MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();

        if (characterId === "") return;
        if (scenarioKey === "") return;

        createGame({
            variables: {
                characterId,
                name,
                scenarioKey,
            },
        });
    }, [characterId, name, scenarioKey]);

    const handleNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        ev.preventDefault();

        setName(ev.target.value);
    }, [setName]);

    const handleScenarioChange = useCallback((ev: SelectChangeEvent) => {
        setScenarioKey(ev.target.value);
    }, [setScenarioKey]);

    return (
        <Page title="Game Creation">
            <Paper component="form" sx={{ p: 3 }}>
                <TextField label="Name" onChange={handleNameChange} sx={{ mb: 3 }} value={name} variant="outlined"/>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="character-label">Character</InputLabel>
                    <Select disabled={getCharactersLoading} id="character" labelId="character-label" onChange={handleCharacterChange} value={characterId}>
                        {getCharactersData?.characters.all.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="scenario-label">Scenario</InputLabel>
                    <Select disabled={getScenariosLoading} id="scenario" labelId="scenario-label" onChange={handleScenarioChange} value={scenarioKey}>
                        {getScenariosData?.scenarios.all.map(({ key, name }) => (
                            <MenuItem key={key} value={key}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </Box>
            </Paper>
        </Page>
    );
};