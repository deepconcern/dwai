import { useQuery } from "@apollo/client";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";

import { graphql } from "../gql";
import { useErrorLogging } from "../hooks/useErrorLogging";

import { Page } from "./Page";

const GET_CHARACTER_QUERY = graphql(`query GetCharacter($characterId: ID!) {
    characters {
        byId(id: $characterId) {
            id
            name
        }
    }
}`)

export type CharacterPageParams = {
    characterId: string,
};

export const CharacterPage: FC = () => {
    const { characterId } = useParams<CharacterPageParams>();

    const { data, error, loading } = useQuery(GET_CHARACTER_QUERY, {
        skip: !characterId,
        variables: {
            characterId: characterId!,
        },
    });

    useErrorLogging(error);

    const content = useMemo(() => {
        if (loading) return <Skeleton/>;
        if (error || !data?.characters.byId) return "ERROR";

        return (
            <>
                <Typography variant="h3">{data.characters.byId.name}</Typography>
            </>
        );
    }, [data, error, loading]);

    return (
        <Page title="Character View">
            <Paper sx={{ p: 3 }}>{content}</Paper>
        </Page>
    );
};