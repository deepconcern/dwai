import { FC, PropsWithChildren, useMemo, useState } from "react";

import { LastRollContext, LastRollData } from "../contexts/LastRollContext";

export const LastRollProvider: FC<PropsWithChildren> = ({ children }) => {
  const [lastRoll, setLastRoll] = useState<string | null>(null);

  const value: LastRollData = useMemo(
    () => ({
      lastRoll,
      setLastRoll,
    }),
    [lastRoll, setLastRoll]
  );

  return (
    <LastRollContext.Provider value={value}>
      {children}
    </LastRollContext.Provider>
  );
};
