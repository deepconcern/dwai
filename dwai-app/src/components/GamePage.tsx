import { useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { graphql } from "../gql";
import { GameTerminal } from "../lib/GameTerminal";

import { Page } from "./Page";
import { Terminal } from "./Terminal";

const GET_MESSAGES_QUERY = graphql(`query GetMessages {
    messages {
        all {
            author
            content
            datetime
            id
        }
    }
}`);

const SEND_MESSAGE_MUTATION = graphql(`mutation SendMessage($content: String!) {
    messages {
        send(content: $content) {
            author
            content
            datetime
            id
        }
    }
}`);

export const GamePage: FC = () => {
  const terminalRef = useRef(new GameTerminal());

  const [isCharacterInfoOpen, setCharacterInfoOpen] = useState(false);

  const { data, error: getMessagesError, loading } = useQuery(GET_MESSAGES_QUERY);

  const [sendMessage, { error: sendMessageError }] = useMutation(SEND_MESSAGE_MUTATION);

  const handleCharacterInfoClose = useCallback(() => {
    setCharacterInfoOpen(false);
  }, [setCharacterInfoOpen]);

  const handleCharacterInfoOpen = useCallback(() => {
    setCharacterInfoOpen(true);
  }, [setCharacterInfoOpen]);

  const handleSubmit = useCallback((content: string): void => {
    sendMessage({
        variables: {
            content,
        }
    }).then(response => {
        terminalRef.current.systemMessage(response.data!.messages.send);
    });
  }, [sendMessage, terminalRef]);

  useEffect(() => {
    if (!data) return;

    const terminalEl = document.getElementById("terminal");

    if (!terminalEl) return;

    terminalRef.current.init(terminalEl, data.messages.all);
    terminalRef.current.onSubmit(handleSubmit);
  }, [data, terminalRef]);

  // Log errors
  useEffect(() => {
    if (getMessagesError) console.error(getMessagesError);
    if (sendMessageError) console.error(sendMessageError);
  }, [getMessagesError, sendMessageError]);

  const content = useMemo(() => {
    if (loading) return "Loading...";
    if (getMessagesError || !data) return "ERROR";

    return <Terminal messages={data.messages.all} sx={{ flex: 1 }} />
  }, [data, getMessagesError]);

  return (
    <Page sx={{ display: "flex", flexDirection: "column" }}>
      {/* <Box id="terminal" sx={{ bgcolor: "black", flex: 1, mb: 3, p: 3 }}/> */}
      {content}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={handleCharacterInfoOpen} variant="contained">
          Character Info
        </Button>
      </Box>
      <Drawer anchor="bottom" open={isCharacterInfoOpen} onClose={handleCharacterInfoClose}>
        TBD
      </Drawer>
    </Page>
  );
};
