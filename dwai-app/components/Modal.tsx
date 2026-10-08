"use client";

import { FC, MouseEventHandler, useEffect, useRef } from "react";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose: MouseEventHandler<HTMLDialogElement> = (ev) => {
    if (ev.target !== dialogRef.current) return;

    onClose();
  };

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  return (
    <dialog
      className="backdrop-blur-sm bg-gray-950 fixed m-auto p-4 rounded-l text-white"
      onClick={handleClose}
      ref={dialogRef}
    >
      {children}
    </dialog>
  );
};
