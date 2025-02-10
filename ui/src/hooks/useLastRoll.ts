import { useContext } from "react";

import { LastRollContext } from "../contexts/LastRollContext";

export function useLastRoll() {
    return useContext(LastRollContext);
}