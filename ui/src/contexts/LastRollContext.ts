import { createContext } from "react";

export type LastRollData = {
    lastRoll: string | null;
    setLastRoll: (newLastRoll: string | null) => void;
};

export const LastRollContext = createContext<LastRollData>({
    lastRoll: null,
    setLastRoll: () => {},
});