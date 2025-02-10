import { createContext, createRef, RefObject } from "react";

export const ModalContext = createContext<RefObject<HTMLElement>>(createRef());
