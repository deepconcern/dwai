import { FitAddon } from "@xterm/addon-fit"
import { Terminal } from "@xterm/xterm";

import { Message } from "../gql/graphql";

const PROMPT_CHAR = ">";
const TERMINAL_NEWLINE = "\r\n";

class EventEmitter<E extends { [name: string]: any }> {
  private listeners: {
    [K in keyof E]?: ((this: EventEmitter<E>, ev: E[K]) => any)[]
  } = {};

  emit<K extends keyof E>(type: K, value: E[K]): void {
    const listeners = this.listeners[type];

    if (!listeners) return;

    for (const listener of listeners) {
      listener.call(this, value);
    }
  }

  on<K extends keyof E>(
    type: K,
    listener: (this: EventEmitter<E>, ev: E[K]) => any
  ): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type]!.push(listener);
  }
}

type GameTerminalEvents = {
  submit: string,
};

export class GameTerminal {
  private currentLine: string;
  private eventEmitter: EventEmitter<GameTerminalEvents>;
  private fitAddon: FitAddon;
  private hasTerminalInitialized: boolean;
  private messages: Message[];
  private state: "ready" | "waiting";
  private term: Terminal;

  constructor() {
    this.currentLine = "";
    this.eventEmitter = new EventEmitter();
    this.fitAddon = new FitAddon();
    this.hasTerminalInitialized = false;
    this.messages = [];
    this.state = "waiting";
    this.term = new Terminal();

    this.term.loadAddon(this.fitAddon);
  }

  init(el: HTMLElement, initialMessages: Message[]): void {
    // Don't init more than once
    if (this.hasTerminalInitialized) return;

    // Setup has occured, so prevent second one
    this.hasTerminalInitialized = true;

    this.attach(el);

    // Handle initial messages
    for (const message of initialMessages) {

      // Stylisticly handle user messages
      if (message.author === "user") {
        for (const line of message.content.split("\n")) {
          this.term.writeln(`${PROMPT_CHAR} ${line}`);
        }
      } else {
        // Replace newlines
        this.term.writeln(message.content.replace("\n", TERMINAL_NEWLINE));
      }

      this.term.writeln("");
    }

    // Handle user key events
    this.term.onKey(({ domEvent, key }) => {
      // Don't do anyting while waiting
      if (this.state === "waiting") return;

      if (domEvent.key === "Backspace") {
        // Handle backspace

        // Don't do anything if the line is empty
        if (this.currentLine === "") return;

        // Remove last line of content, and erase from terminal
        this.currentLine = this.currentLine.slice(
          0,
          this.currentLine.length - 1
        );
        this.term.write("\b \b");
      } else if (domEvent.key === "Enter") {
        if (domEvent.shiftKey) {
          // Handle shift+enter

          this.currentLine += "\n";
          this.prompt();
        } else {
          // Handle enter

          // Submit the currently typed content, and wait for response
          this.eventEmitter.emit("submit", this.currentLine);
          this.state = "waiting";

          // Reset the terminal
          this.currentLine = "";
          this.term.write(TERMINAL_NEWLINE);
        }
      } else if (domEvent.ctrlKey && domEvent.key === "c") {
        // Handle ctrl+c

        // Clear current content (and indicate to user)
        this.currentLine = "";
        this.term.write("\r\n CTRL+C");

        // Reset prompt
        this.prompt();
      } else {
        // Handle normal keys

        // Add currently typed key to content and display in terminal
        this.currentLine += key;
        this.term.write(key);
      }
    });

    // Get ready for user prompt
    this.term.write(`${PROMPT_CHAR} `);
    this.state = "ready";
  }

  systemMessage(message: Message): void {
    this.term.writeln("");
    this.term.writeln(message.content);

    this.state = "ready";

    this.prompt();
  }

  onSubmit(callback: (content: string) => void): void {
    this.eventEmitter.on("submit", callback);
  }

  private attach(el: HTMLElement): void {
    // Attach to element 
    this.term.open(el);

    // Fit once
    this.fitAddon.fit();

    // Refit on resize
    const resizeObserver = new ResizeObserver(() => {
      const { cols, rows } = this.fitAddon.proposeDimensions() || {
        cols: 0,
        rows: 0,
      };

      this.term.resize(cols, rows);
    });

    // resizeObserver.observe(el);
  }

  /**
   * Helper function to create prompt
   */
  private prompt(): void {
    this.term.write(`${TERMINAL_NEWLINE}${PROMPT_CHAR} `);
  }
}
