import { useMutation, useQuery } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Unstable_Grid2";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { graphql } from "../gql";
import { Page } from "./Page";
import { useErrorLogging } from "../hooks/useErrorLogging";
import { CharacterClass, Move, NewLookInput } from "../gql/graphql";

type AlignmentType =
    | "chaotic"    
    | "evil"
    | "good"
    | "lawful"
    | "neutral";

const ATTRIBUTE_SCORES = [16, 15, 13, 12, 9, 8];

const CREATE_CHARACTER_MUTATION = graphql(`mutation CreateCharacter($input: NewCharacterInput!) {
    characters {
        create(input: $input) {
            id
            name
        }
    }
}`);

const GET_CHARACTER_CLASSES_QUERY = graphql(`query GetCharacterClasses {
    characterClasses {
        all {
            alignmentMoves {
                key
                name
                text
                type
            }
            damageDie
            hpBase
            key
            name
            raceMoves {
                key
                name
                text
                type
            }
            startingMoves {
                key
                name
                text
                type
            }
        }
    }
}`);

const GET_LOOK_TYPES_QUERY = graphql(`query GetLookTypes {
    lookTypes {
        all {
            examples
            key
            name
        }
    }
}`);

const GET_MOVES_QUERY = graphql(`query GetMoves {
    moves {
        all {
            key
            name
            text
            type
        }
    }
}`);

function calculateModifier(score: number): number {
    if (score > 17) return 3;
    if (score > 15) return 2;
    if (score > 12) return 1;
    if (score > 8) return 0;
    if (score > 5) return -1;
    if (score > 3) return -2;
    return -3;
}

const MoveCard: FC<{
    move: Move, selected?: boolean, onClick?: (key: string) => void,
}> = ({ move, onClick, selected }) => {
    const handleClick = useCallback((ev: MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();

        onClick?.(move.key);
    }, [move, onClick]);

    return (
        <Card onClick={handleClick} sx={{
            borderColor: selected ? "primary.main" : "divider",
        }} variant="outlined">
            <CardContent>
                <Typography component="div" variant="h5">{move.name}</Typography>
                {move.text.split("\n").map((line, i) => (
                    <Typography key={i}>{line}</Typography>
                ))}
            </CardContent>
        </Card>
    );
};

