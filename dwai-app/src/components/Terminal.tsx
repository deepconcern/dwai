import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material/styles";
import { CSSProperties, FC, KeyboardEvent, useCallback, useState } from "react";
import { Message } from "../gql/graphql";

type TerminalState = "ready" | "waiting";

export type TerminalProps = {
  className?: string;
  messages: Message[];
  onSubmit?: (current: string) => void;
  style?: CSSProperties;
  sx: SxProps<Theme>;
};

export const Terminal: FC<TerminalProps> = ({ className, messages, onSubmit, style, sx }) => {
  const [current, setCurrent] = useState("");
  const [terminalState, setTerminalState] = useState<TerminalState>("ready");

  const initialValue = messages.map(({ author, content }) => {
    if (author === "user") {
        return `> ${content}`;
    } else {
        return content;
    }
  }).join("\n\n");

  const value = [initialValue, `> ${current}`].join("\n\n");

  const handleKeyDown = useCallback((ev: KeyboardEvent<HTMLTextAreaElement>) => {
    ev.preventDefault();

    if (ev.key === "Backspace") {
        // Handle backspace

        // Don't do anything if the line is empty
        if (current === "") return;

        // Remove last line of content, and erase from terminal
        setCurrent(current => {
            if (current === "") return current;

            return current.slice(0, current.length - 1);
        });
      } else if (ev.key === "Enter") {
        if (ev.shiftKey) {
          // Handle shift+enter

          setCurrent(current => current + "\n");
        } else {
          // Handle enter

          // Submit the currently typed content, and wait for response
          setCurrent(current => {
            onSubmit?.(current);

            return "";
          });
          setTerminalState("waiting");
        }
      } else if (ev.ctrlKey && ev.key === "c") {
        // Handle ctrl+c

        // Clear current content (and indicate to user)
        // this.currentLine = "";
        // this.term.write("\r\n CTRL+C");

        // Reset prompt
        // this.prompt();
      } else {
        // Handle normal keys

        // Add currently typed key to content and display in terminal
        setCurrent(current => current + ev.key);
      }
  }, [setCurrent]);

  return (
    <Box
      className={className}
      component="textarea"
      onKeyDown={handleKeyDown}
      readOnly
      style={style}
      sx={[
        { bgcolor: "black", color: "white", p: 3 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      value={value}
    />
  );
};
