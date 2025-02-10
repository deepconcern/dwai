import { FC, PropsWithChildren, useRef } from "react";

import { ModalContext } from "../contexts/ModalContext";

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  const modalTargetRef = useRef<HTMLDivElement>(null);

  return (
    <ModalContext.Provider value={modalTargetRef}>
      {children}
      <div ref={modalTargetRef} />
    </ModalContext.Provider>
  );
};