const Alignment: FC<{
    alignmentKey: string,
    alignmentText: string,
    alignmentType: string,
    characterClass: CharacterClass,
    onAlignmentKeyChange: (alignmentKey: string) => void,
    onAlignmentTextChange: (alignmentText: string) => void,
    onAlignmentTypeChange: (alignmentType: string) => void,
}> = ({ alignmentKey, alignmentText, alignmentType, characterClass, onAlignmentKeyChange, onAlignmentTextChange, onAlignmentTypeChange }) => {
    const handleAlignmentSelect = useCallback((alignmentKey: string) => (_: MouseEvent<HTMLDivElement>) => {
        onAlignmentKeyChange(alignmentKey);
    }, [onAlignmentKeyChange]);

    const handleAlignmentTextChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        onAlignmentTextChange(ev.target.value);
    }, [onAlignmentTextChange]);

    const handleAlignmentTypeChange = useCallback((ev: SelectChangeEvent) => {
        onAlignmentTypeChange(ev.target.value);
    }, [onAlignmentTypeChange]);

    return (
        <>
            <Typography variant="h5">Alignment</Typography>
            <List>
                {characterClass.alignmentMoves.map((move) => (
                    <ListItemButton key={move.key} onClick={handleAlignmentSelect(move.key)} selected={move.key === alignmentKey}>
                        {move.key === alignmentKey && (
                            <ListItemIcon>
                                <CheckCircleIcon/>
                            </ListItemIcon>
                        )}
                        <ListItemText primary={move.name} secondary={move.text}/>
                    </ListItemButton>
                ))}
                <ListItemButton onClick={handleAlignmentSelect("custom")} selected={alignmentKey === "custom"}>
                    {alignmentKey === "custom" && (
                            <ListItemIcon>
                                <CheckCircleIcon/>
                            </ListItemIcon>
                        )}
                    <FormControl fullWidth sx={{ flex: 1 }}>
                        <InputLabel>Alignment Type</InputLabel>
                        <Select label="Alignment Type" onChange={handleAlignmentTypeChange} value={alignmentType}>
                            {[["chaotic", "Chaotic"], ["evil", "Evil"], ["good", "Good"], ["lawful", "Lawful"], ["neutral", "Neutral"]].map(([key, label]) => (
                                <MenuItem key={key} value={key}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField label="Description" onChange={handleAlignmentTextChange} sx={{ flex: 2 }} value={alignmentText}/>
                </ListItemButton>
            </List>
        </>
    );
}

const Attributes: FC<{
    onScoreChange: (scoreIndex: number) => (ev: any, newValue: string) => void,
    scores: (number | null)[],
}> = ({ onScoreChange, scores}) => (
    <>
        <Typography variant="h5">Attributes</Typography>
        <Box>
            {scores.map((score, i) => {
                const scoreLabel = (() => {
                    switch (i) {
                        case 0: return "Strength";
                        case 1: return "Dexterity";
                        case 2: return "Constitution";
                        case 3: return "Intelligence";
                        case 4: return "Wisdom";
                        default: return "Charisma";
                    }
                })();

                return (
                    <Autocomplete fullWidth getOptionDisabled={option => typeof option === "number" && scores.includes(option)} getOptionLabel={option => {
                        if (typeof option === "string") return "None";

                        const modifier = calculateModifier(option);

                        if (modifier > -1) return `${option} (+${modifier})`;
                        return `${option} (${modifier})`;
                    }} key={i} onInputChange={onScoreChange(i)} options={["", ...ATTRIBUTE_SCORES]} renderInput={params => (
                        <TextField {...params} label={scoreLabel}/>
                    )} value={score}/>
                );
            })}
        </Box>
    </>
);

const BasicInfo: FC<{
    characterClass: CharacterClass,
    scores: (number | null)[],
}> = ({ characterClass, scores }) => {
    const hitPoints = (() => {
        if (typeof scores[2] !== "number") return "None";
        return scores[2] + characterClass.hpBase;
    })();

    return (
        <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
            <Typography>Hit Points: {hitPoints} (Constitution + {characterClass.hpBase})</Typography>
            <Typography>Damage Die: D{characterClass.damageDie}</Typography>
            <Typography>Armor: 0</Typography>
        </Box>
    );
};

const RaceSelect: FC<{
    characterClass: CharacterClass,
    onRaceKeyChange: (raceKey: string) => void,
    raceKey: string,
}> = ({ characterClass, onRaceKeyChange, raceKey }) => {
    const handleRaceSelect = useCallback((raceKey: string) => (_: MouseEvent<HTMLDivElement>) => {
        onRaceKeyChange(raceKey);
    }, [onRaceKeyChange]);

    return (
        <>
            <Typography variant="h5">Race</Typography>
            <List>
                {characterClass.raceMoves.map((move) => (
                    <ListItemButton key={move.key} onClick={handleRaceSelect(move.key)} selected={raceKey === move.key}>
                        {raceKey === move.key && (
                            <ListItemIcon>
                                <CheckCircleIcon/>
                            </ListItemIcon>
                        )}
                        <ListItemText primary={move.name} secondary={move.text}/>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
}

export const CreateCharacterPage: FC = () => {
    const [alignmentKey, setAlignmentKey] = useState("");
    const [alignmentText, setAlignmentText] = useState("");
    const [alignmentType, setAlignmentType] = useState("");
    const [characterClassKey, setCharacterClassKey] = useState("");
    const [looks, setLooks] = useState<NewLookInput[]>([]);
    const [moveTab, setMoveTab] = useState("class");
    const [name, setName] = useState("");
    const [raceKey, setRaceKey] = useState("");
    const [scores, setScores] = useState<(number | null)[]>([null, null, null, null, null, null]);

    const navigate = useNavigate();

    const [createCharacter, { data: createCharacterData, error: createCharacterError }] = useMutation(CREATE_CHARACTER_MUTATION);
    const { data: getCharacterClassesData, error: getCharacterClassesError, loading: getCharacterClassesLoading } = useQuery(GET_CHARACTER_CLASSES_QUERY);
    const { data: getLookTypesData, error: getLookTypesError, loading: getLookTypesLoading } = useQuery(GET_LOOK_TYPES_QUERY);
    const { data: getMovesData, error: getMovesError, loading: getMovesLoading } = useQuery(GET_MOVES_QUERY);

    const characterClass = getCharacterClassesData?.characterClasses.all.find(c => c.key === characterClassKey);

    useErrorLogging(createCharacterError);
    useErrorLogging(getCharacterClassesError);
    useErrorLogging(getLookTypesError);

    useEffect(() => {
        if (!createCharacterData) return;

        navigate(`/character/${createCharacterData.characters.create.id}`);
    }, [createCharacterData, navigate]);

    const handleCharacterClassChange = useCallback((ev: SelectChangeEvent) => {
        setCharacterClassKey(ev.target.value);
    }, [setCharacterClassKey]);

    const handleRaceChange = useCallback((key: string) => {
        setRaceKey(key);
    }, [setRaceKey]);

    const handleLookAdd = useCallback((ev: MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();

        if (!getLookTypesData) return;

        setLooks(looks => [...looks, {
            lookTypeKey: getLookTypesData.lookTypes.all[0].key,
            value: "",
        }]);
    }, [getLookTypesData, setLooks]);

    const handleLookDelete = useCallback((lookIndex: number) => (ev: MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();

        setLooks(looks => looks.filter((_, i) => i !== lookIndex));
    }, [setLooks]);

    const handleLookTypeChange = useCallback((lookIndex: number) => (ev: SelectChangeEvent) => {
        setLooks(looks => looks.map((look, i) => {
            if (lookIndex !== i) return look;

            return {
                lookTypeKey: ev.target.value,
                value: look.value,
            };
        }))
    }, [setLooks]);

    const handleLookValueChange = useCallback((lookIndex: number) => (_: any, newValue: string | null) => {
        setLooks(looks => looks.map((look, i) => {
            if (lookIndex !== i) return look;

            return {
                lookTypeKey: look.lookTypeKey,
                value: newValue || "",
            };
        }))
    }, [setLooks]);

    const handleMoveTabChange = useCallback((_: any, newValue: string) => {
        setMoveTab(newValue);
    }, [setMoveTab]);

    const handleNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        ev.preventDefault();

        setName(ev.target.value);
    }, [setName]);

    const handleCreate = useCallback((ev: MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();

        createCharacter({
            variables: {
                input: {
                    looks,
                    name,
                },
            },
        });
    }, [looks, name]);

    const handleScoreChange = useCallback((scoreIndex: number) => (_: any, newValue: string) => {
        setScores(scores => scores.map((score, i) => {
            if (scoreIndex !== i) return score;

            const newScore = parseInt(newValue);

            if (Number.isNaN(newScore)) return null;

            return newScore;
        }))
    }, [setScores]);

    const characterClassContent = useMemo(() => {
        return (
            <FormControl fullWidth>
                <InputLabel>Character Class</InputLabel>
                <Select fullWidth label="Character Class" onChange={handleCharacterClassChange} value={characterClassKey}>
                    {getCharacterClassesData?.characterClasses.all.map(({ key, name}) => (
                        <MenuItem key={key} value={key}>{name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        );

    }, [characterClassKey, getCharacterClassesData, getCharacterClassesError, getCharacterClassesLoading, handleCharacterClassChange]);

    const looksContent = useMemo(() => {
        if (getLookTypesLoading) return (
            <>
                <Skeleton/>
                <Skeleton/>
                <Skeleton/>
            </>
        );

        if (getLookTypesError || !getLookTypesData) return "ERROR";

        const lookTypes = getLookTypesData.lookTypes.all;

        return (
            <List>
                {looks.map(({ lookTypeKey, value }, i) => (
                    <ListItem key={i} secondaryAction={
                        <IconButton onClick={handleLookDelete(i)}>
                            <DeleteIcon/>
                        </IconButton>
                    }>
                        <Box sx={{ display: "flex", gap: 3, mr: 3, width: "100%" }}>
                            <Select onChange={handleLookTypeChange(i)} value={lookTypeKey}>
                                {lookTypes.map(({ key, name }) => (
                                    <MenuItem key={key} value={key}>{name}</MenuItem>
                                ))}
                            </Select>
                            <Autocomplete freeSolo onInputChange={handleLookValueChange(i)} options={lookTypes.find(l => l.key === lookTypeKey)?.examples || []} renderInput={params => (
                                <TextField {...params} fullWidth />
                            )} sx={{ flex: 1 }} value={value}/>
                        </Box>
                    </ListItem>
                ))}
                <ListItemButton onClick={handleLookAdd}>
                    <ListItemIcon><AddIcon/></ListItemIcon>
                    <ListItemText>Add look</ListItemText>
                </ListItemButton>
            </List>
        );

    }, [getLookTypesData, getLookTypesError, getLookTypesLoading, looks]);

    const movesContent = useMemo(() => {
        if (getCharacterClassesLoading || getMovesLoading) return <Skeleton/>;
        if (getCharacterClassesError || !characterClass || getMovesError || !getMovesData) return "ERROR";

        return (
            <>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <Tabs onChange={handleMoveTabChange} value={moveTab}>
                        <Tab label="Class Moves" value="class"/>
                        <Tab label="Basic Moves" value="basic"/>
                        <Tab label="Special Moves" value="special"/>
                    </Tabs>
                </Box>
                <Grid container spacing={3}>
                    {moveTab === "class" && (
                        characterClass?.startingMoves.map((move) => (
                            <Grid key={move.key} xs={6}>
                                <MoveCard move={move}/>
                            </Grid>
                        ))
                    )}
                    {getMovesData.moves.all.filter(m => m.type === moveTab).map((move) => (
                        <Grid key={move.key} xs={6}>
                            <MoveCard move={move}/>
                        </Grid>
                    ))}
                </Grid>
            </>
        );
    }, [characterClass, getCharacterClassesError, getCharacterClassesLoading, getMovesData, getMovesError, getMovesLoading, moveTab]);

    return (
        <Page title="Character Creation">
            <Paper component="form" sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid xs={8}>
                        <TextField fullWidth label="Name" onChange={handleNameChange} sx={{ mb: 3 }} value={name} variant="outlined"/>
                    </Grid>
                    <Grid xs={4}>
                        {characterClassContent}
                    </Grid>

                    {characterClass && (
                        <>
                            <Grid xs={6}>
                                <RaceSelect characterClass={characterClass} onRaceKeyChange={handleRaceChange} raceKey={raceKey}/>
                            </Grid>
                            <Grid xs={6}>
                                <Alignment alignmentKey={alignmentKey} alignmentText={alignmentText} alignmentType={alignmentType} characterClass={characterClass} onAlignmentKeyChange={setAlignmentKey} onAlignmentTextChange={setAlignmentText} onAlignmentTypeChange={setAlignmentType} />
                            </Grid>
                            <Grid xs={12}>
                                <BasicInfo characterClass={characterClass} scores={scores}/>
                            </Grid>
                            <Grid xs={6}>
                                <Typography variant="h5">Looks</Typography>
                                {looksContent}
                            </Grid>
                            <Grid xs={6}>
                                <Attributes onScoreChange={handleScoreChange} scores={scores}/>
                            </Grid>
                            <Grid xs={12}>
                                {movesContent}
                            </Grid>
                            <Grid sx={{ display: "flex", justifyContent: "center" }} xs={12}>
                                <Button onClick={handleCreate} variant="contained">Create</Button>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>
        </Page>
    );
};
