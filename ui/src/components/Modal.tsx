import { useTheme } from "@emotion/react";
import clsx from "clsx";
import {
  FC,
  MouseEvent,
  PropsWithChildren,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import { Icon } from "./Icon";
import { ModalContext } from "../contexts/ModalContext";

export type ModalProps = PropsWithChildren<{
  open?: boolean;
  onClose?: () => void;
  title?: string;
}>;

export const Modal: FC<ModalProps> = ({ children, onClose, open, title }) => {
  const theme = useTheme();

  const modalTargetRef = useContext(ModalContext);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleButtonClose = useCallback(
    (ev: MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();

      onClose?.();
    },
    [onClose]
  );

  const handleDialogCancel = useCallback(
    (ev: SyntheticEvent<HTMLDialogElement, Event>) => {
      ev.preventDefault();

      onClose?.();
    },
    [onClose]
  );

  const handleDialogClose = useCallback(
    (ev: SyntheticEvent<HTMLDialogElement, Event>) => {
      ev.preventDefault();

      onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    const dialogEl = dialogRef.current;

    if (open) {
      dialogEl?.showModal();
    }
  }, [dialogRef, open]);

  if (!modalTargetRef.current) return null;

  return (
    open &&
    createPortal(
      <dialog
        className={clsx("nes-dialog", { "is-dark": theme.mode === "dark" })}
        css={{
          "&.nes-dialog.is-dark:not(.is-rounded)::before": {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        }}
        onCancel={handleDialogCancel}
        onClose={handleDialogClose}
        ref={dialogRef}
      >
        <a
          css={(theme) => ({
            position: "absolute",
            right: theme.spacing[2],
            top: theme.spacing[2],
          })}
          onClick={handleButtonClose}
        >
          <Icon icon="close" invertable size="small" />
        </a>
        <div css={(theme) => ({ margin: theme.spacing[2] })}>
          {title && <h4>{title}</h4>}
          {children}
        </div>
      </dialog>,
      modalTargetRef.current!
    )
  );
};
